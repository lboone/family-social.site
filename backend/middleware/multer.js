const multer = require("multer");

const storage = multer.memoryStorage(); // Store files in memory

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for videos, 5MB for images (checked in controller)
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/")
    ) {
      // Additional size check for images
      if (file.mimetype.startsWith("image/") && file.size > 5 * 1024 * 1024) {
        cb(new Error("Image files must be smaller than 5MB!"), false);
        return;
      }
      // Additional size check for videos
      if (file.mimetype.startsWith("video/") && file.size > 50 * 1024 * 1024) {
        cb(new Error("Video files must be smaller than 50MB!"), false);
        return;
      }
      cb(null, true);
    } else {
      cb(new Error("Only image and video files are allowed!"), false);
    }
  },
});

module.exports = upload;
