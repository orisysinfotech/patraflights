import express from "express";
import db from "../config/database.js";

const router = express.Router();

router.get("/getcountry", async (req, res) => {
  try {
    // Query to join attendance records with driver names (using your table names)
    const qry = `SELECT * FROM  tbl_countries ORDER BY country_name ASC `;

    const [records] = await db.execute(qry);

    const Country = records.map((record) => ({
      ...record,
      
    }));

    res.json({ success: true, data: Country });
    // console.log("Country name are", Country);
  } catch (err) {
    console.error("Country not Found:", err.message);
    res.status(500).json({
      success: false,
      error:
        "Server error retrieving Country.",
    });
  }
});






export default router;