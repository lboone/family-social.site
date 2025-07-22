// FCM Token Debugging Utility
// Run this in browser console to debug FCM token issues

console.log("🔍 FCM Token Debugging Started...");

// 1. Check localStorage token
const storedToken = localStorage.getItem("fcm_token");
const storedTimestamp = localStorage.getItem("fcm_token_timestamp");

console.log("📦 localStorage Check:", {
  hasToken: !!storedToken,
  tokenLength: storedToken?.length || 0,
  tokenStart: storedToken?.substring(0, 30) + "..." || "None",
  timestamp: storedTimestamp
    ? new Date(parseInt(storedTimestamp)).toISOString()
    : "None",
  ageHours: storedTimestamp
    ? Math.round((Date.now() - parseInt(storedTimestamp)) / (1000 * 60 * 60))
    : "N/A",
});

// 2. Check notification permission
console.log("🔔 Notification Permission:", Notification.permission);

// 3. Check service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    console.log(
      "🔧 Service Workers:",
      regs.map((reg) => ({
        scope: reg.scope,
        state: reg.active?.state || "none",
        scriptURL: reg.active?.scriptURL || "none",
      }))
    );
  });
} else {
  console.log("❌ Service Workers not supported");
}

// 4. Generate fresh token for comparison
if (window.firebase && window.firebase.messaging) {
  console.log("🔥 Generating fresh FCM token...");

  window.firebase
    .messaging()
    .getToken({
      vapidKey:
        "BAkCp6zQc4hFf0SfM1tCqnBcJ5MARaoLNp5FP2ckFbkc8zIRNm5F7q-KYgAzKT03aNiVL-K1wjGO49O-lJCH4-M",
    })
    .then((freshToken) => {
      console.log("🆕 Fresh Token:", {
        token: freshToken,
        length: freshToken?.length || 0,
        matchesStored: freshToken === storedToken,
      });

      // Copy fresh token to clipboard
      if (navigator.clipboard && freshToken) {
        navigator.clipboard.writeText(freshToken);
        console.log("📋 Fresh token copied to clipboard!");
      }
    })
    .catch((err) => {
      console.error("❌ Failed to generate fresh token:", err);
    });
} else {
  console.log("❌ Firebase messaging not available");
}

// 5. Test token format
if (storedToken) {
  console.log("🧪 Token Analysis:", {
    isValidFormat: /^[a-zA-Z0-9_-]+:[a-zA-Z0-9_-]+$/.test(storedToken),
    hasColon: storedToken.includes(":"),
    parts: storedToken.split(":").length,
    firstPartLength: storedToken.split(":")[0]?.length || 0,
    secondPartLength: storedToken.split(":")[1]?.length || 0,
  });
}

console.log("✅ FCM Debug Complete! Check logs above for issues.");
console.log("🔧 Next Steps:");
console.log("1. If token is old (>24hrs), refresh page to get new one");
console.log("2. If fresh token differs from stored, use the fresh one");
console.log("3. Check Firebase project ID matches your config");
console.log("4. Verify VAPID key is correct");
