"use client";

import serviceWorkerManager, {
  ServiceWorkerManager,
} from "@/utils/serviceWorkerManager";
import { useEffect, useState } from "react";

interface ServiceWorkerStatus {
  isSupported: boolean;
  isRegistered: boolean;
  isControlling: boolean;
  state: string;
  updateAvailable: boolean;
  error: string | null;
}

export default function ServiceWorkerDebug() {
  const [status, setStatus] = useState<ServiceWorkerStatus>({
    isSupported: false,
    isRegistered: false,
    isControlling: false,
    state: "unknown",
    updateAvailable: false,
    error: null,
  });

  useEffect(() => {
    const updateStatus = () => {
      const registration = serviceWorkerManager.getRegistration();
      const isControlling = !!navigator.serviceWorker.controller;

      setStatus({
        isSupported: ServiceWorkerManager.isSupported(),
        isRegistered: !!registration,
        isControlling,
        state: serviceWorkerManager.getState(),
        updateAvailable: serviceWorkerManager.isUpdateAvailable(),
        error: null,
      });
    };

    // Initial status check
    updateStatus();

    // Update status periodically
    const interval = setInterval(updateStatus, 2000);

    // Listen for service worker events
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener(
        "controllerchange",
        updateStatus
      );
      navigator.serviceWorker.addEventListener("message", updateStatus);
    }

    return () => {
      clearInterval(interval);
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener(
          "controllerchange",
          updateStatus
        );
        navigator.serviceWorker.removeEventListener("message", updateStatus);
      }
    };
  }, []);

  const testNotification = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support notifications");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      new Notification("Test Notification", {
        body: "Service Worker is working!",
        icon: "/web-app-manifest-192x192.png",
        tag: "test",
      });
    }
  };

  const forceUpdate = () => {
    serviceWorkerManager.activateUpdate();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border max-w-sm">
      <h3 className="font-bold text-sm mb-2">Service Worker Status</h3>

      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Supported:</span>
          <span
            className={status.isSupported ? "text-green-600" : "text-red-600"}
          >
            {status.isSupported ? "✅" : "❌"}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Registered:</span>
          <span
            className={status.isRegistered ? "text-green-600" : "text-red-600"}
          >
            {status.isRegistered ? "✅" : "❌"}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Controlling:</span>
          <span
            className={status.isControlling ? "text-green-600" : "text-red-600"}
          >
            {status.isControlling ? "✅" : "❌"}
          </span>
        </div>

        <div className="flex justify-between">
          <span>State:</span>
          <span className="text-gray-600">{status.state}</span>
        </div>

        {status.updateAvailable && (
          <div className="bg-blue-50 p-2 rounded mt-2">
            <p className="text-blue-700 text-xs">Update available!</p>
            <button
              onClick={forceUpdate}
              className="mt-1 px-2 py-1 bg-blue-600 text-white text-xs rounded"
            >
              Update Now
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 space-y-2">
        <button
          onClick={testNotification}
          className="w-full px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
        >
          Test Notification
        </button>

        <button
          onClick={() => window.location.reload()}
          className="w-full px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

// Only show in development
export function ServiceWorkerDebugWrapper() {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return <ServiceWorkerDebug />;
}
