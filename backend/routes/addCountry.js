import express from "express";
import db from "../config/database.js";
import cors from "cors";


const router = express.Router();

// ✅ ADD COUNTRY
router.post("/addcountry", async (req, res) => {
  const { country_name, country_code } = req.body;

  if (!country_name || !country_code) {
    return res.status(400).json({
      success: false,
      message: "Country name & code required"
    });
  }

  try {
    await db.execute(
      "INSERT INTO tbl_countries (country_name, country_code) VALUES (?, ?)",
      [country_name, country_code]
    );

    res.json({
      success: true,
      message: "Country added successfully"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

export default router;
