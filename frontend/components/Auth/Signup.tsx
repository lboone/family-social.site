"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import InputField from "../Form/InputField";
import LoadingButton from "../Form/LoadingButton";
import PasswordInput from "./PasswordInput";

const Signup = () => {
  const [isLoading, setIsLoading] = useState(false);
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
          />
        </div>
        <div className="lg:col-span-3 flex flex-col items-center justify-center h-screen">
          <h1 className="font-bold text-xl sm:text-2xl text-left uppercase mb-8">
            Sign Up With <span className="text_primary">Family Social</span>
          </h1>
          <form className="auth_form">
            <InputField
              name="username"
              label="User Name"
              placeholder="Enter your username"
            />
            <InputField
              name="email"
              label="Email"
              type="email"
              placeholder="Enter your email"
            />
            <PasswordInput
              name="password"
              placeholder="Enter your password"
              label="Password"
            />
            <PasswordInput
              name="passwordConfirm"
              placeholder="Confirm your password"
              label="Confirm Password"
            />
            <LoadingButton
              size="lg"
              className=" mt-3 w-full"
              type="submit"
              isLoading={isLoading}
            >
              Sign Up Now
            </LoadingButton>
          </form>
          <h1 className="mt-4 text-lg text-gray-800">
            Already have account ?{" "}
            <Link href="/auth/login">
              <span className="text-blue-800 underline cursor-pointer font-medium">
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
