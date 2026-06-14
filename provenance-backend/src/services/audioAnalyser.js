/**
 * Audio Analyser Service
 * 
 * Uses Spotify audio features + artist/label signals for AI detection.
 * Spotify gives us energy, danceability, acousticness, tempo, loudness,
 * speechiness, instrumentalness, liveness, valence — enough to be decisive.
 */

const axios = require('axios');

// Known AI music labels and platforms
const AI_ARTIST_SIGNALS = [
  'suno', 'udio', 'musicgen', 'aiva', 'mubert', 'soundraw', 'boomy',
  'beatoven', 'loudly', 'riffusion', 'harmonai', 'splash music',
  'obscurest vinyl', 'untraceable records', 'banned vinyl', 'brainrot',
  'ai generated', 'artificial intelligence music', 'musicgen',
  'stable audio', 'musiclm'
];

async function analyse(resolved, songData) {
  // Try Python microservice first (for YouTube/SoundCloud direct audio)
  if (process.env.PYTHON_SERVICE_URL) {
    try {
      const result = await callPythonService(resolved, songData);
      if (result && result.method !== 'metadata-heuristics') return result;
    } catch (err) {
      console.warn('Python audio service unavailable, falling back to heuristics');
    }
  }

  return analyseFromSpotifyFeatures(songData);
}

async function callPythonService(resolved, songData) {
  const payload = {
    input_type:   resolved.type,
    url:          resolved.originalUrl || null,
    song_title:   songData.title,
    artist:       songData.artist,
    search_query: `${songData.artist} ${songData.title}`
  };

  const response = await axios.post(
    `${process.env.PYTHON_SERVICE_URL}/analyse`,
    payload,
    { timeout: 30000 }
  );

  return response.data;
}

function analyseFromSpotifyFeatures(songData) {
  const af     = songData.audioFeatures;
  const artist = (songData.artist || '').toLowerCase();
  const title  = (songData.title  || '').toLowerCase();
  const genres = (songData.genres || []).map(g => g.toLowerCase());

  // ── Step 1: Check explicit AI signals ──────────────────────────────
  const isExplicitlyAi = songData.isAiGenerated ||
    AI_ARTIST_SIGNALS.some(sig => artist.includes(sig) || title.includes(sig));

  if (isExplicitlyAi) {
    return buildResult({
      aiScore: 0.88,
      pitchCorrection:  'High',
      breathPresence:   'Low',
      timingRegularity: 'Very High',
      spectralSmoothing:'High',
      dynamicRange:     'Compressed',
      confidence:       0.90,
      method:           'explicit-ai-signal'
    });
  }

  // ── Step 2: Use Spotify audio features if available ─────────────────
  if (af) {
    return analyseWithFeatures(af, genres, songData);
  }

  // ── Step 3: Genre-based heuristics (no audio features) ──────────────
  return analyseFromGenre(genres, songData);
}

function analyseWithFeatures(af, genres, songData) {
  // AI music tends to have:
  // - Very high energy (0.7+) with very low acousticness (0.1-)
  // - Near-zero liveness (no audience/room noise)
  // - Extreme valence (too happy or too sad)
  // - Very consistent tempo
  // - Low speechiness (no natural speech patterns)
  // - High instrumentalness or very low (binary)

  let aiScore = 0.0;
  const signals = [];

  // Liveness is the strongest signal — AI has no room presence
  if (af.liveness < 0.08) {
    aiScore += 0.20;
    signals.push('no room presence detected');
  } else if (af.liveness < 0.15) {
    aiScore += 0.10;
  } else {
    aiScore -= 0.10; // Strong human signal — live room presence
  }

  // Acousticness — AI rarely produces truly acoustic music
  if (af.acousticness < 0.05) {
    aiScore += 0.12;
    signals.push('no acoustic elements');
  } else if (af.acousticness > 0.50) {
    aiScore -= 0.15; // Acoustic music is almost never AI
  }

  // Energy + acousticness combination
  if (af.energy > 0.75 && af.acousticness < 0.10) {
    aiScore += 0.10;
    signals.push('high energy with no acoustic character');
  }

  // Speechiness — natural speech patterns indicate human
  if (af.speechiness > 0.15) {
    aiScore -= 0.12; // Natural speech is hard to fake
  } else if (af.speechiness < 0.03) {
    aiScore += 0.05;
  }

  // Loudness — AI music tends to be heavily compressed
  if (af.loudness > -3) {
    aiScore += 0.08;
    signals.push('heavily compressed');
  } else if (af.loudness < -12) {
    aiScore -= 0.05; // Dynamic range suggests human production
  }

  // Genre corrections — some genres naturally look like AI to these metrics
  if (isGenre(genres, ['amapiano', 'afrohouse', 'electronic', 'edm', 'techno', 'house'])) {
    aiScore -= 0.18; // These genres are naturally electronic — not a sign of AI
  }
  if (isGenre(genres, ['acoustic', 'folk', 'classical', 'blues', 'jazz', 'country'])) {
    aiScore -= 0.20; // Organic genres are almost never AI
  }
  if (isGenre(genres, ['afrobeats', 'afropop', 'dancehall', 'reggae', 'latin', 'soca'])) {
    aiScore -= 0.15; // Cultural genres with strong human traditions
  }
  if (isGenre(genres, ['r&b', 'soul', 'gospel', 'neo soul', 'trap soul'])) {
    aiScore -= 0.10;
  }

  // Clamp to 0-1
  aiScore = Math.max(0, Math.min(1, aiScore));

  // Derive production signal labels from audio features
  const pitchCorrection  = af.energy > 0.7 && af.acousticness < 0.2 ? 'High' : af.acousticness > 0.5 ? 'Low' : 'Moderate';
  const breathPresence   = af.liveness > 0.2 ? 'High' : af.liveness > 0.1 ? 'Moderate' : 'Low';
  const timingRegularity = af.danceability > 0.8 ? 'Very High' : af.danceability > 0.6 ? 'High' : 'Moderate';
  const spectralSmoothing= af.acousticness < 0.1 ? 'High' : af.acousticness > 0.4 ? 'Low' : 'Moderate';
  const dynamicRange     = af.loudness > -5 ? 'Compressed' : af.loudness > -10 ? 'Moderate' : 'Wide';

  return buildResult({
    aiScore,
    pitchCorrection,
    breathPresence,
    timingRegularity,
    spectralSmoothing,
    dynamicRange,
    confidence: 0.72,
    method: 'spotify-audio-features'
  });
}

function analyseFromGenre(genres, songData) {
  // No audio features — use genre alone
  let aiScore = 0.40; // Start neutral

  if (isGenre(genres, ['amapiano', 'afrobeats', 'afropop', 'afrohouse', 'kwaito',
                        'dancehall', 'reggae', 'latin', 'soca', 'highlife',
                        'r&b', 'soul', 'gospel', 'jazz', 'blues', 'folk',
                        'acoustic', 'classical', 'neo soul', 'trap soul'])) {
    aiScore = 0.25; // Cultural/organic genres — unlikely to be AI
  }

  if (isGenre(genres, ['edm', 'electronic', 'synth', 'ambient'])) {
    aiScore = 0.40; // Could go either way
  }

  return buildResult({
    aiScore,
    pitchCorrection:  'Moderate',
    breathPresence:   'Moderate',
    timingRegularity: 'Moderate',
    spectralSmoothing:'Moderate',
    dynamicRange:     'Moderate',
    confidence:       0.35,
    method:           'genre-heuristics'
  });
}

function buildResult({ aiScore, pitchCorrection, breathPresence, timingRegularity, spectralSmoothing, dynamicRange, confidence, method }) {
  return {
    pitchCorrection,
    breathPresence,
    timingRegularity,
    spectralSmoothing,
    dynamicRange,
    aiLikelihoodScore: aiScore,
    modelConfidence:   confidence,
    signalConfidence:  confidence * 0.95,
    method
  };
}

function isGenre(genres, targets) {
  return targets.some(t => genres.some(g => g.includes(t)));
}

module.exports = { analyse };