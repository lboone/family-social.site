import { API_URL_USER } from "@/server";
import { logout as logoutAction } from "@/store/authSlice";
import { AppDispatch } from "@/store/store";
import { User } from "@/types";
import axios from "axios";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

/**
 * Logs out the current user by:
 * 1. Calling the logout API endpoint to clear server-side session/cookies
 * 2. Clearing the Redux auth state
 * 3. Clearing persisted data from localStorage
 * 4. Optionally redirecting to a specified route
 *
 * @param dispatch - Redux dispatch function
 * @param redirectTo - Optional path to redirect to after logout (e.g., '/login')
 * @param showToast - Whether to show a success toast message (default: true)
 */
export const logoutUser = async (
  dispatch: AppDispatch,
  options?: {
    redirectTo?: string;
    showToast?: boolean;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
  }
) => {
  const { redirectTo, showToast = true, onSuccess, onError } = options || {};

  try {
    // Call the backend logout endpoint to clear cookies/session
    await axios.post(
      `${API_URL_USER}/logout`,
      {},
      {
        withCredentials: true,
        // Don't throw on 4xx/5xx responses, handle them gracefully
        validateStatus: (status) => status < 500,
      }
    );

    // Clear Redux state
    dispatch(logoutAction());

    // Clear any additional localStorage items if needed
    // (redux-persist will handle the persisted state automatically)
    clearAdditionalStorage();

    // Show success message
    if (showToast) {
      toast.success("You have been logged out successfully");
    }

    // Call success callback
    onSuccess?.();

    // Redirect if specified
    if (redirectTo && typeof window !== "undefined") {
      // Use Next.js router if available, otherwise fallback to window.location
      if (window.location) {
        window.location.href = redirectTo;
      }
    }
  } catch (error) {
    console.error("Logout error:", error);

    // Even if the API call fails, we should still clear local state
    dispatch(logoutAction());
    clearAdditionalStorage();

    const errorMessage =
      error instanceof Error ? error.message : "Logout failed";

    if (showToast) {
      toast.error(`Logout warning: ${errorMessage}`);
    }

    // Call error callback
    onError?.(error instanceof Error ? error : new Error(errorMessage));

    // Still redirect even if API call failed
    if (redirectTo && typeof window !== "undefined") {
      window.location.href = redirectTo;
    }
  }
};

/**
 * Clear additional storage items that might contain sensitive data
 * Add any additional cleanup logic here
 */
const clearAdditionalStorage = () => {
  try {
    // Clear any additional localStorage items
    const itemsToRemove = [
      "token",
      "refreshToken",
      "userPreferences",
      // Add any other keys you want to clear on logout
    ];

    itemsToRemove.forEach((key) => {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    });

    // Clear sessionStorage if you're using it
    if (typeof window !== "undefined" && window.sessionStorage) {
      window.sessionStorage.clear();
    }
  } catch (error) {
    console.error("Error clearing additional storage:", error);
  }
};

/**
 * Hook for logout functionality in React components
 * Returns a logout function that can be called from event handlers
 */
export const useLogout = () => {
  const dispatch = useAppDispatch();

  const logout = (options?: Parameters<typeof logoutUser>[1]) => {
    return logoutUser(dispatch, options);
  };

  return logout;
};

// Type for the logout function
export type LogoutFunction = ReturnType<typeof useLogout>;

// Helper to check if user is authenticated
export const isAuthenticated = (user: User | null): boolean => {
  return user !== null && user !== undefined && Boolean(user?._id);
};

// Import this type helper for use with useSelector
const useAppDispatch = () => useDispatch<AppDispatch>();
