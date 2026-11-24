import express from "express";
import {
  uploadMultipleImages,
  uploadSingleImage,
} from "../controllers/imageController.js";
import {
  uploadMultiple,
  uploadSingle,
} from "../middlewares/multer.middleware.js";
import { imageUploadLimiter } from "../middlewares/rateLimiters/index.js";

const imageRouter = express.Router();

imageRouter.post(
  "/uploadSingle",
  imageUploadLimiter,
  (req, res, next) => {
    uploadSingle("image")(req, res, (err) => {
      if (err) {
        console.error("Multer single upload error:", err);
        return res.status(400).json({ success: false, message: err.message || "File upload error" });
      }
      next();
    });
  },
  uploadSingleImage
);

imageRouter.post(
  "/uploadMultiple",
  imageUploadLimiter,
  (req, res, next) => {
    uploadMultiple("images", 10)(req, res, (err) => {
      if (err) {
        console.error("Multer multiple upload error:", err);
        return res.status(400).json({ success: false, message: err.message || "File upload error" });
      }
      next();
    });
  },
  uploadMultipleImages
);

export default imageRouter;
