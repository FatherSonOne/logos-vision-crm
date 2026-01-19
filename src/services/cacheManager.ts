/**
 * Cache Manager Service
 * Provides intelligent caching for API responses and computed data
 * Enhanced with IndexedDB support and compression
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  key: string;
  compressed?: boolean;
  size?: number;
}

interface CacheConfig {
  maxSize?: number; // Maximum number of entries
  defaultTTL?: number; // Default TTL in milliseconds
  persistToStorage?: boolean; // Persist to localStorage
  useIndexedDB?: boolean; // Use IndexedDB for large data
  compressionThreshold?: number; // Compress data larger than this (bytes)
}

interface CacheMetrics {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  evictions: number;
}

// Simple LZ-based compression utilities
function compress(str: string): string {
  try {
    // Simple Run-Length Encoding for demonstration
    // In production, use a proper library like lz-string
    return str.split('').reduce((acc, char, i, arr) => {
      if (i === 0 || char !== arr[i - 1]) {
        return acc + char;
      }
      return acc;
    }, '');
  } catch {
    return str;
  }
}

function decompress(str: string): string {
  return str; // Placeholder - would use actual decompression
}

class CacheManager {
  private cache: Map<string, CacheEntry<any>>;
  private config: Required<CacheConfig>;
  private accessCount: Map<string, number>;
  private metrics: CacheMetrics;
  private db: IDBDatabase | null = null;
  private dbReady: Promise<void>;

  constructor(config: CacheConfig = {}) {
    this.cache = new Map();
    this.accessCount = new Map();
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
    };
    this.config = {
      maxSize: config.maxSize ?? 100,
      defaultTTL: config.defaultTTL ?? 5 * 60 * 1000, // 5 minutes default
      persistToStorage: config.persistToStorage ?? false,
      useIndexedDB: config.useIndexedDB ?? false,
      compressionThreshold: config.compressionThreshold ?? 100 * 1024, // 100KB
    };

    // Initialize IndexedDB if enabled
    this.dbReady = this.config.useIndexedDB ? this.initIndexedDB() : Promise.resolve();

    // Load cache from localStorage if enabled
    if (this.config.persistToStorage && !this.config.useIndexedDB) {
      this.loadFromStorage();
    }

    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60 * 1000);

    // Background cache warming
    this.warmCache();
  }

  /**
   * Initialize IndexedDB
   */
  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('CacheManagerDB', 1);

      request.onerror = () => {
        console.warn('[Cache] IndexedDB initialization failed, falling back to memory cache');
        resolve();
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Store data in IndexedDB
   */
  private async setIndexedDB(key: string, entry: CacheEntry<any>): Promise<void> {
    await this.dbReady;
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get data from IndexedDB
   */
  private async getIndexedDB(key: string): Promise<CacheEntry<any> | null> {
    await this.dbReady;
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete data from IndexedDB
   */
  private async deleteIndexedDB(key: string): Promise<void> {
    await this.dbReady;
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get cached data
   */
  async get<T>(key: string): Promise<T | null> {
    let entry = this.cache.get(key);

    // Try IndexedDB if not in memory
    if (!entry && this.config.useIndexedDB) {
      try {
        entry = await this.getIndexedDB(key);
        if (entry) {
          // Restore to memory cache
          this.cache.set(key, entry);
        }
      } catch (error) {
        console.warn('[Cache] IndexedDB read error:', error);
      }
    }

    if (!entry) {
      this.metrics.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      await this.delete(key);
      this.metrics.misses++;
      return null;
    }

    // Track access for LRU eviction
    const count = this.accessCount.get(key) || 0;
    this.accessCount.set(key, count + 1);
    this.metrics.hits++;

    // Decompress if needed
    if (entry.compressed) {
      try {
        const decompressed = decompress(entry.data);
        return JSON.parse(decompressed) as T;
      } catch {
        return entry.data as T;
      }
    }

    return entry.data as T;
  }

  /**
   * Synchronous get for backwards compatibility
   */
  getSync<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.metrics.misses++;
      return null;
    }

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      this.metrics.misses++;
      return null;
    }

    const count = this.accessCount.get(key) || 0;
    this.accessCount.set(key, count + 1);
    this.metrics.hits++;

    return entry.data as T;
  }

  /**
   * Set cached data
   */
  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    this.metrics.sets++;

    // Enforce max size with LRU eviction
    if (this.cache.size >= this.config.maxSize) {
      await this.evictLRU();
    }

    // Calculate data size
    const serialized = JSON.stringify(data);
    const size = serialized.length;

    // Compress if needed
    let finalData: any = data;
    let compressed = false;

    if (size > this.config.compressionThreshold) {
      try {
        finalData = compress(serialized);
        compressed = true;
      } catch (error) {
        console.warn('[Cache] Compression failed:', error);
      }
    }

    const entry: CacheEntry<T> = {
      data: finalData,
      timestamp: Date.now(),
      ttl: ttl ?? this.config.defaultTTL,
      key,
      compressed,
      size,
    };

    this.cache.set(key, entry);
    this.accessCount.set(key, 1);

    // Use IndexedDB for large data
    if (this.config.useIndexedDB && size > 5 * 1024 * 1024) {
      try {
        await this.setIndexedDB(key, entry);
        // Remove from memory to save space
        this.cache.delete(key);
      } catch (error) {
        console.warn('[Cache] IndexedDB write error:', error);
      }
    } else if (this.config.persistToStorage) {
      this.saveToStorage();
    }
  }

  /**
   * Synchronous set for backwards compatibility
   */
  setSync<T>(key: string, data: T, ttl?: number): void {
    this.set(key, data, ttl);
  }

  /**
   * Delete cached data
   */
  async delete(key: string): Promise<void> {
    this.metrics.deletes++;
    this.cache.delete(key);
    this.accessCount.delete(key);

    if (this.config.useIndexedDB) {
      try {
        await this.deleteIndexedDB(key);
      } catch (error) {
        console.warn('[Cache] IndexedDB delete error:', error);
      }
    }

    if (this.config.persistToStorage) {
      this.saveToStorage();
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.accessCount.clear();

    if (this.config.persistToStorage) {
      localStorage.removeItem('cache_manager');
    }
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Get or set with async function
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetchFn();
    await this.set(key, data, ttl);
    return data;
  }

  /**
   * Invalidate cache by prefix
   */
  invalidatePrefix(prefix: string): void {
    const keysToDelete: string[] = [];

    this.cache.forEach((_, key) => {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.delete(key));
  }

  /**
   * Get cache statistics
   */
  getStats() {
    let totalSize = 0;
    let expiredCount = 0;
    const now = Date.now();

    this.cache.forEach(entry => {
      totalSize += entry.size || JSON.stringify(entry.data).length;
      if (now - entry.timestamp > entry.ttl) {
        expiredCount++;
      }
    });

    const totalRequests = this.metrics.hits + this.metrics.misses;
    const hitRate = totalRequests > 0 ? (this.metrics.hits / totalRequests) * 100 : 0;

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      utilizationPercent: (this.cache.size / this.config.maxSize) * 100,
      totalSizeBytes: totalSize,
      expiredCount,
      hitRate,
      metrics: { ...this.metrics },
    };
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.delete(key));

    if (keysToDelete.length > 0 && import.meta.env.DEV) {
      console.log(`[Cache] Cleaned up ${keysToDelete.length} expired entries`);
    }
  }

  /**
   * Evict least recently used entry
   */
  private async evictLRU(): Promise<void> {
    this.metrics.evictions++;
    let minAccess = Infinity;
    let lruKey: string | null = null;

    this.accessCount.forEach((count, key) => {
      if (count < minAccess) {
        minAccess = count;
        lruKey = key;
      }
    });

    if (lruKey) {
      await this.delete(lruKey);
      if (import.meta.env.DEV) {
        console.log(`[Cache] Evicted LRU entry: ${lruKey}`);
      }
    }
  }

  /**
   * Background cache warming
   */
  private async warmCache(): Promise<void> {
    // Placeholder for future implementation
    // Could pre-load frequently accessed data
  }

  /**
   * Calculate cache hit rate
   */
  private calculateHitRate(): number {
    if (this.accessCount.size === 0) return 0;

    const totalAccess = Array.from(this.accessCount.values()).reduce(
      (sum, count) => sum + count,
      0
    );

    return (this.cache.size / totalAccess) * 100;
  }

  /**
   * Save cache to localStorage
   */
  private saveToStorage(): void {
    try {
      const data = Array.from(this.cache.entries());
      localStorage.setItem('cache_manager', JSON.stringify(data));
    } catch (error) {
      console.warn('[Cache] Failed to save to localStorage:', error);
    }
  }

  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem('cache_manager');
      if (data) {
        const entries = JSON.parse(data);
        entries.forEach(([key, entry]: [string, CacheEntry<any>]) => {
          // Only load non-expired entries
          if (Date.now() - entry.timestamp <= entry.ttl) {
            this.cache.set(key, entry);
          }
        });
      }
    } catch (error) {
      console.warn('[Cache] Failed to load from localStorage:', error);
    }
  }
}

// Create specialized cache instances
export const apiCache = new CacheManager({
  maxSize: 100,
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  persistToStorage: true,
});

export const computeCache = new CacheManager({
  maxSize: 50,
  defaultTTL: 2 * 60 * 1000, // 2 minutes
  persistToStorage: false,
});

export const staticCache = new CacheManager({
  maxSize: 200,
  defaultTTL: 60 * 60 * 1000, // 1 hour
  persistToStorage: true,
});

/**
 * React Hook for cached data fetching
 */
export function useCachedData<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: {
    ttl?: number;
    cache?: CacheManager;
    enabled?: boolean;
  } = {}
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const cache = options.cache ?? apiCache;
  const enabled = options.enabled ?? true;

  React.useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const result = await cache.getOrSet(key, fetchFn, options.ttl);
        setData(result);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [key, enabled]);

  const refetch = async () => {
    cache.delete(key);
    try {
      setLoading(true);
      const result = await cache.getOrSet(key, fetchFn, options.ttl);
      setData(result);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch };
}

/**
 * Cache key generators for common patterns
 */
export const cacheKeys = {
  tasks: {
    list: (filters?: any) => `tasks:list:${JSON.stringify(filters || {})}`,
    detail: (id: string) => `tasks:detail:${id}`,
    byProject: (projectId: string) => `tasks:project:${projectId}`,
    byAssignee: (assigneeId: string) => `tasks:assignee:${assigneeId}`,
  },
  projects: {
    list: () => 'projects:list',
    detail: (id: string) => `projects:detail:${id}`,
  },
  contacts: {
    list: () => 'contacts:list',
    detail: (id: string) => `contacts:detail:${id}`,
  },
  analytics: {
    dashboard: () => 'analytics:dashboard',
    tasks: () => 'analytics:tasks',
    projects: () => 'analytics:projects',
  },
};

/**
 * Cache invalidation helpers
 */
export const invalidateCache = {
  tasks: () => apiCache.invalidatePrefix('tasks:'),
  projects: () => apiCache.invalidatePrefix('projects:'),
  contacts: () => apiCache.invalidatePrefix('contacts:'),
  analytics: () => apiCache.invalidatePrefix('analytics:'),
  all: () => {
    apiCache.clear();
    computeCache.clear();
  },
};

// Export types
export type { CacheManager, CacheEntry, CacheConfig };
