const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/', async (req, res) => {
  const status = {
    status: 'ok',
    service: 'Provenance API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {}
  };

  // Check Python audio service
  try {
    await axios.get(`${process.env.PYTHON_SERVICE_URL}/health`, { timeout: 2000 });
    status.services.audioAnalysis = 'ok';
  } catch {
    status.services.audioAnalysis = 'unavailable';
  }

  // Check AudD
  status.services.audd = process.env.AUDD_API_KEY ? 'configured' : 'not configured';

  // Check Spotify
  status.services.spotify = (process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET)
    ? 'configured' : 'not configured';

  res.json(status);
});

module.exports = router;
