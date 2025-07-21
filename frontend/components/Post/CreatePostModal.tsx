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
import VideoPlayer from "@/components/ui/VideoPlayer";
import { addPost } from "@/store/postSlice";
import { Hash, ImageIcon, VideoIcon } from "lucide-react";
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
  const [previewVideo, setPreviewVideo] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);
  const [showHashtagPicker, setShowHashtagPicker] = useState(false);
  const [fileSize, setFileSize] = useState<number>(0);
  const [isUploadWarning, setIsUploadWarning] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const captionInputRef = useRef<HTMLInputElement | null>(null);

  // File size limits
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
  const VIDEO_WARNING_SIZE = 25 * 1024 * 1024; // 25MB - warn user about large video

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  useEffect(() => {
    if (!isOpen) {
      setPreviewImage(null);
      setPreviewVideo(null);
      setSelectedFile(null);
      setFileType(null);
      setFileSize(0);
      setIsUploadWarning(false);
      setUploadProgress(0);
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
      setPreviewVideo(null);
      setSelectedFile(null);
      setFileType(null);
      setFileSize(0);
      setIsUploadWarning(false);
      return;
    }

    setFileSize(file.size);

    // Check if it's an image
    if (file.type.startsWith("image/")) {
      if (file.size > MAX_IMAGE_SIZE) {
        toast.error(
          `Image file is too large (${formatFileSize(
            file.size
          )}). Please select an image smaller than ${formatFileSize(
            MAX_IMAGE_SIZE
          )}.`
        );
        clearFileSelection();
        return;
      }

      setSelectedFile(file);
      setFileType("image");
      setIsUploadWarning(false);
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setPreviewVideo(null);

      // Show success message for images
      toast.success(`Image selected (${formatFileSize(file.size)})`);
      return;
    }

    // Check if it's a video
    if (file.type.startsWith("video/")) {
      if (file.size > MAX_VIDEO_SIZE) {
        toast.error(
          `Video file is too large (${formatFileSize(
            file.size
          )}). Please select a video smaller than ${formatFileSize(
            MAX_VIDEO_SIZE
          )}.`
        );
        clearFileSelection();
        return;
      }

      // Show warning for large videos
      if (file.size > VIDEO_WARNING_SIZE) {
        setIsUploadWarning(true);
        toast.warning(
          `Large video file detected (${formatFileSize(
            file.size
          )}). Upload may take longer and could fail on slower connections.`
        );
      } else {
        setIsUploadWarning(false);
        toast.success(`Video selected (${formatFileSize(file.size)})`);
      }

      setSelectedFile(file);
      setFileType("video");
      const videoUrl = URL.createObjectURL(file);
      setPreviewVideo(videoUrl);
      setPreviewImage(null);
      return;
    }

    // File is neither image nor video
    toast.error("Please select a valid image or video file.");
    clearFileSelection();
  };

  const clearFileSelection = () => {
    setPreviewImage(null);
    setPreviewVideo(null);
    setSelectedFile(null);
    setFileType(null);
    setFileSize(0);
    setIsUploadWarning(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
    // Show additional warning for large video files
    if (selectedFile && fileType === "video" && isUploadWarning) {
      toast.loading(
        `Uploading large video (${formatFileSize(
          fileSize
        )})... This may take a while.`,
        {
          id: "video-upload",
        }
      );
    }

    const newFormData = new FormData();
    newFormData.append("caption", data.caption || "");

    if (selectedFile) {
      if (fileType === "image") {
        newFormData.append("postImage", selectedFile);
      } else if (fileType === "video") {
        newFormData.append("postVideo", selectedFile);
      }
    }

    try {
      setUploadProgress(0);
      const result = await axios.post(`${API_URL_POST}/create`, newFormData, {
        withCredentials: true,
        timeout: 300000, // 5 minutes timeout for large files
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);

            // Update the loading toast for large files
            if (isUploadWarning && percentCompleted < 100) {
              toast.loading(`Uploading... ${percentCompleted}%`, {
                id: "video-upload",
              });
            }
          }
        },
      });

      // Dismiss the loading toast on success
      if (isUploadWarning) {
        toast.dismiss("video-upload");
        toast.success("Large video uploaded successfully!");
      }

      setUploadProgress(0);
      return result;
    } catch (error) {
      // Dismiss the loading toast on error
      if (isUploadWarning) {
        toast.dismiss("video-upload");
      }
      setUploadProgress(0);
      throw error;
    }
  };

  const validateForm = (data: CreatePostFormData) => {
    const errors: Record<string, string> = {};

    // Since media is now optional, we need either caption or media
    const hasMedia = selectedFile;
    const hasCaption = data.caption && data.caption.trim().length > 0;

    if (!hasCaption && !hasMedia) {
      errors.caption = "Please provide either a caption or media (image/video)";
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
      // Reset form and clear media on successful submission
      setPreviewImage(null);
      setPreviewVideo(null);
      setSelectedFile(null);
      setFileType(null);
      setFileSize(0);
      setIsUploadWarning(false);
      setUploadProgress(0);
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
                <>
                  <Image
                    src={previewImage}
                    alt="Post Image"
                    width={400}
                    height={400}
                    className="overflow-auto max-h-[50vh] rounded-md object-cover w-full"
                  />
                  {selectedFile && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                      <p className="text-green-700">
                        📸 <strong>{selectedFile.name}</strong> (
                        {formatFileSize(fileSize)})
                      </p>
                      {/* Upload Progress Bar */}
                      {isLoading && uploadProgress > 0 && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Uploading...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : previewVideo ? (
                <>
                  <VideoPlayer
                    src={previewVideo}
                    className="overflow-auto max-h-[50vh] rounded-md w-full"
                    autoPlay={false}
                    loop={false}
                    muted={true}
                    controls={true}
                  />
                  {selectedFile && (
                    <div
                      className={`mt-2 p-2 border rounded text-sm ${
                        isUploadWarning
                          ? "bg-yellow-50 border-yellow-200"
                          : "bg-green-50 border-green-200"
                      }`}
                    >
                      <p
                        className={
                          isUploadWarning ? "text-yellow-700" : "text-green-700"
                        }
                      >
                        🎬 <strong>{selectedFile.name}</strong> (
                        {formatFileSize(fileSize)})
                      </p>
                      {isUploadWarning && (
                        <p className="text-yellow-600 text-xs mt-1">
                          ⚠️ Large file - upload may be slow
                        </p>
                      )}
                      {/* Upload Progress Bar */}
                      {isLoading && uploadProgress > 0 && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Uploading...</span>
                            <span>{uploadProgress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                // Show default view
                <>
                  <DialogHeader>
                    <DialogTitle className="text-center mt-3 mb-6">
                      Upload Photo or Video
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center justify-center text-center space-y-4 p-4 border border-dashed border-gray-300 rounded-lg">
                    <div className="flex space-x-2 text-gray-600">
                      <ImageIcon size={40} />
                      <VideoIcon size={40} />
                    </div>
                    <p className="text-gray-600 mt-4">
                      Select a photo or video from your device
                    </p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>📸 Images: up to {formatFileSize(MAX_IMAGE_SIZE)}</p>
                      <p>🎬 Videos: up to {formatFileSize(MAX_VIDEO_SIZE)}</p>
                    </div>
                    <Button
                      className=" bg-sky-600 text-white hover:bg-sky-700"
                      onClick={handleButtonClick}
                      type="button"
                    >
                      Select Media
                    </Button>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,video/mp4,video/avi,video/mov,video/wmv,video/webm"
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
                  previewImage || previewVideo
                    ? "Write a caption..."
                    : "Write a message..."
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
                  setPreviewVideo(null);
                  setSelectedFile(null);
                  setFileType(null);
                  setFileSize(0);
                  setIsUploadWarning(false);
                  setUploadProgress(0);
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
