/**
 * Web Push Service
 * Handles Web Push API subscriptions and FCM fallback
 */

export interface WebPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class WebPushService {
  private vapidPublicKey: string | null = null;

  /**
   * Initialize the service and get VAPID public key
   */
  async initialize(): Promise<void> {
    try {
      const response = await fetch(
        "http://localhost:3000/api/v1/webpush/vapid-public-key"
      );
      if (response.ok) {
        const data = await response.json();
        this.vapidPublicKey = data.data.publicKey;
        console.log(
          "✅ VAPID public key loaded:",
          this.vapidPublicKey?.substring(0, 20) + "..."
        );
      } else {
        throw new Error("Failed to fetch VAPID public key");
      }
    } catch (error) {
      console.error("❌ Failed to initialize Web Push service:", error);
      throw error;
    }
  }

  /**
   * Check if Web Push is supported
   */
  isSupported(): boolean {
    return (
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
    );
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!("Notification" in window)) {
      throw new Error("Notifications not supported");
    }

    const permission = await Notification.requestPermission();
    console.log("🔔 Notification permission:", permission);
    return permission;
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Subscribe to Web Push notifications
   */
  async subscribe(): Promise<WebPushSubscription | null> {
    try {
      // Ensure service is initialized
      if (!this.vapidPublicKey) {
        await this.initialize();
      }

      if (!this.vapidPublicKey) {
        throw new Error("VAPID public key not available");
      }

      // Check permission
      if (Notification.permission !== "granted") {
        const permission = await this.requestPermission();
        if (permission !== "granted") {
          throw new Error("Notification permission denied");
        }
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Check for existing subscription
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // Create new subscription
        const applicationServerKey = this.urlBase64ToUint8Array(
          this.vapidPublicKey
        );

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey as BufferSource,
        });

        console.log(
          "✅ New Web Push subscription created:",
          subscription.endpoint
        );
      } else {
        console.log(
          "✅ Existing Web Push subscription found:",
          subscription.endpoint
        );
      }

      // Convert to our format
      const webPushSubscription: WebPushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(
            String.fromCharCode(
              ...new Uint8Array(subscription.getKey("p256dh")!)
            )
          ),
          auth: btoa(
            String.fromCharCode(...new Uint8Array(subscription.getKey("auth")!))
          ),
        },
      };

      // Save subscription to backend (optional for testing)
      try {
        const response = await fetch(
          "http://localhost:3000/api/v1/webpush/subscribe",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ subscription: webPushSubscription }),
          }
        );

        if (response.ok) {
          console.log("✅ Subscription saved to backend");
        } else {
          console.warn(
            "⚠️ Failed to save subscription to backend (auth required)"
          );
        }
      } catch (error) {
        console.warn("⚠️ Failed to save subscription to backend:", error);
      }

      return webPushSubscription;
    } catch (error) {
      console.error("❌ Failed to subscribe to Web Push:", error);
      throw error;
    }
  }

  /**
   * Unsubscribe from Web Push notifications
   */
  async unsubscribe(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const result = await subscription.unsubscribe();
        console.log("✅ Web Push subscription removed");
        return result;
      }

      return true;
    } catch (error) {
      console.error("❌ Failed to unsubscribe from Web Push:", error);
      return false;
    }
  }

  /**
   * Get current subscription status
   */
  async getSubscription(): Promise<WebPushSubscription | null> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        return null;
      }

      return {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(
            String.fromCharCode(
              ...new Uint8Array(subscription.getKey("p256dh")!)
            )
          ),
          auth: btoa(
            String.fromCharCode(...new Uint8Array(subscription.getKey("auth")!))
          ),
        },
      };
    } catch (error) {
      console.error("❌ Failed to get Web Push subscription:", error);
      return null;
    }
  }

  /**
   * Test local notification
   */
  async testNotification(
    title: string = "Test Notification",
    body: string = "This is a test notification"
  ): Promise<void> {
    if (Notification.permission !== "granted") {
      throw new Error("Notification permission not granted");
    }

    const notification = new Notification(title, {
      body,
      icon: "/web-app-manifest-192x192.png",
      badge: "/web-app-manifest-192x192.png",
      tag: "test-notification",
      data: {
        url: window.location.origin,
        timestamp: Date.now(),
      },
    });

    notification.onclick = () => {
      console.log("✅ Test notification clicked");
      window.focus();
      notification.close();
    };

    console.log("✅ Test notification sent");
  }
}

// Create a singleton instance
export const webPushService = new WebPushService();
