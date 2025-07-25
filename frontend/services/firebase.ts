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

/**
 * Generate a fresh FCM token using Firebase Messaging
 * This function does NOT store the token locally; it is meant to be used by Redux logic
 */
export const fetchToken = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      if (process.env.NODE_ENV === "development") {
        console.log("� Notification permission denied");
      }
      return null;
    }

    const fcmMessaging = await messaging();
    if (!fcmMessaging) {
      if (process.env.NODE_ENV === "development") {
        console.log("❌ FCM messaging not supported");
      }
      return null;
    }

    // Make sure service worker is ready
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (process.env.NODE_ENV === "development") {
        console.log(
          "🔧 Service worker ready for FCM token generation:",
          registration.scope
        );
      }
    }

    const token = await getToken(fcmMessaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_FCM_VAPID_KEY,
    });

    if (token) {
      if (process.env.NODE_ENV === "development") {
        console.log("🆕 Fresh FCM token generated:", token);
      }
      // Do NOT store token in localStorage; Redux and backend will handle persistence
      return token;
    } else {
      if (process.env.NODE_ENV === "development") {
        console.log(
          "❌ No FCM token generated - check VAPID key configuration"
        );
      }
      return null;
    }
  } catch (error) {
    console.error("❌ Error generating FCM token:", error);
    return null;
  }
};

export { app, messaging };
