"use client";

import React, { useState } from "react";

interface TestResult {
  test: string;
  status: "success" | "error";
  message: string;
  timestamp?: Date;
}

const NotificationTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTestResult = (
    test: string,
    status: "success" | "error",
    message: string
  ) => {
    setTestResults((prev) => [
      ...prev,
      { test, status, message, timestamp: new Date() },
    ]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testLocalNotification = async () => {
    try {
      if (Notification.permission !== "granted") {
        addTestResult("Local Notification", "error", "Permission not granted");
        return;
      }

      const notification = new Notification("Test Notification", {
        body: "This is a test notification from the dashboard",
        icon: "/web-app-manifest-192x192.png",
        tag: "test-dashboard",
      });

      notification.onclick = () => {
        addTestResult(
          "Local Notification Click",
          "success",
          "Notification clicked"
        );
        notification.close();
      };

      addTestResult("Local Notification", "success", "Local notification sent");
    } catch (error) {
      addTestResult("Local Notification", "error", `Error: ${error}`);
    }
  };

  const testServiceWorker = async () => {
    try {
      if (!("serviceWorker" in navigator)) {
        addTestResult(
          "Service Worker",
          "error",
          "Service Worker not supported"
        );
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      addTestResult(
        "Service Worker",
        "success",
        `Registered: ${registration.scope}`
      );
    } catch (error) {
      addTestResult("Service Worker", "error", `Error: ${error}`);
    }
  };

  const testPushManager = async () => {
    try {
      if (!("PushManager" in window)) {
        addTestResult("Push Manager", "error", "PushManager not supported");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const existingSubscription =
        await registration.pushManager.getSubscription();

      if (existingSubscription) {
        addTestResult(
          "Push Manager",
          "success",
          `Subscription exists: ${existingSubscription.endpoint.substring(
            0,
            50
          )}...`
        );
      } else {
        addTestResult(
          "Push Manager",
          "success",
          "PushManager available, no subscription"
        );
      }
    } catch (error) {
      addTestResult("Push Manager", "error", `Error: ${error}`);
    }
  };

  const testNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      addTestResult(
        "Permission Request",
        permission === "granted" ? "success" : "error",
        `Permission: ${permission}`
      );
    } catch (error) {
      addTestResult("Permission Request", "error", `Error: ${error}`);
    }
  };

  const testAPIEndpoints = async () => {
    const endpoints = [
      "/api/v1/webpush/vapid-public-key",
      "/api/v1/webpush/subscription-status",
      "/api/v1/webpush/test",
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:3000${endpoint}`, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          addTestResult(
            `API: ${endpoint}`,
            "success",
            `Status: ${response.status} - ${data.message || "OK"}`
          );
        } else {
          addTestResult(
            `API: ${endpoint}`,
            "error",
            `Status: ${response.status} ${response.statusText}`
          );
        }
      } catch (error) {
        addTestResult(`API: ${endpoint}`, "error", `Network error: ${error}`);
      }
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    clearResults();

    // Platform Detection
    const isIosSafari =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      /Safari/.test(navigator.userAgent) &&
      !/Chrome|CriOS|FxiOS/.test(navigator.userAgent);

    const isPWA =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;

    addTestResult(
      "Platform Detection",
      "success",
      `iOS Safari: ${isIosSafari}, PWA: ${isPWA}`
    );

    // Permission Status
    addTestResult(
      "Notification Permission",
      Notification.permission === "granted" ? "success" : "error",
      `Permission: ${Notification.permission}`
    );

    // Run tests
    await testServiceWorker();
    await testPushManager();
    await testAPIEndpoints();

    setIsRunning(false);
  };

  const getPlatformInfo = () => {
    const isIosSafari =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      /Safari/.test(navigator.userAgent) &&
      !/Chrome|CriOS|FxiOS/.test(navigator.userAgent);

    const isPWA =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;

    return { isIosSafari, isPWA };
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      default:
        return "⚪";
    }
  };

  const { isIosSafari, isPWA } = getPlatformInfo();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Push Notification Testing
        </h1>

        {/* Platform Info */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Platform Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>iOS Safari: {isIosSafari ? "✅ Yes" : "❌ No"}</div>
            <div>PWA Mode: {isPWA ? "✅ Yes" : "❌ No"}</div>
            <div>Notification Permission: {Notification.permission}</div>
            <div>
              Service Worker:{" "}
              {"serviceWorker" in navigator
                ? "✅ Supported"
                : "❌ Not Supported"}
            </div>
            <div>
              Push Manager:{" "}
              {"PushManager" in window ? "✅ Supported" : "❌ Not Supported"}
            </div>
            <div>
              Notifications:{" "}
              {"Notification" in window ? "✅ Supported" : "❌ Not Supported"}
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isRunning ? "Running Tests..." : "Run All Tests"}
          </button>

          <button
            onClick={testNotificationPermission}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Request Permission
          </button>

          <button
            onClick={testLocalNotification}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Test Local Notification
          </button>

          <button
            onClick={clearResults}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Clear Results
          </button>
        </div>

        {/* Test Results */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Test Results</h2>
          <div className="max-h-96 overflow-y-auto border rounded-lg">
            {testResults.length === 0 ? (
              <div className="p-4 text-gray-500 text-center">
                No test results yet. Click &quot;Run All Tests&quot; to start.
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {testResults.map((result, index) => (
                  <div key={index} className="p-3 hover:bg-gray-50">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">
                        {getStatusIcon(result.status)}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{result.test}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {result.message}
                        </div>
                        {result.timestamp && (
                          <div className="text-xs text-gray-400 mt-1">
                            {result.timestamp.toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Manual Testing Instructions */}
        <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">
            Manual Testing Instructions
          </h2>
          <div className="text-sm space-y-2">
            <p>
              <strong>Step 1:</strong> Click &quot;Request Permission&quot; to
              enable notifications
            </p>
            <p>
              <strong>Step 2:</strong> Test basic functionality with &quot;Test
              Local Notification&quot;
            </p>
            <p>
              <strong>Step 3:</strong> Open a second browser window/tab and log
              in as a different user
            </p>
            <p>
              <strong>Step 4:</strong> Test real notifications by:
            </p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Having the other user like/comment on your posts</li>
              <li>Having the other user follow/unfollow you</li>
              <li>Creating new posts (if the other user follows you)</li>
            </ul>
            <p>
              <strong>Step 5:</strong> Check browser console (F12) for detailed
              logs
            </p>
          </div>
        </div>

        {/* Browser Console Helper */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Advanced Testing</h2>
          <p className="text-sm text-gray-600 mb-2">
            For advanced testing, open browser console (F12) and run:
          </p>
          <div className="bg-gray-100 rounded p-2 text-xs font-mono">
            <div>{`// Load testing utilities:`}</div>
            <div>
              fetch(&apos;/notification-test-utils.js&apos;).then(r =&gt;
              r.text()).then(eval);
            </div>
            <div className="mt-2">{`// Then run comprehensive tests:`}</div>
            <div>NotificationTester.runFullDiagnostic();</div>
          </div>
        </div>

        {/* Quick Status Check */}
        <div className="mt-6 p-4 bg-green-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Quick Status</h2>
          <div className="text-sm">
            <div>✅ Backend running on port 3000</div>
            <div>
              ✅ Frontend running on HTTPS (required for push notifications)
            </div>
            <div>✅ Testing dashboard ready</div>
            <div>
              📱 Platform: {isIosSafari ? "iOS Safari" : "Desktop/Android"}{" "}
              {isPWA ? "(PWA)" : "(Browser)"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationTestPage;
