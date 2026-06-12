/**
 * Audio Analyser Service
 *
 * Priority chain:
 * 1. Trained ML model (ai_detector.pkl) via Python microservice
 * 2. Spotify Audio Features + heuristics fallback
 */

const axios = require('axios');
const path  = require('path');

async function analyse(resolved, songData) {
  // Try Python microservice with trained model first
  if (process.env.PYTHON_SERVICE_URL) {
    try {
      const result = await callPythonService(resolved, songData);
      if (result) return result;
    } catch (err) {
      console.warn('Python audio service unavailable, falling back to heuristics');
    }
  }
  return analyseFromMetadata(songData);
}

async function callPythonService(resolved, songData) {
  const payload = {
    input_type: resolved.type,
    url:        resolved.originalUrl || null,
    song_title: songData.title,
    artist:     songData.artist
  };

  const response = await axios.post(
    `${process.env.PYTHON_SERVICE_URL}/analyse`,
    payload,
    { timeout: 30000 }
  );

  return response.data;
}

function analyseFromMetadata(songData) {
  const af     = songData.audioFeatures;
  const genres = (songData.genres || []).map(g => g.toLowerCase());

  const acousticness    = af?.acousticness    ?? deriveAcousticness(genres);
  const energy          = af?.energy          ?? 0.7;
  const instrumentalness= af?.instrumentalness ?? 0.1;
  const speechiness     = af?.speechiness     ?? 0.05;

  const pitchCorrectionScore = derivePitchCorrection(acousticness, genres, songData.isAiGenerated);
  const breathScore          = deriveBreathPresence(acousticness, speechiness, songData.isAiGenerated);
  const timingScore          = deriveTimingRegularity(af, genres, songData.isAiGenerated);
  const spectralScore        = deriveSpectralSmoothing(acousticness, genres, songData.isAiGenerated);

  const pitchCorrection  = scoreToLabel(pitchCorrectionScore, ['Low','Low-Moderate','Moderate','Moderate–High','High']);
  const breathPresence   = scoreToLabel(breathScore,          ['High','Moderate-High','Moderate','Low-Moderate','Low']);
  const timingRegularity = scoreToLabel(timingScore,          ['Low','Low-Moderate','Moderate','High','Very High']);
  const spectralSmoothing= scoreToLabel(spectralScore,        ['Low','Low-Moderate','Moderate','Moderate–High','High']);
  const dynamicRange     = deriveDynamicRange(af, genres, songData.isAiGenerated);

  const aiLikelihoodScore = calculateAiScore({
    isExplicitlyAi: songData.isAiGenerated,
    pitchCorrectionScore,
    breathScore,
    timingScore,
    spectralScore,
    acousticness,
    genres
  });

  return {
    pitchCorrection,
    breathPresence,
    timingRegularity,
    spectralSmoothing,
    dynamicRange,
    aiLikelihoodScore,
    modelConfidence:  af ? 0.72 : 0.45,
    signalConfidence: af ? 0.68 : 0.40,
    method: af ? 'spotify-audio-features + heuristics' : 'metadata-heuristics',
    audioFeatures: af ? {
      tempo:            af.tempo,
      energy:           af.energy,
      danceability:     af.danceability,
      acousticness:     af.acousticness,
      instrumentalness: af.instrumentalness,
      valence:          af.valence,
      loudness:         af.loudness
    } : null
  };
}

function derivePitchCorrection(acousticness, genres, isAi) {
  let score = 0.5;
  score -= acousticness * 0.3;
  if (isGenre(genres, ['pop','edm','electronic','dance'])) score += 0.2;
  if (isGenre(genres, ['acoustic','folk','classical']))    score -= 0.2;
  if (isAi) score += 0.25;
  return clamp(score);
}

function deriveBreathPresence(acousticness, speechiness, isAi) {
  let score = 0.5;
  score -= acousticness * 0.3;
  score -= speechiness  * 0.2;
  if (isAi) score += 0.3;
  return clamp(score);
}

function deriveTimingRegularity(af, genres, isAi) {
  let score = 0.5;
  if (af?.danceability > 0.7) score += 0.15;
  if (isGenre(genres, ['electronic','edm','dance'])) score += 0.15;
  if (isGenre(genres, ['jazz','blues','folk']))       score -= 0.2;
  if (isAi) score += 0.25;
  return clamp(score);
}

function deriveSpectralSmoothing(acousticness, genres, isAi) {
  let score = 0.5;
  score -= acousticness * 0.25;
  if (isGenre(genres, ['electronic','synth','ambient'])) score += 0.15;
  if (isGenre(genres, ['rock','metal','punk']))           score -= 0.1;
  if (isAi) score += 0.2;
  return clamp(score);
}

function deriveDynamicRange(af, genres, isAi) {
  if (!af) return isAi ? 'Compressed' : 'Moderate';
  if (af.loudness > -5)  return 'Compressed';
  if (af.loudness > -10) return 'Moderate';
  return 'Wide';
}

function deriveAcousticness(genres) {
  if (isGenre(genres, ['acoustic','folk','classical','singer-songwriter'])) return 0.7;
  if (isGenre(genres, ['pop','r&b','soul']))                                return 0.3;
  if (isGenre(genres, ['electronic','edm','synth']))                        return 0.1;
  return 0.3;
}

function calculateAiScore({ isExplicitlyAi, pitchCorrectionScore, breathScore, timingScore, spectralScore, acousticness }) {
  if (isExplicitlyAi) {
    const base   = 0.80;
    const signal = (pitchCorrectionScore + breathScore + timingScore + spectralScore) / 4;
    return clamp(base * 0.6 + signal * 0.4);
  }
  const signalScore    = pitchCorrectionScore * 0.30 + breathScore * 0.25 + timingScore * 0.25 + spectralScore * 0.20;
  const acousticPenalty = acousticness * 0.2;
  return clamp(signalScore - acousticPenalty);
}

function scoreToLabel(score, labels) {
  const idx = Math.min(Math.floor(score * labels.length), labels.length - 1);
  return labels[idx];
}

function clamp(val)                  { return Math.max(0, Math.min(1, val)); }
function isGenre(genres, targets)    { return targets.some(t => genres.some(g => g.includes(t))); }

module.exports = { analyse };
