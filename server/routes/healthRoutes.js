import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// GET /api/health - simple uptime + DB connection status check
router.get('/', (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    database: dbStates[mongoose.connection.readyState],
  });
});

export default router;
