import express from "express";
import db from "../config/database.js";
import fs from "fs";
import path from "path";
import multer from "multer";

const router = express.Router();

// Upload folder
const uploadDir = "uploads/country";

// Ensure folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, Date.now() + ext);
  }
});

// Multer validation (size + type only)
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

// 🔹 Get all countries
router.get("/getcountry", async (req, res) => {
  try {
    const [records] = await db.execute("SELECT * FROM tbl_countries ORDER BY country_name ASC");
    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error retrieving Country." });
  }
});

// 🔹 Country list with counts
router.get("/countries-full", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        c.country_id,
        c.country_name,
        c.country_code,
        c.country_image,
        (SELECT COUNT(*) FROM tbl_cities ct WHERE ct.country_id = c.country_id) AS city_count,
        (SELECT COUNT(*) FROM tbl_flight_airports a WHERE a.country_id = c.country_id) AS airport_count
      FROM tbl_countries c
      ORDER BY c.country_name ASC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🔹 Get single country
router.get("/country/:id", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM tbl_countries WHERE country_id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Country not found" });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 🔹 Delete country + image
router.delete("/deletecountry/:id", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT country_image FROM tbl_countries WHERE country_id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Country not found" });

    const imagePath = rows[0].country_image;
    await db.execute("DELETE FROM tbl_countries WHERE country_id = ?", [req.params.id]);

    if (imagePath && fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

    res.json({ success: true, message: "Country and image deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error deleting country" });
  }
});

// 🔹 Update country (only file size & type validation)
router.put("/updatecountry/:id", (req, res) => {
  upload.single("country_image")(req, res, async (err) => {

    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ success: false, message: "Image size must be less than 1 MB" });
      }
      return res.status(400).json({ success: false, message: err.message });
    }

    try {
      const { id } = req.params;
      const { country_name, country_code } = req.body;

      if (!country_name || !country_code) {
        return res.status(400).json({
          success: false,
          message: "Country name and country code are required"
        });
      }

      const [rows] = await db.execute(
        "SELECT country_image FROM tbl_countries WHERE country_id = ?",
        [id]
      );

      if (!rows.length) {
        return res.status(404).json({ success: false, message: "Country not found" });
      }

      let imagePath = rows[0].country_image;

      if (req.file) {
        // delete old image
        if (imagePath && fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }

        const ext = path.extname(req.file.originalname);
        const newFileName = `country_${id}${ext}`;
        const newPath = `${uploadDir}/${newFileName}`;

        fs.renameSync(req.file.path, newPath);
        imagePath = newPath;
      }

      await db.execute(
        "UPDATE tbl_countries SET country_name = ?, country_code = ?, country_image = ? WHERE country_id = ?",
        [country_name, country_code, imagePath, id]
      );

      res.json({ success: true, message: "Country updated successfully" });

    } catch (error) {
      console.error("Update country error:", error);
      res.status(500).json({ success: false, message: "Server error updating country" });
    }
  });
});

export default router;
