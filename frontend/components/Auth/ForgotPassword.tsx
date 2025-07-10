"use client";

import LoadingButton from "@/components/Form/LoadingButton";
import { useForm } from "@/hooks/useForm";
import { API_URL_USER } from "@/server";
import { ForgotPasswordFormData, UseFormHandleSubmitOptions } from "@/types";
import axios from "axios";
import { KeySquareIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import InputField from "../Form/InputField";

const ForgotPassword = () => {
  const router = useRouter();

  // Use the useForm hook for form state management
  const { formData, handleChange, handleSubmit, isLoading, errors } =
    useForm<ForgotPasswordFormData>({
      email: "",
    });

  // Your submission logic - now simplified
  const onSubmit = async (data: ForgotPasswordFormData) => {
    return await axios.post(
      `${API_URL_USER}/forget-password`,
      {
        email: data.email,
      },
      { withCredentials: true }
    );
  };

  // Validation function
  const validateForm = (data: ForgotPasswordFormData) => {
    const errors: Record<string, string> = {};

    console.log("Validating email:", data.email);
    if (!data.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = "Email is invalid";
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };

  const options: UseFormHandleSubmitOptions = {
    validate: validateForm,
    onSuccess: () => {
      router.push(
        "/auth/reset-password?email=" + encodeURIComponent(formData.email)
      );
    },
  };

  return (
    <div className="flex items-center justify-center flex-col w-full h-screen">
      <KeySquareIcon className="w-20 h-20 sm:w-32 sm:h-32 text_primary mb-12" />
      <h1 className="text-2xl sm:text-3xl font-bold mb-3">
        Forgot Your Password
      </h1>
      <p className="mb-6 text-sm text-center sm:text-base text-gray-600 font-md w-[90%] sm:w-[80%] md:w-[60%] lg:w-[40%] xl:w-[30%] mx-auto">
        Enter your email address to reset your password.
      </p>

      <form
        className="flex flex-col space-x-4 w-full items-center justify-center"
        onSubmit={handleSubmit({ onSubmit, options })}
      >
        {/* Replace the manual OTP inputs with the reusable OTPInput component */}
        <InputField
          name="email"
          label="Email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          errors={errors}
          containerClassName="w-[90%] sm:w-[80%] md:w-[60%] lg:w-[40%] xl:w-[20%] mx-auto"
        />
        {/* Display validation errors */}
        {errors.otp && (
          <p className="text-red-500 text-sm mb-4">{errors.otp}</p>
        )}

        <LoadingButton
          size="lg"
          className="mt-6 w-[90%] sm:w-[80%] md:w-[60%] lg:w-[40%] xl:w-[20%] mx-auto"
          isLoading={isLoading}
          type="submit"
          disabled={formData.email.length === 0 || isLoading} // Disable if email is not complete
        >
          Continue
        </LoadingButton>
      </form>
    </div>
  );
};

export default ForgotPassword;
