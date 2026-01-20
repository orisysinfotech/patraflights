import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

/* SMTP CONFIG */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "sales@patratravels.com",
    pass: "pppjvalzqkbfdscd", // Gmail App Password
  },
});

// Verify connection
transporter.verify((error) => {
  if (error) {
    console.error("❌ SMTP Error:", error.message);
  } else {
    console.log("✅ SMTP Connected");
  }
});

/* SOS API (STATIC DATA) */
router.get("/trigger", async (req, res) => {
  try {
    const driverName = "Ramesh Kumar";
    const driverPhone = "9876543210";
    const driverRegNo = "OD02AB1234";
    const latitude = "20.2961";
    const longitude = "85.8245";
    const locationName = "Bhubaneswar";

    const googleMapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

    const emailHtml = `
      <h2>🚨 SOS ALERT</h2>
      <p><b>Driver:</b> ${driverName} (${driverRegNo})</p>
      <p><b>Phone:</b> ${driverPhone}</p>
      <p><b>Location:</b> ${locationName}</p>
      <p><a href="${googleMapLink}">View Map</a></p>
    `;

    await transporter.sendMail({
      from: `"Patra Travels" <sales@patratravels.com>`,
      to: "rajudas7777.jsr@gmail.com",
      subject: `SOS Alert - ${driverName}`,
      html: emailHtml,
    });

    res.json({ success: true, message: "SOS Email Sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Email Failed" });
  }
});

export default router;
