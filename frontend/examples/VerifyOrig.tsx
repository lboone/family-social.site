"use client";

import { useForm } from "@/hooks/useForm";
import { API_URL_USER } from "@/server";
import { setAuthUser } from "@/store/authSlice";
import { UseFormHandleSubmitOptions, VerifyFormData } from "@/types";
import axios from "axios";
import { MailCheckIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import LoadingButton from "../../Form/LoadingButton";

const Verify = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ): void => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Move to next input if current input is filled
      if (value.length === 1 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1]?.focus();
      }
      formData.otp = newOtp.join("");
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ): void => {
    if (
      e.key === "Backspace" &&
      !inputRefs.current[index]?.value &&
      inputRefs.current[index - 1]
    ) {
      inputRefs.current[index - 1]?.focus();
    }
    formData.otp = otp.join("");
  };

  const handleOnPaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    index: number
  ): void => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const newOtp = [...otp];

    for (let i = 0; i < pastedData.length && index + i < 6; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newOtp[index + i] = pastedData[i];
      }
    }

    setOtp(newOtp);

    // Focus the next empty input after pasting
    for (let i = index; i < 6; i++) {
      if (!newOtp[i] && inputRefs.current[i]) {
        inputRefs.current[i]?.focus();
        break;
      }
    }
    formData.otp = newOtp.join("");
  };

  //   const handleSubmit = async () => {
  //     const otpValue = otp.join("");
  //     if (otpValue.length < 6) {
  //       toast.error("Please enter a valid OTP code");
  //       return;
  //     }

  //     const verifyReq = async () => {
  //       await axios.post(
  //         `${API_URL_USER}/verify`,
  //         {
  //           otp: otpValue,
  //         },
  //         { withCredentials: true }
  //       );
  //     };
  //     const result = await handleAuthRequest(null, verifyReq, setIsLoading);
  //     if (result) {
  //       dispatch(setAuthUser(result.data?.data?.user));
  //     }
  //   };

  const { formData, handleSubmit, isLoading } = useForm<VerifyFormData>({
    otp: "",
  });

  // Your signup submission logic
  const onSubmit = async (data: VerifyFormData) => {
    // Call your login API here
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

    if (!data.otp.trim()) {
      errors.otp = "OTP is required";
    } else if (data.otp.length !== 6 || !/^\d+$/.test(data.otp)) {
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

  return (
    <div className="h-screen flex items-center flex-col justify-center ">
      <MailCheckIcon className="w-20 h-20 sm:w-32 sm:h-32 text_primary mb-4" />
      <h1 className="text-2xl sm:text-3xl font-bold mb-3">OTP Verification</h1>
      <p className="mb-6 text-sm sm:text-base text-gray-600 font-md">
        We have sent a code to code@gmail.com
      </p>
      <form
        className="flex flex-col space-x-4 w-full items-center justify-center"
        onSubmit={handleSubmit({ onSubmit, options })}
      >
        <div className="flex space-x-4">
          {[0, 1, 2, 3, 4, 5].map((index) => {
            return (
              <input
                type="number"
                key={index}
                maxLength={1}
                className="sm:w-20 sm:h-20 w-10 h-10 rounded-lg bg-gray-200 text-lg sm:text-3xl font-bold outline-gray-500 text-center no-spinner"
                value={otp[index] || ""}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onChange={(e) => handleChange(e, index)}
                onPaste={(e) => handleOnPaste(e, index)}
              />
            );
          })}
        </div>
        <div className="flex items-center mt-4 space-x-2">
          <h1 className="text-sm sm:text-lg font-medium text-gray-700">
            Didn&apos;t get the OTP code?
          </h1>
          <button
            type="button"
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
        >
          Verify
        </LoadingButton>
      </form>
    </div>
  );
};
export default Verify;
