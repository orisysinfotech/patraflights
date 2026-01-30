import express from "express";
import db from "../config/database.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Ensure upload folder exists
const uploadDir = "uploads/country";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, Date.now() + ext);
  }
});

// Multer validation
const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 }, // 1 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpg|jpeg|png|gif/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype.toLowerCase();

    if (allowedTypes.test(ext) && allowedTypes.test(mime)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPG, JPEG, PNG, GIF images are allowed"));
    }
  }
});

// ================= ADD COUNTRY =================
router.post("/addcountry", (req, res) => {
  upload.single("country_image")(req, res, async (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "Image must be less than 1 MB" });
      }
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const { country_name, country_code } = req.body;

      if (!country_name || !country_code || !req.file) {
        return res.status(400).json({
          success: false,
          message: "Country name, country code and image are required"
        });
      }

      // Duplicate check
      const [exist] = await db.execute(
        "SELECT country_id FROM tbl_countries WHERE country_name = ? OR country_code = ?",
        [country_name, country_code]
      );

      if (exist.length > 0) {
        return res.status(409).json({
          success: false,
          message: "Country name or country code already exists"
        });
      }

      // Insert
      const [result] = await db.execute(
        "INSERT INTO tbl_countries (country_name, country_code) VALUES (?, ?)",
        [country_name, country_code]
      );

      const insertId = result.insertId;

      // Rename image
      const ext = path.extname(req.file.originalname);
      const newFileName = `country_${insertId}${ext}`;
      const newPath = `${uploadDir}/${newFileName}`;
      fs.renameSync(req.file.path, newPath);

      // Update image path
      await db.execute(
        "UPDATE tbl_countries SET country_image = ? WHERE country_id = ?",
        [newPath, insertId]
      );

      res.json({ success: true, message: "Country added successfully" });

    } catch (error) {
      console.error("Add Country Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });
});




export default router;
