"use client";

// Service Worker Registration Utility
// Handles registration, updates, and lifecycle management

interface ServiceWorkerRegistrationResult {
  registration: ServiceWorkerRegistration | null;
  isSupported: boolean;
  error: string | null;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailable = false;

  /**
   * Register the service worker
   */
  async register(): Promise<ServiceWorkerRegistrationResult> {
    // Check if service workers are supported
    if (!("serviceWorker" in navigator)) {
      console.warn("Service Workers are not supported in this browser");
      return {
        registration: null,
        isSupported: false,
        error: "Service Workers not supported",
      };
    }

    try {
      if (process.env.NODE_ENV === "development") {
        console.log("Registering service worker...");
      }

      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
        {
          scope: "/", // Service worker will control all pages
        }
      );

      this.registration = registration;

      // Handle service worker updates
      this.handleUpdates(registration);

      // Handle messages from service worker
      this.handleMessages();

      if (process.env.NODE_ENV === "development") {
        console.log("Service Worker registered successfully:", registration);
      }

      return {
        registration,
        isSupported: true,
        error: null,
      };
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return {
        registration: null,
        isSupported: true,
        error: error instanceof Error ? error.message : "Registration failed",
      };
    }
  }

  /**
   * Handle service worker updates
   */
  private handleUpdates(registration: ServiceWorkerRegistration) {
    // Listen for updates
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      if (process.env.NODE_ENV === "development") {
        console.log("New service worker found, installing...");
      }

      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed") {
          if (navigator.serviceWorker.controller) {
            // New update available
            if (process.env.NODE_ENV === "development") {
              console.log("New service worker installed, update available");
            }
            this.updateAvailable = true;
            this.notifyUpdateAvailable();
          } else {
            // First time installation
            if (process.env.NODE_ENV === "development") {
              console.log("Service worker installed for the first time");
            }
          }
        }
      });
    });

    // Handle controller change (when new SW takes control)
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (process.env.NODE_ENV === "development") {
        console.log("Service worker controller changed, reloading page...");
      }
      window.location.reload();
    });
  }

  /**
   * Handle messages from service worker
   */
  private handleMessages() {
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (process.env.NODE_ENV === "development") {
        console.log("Message from service worker:", event.data);
      }

      // Handle navigation requests from notification clicks
      if (event.data.type === "NOTIFICATION_CLICK") {
        const { url } = event.data;
        if (url && url !== window.location.pathname) {
          // Navigate to the requested URL
          window.location.href = url;
        }
      }
    });
  }

  /**
   * Notify user about available update
   */
  private notifyUpdateAvailable() {
    // You can customize this to show a toast or modal
    if (confirm("A new version is available. Would you like to update?")) {
      this.activateUpdate();
    }
  }

  /**
   * Activate the waiting service worker
   */
  activateUpdate() {
    if (!this.registration || !this.registration.waiting) {
      return;
    }

    // Tell the waiting service worker to skip waiting
    this.registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }

  /**
   * Unregister the service worker
   */
  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      if (process.env.NODE_ENV === "development") {
        console.log("Service worker unregistered:", result);
      }
      this.registration = null;
      return result;
    } catch (error) {
      console.error("Failed to unregister service worker:", error);
      return false;
    }
  }

  /**
   * Get the current registration
   */
  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  /**
   * Check if an update is available
   */
  isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  /**
   * Check if service worker is supported
   */
  static isSupported(): boolean {
    return "serviceWorker" in navigator;
  }

  /**
   * Get the current service worker state
   */
  getState(): string {
    if (!navigator.serviceWorker.controller) {
      return "not-controlled";
    }
    return navigator.serviceWorker.controller.state;
  }
}

// Create singleton instance
const serviceWorkerManager = new ServiceWorkerManager();

// Auto-register on module load (only in browser)
if (typeof window !== "undefined") {
  // Wait for the page to load before registering
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      serviceWorkerManager.register();
    });
  } else {
    serviceWorkerManager.register();
  }
}

export default serviceWorkerManager;
export { ServiceWorkerManager };
export type { ServiceWorkerRegistrationResult };
