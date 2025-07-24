import { User } from "@/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  user: User | null;
}

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    clearAuthUser: (state) => {
      state.user = null;
    },
    logout: () => {
      // Reset to initial state
      return initialState;
    },
  },
});

export const { setAuthUser, clearAuthUser, logout } = authSlice.actions;

// ============================================================================
// REDUX SELECTORS FOR FCM MANAGEMENT
// ============================================================================

// Import RootState type for selectors
import type { RootState } from "./store";

// Selector for complete push notification settings
export const selectPushNotificationSettings = (state: RootState) =>
  state.auth.user?.pushNotificationSettings;

// Selector for FCM token
export const selectFcmToken = (state: RootState) =>
  state.auth.user?.pushNotificationSettings?.fcmToken;

// Selector to determine if token needs refresh (7 days expiry)
export const selectTokenNeedsRefresh = (state: RootState) => {
  const settings = state.auth.user?.pushNotificationSettings;
  if (!settings?.fcmToken || !settings?.tokenTimestamp) return true;

  const tokenAge = Date.now() - new Date(settings.tokenTimestamp).getTime();
  const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
  return tokenAge > SEVEN_DAYS;
};

// Selector for push notification enabled status
export const selectPushEnabled = (state: RootState) =>
  state.auth.user?.pushNotificationSettings?.pushEnabled || false;

// Selector for notification permission status
export const selectNotificationPermissionStatus = () => {
  // Always return the ACTUAL browser permission, not inferred from Redux state
  if (typeof window !== "undefined" && "Notification" in window) {
    return Notification.permission;
  }
  return "unsupported";
};

export default authSlice.reducer;
