import express from "express";
import db from "../config/database.js";

const router = express.Router();

// Get cities by country
router.get("/cities", async (req, res) => {
  try {
    const countryId = req.query.country_id;

    let sql = `
      SELECT 
        c.city_id,
        c.city_name,
        c.city_code,
        c.country_id,
        co.country_name,
        (SELECT COUNT(*) FROM tbl_flight_airports a WHERE a.city_id = c.city_id) AS airport_count
      FROM tbl_cities c
      LEFT JOIN tbl_countries co ON c.country_id = co.country_id
    `;

    if (countryId && countryId != 0) {
      sql += ` WHERE c.country_id = ${countryId}`;
    }

    sql += " ORDER BY c.city_name ASC";

    const [rows] = await db.execute(sql);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/deletecity/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute("DELETE FROM tbl_cities WHERE city_id = ?", [id]);
    res.json({ success: true, message: "City deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
// Get single city by id (for edit form)
router.get("/city/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.execute(
      "SELECT city_id, city_name, city_code, country_id FROM tbl_cities WHERE city_id = ?",
      [id]
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/updatecity/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { city_name, city_code, country_id } = req.body;

    if (!city_name || !city_code) {
      return res.status(400).json({ success: false, message: "Missing fields" });
    }

    const sql = `
      UPDATE tbl_cities 
      SET city_name = ?, city_code = ?, country_id = ?
      WHERE city_id = ?
    `;

    const params = [city_name, city_code, country_id, id];

    // 👇 Console the query and values
    console.log("UPDATE QUERY:", sql);
    console.log("PARAMS:", params);

    const [result] = await db.execute(sql, params);

    res.json({
      success: true,
      message: "City updated successfully"
    });
  } catch (error) {
    console.error("UPDATE CITY ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.post("/addcity", async (req, res) => {
  const { country_id, city_name, city_code } = req.body;

  await db.execute(
    "INSERT INTO tbl_cities (country_id, city_name, city_code) VALUES (?, ?, ?)",
    [country_id, city_name, city_code]
  );

  res.json({ success: true });
});




export default router;
