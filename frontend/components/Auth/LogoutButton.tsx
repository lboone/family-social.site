"use client";

import { useLogout } from "@/utils/auth";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

interface LogoutButtonProps {
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "link"
    | "destructive"
    | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showIcon?: boolean;
  redirectTo?: string;
  children?: React.ReactNode;
  onLogoutSuccess?: () => void;
  onLogoutError?: (error: Error) => void;
  showToast?: boolean;
}

// Button variant styles
const buttonVariants = {
  default: "bg-blue-600 hover:bg-blue-700 text-white",
  outline: "border border-gray-300 hover:bg-gray-50 text-gray-700",
  ghost: "hover:bg-gray-100 text-gray-700",
  link: "text-blue-600 hover:text-blue-800 underline bg-transparent",
  destructive: "bg-red-600 hover:bg-red-700 text-white",
  secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900",
};

const buttonSizes = {
  default: "px-4 py-2 text-sm",
  sm: "px-3 py-1.5 text-xs",
  lg: "px-6 py-3 text-base",
  icon: "p-2",
};

/**
 * Reusable logout button component
 * Handles the complete logout flow including API call, state clearing, and redirection
 */
const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = "outline",
  size = "default",
  className = "",
  showIcon = true,
  redirectTo = "/auth/login",
  children,
  onLogoutSuccess,
  onLogoutError,
  showToast = true,
}) => {
  const router = useRouter();
  const logout = useLogout();

  const handleLogout = async () => {
    await logout({
      redirectTo: undefined, // We'll handle redirection with Next.js router
      showToast,
      onSuccess: () => {
        onLogoutSuccess?.();
        // Use Next.js router for better UX
        router.push(redirectTo);
      },
      onError: (error) => {
        onLogoutError?.(error);
        // Still redirect on error
        router.push(redirectTo);
      },
    });
  };

  const variantClasses = buttonVariants[variant];
  const sizeClasses = buttonSizes[size];

  return (
    <button
      className={`
        inline-flex items-center justify-center font-medium rounded-md
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses} ${sizeClasses} ${className}
      `}
      onClick={handleLogout}
      type="button"
    >
      {showIcon && <LogOut className="w-4 h-4 mr-2" />}
      {children || "Logout"}
    </button>
  );
};

export default LogoutButton;
