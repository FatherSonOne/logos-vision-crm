/**
 * Production-ready logging utility for Logos Vision CRM
 *
 * Controls logging based on environment and log level.
 * In production, only errors are logged to avoid console clutter.
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LoggerConfig {
  level: LogLevel;
  enableDebug: boolean;
}

class Logger {
  private config: LoggerConfig;

  constructor() {
    // Determine logging configuration based on environment
    const isDevelopment = import.meta.env.DEV;
    const debugEnabled = import.meta.env.VITE_DEBUG_LOGGING === 'true';

    this.config = {
      level: isDevelopment ? 'debug' : 'error',
      enableDebug: debugEnabled
    };
  }

  /**
   * Log error messages (always enabled in all environments)
   */
  error(message: string, ...args: any[]): void {
    console.error(`[ERROR] ${message}`, ...args);
  }

  /**
   * Log warning messages (enabled in development or when debug is on)
   */
  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  /**
   * Log informational messages (enabled in development or when debug is on)
   */
  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }

  /**
   * Log debug messages (only enabled when explicitly turned on)
   */
  debug(message: string, ...args: any[]): void {
    if (this.config.enableDebug || this.shouldLog('debug')) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const requestedLevelIndex = levels.indexOf(level);

    return requestedLevelIndex <= currentLevelIndex;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for external use
export type { LogLevel };
