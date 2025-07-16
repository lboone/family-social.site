"use client";
import useForm from "@/hooks/useForm";
import { API_URL_USER } from "@/server";
import {
  ChangePasswordFormData,
  EditProfileFormData,
  UseFormHandleSubmitOptions,
} from "@/types";
import { useLogout } from "@/utils/auth";
import axios from "axios";
import PasswordInput from "../../Auth/PasswordInput";
import LoadingButton from "../../Form/LoadingButton";

const ChangePassword = () => {
  const logout = useLogout();
  const { formData, handleChange, handleSubmit, isLoading } =
    useForm<ChangePasswordFormData>({
      currentPassword: "",
      newPassword: "",
      newPasswordConfirm: "",
    });

  const onSubmit = async (data: ChangePasswordFormData) => {
    return await axios.post(`${API_URL_USER}/change-password`, data, {
      withCredentials: true,
    });
  };

  const handleLogout = async () => {
    await logout({
      redirectTo: "/auth/login",
      showToast: true,
    });
  };
  const validateForm = (data: EditProfileFormData) => {
    const errors: Record<string, string> = {};

    if (
      !data.currentPassword ||
      !data.newPassword ||
      !data.newPasswordConfirm
    ) {
      errors.currentPassword = "Current password is required";
      errors.newPassword = "New password is required";
      errors.newPasswordConfirm = "New password confirmation is required";
    }

    if (data.newPassword !== data.newPasswordConfirm) {
      errors.newPasswordConfirm = "New password confirmation does not match";
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };
  const options: UseFormHandleSubmitOptions = {
    validate: validateForm,
    onSuccess: () => {
      handleLogout();
    },
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Change Password</h1>

      <form
        className="mt-8 mb-8"
        onSubmit={handleSubmit({ onSubmit, options })}
      >
        <div className="w-[90%] md:w-[80%] lg:w-[60%]">
          <PasswordInput
            name="currentPassword"
            label="Current Password"
            placeholder="Enter your current password"
            value={formData.currentPassword}
            errors={{}}
            onChange={handleChange}
          />
        </div>
        <div className="w-[90%] md:w-[80%] lg:w-[60%] mt-6 mb-6">
          <PasswordInput
            name="newPassword"
            label="New Password"
            placeholder="Enter your new password"
            value={formData.newPassword}
            errors={{}}
            onChange={handleChange}
          />
        </div>
        <div className="w-[90%] md:w-[80%] lg:w-[60%]">
          <PasswordInput
            name="newPasswordConfirm"
            label="Confirm Password"
            placeholder="Confirm your new password"
            value={formData.newPasswordConfirm}
            errors={{}}
            onChange={handleChange}
          />
        </div>
        <div className="mt-2">
          <LoadingButton
            isLoading={isLoading}
            size="lg"
            className="mt-6 bg-red-700"
            type="submit"
            disabled={
              !formData.currentPassword ||
              !formData.newPassword ||
              !formData.newPasswordConfirm
            }
          >
            Change Password
          </LoadingButton>
        </div>
      </form>
    </div>
  );
};
export default ChangePassword;
