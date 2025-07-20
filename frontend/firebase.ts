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

export const fetchToken = async () => {
  try {
    const fcmMessaging = await messaging();
    if (fcmMessaging) {
      const token = await getToken(fcmMessaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_FCM_VAPID_KEY,
      });
      return token;
    }
    return null;
  } catch (err) {
    console.error("An error occurred while fetching the token:", err);
    return null;
  }
};

export { app, messaging };
