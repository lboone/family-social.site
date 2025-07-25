const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  timeout: 60000,
});

const uploadToCloudinary = async (fileUri, options = {}) => {
  try {
    const defaultOptions = {
      resource_type: "auto", // Automatically detect resource type
      quality: "auto",
      fetch_format: "auto",
    };

    const uploadOptions = { ...defaultOptions, ...options };
    const response = await cloudinary.uploader.upload(fileUri, uploadOptions);
    return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload file to Cloudinary");
  }
};

module.exports = {
  uploadToCloudinary,
  cloudinary,
};
