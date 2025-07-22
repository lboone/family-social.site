/**
 * Utility to clear service worker cache and force refresh
 * Use this when encountering cached service worker issues
 */

export const clearServiceWorkerCache = async (): Promise<void> => {
  try {
    if ("serviceWorker" in navigator) {
      // Get all registrations
      const registrations = await navigator.serviceWorker.getRegistrations();

      console.log(`Found ${registrations.length} service worker registrations`);

      // Unregister all service workers
      for (const registration of registrations) {
        console.log("Unregistering service worker:", registration.scope);
        await registration.unregister();
      }

      // Clear caches
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        console.log(`Found ${cacheNames.length} caches to clear`);

        for (const cacheName of cacheNames) {
          console.log("Deleting cache:", cacheName);
          await caches.delete(cacheName);
        }
      }

      console.log("✅ Service worker cache cleared successfully");
      console.log(
        "🔄 Please refresh the page to re-register the service worker"
      );
    } else {
      console.log("Service Workers not supported");
    }
  } catch (error) {
    console.error("Error clearing service worker cache:", error);
  }
};

export const forceServiceWorkerUpdate = async (): Promise<void> => {
  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        console.log("Forcing service worker update...");
        await registration.update();
        console.log("✅ Service worker update forced");
      } else {
        console.log("No service worker registration found");
      }
    }
  } catch (error) {
    console.error("Error forcing service worker update:", error);
  }
};

// Helper function to check service worker status
export const getServiceWorkerStatus = async () => {
  if (!("serviceWorker" in navigator)) {
    return { supported: false, registrations: [] };
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    return {
      supported: true,
      registrations: registrations.map((reg) => ({
        scope: reg.scope,
        state: reg.active?.state || "none",
        updatefound: reg.installing !== null || reg.waiting !== null,
      })),
    };
  } catch (error) {
    console.error("Error checking service worker status:", error);
    return {
      supported: true,
      registrations: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
