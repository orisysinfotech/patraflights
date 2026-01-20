import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import auth from "../middleware/auth.js";
import { submitAttendanceLogic } from "../services/attendance.js";

const router = express.Router();
const uploadDir = path.join(process.cwd(), "uploads", "selfies");

// Ensure uploads folder exists
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const driverId = req.driver ? req.driver.id : "NO_ID";
    const timestamp = Date.now();
    cb(null, `${driverId}_${timestamp}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Attendance route
router.post("/", auth, upload.single("selfie"), async (req, res) => {
  if (!req.file)
    return res.status(400).json({ success: false, message: "No image uploaded" });

  try {
    const { latitude, longitude } = req.body;

    await submitAttendanceLogic({
      driver: req.driver,
      filePath: req.file.path,
      fileName: req.file.filename,
      latitude,
      longitude,
    });

    res.status(200).json({ success: true, message: "Attendance submitted!" });
  } catch (error) {
    // DO NOT DELETE THE FILE
    console.error("Attendance submission failed:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;