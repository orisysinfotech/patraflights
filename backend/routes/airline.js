import express from "express";
import multer from "multer";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import db from "../config/database.js";

const router = express.Router();

// ================= MULTER CONFIG =================
const upload = multer({
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, WEBP images allowed"), false);
    }
    cb(null, true);
  }
});

// ================= LIST =================
router.get("/airlines", async (req, res) => {
  try {
    const { search = "" } = req.query;
    let sql = `SELECT * FROM tbl_flight_airlines`;
    const params = [];

    if (search) {
      sql += " WHERE airlines_name LIKE ?";
      params.push(search + "%");
    }

    const [rows] = await db.execute(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= SINGLE =================
router.get("/airlines/:id", async (req, res) => {
  const [rows] = await db.execute(
    "SELECT * FROM tbl_flight_airlines WHERE airlines_id=?",
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, data: rows[0] });
});

// ================= ADD =================
router.post("/add-airline", upload.single("airlines_image"), async (req, res) => {
  try {
    const { airlines_name, airlines_code2, airlines_fare_rule, airlines_popular = 0, airlines_url = "", airlines_sort = 0 } = req.body;

    if (!airlines_name || !airlines_code2 || !airlines_fare_rule) {
      return res.status(400).json({ success: false, message: "Required fields missing" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Airline logo required" });
    }

    const [dup] = await db.execute(
      "SELECT airlines_id FROM tbl_flight_airlines WHERE airlines_name=? AND airlines_code2=?",
      [airlines_name, airlines_code2]
    );

    if (dup.length) {
      return res.status(400).json({ success: false, message: "Duplicate airline exists" });
    }

    const [result] = await db.execute(
      `INSERT INTO tbl_flight_airlines
      (airlines_name, airlines_code2, airlines_fare_rule, airlines_popular, airlines_url, airlines_sort, airlines_updated_date)
      VALUES (?,?,?,?,?,?,NOW())`,
      [airlines_name, airlines_code2, airlines_fare_rule, airlines_popular, airlines_url, airlines_sort]
    );

    const ext = path.extname(req.file.originalname);
    const fileName = `${airlines_code2}${ext}`;
    const uploadDir = path.join(process.cwd(), "template/img/flight");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    await sharp(req.file.buffer).resize(100, 100).toFile(path.join(uploadDir, fileName));

    await db.execute("UPDATE tbl_flight_airlines SET airlines_image=? WHERE airlines_id=?", [
      fileName,
      result.insertId
    ]);

    res.json({ success: true, message: "Airline added successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= UPDATE =================
router.put("/update-airline/:id", upload.single("airlines_image"), async (req, res) => {
  const { id } = req.params;
  try {
    const { airlines_name, airlines_code2, airlines_fare_rule, airlines_popular, airlines_url, airlines_sort } = req.body;

    if (airlines_name && airlines_code2) {
      const [dup] = await db.execute(
        `SELECT airlines_id FROM tbl_flight_airlines 
         WHERE airlines_name=? AND airlines_code2=? AND airlines_id != ?`,
        [airlines_name, airlines_code2, id]
      );
      if (dup.length) {
        return res.status(400).json({ success: false, message: "Duplicate airline exists" });
      }
    }

    const [old] = await db.execute("SELECT airlines_image FROM tbl_flight_airlines WHERE airlines_id=?", [id]);
    if (!old.length) return res.status(404).json({ success: false, message: "Not found" });

    const fields = [];
    const values = [];

    if (airlines_name) { fields.push("airlines_name=?"); values.push(airlines_name); }
    if (airlines_code2) { fields.push("airlines_code2=?"); values.push(airlines_code2); }
    if (airlines_fare_rule) { fields.push("airlines_fare_rule=?"); values.push(airlines_fare_rule); }
    if (airlines_popular !== undefined) { fields.push("airlines_popular=?"); values.push(airlines_popular); }
    if (airlines_url !== undefined) { fields.push("airlines_url=?"); values.push(airlines_url); }
    if (airlines_sort !== undefined) { fields.push("airlines_sort=?"); values.push(airlines_sort); }

    fields.push("airlines_updated_date=NOW()");
    const sql = `UPDATE tbl_flight_airlines SET ${fields.join(", ")} WHERE airlines_id=?`;
    values.push(id);

    await db.execute(sql, values);

    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const fileName = `${airlines_code2 || "airline_" + id}${ext}`;
      const uploadDir = path.join(process.cwd(), "template/img/flight");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      await sharp(req.file.buffer).resize(100, 100).toFile(path.join(uploadDir, fileName));
      await db.execute("UPDATE tbl_flight_airlines SET airlines_image=? WHERE airlines_id=?", [fileName, id]);

      if (old[0].airlines_image && old[0].airlines_image !== fileName) {
        const oldPath = path.join(uploadDir, old[0].airlines_image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    res.json({ success: true, message: "Airline updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= DELETE =================
router.delete("/delete_airlines/:id", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT airlines_image FROM tbl_flight_airlines WHERE airlines_id=?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Not found" });

    await db.execute("DELETE FROM tbl_flight_airlines WHERE airlines_id=?", [req.params.id]);

    if (rows[0].airlines_image) {
      const imgPath = path.join(process.cwd(), "template/img/flight", rows[0].airlines_image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    res.json({ success: true, message: "Airline deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
