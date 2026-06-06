require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const traceRoutes = require('./routes/trace');
const discoverRoutes = require('./routes/discover');
const healthRoutes = require('./routes/health');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;

// ─── Security & middleware ───────────────────
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── CORS ────────────────────────────────────
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ─── Rate limiting ───────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: { error: 'Too many requests. Please try again in a few minutes.' }
});
app.use('/api/', limiter);

// ─── Routes ──────────────────────────────────
app.use('/api/health', healthRoutes);
app.use('/api/trace', traceRoutes);
app.use('/api/discover', discoverRoutes);

// ─── 404 ─────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Error handler ───────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Something went wrong',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ─── Start ───────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🎵 Provenance API running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Trace:  http://localhost:${PORT}/api/trace\n`);
});

module.exports = app;
