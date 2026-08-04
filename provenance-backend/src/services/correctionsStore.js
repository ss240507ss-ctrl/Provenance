const fs = require('fs');
const path = require('path');

const CORRECTIONS_PATH = path.join(__dirname, '..', 'data', 'corrections.json');

function ensureFile() {
  const dir = path.dirname(CORRECTIONS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(CORRECTIONS_PATH)) {
    fs.writeFileSync(CORRECTIONS_PATH, JSON.stringify({ flags: [] }, null, 2));
  }
}

function loadCorrections() {
  ensureFile();
  return JSON.parse(fs.readFileSync(CORRECTIONS_PATH, 'utf-8'));
}

function saveCorrections(data) {
  fs.writeFileSync(CORRECTIONS_PATH, JSON.stringify(data, null, 2));
}

function addFlag({ trackKey, flagType, category, suggestedValue, ip }) {
  const data = loadCorrections();

  const flag = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    trackKey,
    flagType,        // 'wrong_influence' | 'wrong_genre' | 'wrong_ai_verdict'
    category: category || null,  // 'vocal' | 'rhythm' | 'harmonic' | 'production' | null
    suggestedValue: suggestedValue || null,
    ip,
    flaggedAt: new Date().toISOString(),
    status: 'pending'
  };

  data.flags.push(flag);
  saveCorrections(data);

  checkNeedsReview(trackKey, data);

  return flag;
}

function checkNeedsReview(trackKey, data) {
  const matching = data.flags.filter(f =>
    f.trackKey === trackKey && f.status === 'pending'
  );

  // Group by flagType+category combo to find matching complaints
  const groups = {};
  for (const f of matching) {
    const key = `${f.flagType}:${f.category || ''}`;
    groups[key] = (groups[key] || 0) + 1;
  }

  const needsReview = Object.values(groups).some(count => count >= 3);

  if (needsReview) {
    for (const f of matching) {
      f.needsReview = true;
    }
    saveCorrections(data);
  }
}

function getFlagsForTrack(trackKey) {
  const data = loadCorrections();
  return data.flags.filter(f => f.trackKey === trackKey);
}

function getTracksNeedingReview() {
  const data = loadCorrections();
  const grouped = {};
  for (const f of data.flags) {
    if (!f.needsReview || f.status !== 'pending') continue;
    if (!grouped[f.trackKey]) grouped[f.trackKey] = [];
    grouped[f.trackKey].push(f);
  }
  return grouped;
}

function markReviewed(flagIds) {
  const data = loadCorrections();
  for (const f of data.flags) {
    if (flagIds.includes(f.id)) f.status = 'reviewed';
  }
  saveCorrections(data);
}

// Simple in-memory rate limiter: max 5 flags per IP per hour
const rateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 5;

  const timestamps = (rateLimitMap.get(ip) || []).filter(t => now - t < windowMs);

  if (timestamps.length >= maxRequests) {
    return true;
  }

  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return false;
}

module.exports = {
  addFlag,
  getFlagsForTrack,
  getTracksNeedingReview,
  markReviewed,
  isRateLimited
};