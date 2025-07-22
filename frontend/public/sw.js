// Service Worker for Family Social - Push Notifications
// This handles background notifications and notification clicks

// Import Firebase messaging for service worker
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js"
);

// Firebase configuration - should match your main app config
const firebaseConfig = {
  apiKey: "AIzaSyAtefHLmXmaQX0s3BDD1q1Z38hcCH9H5Y0",
  authDomain: "family-social-site-48412.firebaseapp.com",
  projectId: "family-social-site-48412",
  storageBucket: "family-social-site-48412.firebasestorage.app",
  messagingSenderId: "287882277900",
  appId: "1:287882277900:web:edd199cf73fee2826aea29",
  measurementId: "G-8DN1D16QM8",
};

// Initialize Firebase in service worker
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages when app is not in focus
messaging.onBackgroundMessage((payload) => {
  console.log("[Service Worker] Received background message:", payload);

  // Extract notification data
  const notificationTitle = payload.notification?.title || "Family Social";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new notification",
    icon: "/web-app-manifest-192x192.png", // App icon
    badge: "/web-app-manifest-192x192.png", // Small badge icon
    image: payload.notification?.image, // Large image (optional)
    data: {
      click_action:
        payload.notification?.click_action || payload.data?.click_action || "/",
      postId: payload.data?.postId,
      userId: payload.data?.userId,
      type: payload.data?.type,
      timestamp: Date.now(),
    },
    tag: payload.data?.type || "general", // Group similar notifications
    requireInteraction: false, // Don't require user interaction to dismiss
    silent: false, // Allow notification sound
    actions: [
      // Optional action buttons
      {
        action: "open",
        title: "Open",
        icon: "/web-app-manifest-192x192.png",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
  };

  // Show the notification
  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Notification clicked:", event);

  const notification = event.notification;
  const action = event.action;
  const data = notification.data;

  // Close the notification
  notification.close();

  if (action === "dismiss") {
    // User dismissed notification, do nothing
    return;
  }

  // Determine where to navigate
  let targetUrl = "/";

  if (data && data.click_action) {
    targetUrl = data.click_action;
  } else if (data) {
    // Generate URL based on notification type and data
    switch (data.type) {
      case "like":
      case "comment":
      case "save":
      case "post":
        if (data.postId) {
          targetUrl = `/post/${data.postId}`;
        }
        break;
      case "follow":
      case "unfollow":
        if (data.userId) {
          targetUrl = `/profile/${data.userId}`;
        }
        break;
      default:
        targetUrl = "/";
    }
  }

  // Handle the click - open or focus the app
  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Try to find an existing window with the app
        for (const client of clientList) {
          if (client.url.includes(self.location.origin)) {
            // Focus existing window and navigate to target
            client.focus();
            client.postMessage({
              type: "NOTIFICATION_CLICK",
              url: targetUrl,
              data: data,
            });
            return;
          }
        }

        // No existing window found, open a new one
        return clients.openWindow(self.location.origin + targetUrl);
      })
  );
});

// Handle push events (alternative to onBackgroundMessage)
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push received:", event);

  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.body || "You have a new notification",
    icon: "/web-app-manifest-192x192.png",
    badge: "/web-app-manifest-192x192.png",
    data: data.data || {},
    tag: data.tag || "general",
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Family Social", options)
  );
});

// Handle service worker installation
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");

  // Force waiting service worker to become active
  event.waitUntil(self.skipWaiting());
});

// Handle service worker activation
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");

  // Claim all clients immediately
  event.waitUntil(self.clients.claim());
});

// Handle messages from the main app
self.addEventListener("message", (event) => {
  console.log("[Service Worker] Message received:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Optional: Handle notification close events
self.addEventListener("notificationclose", (event) => {
  console.log("[Service Worker] Notification closed:", event.notification.data);

  // Track notification dismissals for analytics
  // You could send this data to your analytics service
});

// Optional: Handle service worker errors
self.addEventListener("error", (event) => {
  console.error("[Service Worker] Error:", event.error);
});

// Optional: Handle unhandled promise rejections
self.addEventListener("unhandledrejection", (event) => {
  console.error("[Service Worker] Unhandled promise rejection:", event.reason);
});
