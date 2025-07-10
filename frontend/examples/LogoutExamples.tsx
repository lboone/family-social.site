// Example: How to add logout functionality to existing components

import LogoutButton from "@/components/Auth/LogoutButton";
import UserMenu from "@/components/Navigation/UserMenu";
import { RootState } from "@/store/store";
import { isAuthenticated, useLogout } from "@/utils/auth";
import React from "react";
import { useSelector } from "react-redux";

// Example 1: Simple Header with Logout Button
export const SimpleHeader = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Family Social
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated(user) ? (
              <>
                <span className="text-sm text-gray-600">
                  Welcome, {user?.username}
                </span>
                <LogoutButton variant="outline" size="sm">
                  Sign Out
                </LogoutButton>
              </>
            ) : (
              <a href="/login" className="text-blue-600 hover:text-blue-800">
                Sign In
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// Example 2: Advanced Header with User Menu
export const AdvancedHeader = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-xl font-semibold text-gray-900">
              Family Social
            </h1>
            {isAuthenticated(user) && (
              <nav className="hidden md:flex space-x-6">
                <a href="/feed" className="text-gray-600 hover:text-gray-900">
                  Feed
                </a>
                <a
                  href="/profile"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Profile
                </a>
                <a
                  href="/friends"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Friends
                </a>
              </nav>
            )}
          </div>

          <div className="flex items-center">
            {isAuthenticated(user) ? (
              <UserMenu showConfirmDialog={true} />
            ) : (
              <div className="space-x-4">
                <a href="/login" className="text-gray-600 hover:text-gray-900">
                  Sign In
                </a>
                <a
                  href="/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Sign Up
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// Example 3: Mobile-Friendly Navigation with Logout
export const MobileNav = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const logout = useLogout();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logout({
      redirectTo: "/login",
      showToast: true,
    });
  };

  if (!isAuthenticated(user)) {
    return null;
  }

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
      >
        ☰ Menu
      </button>

      {isMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white shadow-lg border-b z-50">
          <div className="px-4 py-2 border-b">
            <p className="font-medium">{user?.username}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <nav className="py-2">
            <a
              href="/feed"
              className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
            >
              Feed
            </a>
            <a
              href="/profile"
              className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
            >
              Profile
            </a>
            <a
              href="/friends"
              className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
            >
              Friends
            </a>
            <a
              href="/settings"
              className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
            >
              Settings
            </a>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

// Example 4: Settings Page with Logout
export const SettingsPage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const logout = useLogout();

  const handleLogoutAllDevices = async () => {
    const confirmed = window.confirm(
      "This will log you out from all devices. Are you sure?"
    );

    if (confirmed) {
      await logout({
        redirectTo: "/login",
        showToast: true,
        onSuccess: () => {
          // Could call an API endpoint to invalidate all sessions
          console.log("Logged out from all devices");
        },
      });
    }
  };

  if (!isAuthenticated(user)) {
    return <div>Please log in to access settings.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Account Section */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Account</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <p className="mt-1 text-sm text-gray-900">{user?.username}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Security</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700">
                Session Management
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                Manage your login sessions across different devices.
              </p>
              <div className="space-y-2">
                <LogoutButton variant="outline" size="sm">
                  Logout from this device
                </LogoutButton>
                <button
                  onClick={handleLogoutAllDevices}
                  className="block px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                >
                  Logout from all devices
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Example 5: Error Boundary with Logout
export const ErrorBoundaryWithLogout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const logout = useLogout();

  const handleAuthError = React.useCallback(async () => {
    await logout({
      redirectTo: "/login",
      showToast: false,
    });
  }, [logout]);

  // This would be used in conjunction with a proper error boundary
  return (
    <div>
      {children}
      {/* You could add this to your error boundary to handle auth errors */}
      <div className="hidden">
        <button onClick={handleAuthError}>Handle Auth Error</button>
      </div>
    </div>
  );
};

// Example 6: Automatic Logout on Tab Close/Refresh Warning
export const AutoLogoutWarning = () => {
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Optional: Warn user about unsaved changes
      e.preventDefault();
      e.returnValue = "";
    };

    const handleUnload = () => {
      // Optional: Call logout API when tab closes
      // Note: This might not work reliably in all browsers
      navigator.sendBeacon("/api/users/logout", "{}");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleUnload);
    };
  }, []);

  return null; // This component doesn't render anything
};

const LogoutExamples = {
  SimpleHeader,
  AdvancedHeader,
  MobileNav,
  SettingsPage,
  ErrorBoundaryWithLogout,
  AutoLogoutWarning,
};

export default LogoutExamples;
