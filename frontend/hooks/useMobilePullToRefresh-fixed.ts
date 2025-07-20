"use client";

import PullToRefresh from "pulltorefreshjs";
import { useCallback, useEffect, useRef, useState } from "react";

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

// Persistent storage for throttling across page reloads
const LAST_RELOAD_KEY = "pull-to-refresh-last-reload";
const REFRESH_LOCK_KEY = "pull-to-refresh-lock";

const getLastReloadTime = (): number => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return parseInt(localStorage.getItem(LAST_RELOAD_KEY) || "0", 10);
    }
  } catch (error) {
    console.warn("Unable to read last reload time:", error);
  }
  return 0;
};

const setLastReloadTime = (time: number): void => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(LAST_RELOAD_KEY, time.toString());
    }
  } catch (error) {
    console.warn("Unable to save last reload time:", error);
  }
};

const isRefreshLocked = (): boolean => {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      const lockTime = parseInt(
        sessionStorage.getItem(REFRESH_LOCK_KEY) || "0",
        10
      );
      const now = Date.now();
      // Lock expires after 10 seconds
      if (lockTime && now - lockTime < 10000) {
        return true;
      }
      // Clear expired lock
      sessionStorage.removeItem(REFRESH_LOCK_KEY);
    }
  } catch (error) {
    console.warn("Unable to check refresh lock:", error);
  }
  return false;
};

const setRefreshLock = (): void => {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      sessionStorage.setItem(REFRESH_LOCK_KEY, Date.now().toString());
    }
  } catch (error) {
    console.warn("Unable to set refresh lock:", error);
  }
};

const clearRefreshLock = (): void => {
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      sessionStorage.removeItem(REFRESH_LOCK_KEY);
    }
  } catch (error) {
    console.warn("Unable to clear refresh lock:", error);
  }
};

export const useMobilePullToRefresh = ({
  onRefresh,
  enabled = true,
  visibilityReloadDelay = 2000, // 2 seconds delay
  throttleInterval = 30000, // 30 seconds minimum between reloads
}: UseMobilePullToRefreshOptions = {}) => {
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const visibilityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pullToRefreshInstance = useRef<ReturnType<
    typeof PullToRefresh.init
  > | null>(null);

  // Safe refresh handler that prevents infinite loops
  const safeRefresh = useCallback(
    async (source: string = "unknown") => {
      // Prevent multiple simultaneous refreshes
      if (isRefreshing) {
        console.log(
          `🚫 Refresh blocked - already refreshing (source: ${source})`
        );
        return;
      }

      // Check if refresh is locked (recent refresh in progress)
      if (isRefreshLocked()) {
        console.log(
          `🚫 Refresh locked - recent refresh in progress (source: ${source})`
        );
        return;
      }

      const now = Date.now();
      const lastReload = getLastReloadTime();

      // Check throttle interval
      if (now - lastReload < throttleInterval) {
        const remainingTime = Math.ceil(
          (throttleInterval - (now - lastReload)) / 1000
        );
        console.log(
          `🚫 Refresh throttled - ${remainingTime}s remaining (source: ${source})`
        );
        return;
      }

      console.log(`🔄 Starting refresh (source: ${source})`);

      try {
        setIsRefreshing(true);
        setRefreshLock();
        setLastReloadTime(now);

        if (onRefresh) {
          // Use custom refresh function if provided
          await onRefresh();
          console.log(`✅ Custom refresh completed (source: ${source})`);
        } else {
          // Safe page reload with proper cleanup
          console.log(`🔄 Performing page reload (source: ${source})`);
          // Use replace instead of reload to prevent back button issues
          window.location.href = window.location.href;
        }
      } catch (error) {
        console.error(`❌ Refresh failed (source: ${source}):`, error);
        // Don't fallback to window.location.reload() to prevent loops
      } finally {
        setIsRefreshing(false);
        // Clear lock after a delay to prevent rapid succession
        setTimeout(clearRefreshLock, 2000);
      }
    },
    [onRefresh, throttleInterval, isRefreshing]
  );

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
          await safeRefresh("pull-to-refresh");
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
  }, [enabled, isMobileDevice, safeRefresh]);

  // Handle page visibility changes (tab switching, app switching) - DISABLED to prevent loops
  useEffect(() => {
    if (!enabled || !isMobileDevice) return;

    const handleVisibilityChange = () => {
      // Clear any existing timeout
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
      }

      if (document.visibilityState === "visible") {
        // User came back to the tab/app - be more conservative
        visibilityTimeoutRef.current = setTimeout(() => {
          // Only refresh if user explicitly requests it via pull-to-refresh
          console.log("🔄 Tab became visible - pull-to-refresh available");
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
  }, [enabled, isMobileDevice, visibilityReloadDelay]);

  // Handle app state changes (iOS Safari and PWA) - DISABLED to prevent loops
  useEffect(() => {
    if (!enabled || !isMobileDevice) return;

    const handlePageShow = () => {
      // Page was restored from cache (back/forward navigation)
      console.log("🔄 Page shown from cache - pull-to-refresh available");
      // Don't auto-refresh, let user manually pull to refresh
    };

    const handleFocus = () => {
      // Window gained focus
      console.log("🔄 Window focused - pull-to-refresh available");
      // Don't auto-refresh, let user manually pull to refresh
    };

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("focus", handleFocus);
    };
  }, [enabled, isMobileDevice]);

  return {
    isMobileDevice,
    isEnabled: enabled && isMobileDevice,
    isRefreshing,
    manualRefresh: () => safeRefresh("manual"),
  };
};
