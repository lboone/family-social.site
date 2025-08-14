/**
 * Push Notification Testing Utilities
 *
 * Add this to your browser console to test notifications manually
 * Usage: Copy and paste these functions into your browser console
 */

// Testing utility functions
window.NotificationTester = {
  /**
   * Test FCM Token Status
   */
  async checkFCMStatus() {
    console.log("🔍 Checking FCM Status...");

    // Check if service worker is registered
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      console.log("✅ Service Worker registered:", registration);
    } else {
      console.log("❌ Service Worker not supported");
      return;
    }

    // Check notification permission
    console.log("🔔 Notification permission:", Notification.permission);

    // Check if Firebase messaging is available
    if (window.firebase && window.firebase.messaging) {
      console.log("✅ Firebase messaging available");
      try {
        const messaging = window.firebase.messaging();
        console.log("✅ Firebase messaging instance created");
      } catch (error) {
        console.log("❌ Firebase messaging error:", error);
      }
    } else {
      console.log("❌ Firebase messaging not available");
    }
  },

  /**
   * Test Web Push Status
   */
  async checkWebPushStatus() {
    console.log("🔍 Checking Web Push Status...");

    // Check platform
    const isIosSafari =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      /Safari/.test(navigator.userAgent) &&
      !/Chrome|CriOS|FxiOS/.test(navigator.userAgent);

    const isPWA =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    console.log("📱 Platform Info:", {
      isIosSafari,
      isPWA,
      userAgent: navigator.userAgent,
      pushManager: "PushManager" in window,
      serviceWorker: "serviceWorker" in navigator,
      notification: "Notification" in window,
    });

    // Check current subscription
    if ("serviceWorker" in navigator && "PushManager" in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
          console.log(
            "✅ Web Push subscription exists:",
            subscription.endpoint
          );
        } else {
          console.log("⚠️ No Web Push subscription found");
        }
      } catch (error) {
        console.log("❌ Web Push check error:", error);
      }
    }
  },

  /**
   * Test notification creation
   */
  async testLocalNotification() {
    console.log("🧪 Testing local notification...");

    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        const notification = new Notification("Test Notification", {
          body: "This is a test notification from the console",
          icon: "/web-app-manifest-192x192.png",
          tag: "test-notification",
        });

        notification.onclick = () => {
          console.log("✅ Test notification clicked!");
          notification.close();
        };

        console.log("✅ Test notification sent");
      } else {
        console.log("❌ Notification permission not granted");
      }
    } else {
      console.log("❌ Notifications not supported");
    }
  },

  /**
   * Request notification permission
   */
  async requestPermission() {
    console.log("🔑 Requesting notification permission...");

    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      console.log("🔔 Permission result:", permission);
      return permission;
    } else {
      console.log("❌ Notifications not supported");
      return "denied";
    }
  },

  /**
   * Test API endpoints
   */
  async testAPIEndpoints() {
    console.log("🌐 Testing API endpoints...");

    const endpoints = [
      "/api/v1/webpush/vapid-public-key",
      "/api/v1/webpush/subscription-status",
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${endpoint}:`, data);
        } else {
          console.log(
            `❌ ${endpoint}: ${response.status} ${response.statusText}`
          );
        }
      } catch (error) {
        console.log(`❌ ${endpoint}: Network error`, error);
      }
    }
  },

  /**
   * Test notification triggers (requires two users)
   */
  testInstructions() {
    console.log(`
🧪 NOTIFICATION TESTING INSTRUCTIONS

1. SETUP TWO USERS:
   - Open two browser windows/tabs
   - Log in as different users (UserA and UserB)
   - Enable notifications for UserB

2. TEST LIKE NOTIFICATIONS:
   - UserB creates a post
   - UserA likes UserB's post
   - UserB should receive notification

3. TEST COMMENT NOTIFICATIONS:
   - UserA comments on UserB's post
   - UserB should receive notification

4. TEST FOLLOW NOTIFICATIONS:
   - UserA follows UserB
   - UserB should receive notification

5. TEST UNFOLLOW NOTIFICATIONS:
   - UserA unfollows UserB
   - UserB should receive notification

6. TEST NEW POST NOTIFICATIONS:
   - UserB follows UserA
   - UserB sets post notifications to "following" or "all"
   - UserA creates a new post
   - UserB should receive notification

7. CHECK CONSOLE LOGS:
   - Open Developer Tools → Console
   - Look for notification-related logs
   - Check for any errors

8. VERIFY SETTINGS:
   - Test disabling specific notification types
   - Verify no notifications are sent when disabled
   
📱 PLATFORM TESTING:
   - Test on Chrome (FCM primary)
   - Test on Firefox (FCM primary)  
   - Test on Safari (Web Push primary)
   - Test on iOS Safari PWA (Web Push only)

🐛 IF ISSUES OCCUR:
   - Check browser console for errors
   - Check network tab for failed requests
   - Verify notification permissions
   - Check user notification settings
    `);
  },

  /**
   * Full diagnostic
   */
  async runFullDiagnostic() {
    console.log("🏥 Running full notification diagnostic...");
    console.log("==========================================");

    await this.checkFCMStatus();
    console.log("==========================================");

    await this.checkWebPushStatus();
    console.log("==========================================");

    await this.testAPIEndpoints();
    console.log("==========================================");

    console.log("💡 To test actual notifications, use:");
    console.log("NotificationTester.testInstructions()");
  },
};

// Auto-run diagnostic when script is loaded
console.log("🔧 Notification Testing Utilities Loaded!");
console.log("📋 Available commands:");
console.log("- NotificationTester.runFullDiagnostic()");
console.log("- NotificationTester.checkFCMStatus()");
console.log("- NotificationTester.checkWebPushStatus()");
console.log("- NotificationTester.testLocalNotification()");
console.log("- NotificationTester.requestPermission()");
console.log("- NotificationTester.testAPIEndpoints()");
console.log("- NotificationTester.testInstructions()");
console.log("");
console.log("🚀 Quick start: NotificationTester.runFullDiagnostic()");

// Expose for easy access
window.nt = window.NotificationTester;
