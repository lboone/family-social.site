"use client";

import { API_URL_USER } from "@/server";
import { fetchToken, messaging } from "@/services/firebase";
import {
  selectFcmToken,
  selectNotificationPermissionStatus,
  selectPushEnabled,
  selectPushNotificationSettings,
  selectTokenNeedsRefresh,
  setAuthUser,
} from "@/store/authSlice";
import axios from "axios";
import { onMessage, Unsubscribe } from "firebase/messaging";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

// ============================================================================
// REDUX-BASED FCM TOKEN MANAGEMENT HOOK
// ============================================================================

const useFcmToken = () => {
  const dispatch = useDispatch();

  // Redux selectors - single source of truth
  const pushSettings = useSelector(selectPushNotificationSettings);
  const fcmToken = useSelector(selectFcmToken);
  const tokenNeedsRefresh = useSelector(selectTokenNeedsRefresh);
  const pushEnabled = useSelector(selectPushEnabled);
  const permissionStatus = useSelector(selectNotificationPermissionStatus);

  // Local component state for loading/error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for cleanup
  const messageUnsubscribe = useRef<Unsubscribe | null>(null);

  // ============================================================================
  // HELPER FUNCTIONS FOR DIFFERENT FCM SCENARIOS
  // ============================================================================

  const saveNegativeNotificationSettings = useCallback(async () => {
    try {
      setIsLoading(true);

      const negativeSettings = {
        pushEnabled: false,
        likes: false,
        comments: false,
        follow: false,
        unfollow: false,
        postType: "none",
        fcmToken: null,
        tokenTimestamp: null,
        tokenValid: false,
        deviceInfo: null,
        lastSyncAt: new Date().toISOString(),
      };

      const formData = new FormData();
      formData.append(
        "pushNotificationSettings",
        JSON.stringify(negativeSettings)
      );

      const response = await axios.post(
        `${API_URL_USER}/edit-profile`,
        formData,
        {
          withCredentials: true,
          timeout: 10000,
        }
      );

      if (response.data.status === "success") {
        dispatch(setAuthUser(response.data.data.user));
        console.log("✅ Negative notification settings saved to backend");
      }
    } catch (error) {
      console.error("❌ Failed to save negative settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  const syncTokenWithBackend = useCallback(
    async (token: string) => {
      try {
        console.log("🔄 Syncing FCM token with backend...");

        // Get device info for tracking
        const deviceInfo = `${navigator.userAgent.substring(0, 100)}`;

        // Create push notification settings with defaults
        const pushNotificationSettings = {
          fcmToken: token,
          tokenTimestamp: new Date().toISOString(),
          tokenValid: true,
          deviceInfo: deviceInfo,
          lastSyncAt: new Date().toISOString(),
          pushEnabled: true,
          likes: true,
          comments: true,
          follow: true,
          unfollow: false,
          postType: "following",
        };

        // Sync with backend
        const formData = new FormData();
        formData.append(
          "pushNotificationSettings",
          JSON.stringify(pushNotificationSettings)
        );

        const response = await axios.post(
          `${API_URL_USER}/edit-profile`,
          formData,
          {
            withCredentials: true,
            timeout: 10000,
          }
        );

        if (response.data.status === "success") {
          // Update Redux store with backend response
          dispatch(setAuthUser(response.data.data.user));
          console.log(
            "✅ FCM token successfully synced with backend and Redux store updated"
          );
          toast.success("🔔 Notifications enabled!");
        } else {
          throw new Error("Backend returned non-success status");
        }
      } catch (error) {
        console.error("❌ Failed to sync FCM token with backend:", error);
        setError("Failed to sync with server");

        if (axios.isAxiosError(error)) {
          if (error.response?.status === 429) {
            toast.error("Too many requests. Please try again later.");
          } else if (error.response && error.response.status >= 500) {
            toast.error("Server error. Please try again later.");
          } else {
            toast.error("Failed to enable notifications. Please try again.");
          }
        } else {
          toast.error("Network error. Please try again later.");
        }
      }
    },
    [dispatch]
  );

  const refreshFcmToken = useCallback(async () => {
    try {
      setIsLoading(true);

      console.log("🔄 Refreshing FCM token...");
      const token = await fetchToken();

      if (!token) {
        console.error("❌ Failed to refresh FCM token");
        return;
      }

      await syncTokenWithBackend(token);
    } catch (error) {
      console.error("❌ Error refreshing FCM token:", error);
    } finally {
      setIsLoading(false);
    }
  }, [syncTokenWithBackend]);

  const initializeWithDefaults = useCallback(async () => {
    try {
      setIsLoading(true);

      // Generate FCM token since permission is already granted
      console.log("🔄 Generating FCM token for existing user...");
      const token = await fetchToken();

      if (!token) {
        console.error("❌ Failed to generate FCM token");
        return;
      }

      await syncTokenWithBackend(token);
    } catch (error) {
      console.error("❌ Error initializing with defaults:", error);
    } finally {
      setIsLoading(false);
    }
  }, [syncTokenWithBackend]);

  const requestPermissionAndInitialize = useCallback(async () => {
    try {
      setIsLoading(true);

      // Request notification permission
      console.log("🔔 Requesting notification permission...");
      const permission = await Notification.requestPermission();

      if (permission === "denied") {
        console.log("❌ User denied notification permission");
        await saveNegativeNotificationSettings();
        return;
      }

      if (permission === "granted") {
        console.log("✅ User granted notification permission");
        await initializeWithDefaults();
        return;
      }

      // Permission is still "default" somehow - shouldn't happen but handle it
      console.log(
        "⚠️ Permission request returned 'default' - treating as denied"
      );
      await saveNegativeNotificationSettings();
    } catch (error) {
      console.error("❌ Error requesting permission:", error);
      await saveNegativeNotificationSettings();
    } finally {
      setIsLoading(false);
    }
  }, [saveNegativeNotificationSettings, initializeWithDefaults]);

  // ============================================================================
  // COMPREHENSIVE FCM INITIALIZATION - HANDLES ALL SCENARIOS
  // ============================================================================

  const initializeFcm = useCallback(async () => {
    // Check if browser supports notifications
    if (!("Notification" in window)) {
      console.error("❌ This browser does not support notifications");
      setError("Browser does not support notifications");
      return;
    }

    const currentPermission = Notification.permission;
    const userHasPushSettings =
      pushSettings !== undefined && pushSettings !== null;
    const userPushEnabled = pushSettings?.pushEnabled || false;

    console.log("🔍 FCM Scenario Analysis:", {
      permission: currentPermission,
      userHasPushSettings,
      userPushEnabled,
      hasToken: !!fcmToken,
      tokenNeedsRefresh,
      pushSettingsObject: pushSettings,
    });

    // Add detailed logging for permission reset scenario
    if (currentPermission === "default") {
      console.log("🔍 Permission is 'default' - detailed analysis:", {
        userHasPushSettings,
        userPushEnabled,
        pushSettingsExists: !!pushSettings,
        pushEnabledValue: pushSettings?.pushEnabled,
        willTriggerScenario5: !userHasPushSettings || userPushEnabled,
        willTriggerScenario5B: userHasPushSettings && !userPushEnabled,
      });
    }

    // ========================================
    // SCENARIO 1: Permission granted, pushEnabled false - IGNORE
    // ========================================
    if (
      currentPermission === "granted" &&
      userHasPushSettings &&
      !userPushEnabled
    ) {
      console.log(
        "✅ User has explicitly disabled push notifications. Ignoring."
      );
      return;
    }

    // ========================================
    // SCENARIO 2: Permission denied, pushEnabled false - IGNORE
    // ========================================
    if (
      currentPermission === "denied" &&
      userHasPushSettings &&
      !userPushEnabled
    ) {
      console.log("✅ User denied permission and disabled push. Ignoring.");
      return;
    }

    // ========================================
    // SCENARIO 3: Permission denied, pushEnabled true/missing - Save negative values
    // ========================================
    if (
      currentPermission === "denied" &&
      (!userHasPushSettings || userPushEnabled)
    ) {
      console.log(
        "🔄 User denied permission. Saving negative values to backend."
      );
      await saveNegativeNotificationSettings();
      return;
    }

    // ========================================
    // SCENARIO 4: Permission granted, pushEnabled missing - New user, set defaults
    // ========================================
    if (currentPermission === "granted" && !userHasPushSettings) {
      console.log(
        "🔄 Existing user with granted permission but no settings. Setting defaults."
      );
      await initializeWithDefaults();
      return;
    }

    // ========================================
    // SCENARIO 5: Permission not asked, pushEnabled true/missing - New user flow
    // ========================================
    if (
      currentPermission === "default" &&
      (!userHasPushSettings || userPushEnabled)
    ) {
      console.log(
        "🔄 New user or permission not asked. Starting full initialization."
      );
      await requestPermissionAndInitialize();
      return;
    }

    // ========================================
    // SCENARIO 5B: Permission reset to default, but user had settings - Re-ask permission
    // ========================================
    if (
      currentPermission === "default" &&
      userHasPushSettings &&
      !userPushEnabled
    ) {
      console.log(
        "🔄 Browser permission reset but user had settings. Re-asking permission."
      );
      await requestPermissionAndInitialize();
      return;
    }

    // ========================================
    // SCENARIO 6: Permission granted, pushEnabled true, token valid - Skip
    // ========================================
    if (
      currentPermission === "granted" &&
      userPushEnabled &&
      fcmToken &&
      !tokenNeedsRefresh
    ) {
      console.log(
        "✅ Valid FCM token exists and user has enabled push. Skipping initialization."
      );
      return;
    }

    // ========================================
    // SCENARIO 7: Permission granted, pushEnabled true, token needs refresh - Refresh
    // ========================================
    if (
      currentPermission === "granted" &&
      userPushEnabled &&
      tokenNeedsRefresh
    ) {
      console.log("🔄 Token needs refresh. Refreshing FCM token.");
      await refreshFcmToken();
      return;
    }

    console.log("⚠️ Unhandled FCM scenario - defaulting to ignore");
  }, [
    pushSettings,
    fcmToken,
    tokenNeedsRefresh,
    saveNegativeNotificationSettings,
    initializeWithDefaults,
    requestPermissionAndInitialize,
    refreshFcmToken,
  ]);

  // ============================================================================
  // NOTIFICATION DISABLING
  // ============================================================================

  const disableNotifications = useCallback(async () => {
    try {
      setIsLoading(true);

      // Update backend to disable notifications
      const disabledSettings = {
        ...pushSettings,
        pushEnabled: false,
        fcmToken: null,
        tokenValid: false,
      };

      const formData = new FormData();
      formData.append(
        "pushNotificationSettings",
        JSON.stringify(disabledSettings)
      );

      const response = await axios.post(
        `${API_URL_USER}/edit-profile`,
        formData,
        {
          withCredentials: true,
        }
      );

      if (response.data.status === "success") {
        dispatch(setAuthUser(response.data.data.user));
        console.log("✅ Notifications disabled successfully");
        toast.success("🔕 Notifications disabled");
      }
    } catch (error) {
      console.error("❌ Failed to disable notifications:", error);
      toast.error("Failed to disable notifications");
    } finally {
      setIsLoading(false);
    }
  }, [pushSettings, dispatch]);

  // ============================================================================
  // FOREGROUND MESSAGE HANDLING
  // ============================================================================

  useEffect(() => {
    const setupForegroundMessaging = async () => {
      try {
        const fcmMessaging = await messaging();
        if (fcmMessaging && fcmToken) {
          messageUnsubscribe.current = onMessage(fcmMessaging, (payload) => {
            console.log("🔔 Foreground message received:", payload);

            if (payload.notification) {
              toast.success(
                `${payload.notification.title}\n${payload.notification.body}`,
                {
                  duration: 5000,
                }
              );
            }
          });
          console.log("✅ Foreground message listener registered");
        }
      } catch (error) {
        console.error("❌ Error setting up foreground messaging:", error);
      }
    };

    setupForegroundMessaging();

    return () => {
      if (messageUnsubscribe.current) {
        messageUnsubscribe.current();
        messageUnsubscribe.current = null;
        console.log("🔄 Foreground message listener unregistered");
      }
    };
  }, [fcmToken]);

  // ============================================================================
  // HOOK RETURN INTERFACE
  // ============================================================================

  return {
    // Token state from Redux
    token: fcmToken,
    isValid: !tokenNeedsRefresh,
    needsSync: tokenNeedsRefresh,

    // Settings from Redux
    settings: pushSettings,
    pushEnabled,
    permissionStatus,

    // Actions
    initializeFcm,
    disableNotifications,

    // Status
    isLoading,
    error,

    // Legacy compatibility (for existing components)
    notificationPermissionStatus: permissionStatus,
    isNewToken: false, // No longer relevant in Redux approach
  };
};

export default useFcmToken;
