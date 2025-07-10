// This file demonstrates how to integrate the new OTPInput component
// into the existing Verify.tsx component, replacing the manual OTP logic

"use client";

import OTPInput, { OTPInputRef } from "@/components/Auth/OTPInput";
import LoadingButton from "@/components/Form/LoadingButton";
import { useForm } from "@/hooks/useForm";
import { API_URL_USER } from "@/server";
import { setAuthUser } from "@/store/authSlice";
import { UseFormHandleSubmitOptions, VerifyFormData } from "@/types";
import axios from "axios";
import { MailCheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

const Verify = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const otpRef = useRef<OTPInputRef>(null);
  const [isResending, setIsResending] = useState(false);

  // Use the useForm hook for form state management
  const { formData, updateField, handleSubmit, isLoading, errors } =
    useForm<VerifyFormData>({
      otp: "",
    });

  // Your submission logic - now simplified
  const onSubmit = async (data: VerifyFormData) => {
    return await axios.post(
      `${API_URL_USER}/verify`,
      {
        otp: data.otp,
      },
      { withCredentials: true }
    );
  };

  // Validation function
  const validateForm = (data: VerifyFormData) => {
    const errors: Record<string, string> = {};

    console.log("Validating OTP:", data.otp);
    if (!data.otp.trim()) {
      errors.otp = "OTP is required";
    } else if (data.otp.length !== 6) {
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

  // Handle OTP changes from the OTP component
  const handleOTPChange = (value: string) => {
    updateField("otp", value);
  };

  // Handle OTP completion (optional - auto-submit or validation)
  const handleOTPComplete = (value: string) => {
    console.log("OTP completed:", value);
    // Optional: Auto-submit when OTP is complete
    // if (value.length === 6) {
    //   // Trigger form submission
    // }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      // Clear current OTP
      otpRef.current?.clear();
      updateField("otp", "");

      // Call resend API (you'll need to implement this endpoint)
      await axios.post(
        `${API_URL_USER}/resend-otp`,
        {},
        { withCredentials: true }
      );
      toast.success("OTP resent successfully");
    } catch (error) {
      toast.error("Failed to resend OTP");
      console.error("Failed to resend OTP:", error);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="h-screen flex items-center flex-col justify-center">
      <MailCheckIcon className="w-20 h-20 sm:w-32 sm:h-32 text_primary mb-4" />
      <h1 className="text-2xl sm:text-3xl font-bold mb-3">OTP Verification</h1>
      <p className="mb-6 text-sm sm:text-base text-gray-600 font-md">
        We have sent a code to code@gmail.com
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

        <div className="flex items-center mt-4 space-x-2">
          <h1 className="text-sm sm:text-lg font-medium text-gray-700">
            Didn&apos;t get the OTP code?
          </h1>
          <LoadingButton
            type="button"
            variant="ghost"
            onClick={handleResendOTP}
            className="text-sm sm:text-lg font-medium text_primary underline hover:no-underline py-0 px-0 bg-white dark:bg-white hover:bg-white"
            isLoading={isResending}
          >
            Resend Code
          </LoadingButton>
        </div>

        <LoadingButton
          size="lg"
          className="mt-6 w-52"
          isLoading={isLoading}
          type="submit"
          disabled={formData.otp.length !== 6 || isLoading} // Disable if OTP is not complete
        >
          Verify
        </LoadingButton>
      </form>
    </div>
  );
};

export default Verify;

/*
INTEGRATION BENEFITS:

1. **Cleaner Code**: The manual OTP state management (otp array, inputRefs, handleChange, 
   handleKeyDown, handleOnPaste) is replaced with a single OTPInput component.

2. **Reusability**: The OTP logic can now be used anywhere in the app that needs OTP input.

3. **Better UX**: The OTPInput component has enhanced features like:
   - Automatic focus management
   - Paste support for entire OTP codes
   - Arrow key navigation
   - Auto-completion callbacks
   - Better accessibility

4. **Form Integration**: Works seamlessly with the useForm hook for validation and submission.

5. **Type Safety**: Full TypeScript support with proper typing.

6. **Consistency**: Consistent styling and behavior across all OTP inputs in the app.

MIGRATION STEPS:
1. Replace the existing OTP state management in Verify.tsx with the OTPInput component
2. Update the form submission to use the useForm hook
3. Add proper error handling and validation
4. Test the integration thoroughly
5. Apply the same pattern to any other components that need OTP input

The original functionality is preserved but with much cleaner, more maintainable code.
*/
