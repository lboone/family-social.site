"use client";
import LoadingButton from "@/components/Form/LoadingButton";
import UserAvatar from "@/components/Home/UserAvatar";
import useForm from "@/hooks/useForm";
import useGetUser from "@/hooks/useGetUser";
import { API_URL_USER } from "@/server";
import { setAuthUser } from "@/store/authSlice";
import { EditProfileFormData, UseFormHandleSubmitOptions } from "@/types";
import axios from "axios";
import { useRef, useState } from "react";
import { useDispatch } from "react-redux";

const ChangeBioAndImage = () => {
  const dispatch = useDispatch();
  const { user } = useGetUser();
  const { formData, handleChange, handleSubmit, isLoading } =
    useForm<EditProfileFormData>({
      bio: user?.bio || undefined,
      file: undefined,
    });
  const [selectedImage, setSelectedImage] = useState<string | null>(
    user?.profilePicture || null
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: EditProfileFormData) => {
    const newFormData = new FormData();
    newFormData.append("bio", data.bio || "");

    if (fileInputRef.current?.files?.[0]) {
      newFormData.append("profilePicture", fileInputRef.current.files[0]);
    }

    return await axios.post(`${API_URL_USER}/edit-profile`, newFormData, {
      withCredentials: true,
    });
  };
  const validateForm = (data: EditProfileFormData) => {
    const errors: Record<string, string> = {};

    if (data.bio && data.bio.length > 500) {
      errors.bio = "Bio must be less than 500 characters";
    }
    return Object.keys(errors).length > 0 ? errors : null;
  };
  const options: UseFormHandleSubmitOptions = {
    validate: validateForm,
    onSuccess: (result) => {
      dispatch(setAuthUser(result.data.data.user));
    },
  };
  return (
    <form className=" pb-16 " onSubmit={handleSubmit({ onSubmit, options })}>
      <div className="mt-16 pb-16 border-b-2">
        <div
          className="flex items-center justify-center cursor-pointer"
          onClick={handleAvatarClick}
        >
          <UserAvatar
            user={user!}
            selectedImage={selectedImage || null}
            avatarImageClassName="w-[10rem] h-[10rem]"
            avatarClassName="w-[10rem] h-[10rem]"
            avatarFallbackClassName="text-4xl"
          />
        </div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        <div className="flex items-center justify-center">
          <LoadingButton
            isLoading={isLoading}
            size="lg"
            className="mt-4"
            type="submit"
          >
            Change Photo
          </LoadingButton>
        </div>
      </div>
      <div className="mt-10 border-b-2 pb-10">
        <label htmlFor="bio" className="block text-lg font-bold mb-2">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          className="w-full h-[7rem] bg-gray-200 outline-none  p-6 rounded-md"
          placeholder="Tell us about yourself..."
        />
        <LoadingButton
          isLoading={isLoading}
          size="lg"
          className="mt-6 px-10"
          type="submit"
        >
          Update Bio
        </LoadingButton>
      </div>
    </form>
  );
};
export default ChangeBioAndImage;
