import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import songRoutes from './routes/songRoutes.js';
import recentlyPlayedRoutes from './routes/recentlyPlayedRoutes.js';
import favoriteRoutes from "./routes/favoriteRoutes.js";
import playlistRoutes from "./routes/playlistRoutes.js";

// Load environment variables before anything else touches process.env
dotenv.config();

// Connect to MongoDB
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ---------- Global Middleware ----------
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',');
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Serve uploaded audio/cover files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------- Routes ----------
// Future milestones will add: /api/auth, /api/songs, /api/playlists, /api/favorites, etc.
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/recently-played', recentlyPlayedRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/playlists", playlistRoutes);

app.get('/', (req, res) => {
  res.json({ message: '🎵 Music Player API is running' });
});

// ---------- Error Handling (must be last) ----------
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
