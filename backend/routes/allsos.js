import express from "express";
import db from "../config/database.js";
import axios from "axios"; 
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// Helper: Fetch Google Address (Same as your code)
const fetchGoogleAddress = async (latitude, longitude) => {
  const API_KEY = process.env.GOOGLE_MAPS_KEY;
  if (!API_KEY) return "Location unavailable (Config Error)";
  const googleUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`;
  try {
    const response = await axios.get(googleUrl, { timeout: 5000 });
    return response.data.status === "OK" && response.data.results.length > 0
      ? response.data.results[0].formatted_address
      : `Lat: ${latitude}, Lng: ${longitude}`;
  } catch (error) {
    return `Lat: ${latitude}, Lng: ${longitude}`;
  }
};

// --- 1. GET ALL SOS ALERTS (For Admin Dashboard) ---
router.get("/all", async (req, res) => {
  try {
    // Join sos_alerts with drivers table to get specific fields
    const query = `
      SELECT 
        s.sos_id, 
        s.latitude, 
        s.longitude, 
        s.location_name, 
        s.trigger_time, 
        s.status,
        d.driver_fstname, 
        d.driver_lstname, 
        d.driver_phno, 
        d.driver_email,
        d.driver_regno
      FROM tbl_sos_alerts s
      JOIN tbl_drivers d ON s.driver_id = d.driver_id
      ORDER BY s.trigger_time DESC
    `;

    const [rows] = await db.execute(query);
    res.json({ success: true, data: rows });

  } catch (error) {
    console.error("🔥 Error fetching SOS alerts:", error);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

// --- 2. UPDATE SOS STATUS (Pending -> Resolved) ---
router.put("/update-status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Expecting 'Resolved' or 'Pending'

    await db.execute(
      "UPDATE tbl_sos_alerts SET status = ? WHERE sos_id = ?",
      [status, id]
    );

    res.json({ success: true, message: "Status updated successfully" });

  } catch (error) {
    console.error("🔥 Error updating status:", error);
    res.status(500).json({ success: false, message: "Update failed" });
  }
});

// --- 3. YOUR EXISTING TRIGGER ROUTE (Kept as is) ---

export default router;