// Example usage of OTPInput component with useForm hook
// This shows how to integrate the reusable OTPInput into the Verify component

import OTPInput, { OTPInputRef } from "@/components/Auth/OTPInput";
import LoadingButton from "@/components/Form/LoadingButton";
import { useForm } from "@/hooks/useForm";
import { API_URL_USER } from "@/server";
import { setAuthUser } from "@/store/authSlice";
import { UseFormHandleSubmitOptions, VerifyFormData } from "@/types";
import axios from "axios";
import { MailCheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useRef } from "react";
import { useDispatch } from "react-redux";

// Example 1: Basic OTPInput usage
export const BasicOTPExample = () => {
  const [otpValue, setOtpValue] = React.useState("");

  const handleOTPChange = (value: string) => {
    setOtpValue(value);
  };

  const handleOTPComplete = (value: string) => {
    console.log("OTP completed:", value);
    // Handle OTP completion logic here
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Basic OTP Input</h3>
      <OTPInput
        length={6}
        value={otpValue}
        onChange={handleOTPChange}
        onComplete={handleOTPComplete}
        autoFocus
      />
      <p className="text-sm text-gray-600">Current OTP: {otpValue}</p>
    </div>
  );
};

// Example 2: OTPInput with useForm hook integration
export const OTPWithFormExample = () => {
  const otpRef = useRef<OTPInputRef>(null);

  const { formData, updateField, handleSubmit, isLoading, errors } =
    useForm<VerifyFormData>({
      otp: "",
    });

  const onSubmit = async (data: VerifyFormData) => {
    // Simulate API call
    console.log("Submitting OTP:", data.otp);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { success: true } });
      }, 1000);
    });
  };

  const validateForm = (data: VerifyFormData) => {
    const errors: Record<string, string> = {};

    if (!data.otp.trim()) {
      errors.otp = "OTP is required";
    } else if (data.otp.length !== 6 || !/^\\d+$/.test(data.otp)) {
      errors.otp = "OTP must be exactly 6 digits";
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };

  const options: UseFormHandleSubmitOptions = {
    validate: validateForm,
    onSuccess: (result) => {
      console.log("OTP verified successfully:", result);
      // Handle success logic here
      otpRef.current?.clear(); // Clear OTP on success
    },
  };

  const handleOTPChange = (value: string) => {
    updateField("otp", value);
  };

  const handleResendOTP = () => {
    // Clear current OTP
    otpRef.current?.clear();
    updateField("otp", "");
  };

  return (
    <form onSubmit={handleSubmit({ onSubmit, options })} className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Enter Verification Code</h3>
        <p className="text-gray-600 mb-6">
          We&apos;ve sent a 6-digit code to your email
        </p>

        <OTPInput
          ref={otpRef}
          length={6}
          value={formData.otp}
          onChange={handleOTPChange}
          onComplete={(value) => {
            console.log("OTP auto-completed:", value);
          }}
          autoFocus
          className="justify-center mb-4"
        />

        {errors.otp && (
          <p className="text-red-500 text-sm mt-2">{errors.otp}</p>
        )}
      </div>

      <div className="flex flex-col items-center space-y-4">
        <LoadingButton
          type="submit"
          isLoading={isLoading}
          disabled={formData.otp.length !== 6}
          size="lg"
          className="w-48"
        >
          Verify Code
        </LoadingButton>

        <div className="text-center">
          <span className="text-gray-600">Didn&apos;t receive the code? </span>
          <button
            type="button"
            onClick={handleResendOTP}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Resend
          </button>
        </div>
      </div>
    </form>
  );
};

// Example 3: Full Verify component integration (how it would look)
export const VerifyWithOTPInput = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const otpRef = useRef<OTPInputRef>(null);

  const { formData, updateField, handleSubmit, isLoading, errors } =
    useForm<VerifyFormData>({
      otp: "",
    });

  const onSubmit = async (data: VerifyFormData) => {
    return await axios.post(
      `${API_URL_USER}/verify`,
      { otp: data.otp },
      { withCredentials: true }
    );
  };

  const validateForm = (data: VerifyFormData) => {
    const errors: Record<string, string> = {};

    if (!data.otp.trim()) {
      errors.otp = "OTP is required";
    } else if (data.otp.length !== 6 || !/^\\d+$/.test(data.otp)) {
      errors.otp = "OTP is invalid";
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };

  const options: UseFormHandleSubmitOptions = {
    validate: validateForm,
    onSuccess: (result) => {
      dispatch(setAuthUser(result.data.data.user));
      router.push("/");
    },
  };

  const handleOTPChange = (value: string) => {
    updateField("otp", value);
  };

  const handleResendOTP = async () => {
    try {
      // Clear current OTP
      otpRef.current?.clear();
      updateField("otp", "");

      // Call resend API
      await axios.post(
        `${API_URL_USER}/resend-otp`,
        {},
        { withCredentials: true }
      );
      console.log("OTP resent successfully");
    } catch (error) {
      console.error("Failed to resend OTP:", error);
    }
  };

  return (
    <div className="h-screen flex items-center flex-col justify-center">
      <MailCheckIcon className="w-20 h-20 sm:w-32 sm:h-32 text_primary mb-4" />
      <h1 className="text-2xl sm:text-3xl font-bold mb-3">OTP Verification</h1>
      <p className="mb-6 text-sm sm:text-base text-gray-600 font-md">
        We have sent a code to your email
      </p>

      <form
        className="flex flex-col space-x-4 w-full items-center justify-center"
        onSubmit={handleSubmit({ onSubmit, options })}
      >
        <OTPInput
          ref={otpRef}
          length={6}
          value={formData.otp}
          onChange={handleOTPChange}
          onComplete={(value) => {
            console.log("OTP completed:", value);
          }}
          autoFocus
          className="mb-4"
        />

        {errors.otp && (
          <p className="text-red-500 text-sm mb-4">{errors.otp}</p>
        )}

        <div className="flex items-center mt-4 space-x-2">
          <h1 className="text-sm sm:text-lg font-medium text-gray-700">
            Didn&apos;t get the OTP code?
          </h1>
          <button
            type="button"
            onClick={handleResendOTP}
            className="text-sm sm:text-lg font-medium text_primary underline"
          >
            Resend Code
          </button>
        </div>

        <LoadingButton
          size="lg"
          className="mt-6 w-52"
          isLoading={isLoading}
          type="submit"
          disabled={formData.otp.length !== 6}
        >
          Verify
        </LoadingButton>
      </form>
    </div>
  );
};

// Example 4: Advanced OTPInput with custom styling
export const CustomStyledOTPExample = () => {
  const [otp, setOtp] = React.useState("");

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Custom Styled OTP Input</h3>

      {/* Large, colorful OTP */}
      <OTPInput
        length={4}
        value={otp}
        onChange={setOtp}
        className="space-x-3"
        inputClassName="w-16 h-16 text-3xl border-2 border-purple-300 rounded-xl bg-purple-50 text-purple-700 focus:border-purple-500 focus:bg-white"
        autoFocus
      />

      {/* Small, minimal OTP */}
      <OTPInput
        length={6}
        value={otp}
        onChange={setOtp}
        className="space-x-1"
        inputClassName="w-8 h-8 text-sm border border-gray-300 rounded bg-white focus:border-blue-400"
      />
    </div>
  );
};

const OTPInputExamples = {
  BasicOTPExample,
  OTPWithFormExample,
  VerifyWithOTPInput,
  CustomStyledOTPExample,
};

export default OTPInputExamples;
