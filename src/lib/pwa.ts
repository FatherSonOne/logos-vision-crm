// PWA utilities for Logos Vision CRM

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

// Register service worker
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.log('[PWA] Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('[PWA] Service Worker registered:', registration.scope);

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            console.log('[PWA] New version available');
            // You could show a toast notification here
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('[PWA] Service Worker registration failed:', error);
    return null;
  }
}

// Handle the beforeinstallprompt event
export function setupInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e as BeforeInstallPromptEvent;
    console.log('[PWA] Install prompt saved');
  });

  // Log when app is installed
  window.addEventListener('appinstalled', () => {
    console.log('[PWA] App was installed');
    deferredPrompt = null;
  });
}

// Check if the app can be installed
export function canInstall(): boolean {
  return deferredPrompt !== null;
}

// Trigger the install prompt
export async function promptInstall(): Promise<boolean> {
  if (!deferredPrompt) {
    console.log('[PWA] No install prompt available');
    return false;
  }

  // Show the install prompt
  deferredPrompt.prompt();

  // Wait for the user to respond
  const { outcome } = await deferredPrompt.userChoice;
  console.log('[PWA] Install prompt outcome:', outcome);

  // Clear the prompt
  deferredPrompt = null;

  return outcome === 'accepted';
}

// Check if app is running as PWA
export function isRunningAsPWA(): boolean {
  // Check display-mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }

  // iOS Safari check
  if ((navigator as any).standalone === true) {
    return true;
  }

  // Check for PWA query param (set by manifest start_url)
  if (document.referrer.includes('android-app://')) {
    return true;
  }

  return false;
}

// Check if app is installed (best effort)
export async function isAppInstalled(): Promise<boolean> {
  // Method 1: Check if running as standalone
  if (isRunningAsPWA()) {
    return true;
  }

  // Method 2: Use getInstalledRelatedApps if available
  if ('getInstalledRelatedApps' in navigator) {
    try {
      const relatedApps = await (navigator as any).getInstalledRelatedApps();
      return relatedApps.length > 0;
    } catch (error) {
      console.log('[PWA] Could not check installed apps');
    }
  }

  return false;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.log('[PWA] Notifications not supported');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

// Show a local notification
export async function showNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  if (Notification.permission !== 'granted') {
    console.log('[PWA] Notification permission not granted');
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification(title, {
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    ...options
  });
}

// Initialize PWA features
export function initializePWA(): void {
  if (typeof window === 'undefined') return;

  // Register service worker in production
  if (import.meta.env.PROD) {
    registerServiceWorker();
  }

  // Setup install prompt handler
  setupInstallPrompt();

  console.log('[PWA] PWA features initialized');
  console.log('[PWA] Running as PWA:', isRunningAsPWA());
}
