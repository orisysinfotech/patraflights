import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import db from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import Country from "./routes/countryname.js";
import addcountry from "./routes/addCountry.js";
import CityRoutes from "./routes/city.js";
import airlineRoutes from "./routes/airline.js";
import cabinRoutes from "./routes/cabin.js";
import getairport from "./routes/manageairport.js";
import addairport from "./routes/addairport.js";
import getroute from "./routes/manageroute.js";
import addroute from "./routes/addroute.js";


dotenv.config();

const app = express();
const httpServer = createServer(app);
const Originname = ["http://localhost:3000", "http://192.168.0.30:3000"];

// ✅ SAME PORT AS FRONTEND API
const PORT = process.env.PORT || 5000;

// ✅ MIDDLEWARES (VERY IMPORTANT)
app.use(cors({
  origin: Originname,
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use("/template/img/flight", express.static("template/img/flight"));




async function startServer() {
  try {
    await db.testConnection();

    app.use("/api/v1/auth", authRoutes);
    app.use("/api/v1", Country);
    app.use("/api/v1", addcountry);
    app.use("/api/v1", CityRoutes);
    app.use("/api/v1", airlineRoutes);
    app.use("/api/v1", cabinRoutes);
    app.use("/api/v1", getairport);
    app.use("/api/v1", addairport);
    app.use("/api/v1", getroute);
    app.use("/api/v1", addroute);

    app.use((err, req, res, next) => {
      console.error("Server Error:", err.stack);
      res.status(500).json({
        success: false,
        message: "Internal Server Error"
      });
    });

    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server running on http://192.168.0.30:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
