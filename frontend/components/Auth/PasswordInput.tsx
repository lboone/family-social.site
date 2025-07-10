"use client";

import { cn } from "@/lib/utils";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface PasswordInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: Record<string, string>;
  showForgetPassword?: boolean;
  containerClassName?: string;
  inputClassName?: string;
  labelClassName?: string;
  iconClassName?: string;
}
const PasswordInput = ({
  name,
  label,
  placeholder = "Enter Password",
  value,
  onChange,
  errors,
  showForgetPassword = false,
  containerClassName,
  inputClassName,
  labelClassName,
  iconClassName,
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={cn("mb-4", containerClassName)}>
      {label && (
        <label className={cn("auth_label", labelClassName)} htmlFor={name}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          id={name}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={cn("auth_text_input", inputClassName)}
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className={cn(
            "absolute outline-none right-3 top-3 p-0",
            iconClassName
          )}
        >
          {showPassword ? (
            <EyeIcon className="w-5 h-5" />
          ) : (
            <EyeOffIcon className="w-5 h-5" />
          )}
        </button>
        {showForgetPassword && (
          <Link href="/auth/forgot-password">
            <span className="mt-2 text_primary block font-semibold text-base cursor-pointer text-right">
              Forgot Password?
            </span>
          </Link>
        )}
      </div>
      {errors[name] && (
        <span className="text-red-500 text-sm">{errors[name]}</span>
      )}
    </div>
  );
};
export default PasswordInput;
