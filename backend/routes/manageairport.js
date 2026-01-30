import express from "express";
import db from "../config/database.js";

const router = express.Router();

// 🔹 Get all countries
router.get("/getairport", async (req, res) => {
  try {
    const qry = `SELECT 
                t1.*,
                t2.country_name,
                t3.city_name
                FROM tbl_flight_airports t1
                LEFT JOIN tbl_countries t2 
                ON t1.country_id = t2.country_id
                LEFT JOIN tbl_cities t3 
                ON t1.city_id = t3.city_id;
                `;





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



// 🔹 Update airport (inline edit)
router.put("/updateairport/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      airport_name,
      contactno,
      address,
      pincode
    } = req.body;

    const qry = `
      UPDATE tbl_flight_airports
      SET 
        airport_name = ?,
        contactno = ?,
        address = ?,
        pincode = ?
      WHERE airport_id = ?
    `;

    await db.execute(qry, [
      airport_name,
      contactno,
      address,
      pincode,
      id,
    ]);

    res.json({ success: true, message: "Airport updated successfully" });
  } catch (err) {
    console.error("Update error:", err.message);
    res.status(500).json({ success: false, message: "Update failed" });
  }
});



// 🔹 Delete airport
router.delete("/deleteairport/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const qry = `DELETE FROM tbl_flight_airports WHERE airport_id = ?`;
    await db.execute(qry, [id]);

    res.json({ success: true, message: "Airport deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err.message);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});


export default router;