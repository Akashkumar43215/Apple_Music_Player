
import express from "express";
import "dotenv/config"; // must load before modules that read process.env at import time
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";

import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import songRoutes from "./routes/songRoutes.js";
import recentlyPlayedRoutes from "./routes/recentlyPlayedRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import playlistRoutes from "./routes/playlistRoutes.js";
import smartRoutes from "./routes/smartRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";

// Connect MongoDB
connectDB();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

const corsOptions = {
  origin(origin, callback) {
    // Allow Postman, curl, etc.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

/* =========================================================
   CORS
========================================================= */

const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim());

console.log("======================================");
console.log("CLIENT_URL:", process.env.CLIENT_URL);
console.log("Allowed Origins:", allowedOrigins);
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("======================================");

app.set("trust proxy", 1); // behind Render's proxy: real client IP for rate limiting
// CORP cross-origin: legacy /uploads images are loaded from the Vercel origin
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors(corsOptions));

// Handle OPTIONS preflight requests with the same allowlist
app.options("*", cors(corsOptions));

app.use(compression()); // gzip JSON responses
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Legacy local uploads (new media is stored on Cloudinary)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* =========================================================
   Routes
========================================================= */

app.use("/api/health", healthRoutes);
// Brute-force guard: only failed attempts count, so normal logins never hit it
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 1000, standardHeaders: true, legacyHeaders: false, message: { success: false, message: "Too many requests, please slow down" } }));
app.use("/api/auth/login", rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, skipSuccessfulRequests: true, standardHeaders: true, legacyHeaders: false, message: { success: false, message: "Too many failed logins, try again in 15 minutes" } }));
app.use("/api/auth/signup", rateLimit({ windowMs: 60 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false, message: { success: false, message: "Too many signups from this network, try later" } }));
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/recently-played", recentlyPlayedRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/smart", smartRoutes);
app.use("/api/stats", statsRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🎵 Music Player API is running",
  });
});

/* =========================================================
   Error Handlers
========================================================= */

app.use(notFound);
app.use(errorHandler);

/* =========================================================
   Start Server
========================================================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );
});