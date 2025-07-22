import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";

// Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAtefHLmXmaQX0s3BDD1q1Z38hcCH9H5Y0",
  authDomain: "family-social-site-48412.firebaseapp.com",
  projectId: "family-social-site-48412",
  storageBucket: "family-social-site-48412.firebasestorage.app",
  messagingSenderId: "287882277900",
  appId: "1:287882277900:web:edd199cf73fee2826aea29",
  measurementId: "G-8DN1D16QM8",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const messaging = async () => {
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
};

// Token storage keys
const FCM_TOKEN_KEY = "fcm_token";
const FCM_TOKEN_TIMESTAMP_KEY = "fcm_token_timestamp";
const FCM_TOKEN_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Check if stored token is still valid (not expired)
 */
const isTokenValid = (): boolean => {
  const timestamp = localStorage.getItem(FCM_TOKEN_TIMESTAMP_KEY);
  if (!timestamp) return false;

  const tokenAge = Date.now() - parseInt(timestamp);
  return tokenAge < FCM_TOKEN_MAX_AGE;
};

/**
 * Store FCM token with timestamp
 */
const storeToken = (token: string): void => {
  localStorage.setItem(FCM_TOKEN_KEY, token);
  localStorage.setItem(FCM_TOKEN_TIMESTAMP_KEY, Date.now().toString());
  console.log("📦 FCM token stored with timestamp");
};

/**
 * Get stored FCM token if valid
 */
const getStoredToken = (): string | null => {
  const token = localStorage.getItem(FCM_TOKEN_KEY);
  if (!token) return null;

  if (isTokenValid()) {
    console.log("✅ Using valid stored FCM token");
    return token;
  } else {
    console.log("🔄 Stored FCM token expired, will generate new one");
    // Clear expired token
    localStorage.removeItem(FCM_TOKEN_KEY);
    localStorage.removeItem(FCM_TOKEN_TIMESTAMP_KEY);
    return null;
  }
};

/**
 * Generate a fresh FCM token
 */
const generateFreshToken = async (): Promise<string | null> => {
  try {
    const fcmMessaging = await messaging();
    if (!fcmMessaging) {
      console.log("❌ FCM messaging not supported");
      return null;
    }

    // Make sure service worker is ready
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      console.log(
        "🔧 Service worker ready for FCM token generation:",
        registration.scope
      );
    }

    const token = await getToken(fcmMessaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_FCM_VAPID_KEY,
    });

    if (token) {
      console.log(
        "🆕 Fresh FCM token generated:",
        token.substring(0, 20) + "..."
      );
      storeToken(token);
      return token;
    } else {
      console.log("❌ No FCM token generated - check VAPID key configuration");
      return null;
    }
  } catch (error) {
    console.error("❌ Error generating FCM token:", error);
    return null;
  }
};

/**
 * Main function to get FCM token with automatic refresh handling
 */
export const fetchToken = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("🚫 Notification permission denied");
      return null;
    }

    // First, try to use stored token if valid
    const storedToken = getStoredToken();
    if (storedToken) {
      return storedToken;
    }

    // If no valid stored token, generate fresh one
    console.log("🔄 Generating fresh FCM token...");
    return await generateFreshToken();
  } catch (error) {
    console.error("❌ Error in fetchToken:", error);
    return null;
  }
};

/**
 * Force refresh FCM token (useful when token is rejected by server)
 */
export const refreshToken = async (): Promise<string | null> => {
  console.log("🔄 Force refreshing FCM token...");

  // Clear existing token
  localStorage.removeItem(FCM_TOKEN_KEY);
  localStorage.removeItem(FCM_TOKEN_TIMESTAMP_KEY);

  // Generate fresh token
  return await generateFreshToken();
};

/**
 * Validate token with server and refresh if needed
 */
export const validateAndRefreshToken = async (
  currentToken: string
): Promise<string | null> => {
  try {
    // Test the token with a lightweight API call
    const response = await fetch("/api/validate-fcm-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: currentToken }),
    });

    if (response.ok) {
      console.log("✅ FCM token is valid");
      return currentToken;
    } else {
      console.log("🔄 FCM token invalid, refreshing...");
      return await refreshToken();
    }
  } catch (error) {
    console.error("❌ Error validating token:", error);
    // If validation fails, try to refresh anyway
    return await refreshToken();
  }
};

export { app, messaging };
