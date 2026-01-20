import express from "express";
import db from "../config/database.js";
import upload from "../middleware/multerAttendanceAbstract.js";

const router = express.Router();




///ATTENDANCE MODULE ARAE START//
router.get("/getDriverData", async (req, res) => {
  try {
    const [items] = await db.execute("SELECT driver_id,driver_regno,driver_fstname,driver_mdlname,driver_lstname FROM tbl_drivers where status=1");

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (err) {
    console.error("Driver view error:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error retrieving Driver records",
    });
  }
});

router.get(
  "/attendanceGetDateData/:date/:month/:year",
  async (req, res) => {
    try {
      const { date, month, year } = req.params;

      const fullDate = `${year}-${month}-${date}`;

      const qry = `
        SELECT 
          a.drv_atid,
          d.driver_regno,
          a.checkin_datetime,
          a.checkout_datetime,
          a.ck_sts
        FROM drv_attendance_details a
        JOIN tbl_drivers d ON a.drv_id = d.driver_id
          WHERE DATE(a.checkin_datetime) = ?
        ORDER BY a.checkin_datetime DESC
      `;

      const [records] = await db.execute(qry, [
      
        fullDate,
      ]);

      const formattedRecords = records.map((r) => ({
        ...r,
        checkin_datetime: new Date(r.checkin_datetime).toLocaleString(),
      }));

      res.json({ success: true, data: formattedRecords });
    } catch (err) {
      console.error("Attendance error:", err);
      res.status(500).json({
        success: false,
        error: "Server error retrieving attendance records",
      });
    }
  }
);


router.get(
  "/saveAttendanceGetDateData/:date/:month/:year",
  async (req, res) => {
    try {
      const { date, month, year } = req.params;

      const fullDate = `${year}-${month}-${date}`;

      const qry = `
        SELECT * FROM conf_drvr_atdnce
        WHERE DATE(checkin_datetime) = ?
      `;

      const [records] = await db.execute(qry, [
      
        fullDate,
      ]);

      const formattedRecords = records.map((r) => ({
        ...r,
        checkin_datetime: new Date(r.checkin_datetime).toLocaleString(),
      }));

      res.json({ success: true, data: formattedRecords });
    } catch (err) {
      console.error("Attendance error:", err);
      res.status(500).json({
        success: false,
        error: "Server error retrieving attendance records",
      });
    }
  }
);

router.get(
  "/saveAttendanceGetDateDataMonthly/:firstDate/:lastDate",
  async (req, res) => {
    try {
      const { firstDate, lastDate } = req.params;

    

      const qry = `
        SELECT *
        FROM conf_drvr_atdnce
        WHERE DATE(checkin_datetime)
        BETWEEN ? AND ?
        ORDER BY checkin_datetime ASC
      `;

      const [records] = await db.execute(qry, [
        firstDate,
        lastDate,
      ]);

      const formattedRecords = records.map((r) => ({
        ...r,
        checkin_datetime: new Date(r.checkin_datetime).toLocaleString(),
      }));

      res.json({
        success: true,
        data: formattedRecords,
        
      });
    } catch (err) {
      console.error("Attendance error:", err);
      res.status(500).json({
        success: false,
        error: "Server error retrieving attendance records",
      });
    }
  }
);



// router.post("/attendanceold/confirm", async (req, res) => {
//   try {
//     const { records } = req.body;

//     if (!Array.isArray(records)) {
//       return res.status(400).json({ success: false, message: "Invalid payload" });
//     }

//     for (const r of records) {
//       console.log("RECORD =>", r);

//       if (
//         !r.driver_regno ||
//         !r.attendance_status ||
//         !r.attendance_date
//       ) {
//         // console.log("⛔ INVALID RECORD, SKIPPED:", r);
//         continue;
//       }

//       // 🔹 FORMAT DATE
//       const dateObj = new Date(r.attendance_date);
//       if (isNaN(dateObj)) continue;

//       const formattedDate = `${dateObj.getFullYear()}-${String(
//         dateObj.getMonth() + 1
//       ).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;

//       /* 🔹 CHECK EXIST (USING driver_regno) */
//       const [exist] = await db.execute(
//         `
//         SELECT drv_id FROM conf_drvr_atdnce
//         WHERE drv_id = ?
//         AND DATE(checkin_datetime) = ?
//         `,
//         [r.driver_regno, formattedDate]
//       );

//       if (exist.length > 0) {
//         /* 🔹 UPDATE */
//         // console.log("🔁 UPDATING:", r.driver_regno);

//         await db.execute(
//           `
//           UPDATE conf_drvr_atdnce
//           SET ck_sts = ?
//           WHERE drv_id = ?
//           AND DATE(checkin_datetime) = ?
//           `,
//           [r.attendance_status, r.driver_regno, formattedDate]
//         );
//       } else {
//         /* 🔹 INSERT */
//         const insertValues = [
//           r.driver_regno,
//           `${formattedDate}`,
//           r.attendance_status
//         ];

//         // console.log("🟢 INSERT VALUES:", insertValues);

//         await db.execute(
//           `
//           INSERT INTO conf_drvr_atdnce
//           (drv_id, checkin_datetime, ck_sts)
//           VALUES (?, ?, ?)
//           `,
//           insertValues
//         );
//       }
//     }

//     res.json({ success: true, message: "Attendance saved successfully" });
//   } catch (err) {
//     console.error("❌ DB ERROR:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });


router.post("/attendance/confirm", async (req, res) => {
  try {
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payload" });
    }

    // 🔹 FORMAT DATE (FROM FIRST RECORD)
    const dateObj = new Date(records[0].attendance_date);
    if (isNaN(dateObj)) {
      return res.status(400).json({ success: false, message: "Invalid date" });
    }

    const formattedDate = `${dateObj.getFullYear()}-${String(
      dateObj.getMonth() + 1
    ).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`;

    // 🔹 BUILD JSON OBJECT
    const attendanceJSON = {};

    for (const r of records) {
      if (!r.driver_regno || !r.attendance_status) continue;

      attendanceJSON[r.driver_regno] = r.attendance_status;
    }

    /* 🔹 CHECK DATE EXIST */
    const [exist] = await db.execute(
      `
      SELECT att_id, attendance_json 
      FROM conf_drvr_atdnce
      WHERE DATE(checkin_datetime) = ?
      `,
      [formattedDate]
    );

    if (exist.length > 0) {
      // 🔁 UPDATE JSON
      await db.execute(
        `
        UPDATE conf_drvr_atdnce
        SET attendance_json = ?
        WHERE DATE(checkin_datetime) = ?
        `,
        [JSON.stringify(attendanceJSON), formattedDate]
      );
    } else {
      // 🟢 INSERT SINGLE ROW
      await db.execute(
        `
        INSERT INTO conf_drvr_atdnce
        (checkin_datetime, attendance_json)
        VALUES (?, ?)
        `,
        [formattedDate, JSON.stringify(attendanceJSON)]
      );
    }

    res.json({
      success: true,
      message: "Attendance saved successfully (JSON format)",
    });
  } catch (err) {
    console.error("❌ DB ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
// conform monthly attendace are start//
router.post(
  "/attendance/abstract/submit",
  upload.single("file"),
  async (req, res) => {
    try {
      const { month, year, driver_summary } = req.body;
      const filePath = req.file?.path;

      if (!month || !year || !driver_summary) {
        return res.status(400).json({ message: "Missing data" });
      }

      // 🔹 STEP 1: CHECK EXISTING RECORD
      const [rows] = await db.execute(
        `SELECT abstract_id FROM tbl_attendance_abstract WHERE month = ? AND year = ?`,
        [month, year]
      );

      // 🔹 STEP 2: UPDATE IF EXISTS
      if (rows.length > 0) {
        await db.execute(
          `UPDATE tbl_attendance_abstract
           SET file_path = ?, driver_summary = ?, updated_at = NOW()
           WHERE month = ? AND year = ?`,
          [
            filePath || rows[0].file_path,
            driver_summary,
            month,
            year,
          ]
        );

        return res.json({
          success: true,
          message: "Attendance abstract updated successfully",
        });
      }

      // 🔹 STEP 3: INSERT IF NOT EXISTS
      await db.execute(
        `INSERT INTO tbl_attendance_abstract
         (month, year, file_path, driver_summary)
         VALUES (?, ?, ?, ?)`,
        [
          month,
          year,
          filePath,
          driver_summary,
        ]
      );

      res.json({
        success: true,
        message: "Attendance abstract inserted successfully",
      });
    } catch (err) {
      console.error("Insert/Update Error:", err);
      res.status(500).json({ message: "Operation failed" });
    }
  }
);

// conform monthly attendace are end//

///ATTENDANCE MODULE ARAE END//


/// SALARY PROCESS AREA START //
router.get(
  "/getForSalaryProcess/:month/:year",
  async (req, res) => {
    try {
      const { month, year } = req.params;

      const qry = `
        SELECT *
        FROM tbl_attendance_abstract
        WHERE month = ?
          AND year = ?
        ORDER BY abstract_id ASC
      `;

      const [records] = await db.execute(qry, [month, year]);

      res.json({
        success: true,
        data: records,
      });
    } catch (err) {
      console.error("Attendance error:", err);
      res.status(500).json({
        success: false,
        error: "Server error retrieving Abstract Data records",
      });
    }
  }
);


router.get("/salary/check", async (req, res) => {
  const { month, year } = req.query;

  try {
    const [rows] = await db.execute(
      `
      SELECT salary_id
      FROM tbl_salary_process
      WHERE month = ? AND year = ?
      LIMIT 1
      `,
      [month, year]
    );

    if (rows.length > 0) {
      return res.json({ exists: true });
    }

    res.json({ exists: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ exists: false });
  }
});



router.post("/salary", async (req, res) => {
  const { records } = req.body;

  if (!records || records.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No driver salary data received",
    });
  }

  try {
    // 🔹 month & year sab drivers me same hoga
    const { month, year } = records[0];

    // 🔹 salary_data me ALL DRIVERS ka data
    const salaryData = {
      status: "PREPARED",
      total_drivers: records.length,
      prepared_at: new Date(),
      drivers: records.map((r) => ({
        driver_regno: r.driver_regno,
        driver_name: r.driver_name,

        worked_days: r.worked_days,
        leave_days: r.leave_days,
        leave_deduction: r.leave_deduction,
        extra_allowance: r.extra_allowance,

        deductions: {
          adv: r.adv,
          loan: r.loan,
          lic: r.lic,
          d1: r.d1,
          d2: r.d2,
          total: r.total_deduction,
        },

        gross_salary: r.gross_salary,
        net_salary: r.net_salary,
        comments: r.comments || "",
      })),
    };

    // ✅ ONLY ONE INSERT
    await db.execute(
      `
      INSERT INTO tbl_salary_process (
        month,
        year,
        salary_data
      ) VALUES (?,?,?)
      `,
      [month, year, JSON.stringify(salaryData)]
    );

    res.json({
      success: true,
      message: "Salary prepared for all drivers (single record) ✅",
    });
  } catch (err) {
    console.error("SQL ERROR:", err.sqlMessage || err);
    res.status(500).json({
      success: false,
      error: err.sqlMessage,
    });
  }
});




/// SALARY PROCESS AREA END //

//confirm salary area start//
router.get(
  "/getPreperSalayData/:month/:year",
  async (req, res) => {
    try {
      const { month, year } = req.params;

      const qry = `
        SELECT *
        FROM tbl_salary_process
        WHERE month = ?
          AND year = ?
        ORDER BY salary_id ASC
      `;

      const [records] = await db.execute(qry, [month, year]);

      res.json({
        success: true,
        data: records,
      });
    } catch (err) {
      console.error("Preper Salary error:", err);
      res.status(500).json({
        success: false,
        error: "Server error retrieving Preper Salary records",
      });
    }
  }
);


router.post(
  "/confirm/salary/submit",
  upload.single("file"),
  async (req, res) => {
    try {
      const {salary_id} = req.body;
      const filePath = req.file?.path;

      if (!salary_id) {
        return res.status(400).json({ message: "Missing Salary ID" });
      }

   
      await db.execute(
          `UPDATE tbl_salary_process
           SET ink_sign_letter = ?, conf_sts = ?,confirm_at = NOW()
           WHERE salary_id = ?`,
          [
            filePath || rows[0].file_path,
            2,
            salary_id,
          ]
        );

        return res.json({
          success: true,
          message: "Confirm Salary Submitted Successfully",
        });

    } catch (err) {
      console.error("Insert/Update Error:", err);
      res.status(500).json({ message: "Operation failed" });
    }
  }
);

//confirm salary area end//
///////////////////ITEM MODULE AREA START /////////////////////////////////
// router.get("/getMastadata", async (req, res) => {
//   try {
//     const [items] = await db.execute("SELECT * FROM items ");

//     res.status(200).json({
//       success: true,
//       data: items,
//     });
//   } catch (err) {
//     console.error("Driver view error:", err.message);
//     res.status(500).json({
//       success: false,
//       message: "Server error retrieving Driver records",
//     });
//   }
// });
// router.post("/confirmation-checklist-add", async (req, res) => {
//   try {
//     const { item_name } = req.body;

//     if (!item_name) {
//       return res.status(400).json({
//         success: false,
//         message: "Item name required",
//       });
//     }

//     const sql = `
//       INSERT INTO items (item_names)
//       VALUES (?)
//     `;

//     await db.execute(sql, [item_name]);

//     res.json({
//       success: true,
//       message: "Item added successfully",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// router.put("/confirmation-checklist-status", async (req, res) => {
//   try {
//     const { id, is_active } = req.body;

//     const sql = `
//       UPDATE items
//       SET is_active = ?
//       WHERE id = ?
//     `;

//     await db.execute(sql, [is_active, id]);

//     res.json({
//       success: true,
//       message: "Status updated successfully",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// router.put("/confirmation-checklist-edit", async (req, res) => {
//   try {
//     const { id, item_names } = req.body;

//     const sql = `
//       UPDATE items
//       SET item_names = ?
//       WHERE id = ?
//     `;

//     await db.execute(sql, [item_names, id]);

//     res.json({
//       success: true,
//       message: "Item updated successfully",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });




// Get items dynamically by para
router.get("/getMastadata/:para", async (req, res) => {
  try {
    const para = req.params.para;

    const [items] = await db.execute(
      "SELECT * FROM items WHERE para = ?",
      [para]
    );

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (err) {
    console.error("Error fetching items:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error retrieving items",
    });
  }
});

// Add new item with para and short_name
// router.post("/items-add", async (req, res) => {
//   try {
//     const { item_name, short_name, para } = req.body;

//     if (!item_name || !para) {
//       return res.status(400).json({
//         success: false,
//         message: "Item name and para are required",
//       });
//     }

//     const sql = `
//       INSERT INTO items (item_names, short_name, para)
//       VALUES (?, ?, ?)
//     `;

//     await db.execute(sql, [item_name, short_name, para]);

//     res.json({
//       success: true,
//       message: "Item added successfully",
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });

// Update status
router.put("/items-status", async (req, res) => {
  try {
    const { id, is_active } = req.body;

    const sql = `
      UPDATE items
      SET is_active = ?
      WHERE id = ?
    `;

    await db.execute(sql, [is_active, id]);

    res.json({
      success: true,
      message: "Status updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/items-add", async (req, res) => {
  try {
    const { para, items } = req.body;

    if (!para || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid input data",
      });
    }

    // backend safety (max 10)
    if (items.length > 10) {
      return res.status(400).json({
        success: false,
        message: "Maximum 10 items allowed",
      });
    }

    const placeholders = items.map(() => "(?, ?, ?)").join(", ");
    const values = [];

    items.forEach((item) => {
      values.push(
        item.item_name,
        para === 2 ? item.short_name : null,
        para
      );
    });

    const sql = `
      INSERT INTO items (item_names, short_name, para)
      VALUES ${placeholders}
    `;

    await db.execute(sql, values);

    res.json({
      success: true,
      message: "Items added successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Edit item (short_name only for para = 2)
router.put("/items-edit", async (req, res) => {
  try {
    const { id, item_names, short_name, para } = req.body;

    if (!id || !item_names) {
      return res.status(400).json({
        success: false,
        message: "Item Name is required",
      });
    }

    let sql = "";
    let params = [];

    if (para === 2) {
      // salary-ddt-checklist → update short_name also
      if (!short_name) {
        return res.status(400).json({
          success: false,
          message: "Short Name is required",
        });
      }

      sql = `
        UPDATE items
        SET item_names = ?, short_name = ?
        WHERE id = ?
      `;
      params = [item_names, short_name, id];
    } else {
      // confirmation-checklist → NO short_name
      sql = `
        UPDATE items
        SET item_names = ?
        WHERE id = ?
      `;
      params = [item_names, id];
    }

    await db.execute(sql, params);

    res.json({
      success: true,
      message: "Item updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});



///////////////////ITEM MODULE AREA END /////////////////////////////////


// For Feedback Category Start

// LIST
router.get("/feedback-category-list", async (req, res) => {
  const [rows] = await db.execute(
    "SELECT * FROM items WHERE para = 3 ORDER BY id DESC"
  );
  res.json({ success: true, data: rows });
});


router.post("/feedback-category-add", async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid data",
      });
    }

    if (items.length > 10) {
      return res.status(400).json({
        success: false,
        message: "Maximum 10 categories allowed",
      });
    }

    const placeholders = items.map(() => "(?, 3)").join(", ");
    const values = [];

    items.forEach((item) => {
      values.push(item.item_name);
    });

    const sql = `
      INSERT INTO items (item_names, para)
      VALUES ${placeholders}
    `;

    await db.execute(sql, values);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// STATUS
router.put("/feedback-category-status", async (req, res) => {
  const { id, is_active } = req.body;

  await db.execute(
    "UPDATE items SET is_active=? WHERE id=? AND para=3",
    [is_active, id]
  );

  res.json({ success: true });
});

// EDIT
router.put("/feedback-category-edit", async (req, res) => {
  const { id, item_names } = req.body;

  await db.execute(
    "UPDATE items SET item_names=? WHERE id=? AND para=3",
    [item_names, id]
  );

  res.json({ success: true });
});


//--------- For Feedback Category End-----------


// ---------For Feedback Sub-Category Start---------

// Category Dropdown (para = 3)
router.get("/feedback-category-dropdown", async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT id, item_names FROM items WHERE para = 3 AND is_active = 1"
    );

    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});

// Add Sub Category (para = 4)


router.post("/feedback-subcategory-add", async (req, res) => {
  try {
    const { category_id, items } = req.body;

    if (!category_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false });
    }

    if (items.length > 10) {
      return res.status(400).json({
        success: false,
        message: "Maximum 10 subcategories allowed",
      });
    }

    const placeholders = items.map(() => "(?, 4, ?)").join(", ");
    const values = [];

    items.forEach((item) => {
      values.push(item.subcategory_name, category_id);
    });

    const sql = `
      INSERT INTO items (item_names, para, parent_id)
      VALUES ${placeholders}
    `;

    await db.execute(sql, values);

    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false });
  }
});



router.get("/feedback-subcategory-list", async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT 
        s.id,
        s.item_names,
        s.is_active,
        s.parent_id AS category_id,
        c.item_names AS category_name
      FROM items s
      JOIN items c ON c.id = s.parent_id
      WHERE s.para = 4
      ORDER BY s.id DESC
    `);

    res.json({ success: true, data: rows });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});
//Update Status
router.put("/feedback-subcategory-status", async (req, res) => {
  try {
    const { id, is_active } = req.body;

    await db.execute(
      "UPDATE items SET is_active=? WHERE id=? AND para=4",
      [is_active, id]
    );

    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});


router.put("/feedback-subcategory-edit", async (req, res) => {
  try {
    const { id, item_names, category_id } = req.body;

    await db.execute(
      "UPDATE items SET item_names=?, parent_id=? WHERE id=? AND para=4",
      [item_names, category_id, id]
    );

    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
});


// --------- For Feedback Sub-Category End ---------


// --------- For Salary Prepare Start ---------


/// SALARY PROCESS AREA START //
router.get(
  "/getForSalaryProcess/:month/:year",
  async (req, res) => {
    try {
      const { month, year } = req.params;

      const qry = `
        SELECT *
        FROM tbl_attendance_abstract
        WHERE month = ?
          AND year = ?
        ORDER BY abstract_id ASC
      `;

      const [records] = await db.execute(qry, [month, year]);

      res.json({
        success: true,
        data: records,
      });
    } catch (err) {
      console.error("Attendance error:", err);
      res.status(500).json({
        success: false,
        error: "Server error retrieving Abstract Data records",
      });
    }
  }
);


// 🔹 Get Salary Deduction Items (Dynamic Header)
router.get("/getSalaryDeductions", async (req, res) => {
  try {
    const [items] = await db.execute(`
      SELECT id, short_name
      FROM items
      WHERE is_active = 1 AND para = 2
      ORDER BY id ASC
    `);

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (err) {
    console.error("Salary deduction error:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error retrieving deduction items",
    });
  }
});



///////////////////ITEM MODULE AREA END /////////////////////////////////


export default router;