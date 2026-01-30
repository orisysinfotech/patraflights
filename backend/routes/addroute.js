import express from "express";
import db from "../config/database.js";

const router = express.Router();

// Airport search
router.post("/airports/search", async (req, res) => {
  const { keyword } = req.body;
  try {
    const sql = `
      SELECT a.city_name, c.airport_code, b.country_name
      FROM tbl_cities a
      JOIN tbl_countries b ON b.country_id = a.country_id
      JOIN tbl_flight_airports c ON c.city_id = a.city_id
      WHERE a.city_name LIKE ? OR c.airport_code LIKE ?
      LIMIT 10
    `;
    const [rows] = await db.execute(sql, [`%${keyword}%`, `%${keyword}%`]); // search anywhere in string
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

// Get templates
router.get("/templates", async (req, res) => {
  try {
    const sql = `
      SELECT temp_id, CONCAT('Routes Page Content ', temp_id) AS temp_name
      FROM tbl_flighttemplate
      WHERE param_id = 1
      ORDER BY temp_id ASC
    `;
    const [rows] = await db.execute(sql);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, data: [] });
  }
});

// Add route
router.post("/add", async (req, res) => {
  const { routes } = req.body;

  let cntAdd = 0;
  let cntDup = 0;

  try {
    for (const r of routes) {
      let {
        route_type,
        route_from,
        route_to,
        deal_price,
        template_id,
      } = r;

      deal_price = deal_price ? deal_price : 0;

      /* -----------------------------
         FROM CITY
      ----------------------------- */
      const [fromCity] = await db.execute(
        `SELECT c.city_id, c.city_name
         FROM tbl_flight_airports a
         JOIN tbl_cities c ON c.city_id = a.city_id
         WHERE a.airport_code = ?`,
        [route_from]
      );

      const frmcity_id = fromCity[0].city_id;
      const frmcity_name = fromCity[0].city_name;

      /* -----------------------------
         TO CITY
      ----------------------------- */
      const [toCity] = await db.execute(
        `SELECT c.city_id, c.city_name
         FROM tbl_flight_airports a
         JOIN tbl_cities c ON c.city_id = a.city_id
         WHERE a.airport_code = ?`,
        [route_to]
      );

      const tocity_id = toCity[0].city_id;
      const tocity_name = toCity[0].city_name;

      /* -----------------------------
         TEMPLATE URL
      ----------------------------- */
      const [temp] = await db.execute(
        `SELECT route_url
         FROM tbl_flighttemplate
         WHERE temp_id = ? AND param_id = 1`,
        [template_id]
      );

      let urlcontent = temp[0].route_url;

      const fromcode = route_from.toUpperCase();
      const tocode = route_to.toUpperCase();

      let finalrouteurl = urlcontent
        .replace(/\[\[from_place\]\]/g, frmcity_name)
        .replace(/\[\[to_place\]\]/g, tocity_name)
        .replace(/\[\[from_place_code\]\]/g, fromcode)
        .replace(/\[\[to_place_code\]\]/g, tocode)
        .replace(/\[\[deal_price\]\]/g, deal_price);

      // optional: remove special characters (PHP removespcharallowspace)
      finalrouteurl = finalrouteurl.replace(/[^a-zA-Z0-9\- ]/g, "");

      /* -----------------------------
         DUPLICATE CHECK
      ----------------------------- */
      const [dup] = await db.execute(
        `SELECT route_id
         FROM tbl_flight_route
         WHERE 
           (route_from=? AND route_to=?)
           OR route_url=?`,
        [route_from, route_to, finalrouteurl]
      );

      if (dup.length > 0) {
        cntDup++;
        continue;
      }

      /* -----------------------------
         INSERT ROUTE
      ----------------------------- */
      await db.execute(
        `INSERT INTO tbl_flight_route
        (route_type, route_from, route_to, sel_temp, deal_price, route_url, created_date)
        VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          route_type,
          route_from,
          route_to,
          template_id,
          deal_price,
          finalrouteurl,
        ]
      );

      cntAdd++;
    }

    res.json({
      success: true,
      added: cntAdd,
      duplicate: cntDup,
    });
  } catch (err) {
    console.error("ADD ROUTE ERROR:", err);
    res.status(500).json({ success: false });
  }
});


export default router;
