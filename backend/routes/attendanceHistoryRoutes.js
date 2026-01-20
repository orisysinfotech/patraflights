import express from "express";
import db from "../config/database.js";

const router = express.Router();


router.get(
  "/driverHistory/:driverId/:month/:year",
  async (req, res) => {
    try {
      const { driverId, month, year } = req.params;

      // const qry = `
      //   SELECT 
      //     a.attendance_id, 
      //     d.driver_regno,   
      //     d.driver_fstname,
      //     a.selfie AS selfie_path, 
      //     a.created_at,
      //     a.latitude,
      //     a.longitude
      //   FROM attendance a 
      //   JOIN tbl_drivers d ON a.driver_id = d.driver_id
      //   WHERE d.driver_regno = ?
      //     AND MONTH(a.created_at) = ?
      //     AND YEAR(a.created_at) = ?
      //   ORDER BY a.created_at DESC
      // `;

       const qry = `
        SELECT 
          a.*,
          d.driver_regno,
          d.driver_fstname
        FROM drv_attendance_details a
        JOIN tbl_drivers d ON a.drv_id = d.driver_id
        WHERE d.driver_regno = ?
          AND MONTH(a.checkin_datetime) = ?
          AND YEAR(a.checkin_datetime) = ?
        ORDER BY a.checkin_datetime DESC;

      `;

      const [records] = await db.execute(qry, [
        driverId,
        month,
        year,
      ]);

      const formattedRecords = records.map((record) => ({
        ...record,
        selfie_path: `uploads/selfies/${record.selfie_path}`,
        checkin_datetime: new Date(record.checkin_datetime).toLocaleString(),
      }));

      res.json({ success: true, data: formattedRecords });
    } catch (err) {
      console.error("Attendance error:", err.message);
      res.status(500).json({
        success: false,
        error: "Server error retrieving attendance records",
      });
    }
  }
);

router.get(
  "/attendanceHistory/:driverId/:month/:year",
  async (req, res) => {
    try {
      const { driverId, month, year } = req.params;

      // const qry = `
      //   SELECT 
      //     a.attendance_id, 
      //     d.driver_regno,   
      //     d.driver_fstname,
      //     a.selfie AS selfie_path, 
      //     a.created_at,
      //     a.latitude,
      //     a.longitude
      //   FROM attendance a 
      //   JOIN tbl_drivers d ON a.driver_id = d.driver_id
      //   WHERE d.driver_regno = ?
      //     AND MONTH(a.created_at) = ?
      //     AND YEAR(a.created_at) = ?
      //   ORDER BY a.created_at DESC
      // `;

       const qry = `
        SELECT 
          a.drv_atid, 
          d.driver_regno,   
          d.driver_fstname,
          a.checkin_selfie AS selfie_path, 
          a.checkin_datetime,
          a.cigps_latitude,
          a.cigps_longitude
        FROM drv_attendance_details a 
        JOIN tbl_drivers d ON a.drv_id = d.driver_id
        WHERE d.driver_regno = ?
          AND MONTH(a.checkin_datetime) = ?
          AND YEAR(a.checkin_datetime) = ?
        ORDER BY a.checkin_datetime DESC
      `;

      const [records] = await db.execute(qry, [
        driverId,
        month,
        year,
      ]);

      const formattedRecords = records.map((record) => ({
        ...record,
        selfie_path: `uploads/selfies/${record.selfie_path}`,
        checkin_datetime: new Date(record.checkin_datetime).toLocaleString(),
      }));

      res.json({ success: true, data: formattedRecords });
    } catch (err) {
      console.error("Attendance error:", err.message);
      res.status(500).json({
        success: false,
        error: "Server error retrieving attendance records",
      });
    }
  }
);



router.get(
  "/attendanceCheckDate/:driverId/:date/:month/:year",
  async (req, res) => {
    try {
      const { driverId, date,month, year } = req.params;



       const qry = `
        SELECT 
          a.drv_atid, 
          d.driver_regno,   
          d.driver_fstname,
          a.checkin_selfie AS selfie_path, 
          a.checkin_datetime,
          a.odo_civalue,
          a.cigps_latitude,
          a.cigps_longitude,
          a.ck_sts
        FROM drv_attendance_details a 
        JOIN tbl_drivers d ON a.drv_id = d.driver_id
        WHERE d.driver_regno = ?
        AND DATE(a.checkin_datetime) = ?
          AND MONTH(a.checkin_datetime) = ?
          AND YEAR(a.checkin_datetime) = ?
        ORDER BY a.checkin_datetime DESC
        LIMIT 1
      `;

      const [records] = await db.execute(qry, [
        driverId,
        date,
        month,
        year,
      ]);

      const formattedRecords = records.map((record) => ({
        ...record,
        selfie_path: `uploads/selfies/${record.selfie_path}`,
        checkin_datetime: new Date(record.checkin_datetime).toLocaleString(),
      }));

      res.json({ success: true, data: formattedRecords });
    } catch (err) {
      console.error("Attendance error:", err.message);
      res.status(500).json({
        success: false,
        error: "Server error retrieving attendance records",
      });
    }
  }
);



router.get("/sendItems", async (req, res) => {
  try {
    const [items] = await db.execute("SELECT * FROM items where is_active=1");

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (err) {
    console.error("Items view error:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error retrieving Items records",
    });
  }
});





export default router;