import express from "express";
import db from "../config/database.js";
import cors from "cors";


const router = express.Router();

router.get("/getcountryname", async (req, res) => {
  try {
    const qry = `SELECT * FROM  tbl_countries ORDER BY country_name ASC`;
    const [records] = await db.execute(qry);

    res.json({ success: true, data: records });
  } catch (err) {
    console.error("Country not Found:", err.message);
    res.status(500).json({
      success: false,
      error: "Server error retrieving Country.",
    });
  }
});


router.get("/getcities", async (req, res) => {
  try {
    const { country_id } = req.query; // 👈 frontend ru asiba

    if (!country_id) {
      return res.status(400).json({
        success: false,
        error: "country_id is required",
      });
    }

    const qry = `
      SELECT city_id, city_name 
      FROM tbl_cities 
      WHERE country_id = ?
      ORDER BY city_name ASC
    `;

    const [records] = await db.execute(qry, [country_id]);

    res.json({ success: true, data: records });
  } catch (err) {
    console.error("City not Found:", err.message);
    res.status(500).json({
      success: false,
      error: "Server error retrieving City.",
    });
  }
});

// ADD AIRPORT
router.post("/airports", async (req, res) => {
  try {
    const {
      country_id,
      city_id,
      airport_name,
      airport_code,
      contactno,
      address,
      pincode,
    } = req.body;

    // 🛡 Required Validation
    if (!country_id || !city_id || !airport_name || !airport_code) {
      return res.status(400).json({
        success: false,
        error: "Country, City, Airport Name and Code are required",
      });
    }

    // 🔁 Duplicate Check (Airport Name or Code)
    const [dup] = await db.execute(
      `SELECT airport_id 
       FROM tbl_flight_airports 
       WHERE airport_name = ?`,
      [airport_name]
    );

    if (dup.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Airport name or code already exists",
      });
    }

    const qry = `
      INSERT INTO tbl_flight_airports
      (country_id, city_id, airport_name, airport_code, contactno, address, pincode)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(qry, [
      country_id,
      city_id,
      airport_name,
      airport_code.toUpperCase(),
      contactno || null,
      address || null,
      pincode || null
    ]);

    res.json({
      success: true,
      message: "Airport added successfully",
      airport_id: result.insertId,
    });

  } catch (err) {
    console.error("Add Airport Error:", err.message);
    res.status(500).json({
      success: false,
      error: "Server error adding airport",
    });
  }
});


// GET SINGLE AIRPORT (FOR EDIT)
router.get("/getairport/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const qry = `
      SELECT 
        airport_id,
        country_id,
        city_id,
        airport_name,
        airport_code,
        contactno,
        address,
        pincode
      FROM tbl_flight_airports
      WHERE airport_id = ?
    `;

    const [rows] = await db.execute(qry, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Airport not found",
      });
    }

    res.json({
      success: true,
      data: rows[0],
    });
  } catch (err) {
    console.error("Get Airport Error:", err.message);
    res.status(500).json({
      success: false,
      error: "Server error retrieving airport",
    });
  }
});


// UPDATE AIRPORT
router.put("/updateairport/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      country_id,
      city_id,
      airport_name,
      airport_code,
      contactno,
      address,
      pincode
    } = req.body;

    if (!country_id || !city_id || !airport_name || !airport_code) {
      return res.status(400).json({
        success: false,
        error: "Country, City, Airport Name and Code are required",
      });
    }

    const qry = `
      UPDATE tbl_flight_airports SET
        country_id = ?,
        city_id = ?,
        airport_name = ?,
        airport_code = ?,
        contactno = ?,
        address = ?,
        pincode = ?
      WHERE airport_id = ?
    `;

    const [result] = await db.execute(qry, [
      country_id,
      city_id,
      airport_name,
      airport_code.toUpperCase(),
      contactno || null,
      address || null,
      pincode || null,
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: "Airport not found",
      });
    }

    res.json({
      success: true,
      message: "Airport updated successfully",
    });

  } catch (err) {
    console.error("Update Airport Error:", err.message);
    res.status(500).json({
      success: false,
      error: "Server error updating airport",
    });
  }
});



export default router;

