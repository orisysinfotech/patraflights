import express from "express";
import auth from "../middleware/auth.js";
import multer from "multer";
import path from "path";
// ADD THESE TWO IMPORTS:
import { State, City } from 'country-state-city'; 

import {
  requestOtp,
  verifyOtp,
  mpinLogin,
  setupMpin,
  resetMpin,
  getDriverProfile,
  requestPhoneChangeOtp,
  verifyPhoneChange,
  requestEmailChangeOtp,
  verifyEmailChange,
  updateDriverprofile,
  getAllStates,
  getCitiesByState, 
  getAllCountries,
  getDriverDocuments,
  updateDriverDocuments,
} from "../services/authModel.js";
import db from "../config/database.js";

const router = express.Router();

// --- MULTER CONFIGURATION FOR PROFILE PHOTO ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profile/");
  },
  filename: (req, file, cb) => {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0].replace(/-/g, "");
    const timeStr = now.toTimeString().split(" ")[0].replace(/:/g, "");

    const ext = path.extname(file.originalname);

    cb(null, `profile-${dateStr}-${timeStr}${ext}`);
  },
});
const upload = multer({ storage: storage });

// Async Wrapper for standard POST routes
const asyncWrapper = (logicFunction) => async (req, res) => {
  try {
    const ip =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress || "0.0.0.0";

    const result = await logicFunction({ ...req.body, ip });

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("Auth Error:", error);
    if (error.locked === true) {
      return res
        .status(401)
        .json({ success: false, message: error.message, locked: true });
    }
    return res.status(400).json({
      success: false,
      message: error.message,
      locked: false,
      attemptsRemaining: error.attemptsRemaining ?? null,
    });
  }
};

router.get("/profile", auth, async (req, res) => {
  try {
    const profileData = await getDriverProfile(req.driver.id);
    return res.status(200).json({ success: true, ...profileData });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.put(
  "/update-complete-profile",
  auth,
  upload.single("photo"),
  async (req, res) => {
    try {
      const photoPath = req.file ? `/uploads/profile/${req.file.filename}` : null;

      // Extract exactly what we need
      const updateData = {
        address1: req.body.address1 || null,
        address2: req.body.address2 || null,
        address3: req.body.address3 || null,
        state_id: req.body.state_id || null, 
        city_id: req.body.city_id || null,   
        zipcode: req.body.zipcode || null,
        utype: req.body.utype || req.driver.user_type, 
      };

      const result = await updateDriverprofile(
        req.driver.id,
        updateData,
        photoPath
      );

      res.status(200).json(result);
    } catch (error) {
      console.error("Update Route Error:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  }
);

// --- MOBILE & EMAIL OTP ROUTES ---
router.post("/request-phone-change", auth, async (req, res) => {
  try {
    const result = await requestPhoneChangeOtp(req.driver.id, req.body);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post("/verify-phone-change", auth, async (req, res) => {
  try {
    const result = await verifyPhoneChange(req.driver.id, req.body);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post("/request-email-change", auth, async (req, res) => {
  try {
    const result = await requestEmailChangeOtp(req.driver.id, req.body);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post("/verify-email-change", auth, async (req, res) => {
  try {
    const result = await verifyEmailChange(req.driver.id, req.body);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// --- GEOGRAPHIC DATA ROUTES ---
router.get("/geo/countries", async (req, res) => {
  try {
    const result = await getAllCountries();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
// router.get("/geo/states", async (req, res) => {
//   try {
//     const result = await getAllStates();
//     res.status(200).json({ success: true, data: result });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// });

// router.get("/geo/cities", async (req, res) => {
//   try {
//     const result = await getAllCities();
//     res.status(200).json({ success: true, data: result });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// });
// 1. Get All States for India
router.get("/geo/states", async (req, res) => {
  try {
    // Get all states for India (Country Code: IN)
    const states = State.getStatesOfCountry("IN");
    
    // Map to your existing frontend structure
    const result = states.map((s) => ({
      state_id: s.isoCode, // e.g., "OR" for Odisha
      state_name: s.name,  // e.g., "Odisha"
    }));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// 2. Get Cities based on State Code
router.get("/geo/cities", async (req, res) => {
  try {
    const { stateCode } = req.query; // Expecting ?stateCode=OR

    if (!stateCode) {
      return res.status(400).json({ success: false, message: "stateCode is required" });
    }

    // Get cities for India ("IN") and the specific state code
    const cities = City.getCitiesOfState("IN", stateCode);

    const result = cities.map((c) => ({
      city_id: c.name, // The library uses names as unique identifiers within a state
      city_name: c.name,
    }));

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
/**
 * GET /auth/get-driver-documents
 */
const docStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/documents/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${Date.now()}${ext}`);
  },
});

const uploadDocs = multer({
  storage: docStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB Limit
});

/**
 * GET: Fetch existing documents
 */
router.get("/get-driver-documents", auth, async (req, res) => {
  try {
    const result = await getDriverDocuments(req.driver.id);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Fetch Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST: Update documents (Non-mandatory)
 */
router.post(
  "/update-all-documents",
  auth,
  uploadDocs.fields([
    { name: "aadhar_file", maxCount: 1 },
    { name: "pan_file", maxCount: 1 },
    { name: "voter_file", maxCount: 1 },
    { name: "dl_file", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const driverId = req.driver.id;

      // Fallback to fetch eu_type if not in token
      let euType = req.user_type || req.driver.user_type;
      if (!euType) {
        const [driver] = await db.pool.execute(
          "SELECT user_type FROM tbl_drivers WHERE driver_id = ?",
          [driverId]
        );
        euType = driver[0]?.user_type;
      }

      if (!euType) throw new Error("User type not identified.");
      const sessionId =
        req.headers["authorization"]?.split(" ")[1]?.substring(0, 50) ||
        "system-gen";

      // Add session info to the body so the service can read it
      req.body.session_id = sessionId;
      req.body.session_createtime = new Date();

      const result = await updateDriverDocuments(
        driverId,
        euType,
        req.body,
        req.files
      );
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      console.error("Document Sync Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Standard Login Routes
router.post("/login", asyncWrapper(requestOtp));
router.post("/verify-otp", asyncWrapper(verifyOtp));
router.post("/mpin-login", asyncWrapper(mpinLogin));
router.post("/setup-mpin", asyncWrapper(setupMpin));
router.post("/reset-mpin", asyncWrapper(resetMpin));

export default router;