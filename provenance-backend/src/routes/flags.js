const express = require('express');
const router = express.Router();
const correctionsStore = require('../services/correctionsStore');

const VALID_FLAG_TYPES = ['wrong_influence', 'wrong_genre', 'wrong_ai_verdict'];
const VALID_CATEGORIES = ['vocal', 'rhythm', 'harmonic', 'production'];

router.post('/flag', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

  if (correctionsStore.isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many flags submitted. Please try again later.' });
  }

  const { trackKey, flagType, category, suggestedValue } = req.body;

  if (!trackKey || typeof trackKey !== 'string') {
    return res.status(400).json({ error: 'trackKey is required' });
  }

  if (!VALID_FLAG_TYPES.includes(flagType)) {
    return res.status(400).json({ error: `flagType must be one of: ${VALID_FLAG_TYPES.join(', ')}` });
  }

  if (category && !VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `category must be one of: ${VALID_CATEGORIES.join(', ')}` });
  }

  if (suggestedValue && (typeof suggestedValue !== 'string' || suggestedValue.length > 200)) {
    return res.status(400).json({ error: 'suggestedValue must be a string under 200 characters' });
  }

  const flag = correctionsStore.addFlag({
    trackKey: trackKey.trim().toLowerCase(),
    flagType,
    category: category || null,
    suggestedValue: suggestedValue ? suggestedValue.trim() : null,
    ip
  });

  res.json({ success: true, message: 'Thanks — we\'ll look into it.', flagId: flag.id });
});

// Admin routes — protected by simple password check
function requireAdmin(req, res, next) {
  const password = req.headers['x-admin-password'] || req.query.password;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

router.get('/admin/review', requireAdmin, (req, res) => {
  const tracksNeedingReview = correctionsStore.getTracksNeedingReview();
  res.json({ tracksNeedingReview });
});

router.post('/admin/review/resolve', requireAdmin, (req, res) => {
  const { flagIds } = req.body;
  if (!Array.isArray(flagIds) || flagIds.length === 0) {
    return res.status(400).json({ error: 'flagIds must be a non-empty array' });
  }
  correctionsStore.markReviewed(flagIds);
  res.json({ success: true });
});

module.exports = router;