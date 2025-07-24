"use client";

import {
  selectFcmToken,
  selectNotificationPermissionStatus,
  selectPushEnabled,
  selectPushNotificationSettings,
  selectTokenNeedsRefresh,
} from "@/store/authSlice";
import { RootState } from "@/store/store";
import { useState } from "react";
import { useSelector } from "react-redux";

const ReduxFcmDebugger = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  // Collapsible state
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [showPushSettings, setShowPushSettings] = useState(false);
  const [showTokenInfo, setShowTokenInfo] = useState(false);
  const [showReduxSelectors, setShowReduxSelectors] = useState(false);

  // Use our new Redux selectors
  const pushSettings = useSelector(selectPushNotificationSettings);
  const fcmToken = useSelector(selectFcmToken);
  const tokenNeedsRefresh = useSelector(selectTokenNeedsRefresh);
  const pushEnabled = useSelector(selectPushEnabled);
  const permissionStatus = useSelector(selectNotificationPermissionStatus);

  // Helper function to check if token needs refresh (7 days)
  const getTokenStatus = () => {
    if (!pushSettings?.fcmToken || !pushSettings?.tokenTimestamp) {
      return { needsRefresh: true, reason: "No token or timestamp" };
    }

    const tokenAge =
      Date.now() - new Date(pushSettings.tokenTimestamp).getTime();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    if (tokenAge > sevenDays) {
      return { needsRefresh: true, reason: "Token older than 7 days" };
    }

    return {
      needsRefresh: false,
      reason: `Token valid (${Math.round(
        tokenAge / (24 * 60 * 60 * 1000)
      )} days old)`,
    };
  };

  const tokenStatus = getTokenStatus();

  return (
    <div className="bg-gray-800 p-4 rounded-lg text-white text-xs font-mono">
      <h3 className="font-bold text-blue-400 mb-3">FCM Redux State Debugger</h3>

      {/* User Authentication Status */}
      <div className="mb-3">
        <h4
          className="font-semibold text-green-400 cursor-pointer flex items-center"
          onClick={() => setShowUserInfo(!showUserInfo)}
        >
          👤 User Auth {showUserInfo ? "▼" : "▶"}
        </h4>
        {showUserInfo && (
          <div className="ml-3 mt-1">
            {user ? (
              <div className="space-y-1">
                <p className="text-gray-300">ID: {user._id}</p>
                <p className="text-gray-300">Username: {user.username}</p>
                <p className="text-gray-300">Email: {user.email}</p>
                <p className="text-gray-300">Role: {user.role}</p>
                <p className="text-gray-300">
                  Verified: {user.isVerified ? "✅" : "❌"}
                </p>
                <p className="text-gray-300">
                  Active: {user.isActive ? "✅" : "❌"}
                </p>
              </div>
            ) : (
              <p className="text-red-400">User not authenticated</p>
            )}
          </div>
        )}
      </div>

      {/* Push Settings Status */}
      <div className="mb-3">
        <h4
          className="font-semibold text-yellow-400 cursor-pointer flex items-center"
          onClick={() => setShowPushSettings(!showPushSettings)}
        >
          ⚙️ Push Settings {showPushSettings ? "▼" : "▶"}
        </h4>
        {showPushSettings && (
          <div className="ml-3 mt-1">
            {pushSettings ? (
              <div className="space-y-1">
                <p
                  className={`${
                    pushSettings.pushEnabled ? "text-green-400" : "text-red-400"
                  }`}
                >
                  Push Enabled: {pushSettings.pushEnabled ? "✅" : "❌"}
                </p>
                <p className="text-gray-300">
                  Post Type: {pushSettings.postType || "none"}
                </p>
                <p className="text-gray-300">
                  Likes: {pushSettings.likes ? "✅" : "❌"}
                </p>
                <p className="text-gray-300">
                  Comments: {pushSettings.comments ? "✅" : "❌"}
                </p>
                <p className="text-gray-300">
                  Follow: {pushSettings.follow ? "✅" : "❌"}
                </p>
                <p className="text-gray-300">
                  Unfollow: {pushSettings.unfollow ? "✅" : "❌"}
                </p>
              </div>
            ) : (
              <p className="text-red-400">No push settings found</p>
            )}
          </div>
        )}
      </div>

      {/* FCM Token Info */}
      <div className="mb-3">
        <h4
          className="font-semibold text-purple-400 cursor-pointer flex items-center"
          onClick={() => setShowTokenInfo(!showTokenInfo)}
        >
          🎫 FCM Token {showTokenInfo ? "▼" : "▶"}
        </h4>
        {showTokenInfo && (
          <div className="ml-3 mt-1">
            {pushSettings?.fcmToken ? (
              <div className="space-y-1">
                <p className="text-gray-300">
                  Token: {pushSettings.fcmToken.substring(0, 20)}...
                </p>
                <p
                  className={`${
                    tokenStatus.needsRefresh ? "text-red-400" : "text-green-400"
                  }`}
                >
                  Status: {tokenStatus.reason}
                </p>
                {pushSettings.tokenTimestamp && (
                  <p className="text-gray-300">
                    Created:{" "}
                    {new Date(pushSettings.tokenTimestamp).toLocaleString()}
                  </p>
                )}
                {pushSettings.lastSyncAt && (
                  <p className="text-gray-300">
                    Last Sync:{" "}
                    {new Date(pushSettings.lastSyncAt).toLocaleString()}
                  </p>
                )}
                <p
                  className={`${
                    pushSettings.tokenValid ? "text-green-400" : "text-red-400"
                  }`}
                >
                  Valid: {pushSettings.tokenValid ? "✅" : "❌"}
                </p>
                {pushSettings.deviceInfo && (
                  <p className="text-gray-300">
                    Device: {pushSettings.deviceInfo}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-red-400">No FCM token found</p>
            )}
          </div>
        )}
      </div>

      {/* Redux Selectors Status */}
      <div className="mb-3">
        <h4
          className="font-semibold text-cyan-400 cursor-pointer flex items-center"
          onClick={() => setShowReduxSelectors(!showReduxSelectors)}
        >
          🏪 Redux Selectors {showReduxSelectors ? "▼" : "▶"}
        </h4>
        {showReduxSelectors && (
          <div className="ml-3 mt-1">
            <div className="space-y-1">
              <p className="text-gray-300">
                FCM Token:{" "}
                {fcmToken ? `${fcmToken.substring(0, 15)}...` : "❌ None"}
              </p>
              <p
                className={`${
                  tokenNeedsRefresh ? "text-red-400" : "text-green-400"
                }`}
              >
                Needs Refresh: {tokenNeedsRefresh ? "✅" : "❌"}
              </p>
              <p
                className={`${pushEnabled ? "text-green-400" : "text-red-400"}`}
              >
                Push Enabled: {pushEnabled ? "✅" : "❌"}
              </p>
              <p className="text-gray-300">
                Permission Status: {permissionStatus}
              </p>
              <p className="text-gray-300">
                Store Updated:{" "}
                {user?.updatedAt
                  ? new Date(user.updatedAt).toLocaleString()
                  : "Unknown"}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-700 p-2 rounded text-purple-300 mt-2">
        <strong>Current State Analysis:</strong>
      </div>
      <div className="space-y-1">
        <p className="text-gray-300">
          Permission:{" "}
          <span className="text-cyan-400">{permissionStatus || "unknown"}</span>
        </p>
        <p className="text-gray-300">
          Push Enabled:{" "}
          <span className="text-cyan-400">
            {pushSettings?.pushEnabled ? "true" : "false"}
          </span>
        </p>
        <p className="text-gray-300">
          Has Settings:{" "}
          <span className="text-cyan-400">
            {pushSettings && typeof pushSettings.pushEnabled !== "undefined"
              ? "true"
              : "false"}
          </span>
        </p>
        <p className="text-gray-300">
          Has Token:{" "}
          <span className="text-cyan-400">{fcmToken ? "true" : "false"}</span>
        </p>
        <p className="text-gray-300">
          Needs Refresh:{" "}
          <span className="text-cyan-400">
            {tokenNeedsRefresh ? "true" : "false"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default ReduxFcmDebugger;
