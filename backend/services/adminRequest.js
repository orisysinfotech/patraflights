import fs from 'fs';
import sharp from 'sharp';
import db from "../config/database.js";

async function addWatermark(inputPath, text) {
    const svgBuffer = Buffer.from(`
        <svg width="600" height="120">
            <rect width="100%" height="100%" fill="black" fill-opacity="0.5"/>
            <text x="20" y="40" font-family="Arial" font-size="22" fill="white">${text[0]}</text>
            <text x="20" y="75" font-family="Arial" font-size="22" fill="white">${text[1]}</text>
            <text x="20" y="110" font-family="Arial" font-size="22" fill="white">${text[2]}</text>
        </svg>
    `);

    const imageBuffer = await sharp(inputPath)
        .composite([{ input: svgBuffer, gravity: 'southwest' }])
        .toBuffer();

    await fs.promises.writeFile(inputPath, imageBuffer);
}

export const submitAttendanceLogic = async ({ driver, filePath, fileName, latitude, longitude }) => {
    // 1. Process Watermark
    // driver.driver_fstname comes from your tbl_drivers table via JWT payload
    await addWatermark(filePath, [
        `Driver: ${driver.driver_fstname} (ID: ${driver.id})`,
        `Location: ${latitude}, ${longitude}`,
        `Timestamp: ${new Date().toLocaleString()}`
    ]);

    // 2. Insert into attendance table matching your schema
    await db.execute(
        `INSERT INTO attendance (driver_id, selfie, latitude, longitude, created_at) 
         VALUES (?, ?, ?, ?, ?)`,
        [driver.id, fileName, latitude, longitude, new Date()]
    );
};