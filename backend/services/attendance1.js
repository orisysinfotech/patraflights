import fs from "fs";
import sharp from "sharp";
import db from "../config/database.js";

async function addWatermark(inputPath, textLines) {
  const svgBuffer = Buffer.from(`
    <svg width="700" height="140">
      <rect width="100%" height="100%" fill="black" fill-opacity="0.5"/>
      ${textLines
        .map(
          (t, i) =>
            `<text x="20" y="${
              40 + i * 40
            }" font-size="22" fill="white">${t}</text>`
        )
        .join("")}
    </svg>
  `);

  const tempPath = inputPath + ".tmp";

  await sharp(inputPath)
    .composite([{ input: svgBuffer, gravity: "southwest" }])
    .toFile(tempPath);

  await fs.promises.rename(tempPath, inputPath);
}

export const submitAttendanceLogic = async ({
  driver,
  filePath,
  fileName,
  odometerFileName,
  odometerValue,
  latitude,
  longitude,
  ci_itemchkstatus,
  buttonParameter,
}) => {
  if (!driver?.id) throw new Error("Driver missing");

  const locationText = `Lat:${latitude}, Lng:${longitude}`;

  await addWatermark(filePath, [
    `Driver: ${driver.driver_fstname} (${driver.id})`,
    `Location: ${locationText}`,
    `Time: ${new Date().toLocaleString()}`,
  ]);

  if (buttonParameter == 0) {
    await db.execute(
      `INSERT INTO drv_attendance_details (
        drv_id,
        checkin_datetime,
        checkin_selfie,
        cigps_locname,
        cigps_latitude,
        cigps_longitude,
        ciodomtr_image,
        odo_civalue,
        ci_itemchkstatus,
        ck_sts
      ) VALUES (?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        driver.id,
        fileName,
        locationText,
        latitude,
        longitude,
        odometerFileName,
        odometerValue,
        JSON.stringify(ci_itemchkstatus),
        1,
      ]
    );
  } else {
    const today = new Date();
    await db.execute(
      `UPDATE drv_attendance_details
       SET
        checkout_datetime =?,
        checkout_selfie   = ?,
        cogps_locname    = ?,
        cogps_latitude   = ?,
        cogps_longitude  = ?,
        coodomtr_image   = ?,
        odo_covalue      = ?,
        co_itemchkstatus = ?,
        ck_sts =?
       WHERE drv_atid = ?`,
      [
        today,
        fileName,
        locationText,
        latitude,
        longitude,
        odometerFileName,
        odometerValue,
        JSON.stringify(ci_itemchkstatus),
        2,
        buttonParameter, // drv_atid
      ]
    );
  }
};
