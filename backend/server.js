import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import db from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import Country from "./routes/countryname.js";
import addcountry from "./routes/addCountry.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// ✅ SAME PORT AS FRONTEND API
const PORT = process.env.PORT || 5000;

// ✅ MIDDLEWARES (VERY IMPORTANT)
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function startServer() {
  try {
    await db.testConnection();

    app.use("/api/v1/auth", authRoutes);
    app.use("/api/v1", Country);
    app.use("/api/v1", addcountry);

    app.use((err, req, res, next) => {
      console.error("Server Error:", err.stack);
      res.status(500).json({
        success: false,
        message: "Internal Server Error"
      });
    });

    httpServer.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
