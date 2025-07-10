"use client";

import { RootState } from "@/store/store";
import { useLogout } from "@/utils/auth";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

interface UserMenuProps {
  showConfirmDialog?: boolean;
  className?: string;
}

/**
 * User menu dropdown with logout confirmation
 * Typically used in app header/navigation
 */
const UserMenu: React.FC<UserMenuProps> = ({
  showConfirmDialog = true,
  className = "",
}) => {
  const router = useRouter();
  const logout = useLogout();
  const user = useSelector((state: RootState) => state.auth.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setIsLogoutDialogOpen(false);
    setIsMenuOpen(false);

    await logout({
      showToast: true,
      onSuccess: () => {
        router.push("/login");
      },
      onError: () => {
        router.push("/login");
      },
    });
  };

  const handleLogoutClick = () => {
    if (showConfirmDialog) {
      setIsLogoutDialogOpen(true);
    } else {
      handleLogout();
    }
  };

  if (!user) {
    return null;
  }

  const userInitials = user.username
    ? user.username.substring(0, 2).toUpperCase()
    : user.email.substring(0, 2).toUpperCase();

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {user.profilePicture ? (
          <Image
            src={user.profilePicture}
            alt={user.username}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <span className="text-sm font-medium text-gray-700">
            {userInitials}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="font-medium text-gray-900">{user.username}</p>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                router.push("/profile");
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              <UserIcon className="mr-3 h-4 w-4" />
              Profile
            </button>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                router.push("/settings");
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              <Settings className="mr-3 h-4 w-4" />
              Settings
            </button>
            <hr className="my-1" />
            <button
              onClick={handleLogoutClick}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      {showConfirmDialog && isLogoutDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Are you sure you want to logout?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              You will be signed out of your account and redirected to the login
              page.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsLogoutDialogOpen(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
