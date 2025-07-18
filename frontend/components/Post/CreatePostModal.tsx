"use client";

import useForm from "@/hooks/useForm";
import { API_URL_POST } from "@/server";
import { CreatePostFormData, UseFormHandleSubmitOptions } from "@/types";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { addPost } from "@/store/postSlice";
import { Hash, ImageIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import HashtagText from "../Form/HashtagText";
import LoadingButton from "../Form/LoadingButton";
import { Button } from "../ui/button";
import HashtagPicker from "./HashtagPicker";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}
const CreatePostModal = ({ isOpen, onClose }: CreatePostModalProps) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { formData, handleChange, handleSubmit, isLoading, resetForm, errors } =
    useForm<CreatePostFormData>({
      caption: "",
      file: undefined,
    });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showHashtagPicker, setShowHashtagPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const captionInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setPreviewImage(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      // Don't call resetForm here to avoid the infinite loop
    }
  }, [isOpen]); // Only depend on isOpen

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setPreviewImage(null);
      setSelectedFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      setPreviewImage(null);
      setSelectedFile(null);
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Please select an image smaller than 5MB.");
      setPreviewImage(null);
      setSelectedFile(null);
      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // File is valid, process it
    setSelectedFile(file);
    const imageUrl = URL.createObjectURL(file);
    setPreviewImage(imageUrl);
  };

  const handleHashtagSelect = (hashtag: string) => {
    const currentCaption = formData.caption || "";
    const newCaption =
      currentCaption + (currentCaption ? " " : "") + `#${hashtag} `;
    handleChange({
      target: { name: "caption", value: newCaption },
    } as React.ChangeEvent<HTMLInputElement>);
    setShowHashtagPicker(false);

    // Set focus back to caption input after a brief delay to ensure modal closes first
    setTimeout(() => {
      if (captionInputRef.current) {
        captionInputRef.current.focus();
        // Set cursor to the end of the text
        const length = newCaption.length;
        captionInputRef.current.setSelectionRange(length, length);
      }
    }, 100);
  };

  const onSubmit = async (data: CreatePostFormData) => {
    const newFormData = new FormData();
    newFormData.append("caption", data.caption || "");

    if (selectedFile) {
      newFormData.append("postImage", selectedFile);
    }
    return await axios.post(`${API_URL_POST}/create`, newFormData, {
      withCredentials: true,
      // Don't set Content-Type header, let axios handle it for FormData
    });
  };

  const validateForm = (data: CreatePostFormData) => {
    const errors: Record<string, string> = {};

    // Since image is now optional, we need either caption or image
    const hasImage = selectedFile;
    const hasCaption = data.caption && data.caption.trim().length > 0;

    if (!hasCaption && !hasImage) {
      errors.caption = "Please provide either a caption or an image";
    }

    if (data.caption && data.caption.length > 2200) {
      errors.caption = "Caption must be less than 2200 characters";
    }

    return Object.keys(errors).length > 0 ? errors : null;
  };
  const options: UseFormHandleSubmitOptions = {
    validate: validateForm,
    onSuccess: (result) => {
      dispatch(addPost(result.data.data.post));
      // Reset form and clear images on successful submission
      setPreviewImage(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      resetForm();
      onClose();
      router.push("/"); // Redirect to home after creating post
      router.refresh();
    },
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <form className="pb-4" onSubmit={handleSubmit({ onSubmit, options })}>
          <div className="flex flex-col justify-center text-center space-y-4">
            <div className="mt-4">
              {previewImage ? (
                <Image
                  src={previewImage}
                  alt="Post Image"
                  width={400}
                  height={400}
                  className="overflow-auto max-h-[50vh] rounded-md object-cover w-full"
                />
              ) : (
                // Show default view
                <>
                  <DialogHeader>
                    <DialogTitle className="text-center mt-3 mb-6">
                      Upload Photo
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center justify-center text-center space-y-4 p-4 border border-dashed border-gray-300 rounded-lg">
                    <div className="flex space-x-2 text-gray-600">
                      <ImageIcon size={40} />
                    </div>
                    <p className="text-gray-600 mt-4">
                      Select a photo from your device
                    </p>
                    <Button
                      className=" bg-sky-600 text-white hover:bg-sky-700"
                      onClick={handleButtonClick}
                      type="button"
                    >
                      Select Image
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                  </div>
                </>
              )}
            </div>
            <div className="mt-4 w-full">
              <input
                ref={captionInputRef}
                name="caption"
                type="text"
                placeholder={
                  previewImage ? "Write a caption..." : "Write a message..."
                }
                value={formData.caption}
                onChange={handleChange}
                className="focus:outline-none focus:ring-2 focus:ring-sky-600 rounded-md p-2 w-full border border-gray-300"
              />
              {errors.caption && (
                <span className="text-red-500 text-sm">{errors.caption}</span>
              )}
            </div>

            {/* Hashtag Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowHashtagPicker(true)}
              className="mt-2 flex items-center gap-2 text-sky-600 hover:text-sky-700 hover:bg-sky-50 border-sky-300"
            >
              <Hash size={16} />
              Add Hashtag
            </Button>

            {formData.caption && (
              <div className="mt-2 p-2 bg-gray-50 rounded">
                <p className="text-sm text-gray-600 mb-1">Preview:</p>
                <HashtagText text={formData.caption} />
              </div>
            )}
            <div className="flex justify-end space-x-4 mt-4">
              <LoadingButton
                isLoading={isLoading}
                className="bg_primary text-white hover:bg-sky-700"
                type="submit"
              >
                Create Post
              </LoadingButton>
              <Button
                className="px-4 py-6 text-lg rounded-lg hover:cursor-pointer"
                onClick={() => {
                  setPreviewImage(null);
                  setSelectedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                  resetForm();
                  onClose();
                }}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>

        {/* Hashtag Picker */}
        <HashtagPicker
          isOpen={showHashtagPicker}
          onClose={() => setShowHashtagPicker(false)}
          onSelectHashtag={handleHashtagSelect}
          currentCaption={formData.caption || ""}
        />
      </DialogContent>
    </Dialog>
  );
};
export default CreatePostModal;
