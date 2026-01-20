import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import auth from "../middleware/auth.js";
import { submitAttendanceLogic } from "../services/attendance1.js";

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads", "selfies");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const driverId = req.driver?.id || "NO_ID";
    cb(null, `${driverId}_${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

router.post(
  "/",
  auth,
  upload.fields([
    { name: "selfie", maxCount: 1 },
    { name: "secondSelfie", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const selfie = req.files?.selfie?.[0];
      const odometerImg = req.files?.secondSelfie?.[0] || null;

      if (!selfie) {
        return res.status(400).json({ message: "Selfie required" });
      }

      const latitude = Number(req.body.latitude);
      const longitude = Number(req.body.longitude);
      const notes = req.body.notes || null;
      const btnpara = req.body.btnParameter || null;

      // ✅ PARSE JSON
      let ci_itemchkstatus = {};
      if (req.body.ci_itemchkstatus) {
        ci_itemchkstatus = JSON.parse(req.body.ci_itemchkstatus);
      }

      await submitAttendanceLogic({
        driver: req.driver,
        filePath: selfie.path,
        fileName: selfie.filename,
        odometerFileName: odometerImg?.filename || null,
        odometerValue: notes,
        latitude,
        longitude,
        ci_itemchkstatus,
        buttonParameter: btnpara
      });

      res.json({ success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Attendance failed" });
    }
  }
);

export default router;




