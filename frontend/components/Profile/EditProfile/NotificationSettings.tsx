"use client";

import LoadingButton from "@/components/Form/LoadingButton";
import { Switch } from "@/components/ui/switch";
import useGetUser from "@/hooks/useGetUser";
import { API_URL_USER } from "@/server";
import { setAuthUser } from "@/store/authSlice";
import axios from "axios";
import { BellIcon, BellOffIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

interface NotificationSettingsState {
  pushEnabled: boolean;
  likes: boolean;
  comments: boolean;
  follow: boolean;
  unfollow: boolean;
  postType: "all" | "following" | "none";
}

const NotificationSettings = () => {
  const dispatch = useDispatch();
  const { user } = useGetUser();
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] =
    useState<NotificationSettingsState>({
      pushEnabled: false,
      likes: false,
      comments: false,
      follow: false,
      unfollow: false,
      postType: "none",
    });
  const [settings, setSettings] = useState<NotificationSettingsState>({
    pushEnabled: false,
    likes: false,
    comments: false,
    follow: false,
    unfollow: false,
    postType: "none",
  });

  // Initialize settings from user data
  useEffect(() => {
    if (user?.pushNotificationSettings) {
      const userSettings: NotificationSettingsState = {
        pushEnabled: user.pushNotificationSettings.pushEnabled || false,
        likes: user.pushNotificationSettings.likes || false,
        comments: user.pushNotificationSettings.comments || false,
        follow: user.pushNotificationSettings.follow || false,
        unfollow: user.pushNotificationSettings.unfollow || false,
        postType: (() => {
          const currentType = user.pushNotificationSettings.postType as string;
          if (
            currentType === "following" ||
            currentType === "follwersposts" ||
            currentType === "followersposts"
          ) {
            return "following";
          } else if (currentType === "all" || currentType === "allposts") {
            return "all";
          } else {
            return "none";
          }
        })(),
      };
      setSettings(userSettings);
      setOriginalSettings(userSettings);
    }
  }, [user]);

  // Check if settings have changed
  useEffect(() => {
    const changed =
      JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, originalSettings]);

  const handleToggleChange = (
    key: keyof NotificationSettingsState,
    value: boolean | string
  ) => {
    const newSettings = { ...settings, [key]: value };

    // If turning off push notifications entirely
    if (key === "pushEnabled" && !value) {
      // Disable all other notifications
      newSettings.likes = false;
      newSettings.comments = false;
      newSettings.follow = false;
      newSettings.unfollow = false;
      newSettings.postType = "none";
    }

    setSettings(newSettings);
  };

  const handleSave = async () => {
    await updateNotificationSettings(settings);
  };

  const handleReset = () => {
    setSettings(originalSettings);
  };

  const updateNotificationSettings = async (
    newSettings: NotificationSettingsState
  ) => {
    setIsLoading(true);
    try {
      // If push notifications are being disabled, handle cleanup
      if (!newSettings.pushEnabled) {
        // No localStorage cleanup needed in Redux approach
        // Firebase cleanup is still useful
        try {
          const { messaging } = await import("@/services/firebase");
          const fcmMessaging = await messaging();
          if (fcmMessaging) {
            // Note: We don't delete the token from Firebase servers as user might re-enable
            // The token will become invalid after some time automatically
            console.log("FCM messaging cleanup completed");
          }
        } catch (error) {
          console.warn("FCM cleanup failed:", error);
        }
      }

      const formData = new FormData();
      const settingsWithToken = {
        ...newSettings,
        // Handle FCM data based on pushEnabled state
        fcmToken: newSettings.pushEnabled
          ? user?.pushNotificationSettings?.fcmToken || null
          : null, // Clear token when disabled
        tokenTimestamp: newSettings.pushEnabled
          ? user?.pushNotificationSettings?.tokenTimestamp || null
          : null, // Clear timestamp when disabled
        tokenValid: newSettings.pushEnabled
          ? user?.pushNotificationSettings?.tokenValid || false
          : false, // Set invalid when disabled
        deviceInfo: newSettings.pushEnabled
          ? user?.pushNotificationSettings?.deviceInfo || null
          : null, // Clear device info when disabled
        lastSyncAt: newSettings.pushEnabled
          ? user?.pushNotificationSettings?.lastSyncAt || null
          : null, // Clear last sync when disabled
      };
      formData.append(
        "pushNotificationSettings",
        JSON.stringify(settingsWithToken)
      );

      const response = await axios.post(
        `${API_URL_USER}/edit-profile`,
        formData,
        {
          withCredentials: true,
        }
      );

      if (response.data.status === "success") {
        dispatch(setAuthUser(response.data.data.user));
        setOriginalSettings(newSettings); // Update original settings after successful save
        toast.success("Notification settings updated successfully");
      }
    } catch (error) {
      console.error("Failed to update notification settings:", error);
      toast.error("Failed to update notification settings");
    } finally {
      setIsLoading(false);
    }
  };

  const resetBrowserPermissions = async () => {
    // Confirm the destructive action
    const confirmed = window.confirm(
      "Are you sure you want to disable all notifications and reset browser permissions?\n\n" +
        "This will:\n" +
        "• Disable all notification settings\n" +
        "• Clear all tokens from this device\n" +
        "• Remove the FCM token from our servers\n" +
        "• Require you to manually reset browser permissions\n\n" +
        "You'll need to re-grant permissions if you want notifications again."
    );

    if (!confirmed) return;

    try {
      // First, disable notifications using the same logic as the toggle
      const disabledSettings = {
        pushEnabled: false,
        likes: false,
        comments: false,
        follow: false,
        unfollow: false,
        postType: "none" as const,
      };

      // Update the form state to reflect disabled notifications
      setSettings(disabledSettings);

      // Save the disabled settings to backend (this will null out the FCM token)
      await updateNotificationSettings(disabledSettings);

      // No additional cleanup needed in Redux approach
      // The backend sync above handles everything

      // Inform user about manual browser permission reset
      toast.success(
        "Notifications disabled and tokens cleared!\n\n" +
          "To completely reset browser permissions:\n" +
          "1. Click the lock icon in your address bar\n" +
          "2. Set 'Notifications' to 'Block' or 'Ask'\n" +
          "3. Refresh the page"
      );
    } catch (error) {
      console.error("Failed to reset permissions:", error);
      toast.error("Failed to reset notification settings");
    }
  };

  const postTypeOptions = [
    { value: "none", label: "None" },
    { value: "following", label: "People I Follow" },
    { value: "all", label: "All Posts" },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        {settings.pushEnabled ? (
          <BellIcon className="h-6 w-6 text-blue-600" />
        ) : (
          <BellOffIcon className="h-6 w-6 text-gray-400" />
        )}
        <h1 className="text-2xl font-bold text-gray-900">
          Notification Settings
        </h1>
      </div>

      <div className="space-y-6">
        {/* Master Push Notifications Toggle */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                Push Notifications
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Enable or disable all push notifications. When disabled, you
                won&apos;t receive any notifications and will need to re-grant
                permission.
              </p>
            </div>
            <Switch
              checked={settings.pushEnabled}
              onCheckedChange={(checked) =>
                handleToggleChange("pushEnabled", checked)
              }
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Individual Notification Settings */}
        <div
          className={`space-y-4 transition-opacity ${
            settings.pushEnabled ? "opacity-100" : "opacity-50"
          }`}
        >
          <h3 className="text-lg font-semibold text-gray-900">
            Notification Types
          </h3>

          {/* Likes */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Likes</h4>
              <p className="text-sm text-gray-600">
                Get notified when someone likes your posts
              </p>
            </div>
            <Switch
              checked={settings.likes}
              onCheckedChange={(checked) =>
                handleToggleChange("likes", checked)
              }
              disabled={isLoading || !settings.pushEnabled}
            />
          </div>

          {/* Comments */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Comments</h4>
              <p className="text-sm text-gray-600">
                Get notified when someone comments on your posts
              </p>
            </div>
            <Switch
              checked={settings.comments}
              onCheckedChange={(checked) =>
                handleToggleChange("comments", checked)
              }
              disabled={isLoading || !settings.pushEnabled}
            />
          </div>

          {/* Follow */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">New Followers</h4>
              <p className="text-sm text-gray-600">
                Get notified when someone follows you
              </p>
            </div>
            <Switch
              checked={settings.follow}
              onCheckedChange={(checked) =>
                handleToggleChange("follow", checked)
              }
              disabled={isLoading || !settings.pushEnabled}
            />
          </div>

          {/* Unfollow */}
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Unfollows</h4>
              <p className="text-sm text-gray-600">
                Get notified when someone unfollows you
              </p>
            </div>
            <Switch
              checked={settings.unfollow}
              onCheckedChange={(checked) =>
                handleToggleChange("unfollow", checked)
              }
              disabled={isLoading || !settings.pushEnabled}
            />
          </div>

          {/* Post Types */}
          <div className="py-3">
            <div className="mb-3">
              <h4 className="font-medium text-gray-900">New Posts</h4>
              <p className="text-sm text-gray-600">
                Choose what type of new posts you want to be notified about
              </p>
            </div>
            <div className="space-y-2">
              {postTypeOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors ${
                    settings.postType === option.value
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-gray-50"
                  } ${
                    !settings.pushEnabled ? "cursor-not-allowed opacity-50" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="postType"
                    value={option.value}
                    checked={settings.postType === option.value}
                    onChange={(e) =>
                      handleToggleChange("postType", e.target.value)
                    }
                    disabled={isLoading || !settings.pushEnabled}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="border rounded-lg p-4 bg-red-50 border-red-200">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Advanced Settings
          </h3>
          <p className="text-sm text-red-700 mb-4">
            This will automatically disable all notifications, clear all tokens,
            and remove notification data from your browser and our servers.
            You&apos;ll need to manually reset browser permissions and grant
            them again if you want to re-enable notifications later.
          </p>
          <button
            type="button"
            onClick={resetBrowserPermissions}
            className="px-4 py-2 text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors text-sm font-medium"
          >
            Disable Notifications & Reset Permissions
          </button>
        </div>

        {/* Save/Reset Buttons */}
        {hasChanges && (
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <LoadingButton
              isLoading={isLoading}
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              Save Changes
            </LoadingButton>
            <button
              type="button"
              onClick={handleReset}
              disabled={isLoading}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Reset Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSettings;
