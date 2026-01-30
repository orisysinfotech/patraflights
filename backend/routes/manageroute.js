import express from "express";
import db from "../config/database.js";

const router = express.Router();

// 🔹 Get all countries
router.get("/getroute", async (req, res) => {
  try {
    const qry = `SELECT * FROM  tbl_flight_route`;
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

const deleteRoute = async (route_id) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "Do you want to delete this route?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it",
    cancelButtonText: "Cancel",
  });

  if (!result.isConfirmed) return;

  try {
    const res = await api.delete(`/route/${route_id}`);
    if (res.data.success) {
      setRoutes(routes.filter((r) => r.route_id !== route_id));
      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "Route deleted successfully",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      Swal.fire("Failed", "Unable to delete route", "error");
    }
  } catch (err) {
    Swal.fire("Error", "Server error occurred", "error");
  }
};

router.put("/route/status/:id", async (req, res) => {
  const { id } = req.params;
  const { field, value } = req.body;

  // safety: only allow these 3 fields
  const allowed = ["show_home", "show_page", "crawl"];
  if (!allowed.includes(field)) {
    return res.status(400).json({ success: false });
  }

  try {
    const sql = `UPDATE tbl_flight_route SET ${field}=? WHERE route_id=?`;
    await db.execute(sql, [value, id]);

    res.json({ success: true });
  } catch (err) {
    console.error("STATUS UPDATE ERROR:", err);
    res.status(500).json({ success: false });
  }
});


export default router;