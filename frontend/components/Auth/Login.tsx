"use client";

import PasswordInput from "@/components/Auth/PasswordInput";
import InputField from "@/components/Form/InputField";
import LoadingButton from "@/components/Form/LoadingButton";
import { useForm } from "@/hooks/useForm";
import { API_URL_USER } from "@/server";
import { setAuthUser } from "@/store/authSlice"; // Adjust the import path as necessary
import {
  LoginFormData,
  SignUpFormData,
  UseFormHandleSubmitOptions,
} from "@/types";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

const Login = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { formData, handleChange, handleSubmit, isLoading, errors } =
    useForm<LoginFormData>({
      email: "",
      password: "",
    });

  // Your signup submission logic
  const onSubmit = async (data: SignUpFormData) => {
    // Call your login API here
    return await axios.post(`${API_URL_USER}/login`, data, {
      withCredentials: true,
    });
  };

  // Validation function
  const validateForm = (data: SignUpFormData) => {
    const errors: Record<string, string> = {};

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
    <div className="w-full h-screen overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        <div className="lg:col-span-4 h-screen hidden lg:block">
          <Image
            src="/images/login-banner.jpg"
            alt="Login"
            width={1000}
            height={1000}
            className="w-full h-full object-cover"
            priority
          />
        </div>
        <div className="lg:col-span-3 flex flex-col items-center justify-center h-screen">
          <h1 className="font-bold text-xl sm:text-2xl text-left uppercase mb-8">
            Login With<span className="text_primary ml-2">Family Social</span>
          </h1>
          <form
            className="auth_form"
            onSubmit={handleSubmit({
              onSubmit,
              options,
            })}
          >
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
              showForgetPassword
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
              Login Now
            </LoadingButton>
          </form>
          <h1 className="mt-4 text-lg text-gray-800">
            Don&apos;t have account?
            <Link href="/auth/signup">
              <span className="text-blue-800 underline cursor-pointer font-medium ml-2">
                Sign Up
              </span>
            </Link>
          </h1>
        </div>
      </div>
    </div>
  );
};
export default Login;
