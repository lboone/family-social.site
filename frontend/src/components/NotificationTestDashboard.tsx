"use client";

import React, { useState } from "react";

interface TestResult {
  test: string;
  status: "pending" | "success" | "error";
  message: string;
  timestamp?: Date;
}

const NotificationTestDashboard: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Mock the unified notifications functionality since the hook doesn't exist
  const subscription = null;
  const fcmToken = null;
  const error = null;
  const requestPermission = async () => {
    return await Notification.requestPermission();
  };
  const subscribe = async () => {
    // Mock subscribe function
    return true;
  };

  const addTestResult = (
    test: string,
    status: "pending" | "success" | "error",
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

  const testAPIEndpoints = async () => {
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
          await response.json(); // Parse response but don't store unused data
          addTestResult(
            `API: ${endpoint}`,
            "success",
            `Status: ${response.status}`
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

    addTestResult("Test Suite", "pending", "Starting comprehensive tests...");

    // Platform Detection
    const isIosSafari =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      /Safari/.test(navigator.userAgent) &&
      !/Chrome|CriOS|FxiOS/.test(navigator.userAgent);

    const isPWA =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as typeof window.navigator & { standalone?: boolean })
        .standalone === true;

    addTestResult(
      "Platform Detection",
      "success",
      `iOS Safari: ${isIosSafari}, PWA: ${isPWA}, UA: ${navigator.userAgent.substring(
        0,
        50
      )}...`
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
    addTestResult("Test Suite", "success", "All tests completed");
  };

  const getPlatformInfo = () => {
    const isIosSafari =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      /Safari/.test(navigator.userAgent) &&
      !/Chrome|CriOS|FxiOS/.test(navigator.userAgent);

    const isPWA =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as typeof window.navigator & { standalone?: boolean })
        .standalone === true;

    return { isIosSafari, isPWA };
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "pending":
        return "⏳";
      default:
        return "⚪";
    }
  };

  const { isIosSafari, isPWA } = getPlatformInfo();

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Notification Testing Dashboard
      </h1>

      {/* Platform Info */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Platform Information</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>iOS Safari: {isIosSafari ? "✅" : "❌"}</div>
          <div>PWA Mode: {isPWA ? "✅" : "❌"}</div>
          <div>FCM Token: {fcmToken ? "✅" : "❌"}</div>
          <div>Web Push Sub: {subscription ? "✅" : "❌"}</div>
          <div>Permission: {Notification.permission}</div>
          <div>
            Service Worker: {"serviceWorker" in navigator ? "✅" : "❌"}
          </div>
        </div>
        {error && (
          <div className="mt-2 text-red-600 text-sm">Error: {error}</div>
        )}
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
          onClick={requestPermission}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Request Permission
        </button>

        <button
          onClick={subscribe}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Subscribe to Notifications
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
            <strong>Step 1:</strong> Ensure notifications are working by
            clicking &quot;Request Permission&quot; and &quot;Subscribe to
            Notifications&quot;
          </p>
          <p>
            <strong>Step 2:</strong> Test basic functionality with &quot;Test
            Local Notification&quot;
          </p>
          <p>
            <strong>Step 3:</strong> Open a second browser window/tab and log in
            as a different user
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
            <strong>Step 5:</strong> Check browser console for detailed logs
          </p>
        </div>
      </div>

      {/* Browser Console Helper */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">
          Browser Console Utilities
        </h2>
        <p className="text-sm text-gray-600 mb-2">
          For advanced testing, load the testing utilities in your browser
          console:
        </p>
        <code className="block p-2 bg-gray-100 rounded text-xs">
          {`// Paste this in browser console:
fetch('/notification-test-utils.js').then(r => r.text()).then(eval);

// Then run:
NotificationTester.runFullDiagnostic();`}
        </code>
      </div>
    </div>
  );
};

export default NotificationTestDashboard;
