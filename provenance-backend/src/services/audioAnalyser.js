/**
 * Audio Analyser Service
 *
 * Analyses production signals to estimate AI involvement.
 *
 * Priority chain:
 * 1. Python microservice (librosa — real audio analysis)
 * 2. Spotify Audio Features API (tempo, energy, danceability etc.)
 * 3. Heuristic analysis from metadata and genre signals
 *
 * The goal is to always return something useful, being honest
 * about the confidence level of what we have.
 */

const axios = require('axios');

async function analyse(resolved, songData) {
  // ── Try Python audio service first ──────────────────────────────
  if (process.env.PYTHON_SERVICE_URL) {
    try {
      const result = await callPythonService(resolved, songData);
      if (result) return result;
    } catch (err) {
      console.warn('Python audio service unavailable, falling back to heuristics');
    }
  }

  // ── Fall back to Spotify audio features + heuristics ────────────
  return analyseFromMetadata(songData);
}

// ── Python microservice call ───────────────────────────────────────────────
async function callPythonService(resolved, songData) {
  const payload = {
    input_type: resolved.type,
    url: resolved.originalUrl || null,
    song_title: songData.title,
    artist: songData.artist
  };

  const response = await axios.post(
    `${process.env.PYTHON_SERVICE_URL}/analyse`,
    payload,
    { timeout: 30000 }
  );

  return response.data;
}

// ── Metadata + heuristic analysis ─────────────────────────────────────────
function analyseFromMetadata(songData) {
  const af = songData.audioFeatures; // Spotify audio features if available
  const genres = (songData.genres || []).map(g => g.toLowerCase());
  const artist = (songData.artist || '').toLowerCase();
  const title  = (songData.title || '').toLowerCase();

  // ── Base signals from Spotify audio features ─────────────────────
  // These are real data points from Spotify's own analysis

  // Acousticness: 0 = electronic/produced, 1 = acoustic
  // AI music tends to be low acousticness
  const acousticness = af?.acousticness ?? deriveAcousticness(genres);

  // Instrumentalness: higher = less vocal
  const instrumentalness = af?.instrumentalness ?? 0.1;

  // Energy: AI tends to be consistent/high energy
  const energy = af?.energy ?? 0.7;

  // Tempo: AI tends to be very regular
  const tempo = af?.tempo ?? 120;

  // Valence: emotional quality
  const valence = af?.valence ?? 0.5;

  // Speechiness
  const speechiness = af?.speechiness ?? 0.05;

  // ── Derive production signal assessments ─────────────────────────

  // Pitch correction: estimated from acousticness + genre
  // Low acousticness + pop/electronic genres = likely high pitch correction
  const pitchCorrectionScore = derivePitchCorrection(acousticness, genres, songData.isAiGenerated);
  const pitchCorrection = scoreToLabel(pitchCorrectionScore, ['Low', 'Low-Moderate', 'Moderate', 'Moderate–High', 'High']);

  // Breath presence: AI vocals typically have low breath presence
  const breathScore = deriveBreathPresence(acousticness, speechiness, songData.isAiGenerated);
  const breathPresence = scoreToLabel(breathScore, ['High', 'Moderate-High', 'Moderate', 'Low-Moderate', 'Low']);

  // Timing regularity: AI tends to be perfectly on grid
  // We estimate from tempo stability (if available) or genre
  const timingScore = deriveTimingRegularity(af, genres, songData.isAiGenerated);
  const timingRegularity = scoreToLabel(timingScore, ['Low', 'Low-Moderate', 'Moderate', 'High', 'Very High']);

  // Spectral smoothing: AI tends to have smooth, even frequency spectrum
  const spectralScore = deriveSpectralSmoothing(acousticness, genres, songData.isAiGenerated);
  const spectralSmoothing = scoreToLabel(spectralScore, ['Low', 'Low-Moderate', 'Moderate', 'Moderate–High', 'High']);

  // Dynamic range: AI tends to have less dynamic variation
  const dynamicRange = deriveDynamicRange(af, genres, songData.isAiGenerated);

  // ── Calculate overall AI likelihood score ────────────────────────
  const aiLikelihoodScore = calculateAiScore({
    isExplicitlyAi: songData.isAiGenerated,
    pitchCorrectionScore,
    breathScore,
    timingScore,
    spectralScore,
    acousticness,
    genres,
    artist
  });

  return {
    pitchCorrection,
    breathPresence,
    timingRegularity,
    spectralSmoothing,
    dynamicRange,
    aiLikelihoodScore,
    modelConfidence: af ? 0.72 : 0.45, // Higher confidence when Spotify data is available
    signalConfidence: af ? 0.68 : 0.40,
    method: af ? 'spotify-audio-features + heuristics' : 'metadata-heuristics',
    audioFeatures: af ? {
      tempo:           af.tempo,
      energy:          af.energy,
      danceability:    af.danceability,
      acousticness:    af.acousticness,
      instrumentalness:af.instrumentalness,
      valence:         af.valence,
      loudness:        af.loudness
    } : null
  };
}

// ── Scoring functions ──────────────────────────────────────────────────────

function derivePitchCorrection(acousticness, genres, isAi) {
  let score = 0.5;
  score -= acousticness * 0.3;    // More acoustic = less pitch correction
  if (isGenre(genres, ['pop', 'edm', 'electronic', 'dance'])) score += 0.2;
  if (isGenre(genres, ['acoustic', 'folk', 'classical'])) score -= 0.2;
  if (isAi) score += 0.25;
  return clamp(score);
}

function deriveBreathPresence(acousticness, speechiness, isAi) {
  // Higher = more breath (more human)
  // We're returning inverse so higher score = less breath (more AI)
  let score = 0.5;
  score -= acousticness * 0.3;
  score -= speechiness * 0.2;
  if (isAi) score += 0.3;
  return clamp(score);
}

function deriveTimingRegularity(af, genres, isAi) {
  let score = 0.5;
  if (af?.danceability > 0.7) score += 0.15; // High danceability = regular timing
  if (isGenre(genres, ['electronic', 'edm', 'dance'])) score += 0.15;
  if (isGenre(genres, ['jazz', 'blues', 'folk'])) score -= 0.2;
  if (isAi) score += 0.25;
  return clamp(score);
}

function deriveSpectralSmoothing(acousticness, genres, isAi) {
  let score = 0.5;
  score -= acousticness * 0.25;
  if (isGenre(genres, ['electronic', 'synth', 'ambient'])) score += 0.15;
  if (isGenre(genres, ['rock', 'metal', 'punk'])) score -= 0.1;
  if (isAi) score += 0.2;
  return clamp(score);
}

function deriveDynamicRange(af, genres, isAi) {
  if (!af) return isAi ? 'Compressed' : 'Moderate';
  const loudness = af.loudness; // Typically -20 to 0 dB
  if (loudness > -5) return 'Compressed';
  if (loudness > -10) return 'Moderate';
  return 'Wide';
}

function deriveAcousticness(genres) {
  if (isGenre(genres, ['acoustic', 'folk', 'classical', 'singer-songwriter'])) return 0.7;
  if (isGenre(genres, ['pop', 'r&b', 'soul'])) return 0.3;
  if (isGenre(genres, ['electronic', 'edm', 'synth'])) return 0.1;
  return 0.3;
}

function calculateAiScore({ isExplicitlyAi, pitchCorrectionScore, breathScore, timingScore, spectralScore, acousticness, genres, artist }) {
  // If explicitly identified as AI-generated (from platform name)
  if (isExplicitlyAi) {
    // Start high but let signals modulate
    const base = 0.80;
    const signal = (pitchCorrectionScore + breathScore + timingScore + spectralScore) / 4;
    return clamp(base * 0.6 + signal * 0.4);
  }

  // Weighted combination of production signals
  const signalScore = (
    pitchCorrectionScore * 0.30 +
    breathScore          * 0.25 +
    timingScore          * 0.25 +
    spectralScore        * 0.20
  );

  // Adjust for acoustic penalty
  const acousticPenalty = acousticness * 0.2;

  return clamp(signalScore - acousticPenalty);
}

// ── Utility ────────────────────────────────────────────────────────────────

function scoreToLabel(score, labels) {
  const idx = Math.min(Math.floor(score * labels.length), labels.length - 1);
  return labels[idx];
}

function clamp(val) {
  return Math.max(0, Math.min(1, val));
}

function isGenre(genres, targets) {
  return targets.some(t => genres.some(g => g.includes(t)));
}

module.exports = { analyse };
