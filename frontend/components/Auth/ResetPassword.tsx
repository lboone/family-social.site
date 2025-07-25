// This file demonstrates how to integrate the new OTPInput component
// into the existing Verify.tsx component, replacing the manual OTP logic

"use client";

import OTPInput, { OTPInputRef } from "@/components/Auth/OTPInput";
import LoadingButton from "@/components/Form/LoadingButton";
import { useForm } from "@/hooks/useForm";
import { API_URL_USER } from "@/server";
import { ResetPasswordFormData, UseFormHandleSubmitOptions } from "@/types";
import axios from "axios";
import { MailCheckIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
//import { useRef, useState } from "react";
import { useRef } from "react";
import InputField from "../Form/InputField";
import PasswordInput from "./PasswordInput";

const ResetPassword = () => {
  const router = useRouter();
  const otpRef = useRef<OTPInputRef>(null);
  //const [isResending, setIsResending] = useState(false);
  const searchParams = useSearchParams();

  const email = searchParams.get("email");

  // Use the useForm hook for form state management
  const {
    formData,
    handleChange,
    updateField,
    handleSubmit,
    isLoading,
    errors,
  } = useForm<ResetPasswordFormData>({
    email: email || "",
    otp: "",
    password: "",
    passwordConfirm: "",
  });

  // Your submission logic - now simplified
  const onSubmit = async (data: ResetPasswordFormData) => {
    return await axios.post(
      `${API_URL_USER}/reset-password`,
      {
        email: data.email,
        otp: data.otp,
        password: data.password,
        passwordConfirm: data.passwordConfirm,
      },
      { withCredentials: true }
    );
  };

  // Validation function
  const validateForm = (data: ResetPasswordFormData) => {
    const errors: Record<string, string> = {};

    if (!data.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = "Email is invalid";
    }

    if (!data.otp.trim()) {
      errors.otp = "OTP is required";
    } else if (data.otp.length !== 6) {
      errors.otp = "OTP is invalid";
    }

    if (!data.password.trim()) {
      errors.password = "Password is required";
    } else if (data.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    if (data.password !== data.passwordConfirm) {
      errors.passwordConfirm = "Passwords do not match";
    }
    return Object.keys(errors).length > 0 ? errors : null;
  };

  const options: UseFormHandleSubmitOptions = {
    validate: validateForm,
    onSuccess: () => {
      //dispatch(setAuthUser(result.data.data.user));
      router.push("/auth/login");
    },
  };

  // Handle OTP changes from the OTP component
  const handleOTPChange = (value: string) => {
    updateField("otp", value);
  };

  // Handle OTP completion (optional - auto-submit or validation)
  const handleOTPComplete = (value: string) => {
    if (process.env.NODE_ENV === "development") {
      console.log("OTP completed:", value);
    }
    // Optional: Auto-submit when OTP is complete
    // if (value.length === 6) {
    //   // Trigger form submission
    // }
  };

  // Handle resend OTP
  // const handleResendOTP = async () => {
  //   setIsResending(true);
  //   try {
  //     // Clear current OTP
  //     otpRef.current?.clear();
  //     updateField("otp", "");

  //     // Call resend API (you'll need to implement this endpoint)
  //     await axios.post(
  //       `${API_URL_USER}/resend-otp`,
  //       {},
  //       { withCredentials: true }
  //     );
  //     toast.success("OTP resent successfully");
  //   } catch (error) {
  //     toast.error("Failed to resend OTP");
  //     console.error("Failed to resend OTP:", error);
  //   } finally {
  //     setIsResending(false);
  //   }
  // };

  return (
    <div className="h-screen flex items-center flex-col justify-center">
      <MailCheckIcon className="w-20 h-20 sm:w-32 sm:h-32 text_primary mb-4" />
      <h1 className="text-2xl sm:text-3xl font-bold mb-3">Reset Password</h1>
      <p className="mb-6 text-sm sm:text-base text-gray-600 font-md">
        We have sent a code to {email}
      </p>

      <form
        className="flex flex-col space-x-4 w-full items-center justify-center"
        onSubmit={handleSubmit({ onSubmit, options })}
      >
        {/* Replace the manual OTP inputs with the reusable OTPInput component */}
        <OTPInput
          ref={otpRef}
          length={6}
          value={formData.otp}
          onChange={handleOTPChange}
          onComplete={handleOTPComplete}
          autoFocus
          className="mb-4"
        />

        {/* Display validation errors */}
        {errors.otp && (
          <p className="text-red-500 text-sm mb-4">{errors.otp}</p>
        )}

        <InputField
          name="email"
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          errors={errors}
          containerClassName="w-[90%] sm:w-[80%] md:w-[60%] lg:w-[40%] xl:w-[20%] mx-auto"
          hidden
        />
        <PasswordInput
          name="password"
          label="New Password"
          placeholder="Enter your new password"
          value={formData.password}
          onChange={handleChange}
          errors={errors}
          containerClassName="w-[90%] sm:w-[80%] md:w-[60%] lg:w-[40%] xl:w-[20%] mx-auto"
        />

        <PasswordInput
          name="passwordConfirm"
          label="Confirm Password"
          placeholder="Confirm your new password"
          value={formData.passwordConfirm}
          onChange={handleChange}
          errors={errors}
          containerClassName="w-[90%] sm:w-[80%] md:w-[60%] lg:w-[40%] xl:w-[20%] mx-auto"
        />

        <div className="flex items-center mt-4 space-x-2">
          <h1 className="text-sm sm:text-lg font-medium text-gray-700">
            Didn&apos;t get the OTP code?
          </h1>
          <LoadingButton
            type="button"
            variant="ghost"
            onClick={() => router.push("/auth/forgot-password")}
            //onClick={handleResendOTP})}
            className="text-sm sm:text-lg font-medium text_primary underline hover:no-underline py-0 px-0 bg-white dark:bg-white hover:bg-white"
          >
            Resend Code
          </LoadingButton>
        </div>

        <LoadingButton
          size="lg"
          className="mt-6 w-52"
          isLoading={isLoading}
          type="submit"
          disabled={
            formData.otp.length !== 6 ||
            formData.password.length < 8 ||
            formData.password !== formData.passwordConfirm ||
            isLoading
          } // Disable if OTP is not complete
        >
          Change Password
        </LoadingButton>
      </form>
    </div>
  );
};

export default ResetPassword;
