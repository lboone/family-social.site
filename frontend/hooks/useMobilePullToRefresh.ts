"use client";

import PullToRefresh from "pulltorefreshjs";
import { useEffect, useRef, useState } from "react";

interface UseMobilePullToRefreshOptions {
  onRefresh?: () => Promise<void> | void;
  enabled?: boolean;
  visibilityReloadDelay?: number; // Delay in ms before reloading on visibility change
  throttleInterval?: number; // Minimum time between reloads in ms
}

// Helper function to detect mobile/PWA
const isMobileOrPWA = (): boolean => {
  // Check if it's a PWA (standalone mode)
  const isPWA =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone ||
    document.referrer.includes("android-app://");

  // Check if it's mobile
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth <= 768;

  return isPWA || isMobile;
};

export const useMobilePullToRefresh = ({
  onRefresh,
  enabled = true,
  visibilityReloadDelay = 2000, // 2 seconds delay
  throttleInterval = 30000, // 30 seconds minimum between reloads
}: UseMobilePullToRefreshOptions = {}) => {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const lastReloadTime = useRef<number>(0);
  const visibilityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pullToRefreshInstance = useRef<ReturnType<
    typeof PullToRefresh.init
  > | null>(null);

  // Default refresh handler - reload window
  const defaultRefresh = async () => {
    const now = Date.now();
    if (now - lastReloadTime.current >= throttleInterval) {
      lastReloadTime.current = now;
      window.location.reload();
    }
  };

  const refreshHandler = onRefresh || defaultRefresh;

  // Initialize mobile detection
  useEffect(() => {
    setIsMobileDevice(isMobileOrPWA());

    // Listen for resize to detect orientation changes
    const handleResize = () => {
      setIsMobileDevice(isMobileOrPWA());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize pull-to-refresh
  useEffect(() => {
    if (!enabled || !isMobileDevice || pullToRefreshInstance.current) return;

    try {
      pullToRefreshInstance.current = PullToRefresh.init({
        mainElement: "body",
        onRefresh: async () => {
          try {
            await refreshHandler();
          } catch (error) {
            console.error("Pull to refresh error:", error);
            // Fallback to window reload on error
            window.location.reload();
          }
        },
        iconArrow: "⬇",
        iconRefreshing: "⟳",
        instructionsPullToRefresh: "Pull down to refresh",
        instructionsReleaseToRefresh: "Release to refresh",
        instructionsRefreshing: "Refreshing...",
        distThreshold: 60,
        distMax: 80,
        distReload: 50,
        distIgnore: 0,
        triggerElement: "body",
        ptrElement: ".ptr",
        classPrefix: "ptr--",
        cssProp: "min-height",
        resistanceFunction: (t: number) => Math.min(1, t / 2.5),
        shouldPullToRefresh: () => !window.scrollY,
      });

      console.log("✅ Pull-to-refresh initialized for mobile device");
    } catch (error) {
      console.error("Failed to initialize pull-to-refresh:", error);
    }

    return () => {
      if (pullToRefreshInstance.current) {
        try {
          PullToRefresh.destroyAll();
          pullToRefreshInstance.current = null;
          console.log("🧹 Pull-to-refresh destroyed");
        } catch (error) {
          console.error("Error destroying pull-to-refresh:", error);
        }
      }
    };
  }, [enabled, isMobileDevice, refreshHandler]);

  // Handle page visibility changes (tab switching, app switching)
  useEffect(() => {
    if (!enabled || !isMobileDevice) return;

    const handleVisibilityChange = () => {
      // Clear any existing timeout
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
      }

      if (document.visibilityState === "visible") {
        // User came back to the tab/app
        visibilityTimeoutRef.current = setTimeout(() => {
          const now = Date.now();
          if (now - lastReloadTime.current >= throttleInterval) {
            console.log("🔄 Auto-refreshing due to visibility change");
            refreshHandler();
          }
        }, visibilityReloadDelay);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
      }
    };
  }, [
    enabled,
    isMobileDevice,
    refreshHandler,
    visibilityReloadDelay,
    throttleInterval,
  ]);

  // Handle app state changes (iOS Safari and PWA)
  useEffect(() => {
    if (!enabled || !isMobileDevice) return;

    const handlePageShow = () => {
      // Page was restored from cache (back/forward navigation)
      const now = Date.now();
      if (now - lastReloadTime.current >= throttleInterval) {
        console.log("🔄 Auto-refreshing due to page show");
        refreshHandler();
      }
    };

    const handleFocus = () => {
      // Window gained focus
      const now = Date.now();
      if (now - lastReloadTime.current >= throttleInterval) {
        setTimeout(() => {
          console.log("🔄 Auto-refreshing due to focus");
          refreshHandler();
        }, visibilityReloadDelay);
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("focus", handleFocus);
    };
  }, [
    enabled,
    isMobileDevice,
    refreshHandler,
    visibilityReloadDelay,
    throttleInterval,
  ]);

  return {
    isMobileDevice,
    isEnabled: enabled && isMobileDevice,
    manualRefresh: refreshHandler,
  };
};
