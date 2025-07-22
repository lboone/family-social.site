"use client";

import serviceWorkerManager from "@/utils/serviceWorkerManager";
import { useEffect } from "react";

/**
 * Service Worker Provider Component
 * Handles service worker registration and lifecycle management
 */
export default function ServiceWorkerProvider() {
  useEffect(() => {
    // Only register service worker in browser environment
    if (typeof window === "undefined") return;

    let mounted = true;

    const registerServiceWorker = async () => {
      try {
        const result = await serviceWorkerManager.register();

        if (!mounted) return;

        if (result.isSupported && result.registration) {
          console.log("✅ Service Worker registered successfully");

          // Optional: Show user that PWA features are available
          if (result.registration.active) {
            console.log("🔔 Push notifications are now available");
          }
        } else if (!result.isSupported) {
          console.warn("⚠️ Service Workers not supported in this browser");
        } else if (result.error) {
          console.error("❌ Service Worker registration failed:", result.error);
        }
      } catch (error) {
        if (mounted) {
          console.error(
            "❌ Unexpected error during service worker registration:",
            error
          );
        }
      }
    };

    // Register service worker
    registerServiceWorker();

    // Cleanup function
    return () => {
      mounted = false;
    };
  }, []);

  // This component doesn't render anything, it just handles service worker registration
  return null;
}
