"use client";

import PasswordInput from "@/components/Auth/PasswordInput";
import InputField from "@/components/Form/InputField";
import LoadingButton from "@/components/Form/LoadingButton";
import { useForm } from "@/hooks/useForm";
import { API_URL_USER } from "@/server";
import { setAuthUser } from "@/store/authSlice"; // Adjust the import path as necessary
import { SignUpFormData, UseFormHandleSubmitOptions } from "@/types";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

const Signup = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { formData, handleChange, handleSubmit, isLoading, errors } =
    useForm<SignUpFormData>({
      username: "",
      email: "",
      password: "",
      passwordConfirm: "",
    });

  // Your signup submission logic
  const onSubmit = async (data: SignUpFormData) => {
    // Call your signup API here
    return await axios.post(`${API_URL_USER}/signup`, data, {
      withCredentials: true,
    });
  };

  // Validation function
  const validateForm = (data: SignUpFormData) => {
    const errors: Record<string, string> = {};

    if (!data.username.trim()) {
      errors.username = "Username is required";
    } else if (data.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!data.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = "Email is invalid";
    }

    if (!data.password) {
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
    onSuccess: (result) => {
      dispatch(setAuthUser(result.data.data.user));
      console.log("User signed up successfully");
      // Redirect to verify page after successful signup
      router.push("/auth/verify");
    },
  };

  return (
    <div className="w-full h-screen overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        <div className="lg:col-span-4 h-screen hidden lg:block">
          <Image
            src="/images/signup-banner.jpg"
            alt="Signup"
            width={1000}
            height={1000}
            className="w-full h-full object-cover"
            priority
          />
        </div>
        <div className="lg:col-span-3 flex flex-col items-center justify-center h-screen">
          <h1 className="font-bold text-xl sm:text-2xl text-left uppercase mb-8">
            Sign Up With{" "}
            <span className="text_primary ml-2">Family Social</span>
          </h1>
          <form
            className="auth_form"
            onSubmit={handleSubmit({
              onSubmit,
              options,
            })}
          >
            <InputField
              name="username"
              label="User Name"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              errors={errors}
            />

            <InputField
              name="email"
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              errors={errors}
            />

            <PasswordInput
              name="password"
              placeholder="Enter your password"
              label="Password"
              value={formData.password}
              onChange={handleChange}
              errors={errors}
            />

            <PasswordInput
              name="passwordConfirm"
              placeholder="Confirm your password"
              label="Confirm Password"
              value={formData.passwordConfirm}
              onChange={handleChange}
              errors={errors}
            />

            {/* {errors.submit && (
              <div className="text-red-500 text-sm">{errors.submit}</div>
            )} */}

            <LoadingButton
              size="lg"
              className="mt-3 w-full"
              type="submit"
              isLoading={isLoading}
            >
              Sign Up Now
            </LoadingButton>
          </form>
          <h1 className="mt-4 text-lg text-gray-800">
            Already have account?
            <Link href="/auth/login">
              <span className="text-blue-800 underline cursor-pointer font-medium ml-2">
                Login
              </span>
            </Link>
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Signup;
