// Firebase Console Notification Debugging Script
// Paste this in browser console to debug notification issues

console.log("🔍 Starting Firebase Notification Debug...");

// 1. Check Service Worker Status
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    console.log("📋 Service Worker Registrations:", registrations.length);
    registrations.forEach((reg, index) => {
      console.log(`SW ${index + 1}:`, {
        scope: reg.scope,
        state: reg.active?.state || "none",
        scriptURL: reg.active?.scriptURL || "none",
      });
    });
  });
} else {
  console.log("❌ Service Workers not supported");
}

// 2. Check Notification Permission
console.log("🔔 Notification Permission:", Notification.permission);

// 3. Check FCM Token in localStorage
const fcmToken = localStorage.getItem("fcm_token");
if (fcmToken) {
  console.log("🎫 FCM Token Found:");
  console.log("   Length:", fcmToken.length);
  console.log("   First 50 chars:", fcmToken.substring(0, 50) + "...");
  console.log("   Full token:", fcmToken);

  // Copy to clipboard if possible
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(fcmToken)
      .then(() => {
        console.log("📋 Token copied to clipboard!");
      })
      .catch(() => {
        console.log("❌ Could not copy to clipboard");
      });
  }
} else {
  console.log("❌ No FCM token found in localStorage");
}

// 4. Check Firebase Config
console.log("🔥 Firebase Config Check:");
console.log(
  "   VAPID Key length:",
  process?.env?.NEXT_PUBLIC_FIREBASE_FCM_VAPID_KEY?.length || "Not found"
);

// 5. Test Notification API directly
if ("Notification" in window && Notification.permission === "granted") {
  console.log("🧪 Testing direct notification...");
  try {
    new Notification("Debug Test", {
      body: "Direct notification API test",
      icon: "/web-app-manifest-192x192.png",
    });
    console.log("✅ Direct notification sent");
  } catch (error) {
    console.log("❌ Direct notification failed:", error);
  }
} else {
  console.log("❌ Cannot test direct notification - permission not granted");
}

// 6. Check for Firebase messaging instance
if (window.firebase && window.firebase.messaging) {
  console.log("✅ Firebase messaging available in window");
} else {
  console.log("❌ Firebase messaging not found in window");
}

console.log("🏁 Debug complete! Check the logs above for issues.");
console.log("📋 If FCM token was found, it's now in your clipboard.");
console.log("🚀 Use this token in Firebase Console to test notifications.");

// Instructions
console.log(`
📝 Next Steps:
1. Copy the FCM token from above
2. Go to Firebase Console → Cloud Messaging
3. Create new campaign → 'Single device'
4. Paste token (should be ~150+ characters)
5. Add title and body
6. Send test message
7. Check for notification (minimize browser first)
`);
