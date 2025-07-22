"use client";

import { fetchToken, messaging } from "@/services/firebase";
import { onMessage, Unsubscribe } from "firebase/messaging";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const FCM_TOKEN_KEY = "fcm_token";
const FCM_TOKEN_TIMESTAMP_KEY = "fcm_token_timestamp";
const TOKEN_REFRESH_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Check if stored token is still valid (not older than 24 hours)
function isTokenValid(): boolean {
  const timestamp = localStorage.getItem(FCM_TOKEN_TIMESTAMP_KEY);
  if (!timestamp) return false;

  const tokenAge = Date.now() - parseInt(timestamp);
  return tokenAge < TOKEN_REFRESH_INTERVAL;
}

// Get stored token if it's still valid
function getStoredToken(): string | null {
  if (!isTokenValid()) {
    localStorage.removeItem(FCM_TOKEN_KEY);
    localStorage.removeItem(FCM_TOKEN_TIMESTAMP_KEY);
    return null;
  }
  return localStorage.getItem(FCM_TOKEN_KEY);
}

// Store token with timestamp
function storeToken(token: string): void {
  localStorage.setItem(FCM_TOKEN_KEY, token);
  localStorage.setItem(FCM_TOKEN_TIMESTAMP_KEY, Date.now().toString());
}

// Completely clean up FCM data and unsubscribe from messaging
function cleanupFCMData(): void {
  localStorage.removeItem(FCM_TOKEN_KEY);
  localStorage.removeItem(FCM_TOKEN_TIMESTAMP_KEY);
  console.log("FCM data cleaned up");
}

// Check current notification permission status
function getNotificationPermissionStatus(): NotificationPermission {
  if (!("Notification" in window)) {
    return "denied"; // Treat unsupported as denied
  }
  return Notification.permission;
}

async function getNotificationPermissionAndToken() {
  // Step 1: Check if Notifications are supported in the browser.
  if (!("Notification" in window)) {
    console.info("This browser does not support desktop notification");
    return null;
  }

  // Step 2: Check if permission is already granted.
  if (Notification.permission === "granted") {
    // Check for stored valid token first
    const storedToken = getStoredToken();
    if (storedToken) {
      console.log("Using stored FCM token");
      return storedToken;
    }

    // If no valid stored token, fetch new one
    console.log("Fetching new FCM token");
    const newToken = await fetchToken();
    if (newToken) {
      storeToken(newToken);
    }
    return newToken;
  }

  // Step 3: If permission is not denied, request permission from the user.
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Permission granted, fetching new FCM token");
      const newToken = await fetchToken();
      if (newToken) {
        storeToken(newToken);
      }
      return newToken;
    }
  }

  console.log("Notification permission not granted.");
  return null;
}

const useFcmToken = () => {
  const router = useRouter(); // Initialize the router for navigation.
  const [notificationPermissionStatus, setNotificationPermissionStatus] =
    useState<NotificationPermission | null>(null); // State to store the notification permission status.
  const [token, setToken] = useState<string | null>(null); // State to store the FCM token.
  const [isNewToken, setIsNewToken] = useState<boolean>(false); // Flag to indicate if this is a new/refreshed token
  const retryLoadToken = useRef(0); // Ref to keep track of retry attempts.
  const isLoading = useRef(false); // Ref to keep track if a token fetch is currently in progress.

  // Initialize previousTokenRef with stored token to avoid false positives
  const previousTokenRef = useRef<string | null>(
    typeof window !== "undefined" ? getStoredToken() : null
  ); // Track previous token to detect changes

  const loadToken = async () => {
    // Step 4: Prevent multiple fetches if already fetched or in progress.
    if (isLoading.current) return;

    isLoading.current = true; // Mark loading as in progress.
    const newToken = await getNotificationPermissionAndToken(); // Fetch the token.

    // Step 5: Handle the case where permission is denied.
    if (Notification.permission === "denied") {
      setNotificationPermissionStatus("denied");
      console.info(
        "%cPush Notifications issue - permission denied",
        "color: green; background: #c7c7c7; padding: 8px; font-size: 20px"
      );
      isLoading.current = false;
      return;
    }

    // Step 6: Retry fetching the token if necessary. (up to 3 times)
    // This step is typical initially as the service worker may not be ready/installed yet.
    if (!newToken) {
      if (retryLoadToken.current >= 3) {
        alert("Unable to load token, refresh the browser");
        console.info(
          "%cPush Notifications issue - unable to load token after 3 retries",
          "color: green; background: #c7c7c7; padding: 8px; font-size: 20px"
        );
        isLoading.current = false;
        return;
      }

      retryLoadToken.current += 1;
      console.error("An error occurred while retrieving token. Retrying...");
      isLoading.current = false;
      await loadToken();
      return;
    }

    // Step 7: Check if this is a new token (different from previous or first time)
    const isTokenNew = previousTokenRef.current !== newToken;
    console.log("🔍 Token comparison:", {
      previousToken: previousTokenRef.current,
      newToken: newToken,
      isNewToken: isTokenNew,
    });

    previousTokenRef.current = newToken;

    // Set the fetched token and mark as fetched.
    setNotificationPermissionStatus(Notification.permission);
    setToken(newToken);
    setIsNewToken(isTokenNew);
    isLoading.current = false;
  };

  useEffect(() => {
    // Step 8: Initialize token loading when the component mounts.
    if ("Notification" in window) {
      loadToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const setupListener = async () => {
      if (!token) return; // Exit if no token is available.

      console.log(`onMessage registered with token ${token}`);
      const m = await messaging();
      if (!m) return;

      // Step 9: Register a listener for incoming FCM messages.
      const unsubscribe = onMessage(m, (payload) => {
        if (Notification.permission !== "granted") return;

        console.log("Foreground push notification received:", payload);
        const link = payload.fcmOptions?.link || payload.data?.link;

        if (link) {
          toast.info(
            `${payload.notification?.title}: ${payload.notification?.body}`,
            {
              action: {
                label: "Visit",
                onClick: () => {
                  const link = payload.fcmOptions?.link || payload.data?.link;
                  if (link) {
                    router.push(link);
                  }
                },
              },
            }
          );
        } else {
          toast.info(
            `${payload.notification?.title}: ${payload.notification?.body}`
          );
        }

        // --------------------------------------------
        // Disable this if you only want toast notifications.
        const n = new Notification(
          payload.notification?.title || "New message",
          {
            body: payload.notification?.body || "This is a new message",
            data: link ? { url: link } : undefined,
          }
        );

        // Step 10: Handle notification click event to navigate to a link if present.
        n.onclick = (event) => {
          event.preventDefault();
          const target = event.target as Notification;
          const link = (target.data as { url?: string })?.url;
          if (link) {
            router.push(link);
          } else {
            console.log("No link found in the notification payload");
          }
        };
        // --------------------------------------------
      });

      return unsubscribe;
    };

    let unsubscribe: Unsubscribe | null = null;

    setupListener().then((unsub) => {
      if (unsub) {
        unsubscribe = unsub;
      }
    });

    // Step 11: Cleanup the listener when the component unmounts.
    return () => unsubscribe?.();
  }, [token, router]);

  return {
    token,
    notificationPermissionStatus,
    isNewToken, // Return flag indicating if this is a new token that needs to be sent to backend
  };
};

// Export utility functions for external use
export { cleanupFCMData, getNotificationPermissionStatus };
export default useFcmToken;
