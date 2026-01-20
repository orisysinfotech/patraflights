import express from "express";
import db from "../config/database.js";

const router = express.Router();

router.get("/attendance", async (req, res) => {
  try {
    // Query to join attendance records with driver names (using your table names)
    const qry = `
            SELECT 
                a.attendance_id, 
                d.driver_regno,   
                d.driver_fstname,
                a.selfie AS selfie_path, 
                a.created_at,
                a.latitude,
                a.longitude
            FROM attendance a 
            JOIN tbl_drivers d ON a.driver_id = d.driver_id 
        `;

    const [records] = await db.execute(qry);

    const formattedRecords = records.map((record) => ({
      ...record,
      selfie_path: `uploads/selfies/${record.selfie_path}`,
      created_at: new Date(record.created_at).toLocaleString(),
    }));

    res.json({ success: true, data: formattedRecords });
  } catch (err) {
    console.error("Admin attendance view error:", err.message);
    res.status(500).json({
      success: false,
      error:
        "Server error retrieving attendance records. Check SQL query and driver table names.",
    });
  }
});

export default router;