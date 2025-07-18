"use client";
import LoadingButton from "@/components/Form/LoadingButton";
import UserAvatar from "@/components/Home/UserAvatar";
import useForm from "@/hooks/useForm";
import useGetUser from "@/hooks/useGetUser";
import { API_URL_USER } from "@/server";
import { setAuthUser } from "@/store/authSlice";
import { EditProfileFormData, UseFormHandleSubmitOptions } from "@/types";
import axios from "axios";
import Image from "next/image";
import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import BackgroundImageEditor from "./BackgroundImageEditor";

const ChangeBioAndImage = () => {
  const dispatch = useDispatch();
  const { user } = useGetUser();
  const { formData, handleChange, handleSubmit, isLoading } =
    useForm<EditProfileFormData>({
      bio: user?.bio || undefined,
      file: undefined,
      usernameColor: user?.usernameColor || "#000000",
    });
  const [selectedImage, setSelectedImage] = useState<string | null>(
    user?.profilePicture || null
  );
  const [selectedBackground, setSelectedBackground] = useState<string | null>(
    user?.profileBackground || null
  );
  const [showBackgroundEditor, setShowBackgroundEditor] = useState(false);
  const [backgroundPositionData, setBackgroundPositionData] = useState<{
    x: number;
    y: number;
    scale: number;
    width: number;
    height: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const backgroundInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleBackgroundClick = () => {
    if (backgroundInputRef.current) {
      backgroundInputRef.current.click();
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

  const handleBackgroundChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageUrl = reader.result as string;
        setSelectedBackground(imageUrl);
        setShowBackgroundEditor(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: EditProfileFormData) => {
    const newFormData = new FormData();
    newFormData.append("bio", data.bio || "");
    newFormData.append("usernameColor", data.usernameColor || "#000000");

    if (fileInputRef.current?.files?.[0]) {
      newFormData.append("profilePicture", fileInputRef.current.files[0]);
    }

    return await axios.post(`${API_URL_USER}/edit-profile`, newFormData, {
      withCredentials: true,
    });
  };

  const onBackgroundSubmit = async () => {
    if (!backgroundInputRef.current?.files?.[0]) {
      return;
    }

    const formData = new FormData();
    formData.append("profileBackground", backgroundInputRef.current.files[0]);

    // Add positioning data if available
    if (backgroundPositionData) {
      formData.append("x", backgroundPositionData.x.toString());
      formData.append("y", backgroundPositionData.y.toString());
      formData.append("scale", backgroundPositionData.scale.toString());
      formData.append("width", backgroundPositionData.width.toString());
      formData.append("height", backgroundPositionData.height.toString());
    }

    return await axios.post(`${API_URL_USER}/update-background`, formData, {
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

  const handleBackgroundEditorSave = (imageData: {
    x: number;
    y: number;
    scale: number;
    width: number;
    height: number;
  }): void => {
    setBackgroundPositionData(imageData);
    setShowBackgroundEditor(false);
  };

  const handleBackgroundEditorCancel = (): void => {
    setShowBackgroundEditor(false);
    setSelectedBackground(user?.profileBackground || null);
    // Reset file input
    if (backgroundInputRef.current) {
      backgroundInputRef.current.value = "";
    }
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

      {/* Profile Background Section */}
      <div className="mt-16 pb-16 border-b-2">
        <h3 className="text-lg font-bold mb-4 text-center">
          Profile Background
        </h3>
        <div
          className="relative w-full h-[200px] bg-gray-200 rounded-lg cursor-pointer overflow-hidden border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
          onClick={handleBackgroundClick}
        >
          {selectedBackground ? (
            <Image
              src={selectedBackground}
              alt="Background preview"
              className="w-full h-full object-cover"
              fill
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">📷</div>
                <p>Click to upload background image</p>
              </div>
            </div>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={backgroundInputRef}
          onChange={handleBackgroundChange}
        />
        <div className="flex flex-col items-center">
          {selectedBackground && !backgroundPositionData && (
            <p className="text-sm text-gray-600 mt-2 mb-2">
              Please adjust the position and save to enable upload
            </p>
          )}
          <LoadingButton
            isLoading={false}
            size="lg"
            className="mt-4"
            type="button"
            disabled={!backgroundPositionData}
            onClick={async () => {
              try {
                const result = await onBackgroundSubmit();
                if (result?.data) {
                  dispatch(setAuthUser(result.data.data.user));
                  setBackgroundPositionData(null); // Reset after successful upload

                  // Force a page refresh to ensure the profile header updates
                  window.location.reload();
                }
              } catch (error) {
                console.error("Background upload failed:", error);
              }
            }}
          >
            {backgroundPositionData
              ? "Update Background"
              : "Select & Position Image First"}
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
      </div>

      {/* Username Color Section */}
      <div className="mt-10 border-b-2 pb-10">
        <label htmlFor="usernameColor" className="block text-lg font-bold mb-2">
          Username Color{" "}
          <span className="text-sm font-normal text-gray-600">
            (For larger screens)
          </span>
        </label>
        <p className="text-sm text-gray-600 mb-4">
          Choose a color for your username text on larger screens. This helps
          with readability when you have a dark background image. On mobile
          devices, the default black color will be used.
        </p>
        <div className="flex items-center gap-4 mb-4">
          <input
            type="color"
            id="usernameColor"
            name="usernameColor"
            value={formData.usernameColor}
            onChange={handleChange}
            className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer"
          />
          <div className="flex-1">
            <input
              type="text"
              value={formData.usernameColor}
              onChange={(e) =>
                handleChange({
                  target: { name: "usernameColor", value: e.target.value },
                } as React.ChangeEvent<HTMLInputElement>)
              }
              className="w-full bg-gray-200 outline-none p-3 rounded-md font-mono"
              placeholder="#000000"
              pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
            />
          </div>
        </div>
        <div className="p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Preview:</p>
          <h2
            className="text-2xl font-bold"
            style={{ color: formData.usernameColor }}
          >
            {user?.username}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            ↑ This is how your username will appear on larger screens
          </p>
        </div>
      </div>

      <div className="mt-10">
        <LoadingButton
          isLoading={isLoading}
          size="lg"
          className="w-full"
          type="submit"
        >
          Update Profile
        </LoadingButton>
      </div>

      {showBackgroundEditor && selectedBackground && (
        <BackgroundImageEditor
          imageUrl={selectedBackground}
          onSave={handleBackgroundEditorSave}
          onCancel={handleBackgroundEditorCancel}
        />
      )}
    </form>
  );
};
export default ChangeBioAndImage;
