import express from "express";
import db from "../config/database.js";

const router = express.Router();

/* ================== GET ALL CABINS ================== */
router.get("/cabins", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM tbl_cabin_type ORDER BY cabin_id DESC"
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ================== GET SINGLE CABIN (EDIT) ================== */
router.get("/cabins/:id", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM tbl_cabin_type WHERE cabin_id=?",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* ================== UPDATE CABIN ================== */
router.put("/cabins/:id", async (req, res) => {
  const { cabin_name, cabin_code, flight_price_hike } = req.body;
  const id = req.params.id;

  try {
    // Duplicate Check
    const [dup] = await db.execute(
      "SELECT cabin_id FROM tbl_cabin_type WHERE cabin_name=? AND cabin_id!=?",
      [cabin_name, id]
    );

    if (dup.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Duplicate cabin name"
      });
    }

    await db.execute(
      `UPDATE tbl_cabin_type 
       SET cabin_name=?, cabin_code=?, flight_price_hike=? 
       WHERE cabin_id=?`,
      [cabin_name, cabin_code, flight_price_hike, id]
    );

    res.json({ success: true, message: "Cabin updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Update failed" });
  }
});

/* ================== DELETE CABIN ================== */
router.delete("/cabins/:id", async (req, res) => {
  try {
    await db.execute("DELETE FROM tbl_cabin_type WHERE cabin_id=?", [
      req.params.id
    ]);
    res.json({ success: true, message: "Cabin deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

/* ================== ACTIVATE CABIN ================== */
router.put("/cabins/activate/:id", async (req, res) => {
  try {
    await db.execute(
      "UPDATE tbl_cabin_type SET cabin_status=1 WHERE cabin_id=?",
      [req.params.id]
    );
    res.json({ success: true, message: "Cabin activated" });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* ================== DEACTIVATE CABIN ================== */
router.put("/cabins/deactivate/:id", async (req, res) => {
  try {
    await db.execute(
      "UPDATE tbl_cabin_type SET cabin_status=0 WHERE cabin_id=?",
      [req.params.id]
    );
    res.json({ success: true, message: "Cabin deactivated" });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});



// ================= ADD CABIN TYPE =================
router.post("/cabins", async (req, res) => {
  try {
    const { cabin_name, cabin_code, flight_price_hike } = req.body;

    if (!cabin_name || !cabin_code || !flight_price_hike) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Duplicate check (same as PHP: cabin_name)
    const [dup] = await db.execute(
      "SELECT cabin_id FROM tbl_cabin_type WHERE cabin_name = ?",
      [cabin_name]
    );

    if (dup.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Cabin Type already exists"
      });
    }

    // Insert
    const [result] = await db.execute(
      `INSERT INTO tbl_cabin_type 
       (cabin_name, cabin_code, flight_price_hike) 
       VALUES (?,?,?)`,
      [cabin_name, cabin_code, flight_price_hike]
    );

    return res.json({
      success: true,
      message: "Cabin Type added successfully",
      insertId: result.insertId
    });

  } catch (error) {
    console.error("Add Cabin Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding cabin"
    });
  }
});


export default router;
