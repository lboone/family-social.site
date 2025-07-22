"use client";

import { useState } from "react";

interface TestItem {
  id: string;
  category: string;
  description: string;
  completed: boolean;
}

const initialTests: TestItem[] = [
  // Service Worker Registration
  {
    id: "sw-debug-panel",
    category: "Service Worker",
    description: "Debug panel shows all green checkmarks",
    completed: false,
  },
  {
    id: "sw-devtools",
    category: "Service Worker",
    description: "DevTools shows SW as 'activated and running'",
    completed: false,
  },
  {
    id: "sw-console",
    category: "Service Worker",
    description: "No console errors, success logs visible",
    completed: false,
  },

  // Notification Permission
  {
    id: "notif-permission",
    category: "Notifications",
    description: "Permission request works via test button",
    completed: false,
  },
  {
    id: "notif-test",
    category: "Notifications",
    description: "Test notification appears correctly",
    completed: false,
  },

  // FCM Token
  {
    id: "fcm-token",
    category: "FCM",
    description: "FCM token generated and stored in localStorage",
    completed: false,
  },
  {
    id: "fcm-logs",
    category: "FCM",
    description: "FCM token logs appear in console",
    completed: false,
  },

  // Background Notifications
  {
    id: "bg-firebase",
    category: "Background",
    description: "Firebase Console test notification received",
    completed: false,
  },
  {
    id: "bg-route",
    category: "Background",
    description: "Test route notification received",
    completed: false,
  },
  {
    id: "bg-minimized",
    category: "Background",
    description: "Notifications work when app is minimized",
    completed: false,
  },

  // Click Behavior
  {
    id: "click-home",
    category: "Click Behavior",
    description: "Clicking notification navigates to home",
    completed: false,
  },
  {
    id: "click-profile",
    category: "Click Behavior",
    description: "Clicking notification navigates to profile",
    completed: false,
  },
  {
    id: "click-focus",
    category: "Click Behavior",
    description: "Existing tab gets focused correctly",
    completed: false,
  },

  // PWA
  {
    id: "pwa-install",
    category: "PWA",
    description: "Install prompt appears (optional)",
    completed: false,
  },
  {
    id: "pwa-function",
    category: "PWA",
    description: "Notifications work in standalone mode",
    completed: false,
  },
];

export default function Phase1TestingChecklist() {
  const [tests, setTests] = useState<TestItem[]>(initialTests);
  const [showCompleted, setShowCompleted] = useState(true);

  const toggleTest = (id: string) => {
    setTests(
      tests.map((test) =>
        test.id === id ? { ...test, completed: !test.completed } : test
      )
    );
  };

  const resetAll = () => {
    setTests(tests.map((test) => ({ ...test, completed: false })));
  };

  const getStats = () => {
    const completed = tests.filter((t) => t.completed).length;
    const total = tests.length;
    const percentage = Math.round((completed / total) * 100);
    return { completed, total, percentage };
  };

  const getTestsByCategory = () => {
    const categories: { [key: string]: TestItem[] } = {};
    tests.forEach((test) => {
      if (!categories[test.category]) {
        categories[test.category] = [];
      }
      categories[test.category].push(test);
    });
    return categories;
  };

  const stats = getStats();
  const testsByCategory = getTestsByCategory();

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border max-w-md max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm">Phase 1 Testing</h3>
        <button
          onClick={resetAll}
          className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Reset
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span>Progress</span>
          <span>
            {stats.completed}/{stats.total} ({stats.percentage}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${stats.percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Show/Hide Completed Toggle */}
      <div className="mb-3">
        <label className="flex items-center text-xs">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="mr-2"
          />
          Show completed tests
        </label>
      </div>

      {/* Tests by Category */}
      <div className="space-y-3">
        {Object.entries(testsByCategory).map(([category, categoryTests]) => {
          const visibleTests = showCompleted
            ? categoryTests
            : categoryTests.filter((t) => !t.completed);

          if (visibleTests.length === 0) return null;

          const categoryCompleted = categoryTests.filter(
            (t) => t.completed
          ).length;
          const categoryTotal = categoryTests.length;

          return (
            <div key={category}>
              <h4 className="font-medium text-xs text-gray-700 mb-2">
                {category} ({categoryCompleted}/{categoryTotal})
              </h4>
              <div className="space-y-1">
                {visibleTests.map((test) => (
                  <label
                    key={test.id}
                    className={`flex items-start text-xs cursor-pointer p-2 rounded ${
                      test.completed
                        ? "bg-green-50 text-green-800"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={test.completed}
                      onChange={() => toggleTest(test.id)}
                      className="mr-2 mt-0.5 flex-shrink-0"
                    />
                    <span className={test.completed ? "line-through" : ""}>
                      {test.description}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Status */}
      {stats.percentage === 100 && (
        <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded">
          <p className="text-green-800 text-xs font-medium">
            🎉 Phase 1 Complete! Ready for Phase 2.
          </p>
        </div>
      )}
    </div>
  );
}
