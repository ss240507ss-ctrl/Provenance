/**
 * Audio Analyser Service
 * 
 * Multi-source artist verification:
 * 1. Wikipedia — confirms real artists
 * 2. MusicBrainz — comprehensive music database
 * 3. Last.fm — listener counts and tags
 * 4. Spotify audio features — production analysis
 */

const axios = require('axios');

const AI_ARTIST_SIGNALS = [
  'suno', 'udio', 'musicgen', 'aiva', 'mubert', 'soundraw', 'boomy',
  'beatoven', 'loudly', 'riffusion', 'harmonai', 'splash music',
  'obscurest vinyl', 'untraceable records', 'banned vinyl', 'brainrot',
  'ai generated', 'artificial intelligence music', 'stable audio', 'musiclm'
];

const MUSIC_KEYWORDS = [
  'singer', 'rapper', 'musician', 'artist', 'band', 'dj', 'producer',
  'songwriter', 'vocalist', 'composer', 'discography', 'album', 'record',
  'hip hop', 'r&b', 'pop', 'jazz', 'soul', 'reggae', 'afrobeats', 'amapiano',
  'gospel', 'blues', 'rock', 'electronic', 'dancehall', 'music group',
  'recording artist', 'south african', 'nigerian', 'ghanaian', 'kenyan'
];

// In-memory cache to avoid repeated lookups within a session
const verificationCache = new Map();

// ── Wikipedia lookup ───────────────────────────────────────────────────────

async function checkWikipedia(artistName) {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(artistName)}`;
    const res = await axios.get(url, { timeout: 4000 });
    if (res.status === 200 && res.data) {
      const text = ((res.data.extract || '') + ' ' + (res.data.description || '')).toLowerCase();
      const isMusicArtist = MUSIC_KEYWORDS.some(kw => text.includes(kw));
      return { found: true, isMusicArtist };
    }
  } catch (err) {
    if (err.response?.status === 404) return { found: false, isMusicArtist: false };
  }
  return null;
}

// ── MusicBrainz lookup ────────────────────────────────────────────────────

async function checkMusicBrainz(artistName) {
  try {
    const url = `https://musicbrainz.org/ws/2/artist/?query=artist:${encodeURIComponent(artistName)}&limit=1&fmt=json`;
    const res = await axios.get(url, {
      timeout: 5000,
      headers: { 'User-Agent': 'Provenance/1.0 (provenance-trace.netlify.app)' }
    });
    if (res.status === 200 && res.data?.artists?.length > 0) {
      const artist = res.data.artists[0];
      const score  = artist.score || 0;
      // Only trust high-confidence matches (80%+)
      if (score >= 80) {
        return {
          found: true,
          name:  artist.name,
          type:  artist.type, // Person, Group, etc.
          country: artist.country,
          score
        };
      }
    }
    return { found: false };
  } catch (err) {
    return null;
  }
}

// ── Last.fm lookup ────────────────────────────────────────────────────────

async function checkLastFm(artistName) {
  const apiKey = process.env.LASTFM_API_KEY;
  if (!apiKey) return null;

  try {
    const url = `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artistName)}&api_key=${apiKey}&format=json`;
    const res = await axios.get(url, { timeout: 4000 });

    if (res.status === 200 && res.data?.artist) {
      const artist     = res.data.artist;
      const listeners  = parseInt(artist.stats?.listeners || '0');
      const playcount  = parseInt(artist.stats?.playcount  || '0');
      const bio        = (artist.bio?.summary || '').toLowerCase();
      const hasBio     = bio.length > 100;

      return {
        found:     true,
        listeners,
        playcount,
        hasBio,
        // Any real artist has at least some listeners
        isEstablished: listeners > 1000
      };
    }
    return { found: false };
  } catch (err) {
    return null;
  }
}

// ── Combined verification ──────────────────────────────────────────────────

async function verifyArtist(artistName) {
  if (!artistName) return { isHuman: false, confidence: 0, sources: [] };

  const cacheKey = artistName.toLowerCase().trim();
  if (verificationCache.has(cacheKey)) return verificationCache.get(cacheKey);

  // Run all three checks in parallel
  const [wiki, musicbrainz, lastfm] = await Promise.all([
    checkWikipedia(artistName),
    checkMusicBrainz(artistName),
    checkLastFm(artistName)
  ]);

  const sources    = [];
  let humanSignals = 0;
  let totalSources = 0;

  // Wikipedia
  if (wiki !== null) {
    totalSources++;
    if (wiki.found && wiki.isMusicArtist) {
      humanSignals++;
      sources.push('wikipedia');
    }
  }

  // MusicBrainz — strongest signal, only contains human music
  if (musicbrainz !== null) {
    totalSources++;
    if (musicbrainz.found) {
      humanSignals += 2; // Weight MusicBrainz higher
      sources.push('musicbrainz');
    }
  }

  // Last.fm
  if (lastfm !== null) {
    totalSources++;
    if (lastfm.found && lastfm.isEstablished) {
      humanSignals++;
      sources.push('lastfm');
    } else if (lastfm.found && lastfm.listeners > 0) {
      humanSignals += 0.5;
      sources.push('lastfm-low');
    }
  }

  // Determine result
  let isHuman    = false;
  let confidence = 0;

  if (humanSignals >= 2) {
    isHuman    = true;
    confidence = Math.min(0.95, 0.60 + (humanSignals * 0.10));
  } else if (humanSignals >= 1) {
    isHuman    = true;
    confidence = 0.65;
  } else if (totalSources >= 2 && humanSignals === 0) {
    // Multiple sources checked and found nothing — suspicious
    isHuman    = false;
    confidence = 0.55;
  }

  const result = { isHuman, confidence, sources, humanSignals, totalSources };
  verificationCache.set(cacheKey, result);

  console.log(`Artist verification [${artistName}]: human=${isHuman}, signals=${humanSignals}, sources=[${sources.join(',')}]`);
  return result;
}

// ── Main analyse function ──────────────────────────────────────────────────

async function analyse(resolved, songData) {
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

async function analyseFromSpotifyFeatures(songData) {
  const af     = songData.audioFeatures;
  const artist = (songData.artist || '').toLowerCase();
  const title  = (songData.title  || '').toLowerCase();
  const genres = (songData.genres || []).map(g => g.toLowerCase());

  // ── Step 1: Explicit AI signal ──────────────────────────────────────
  const isExplicitlyAi = songData.isAiGenerated ||
    AI_ARTIST_SIGNALS.some(sig => artist.includes(sig) || title.includes(sig));

  if (isExplicitlyAi) {
    return buildResult({
      aiScore: 0.88,
      pitchCorrection: 'High', breathPresence: 'Low',
      timingRegularity: 'Very High', spectralSmoothing: 'High',
      dynamicRange: 'Compressed', confidence: 0.90, method: 'explicit-ai-signal'
    });
  }

  // ── Step 2: Multi-source artist verification ────────────────────────
  const verification = await verifyArtist(songData.artist);

  if (verification.isHuman && verification.confidence >= 0.65) {
    // Confirmed human — use audio features with low base score
    const baseScore = 0.10;
    if (af) return analyseWithFeatures(af, genres, songData, baseScore, verification);
    return buildResult({
      aiScore: baseScore,
      pitchCorrection: 'Low', breathPresence: 'High',
      timingRegularity: 'Moderate', spectralSmoothing: 'Low',
      dynamicRange: 'Wide',
      confidence: verification.confidence,
      method: `verified-human(${verification.sources.join('+')})`
    });
  }

  if (!verification.isHuman && verification.totalSources >= 2) {
    // Multiple sources, none confirmed — elevated suspicion
    const baseScore = 0.55;
    if (af) return analyseWithFeatures(af, genres, songData, baseScore, verification);
    return analyseFromGenre(genres, songData, baseScore);
  }

  // ── Step 3: Standard analysis ───────────────────────────────────────
  if (af) return analyseWithFeatures(af, genres, songData, 0.35, verification);
  return analyseFromGenre(genres, songData, 0.35);
}

function analyseWithFeatures(af, genres, songData, baseScore, verification) {
  let aiScore = baseScore;

  // Liveness — strongest audio signal
  if (af.liveness < 0.08)       aiScore += 0.15;
  else if (af.liveness < 0.15)  aiScore += 0.07;
  else                           aiScore -= 0.10;

  // Acousticness
  if (af.acousticness < 0.05)   aiScore += 0.10;
  else if (af.acousticness > 0.50) aiScore -= 0.15;

  // Energy combo
  if (af.energy > 0.75 && af.acousticness < 0.10) aiScore += 0.06;

  // Speechiness
  if (af.speechiness > 0.15)    aiScore -= 0.10;
  else if (af.speechiness < 0.03) aiScore += 0.04;

  // Compression
  if (af.loudness > -3)          aiScore += 0.06;
  else if (af.loudness < -12)    aiScore -= 0.04;

  // Genre corrections
  if (isGenre(genres, ['amapiano', 'afrohouse', 'kwaito', 'afrobeats', 'afropop',
                        'dancehall', 'reggae', 'latin', 'soca', 'highlife',
                        'r&b', 'soul', 'gospel', 'jazz', 'blues', 'folk',
                        'acoustic', 'classical', 'neo soul', 'trap soul',
                        'gengetone', 'bongo flava', 'afrosoul', 'grime'])) {
    aiScore -= 0.18;
  }

  aiScore = Math.max(0, Math.min(1, aiScore));

  const pitchCorrection  = af.energy > 0.7 && af.acousticness < 0.2 ? 'High' : af.acousticness > 0.5 ? 'Low' : 'Moderate';
  const breathPresence   = af.liveness > 0.2 ? 'High' : af.liveness > 0.1 ? 'Moderate' : 'Low';
  const timingRegularity = af.danceability > 0.8 ? 'Very High' : af.danceability > 0.6 ? 'High' : 'Moderate';
  const spectralSmoothing= af.acousticness < 0.1 ? 'High' : af.acousticness > 0.4 ? 'Low' : 'Moderate';
  const dynamicRange     = af.loudness > -5 ? 'Compressed' : af.loudness > -10 ? 'Moderate' : 'Wide';

  const sources = verification?.sources?.join('+') || 'none';
  return buildResult({
    aiScore, pitchCorrection, breathPresence, timingRegularity,
    spectralSmoothing, dynamicRange,
    confidence: Math.max(0.65, verification?.confidence || 0.65),
    method: `verified(${sources})+spotify-features`
  });
}

function analyseFromGenre(genres, songData, baseScore = 0.35) {
  let aiScore = baseScore;

  if (isGenre(genres, ['amapiano', 'afrobeats', 'afropop', 'afrohouse', 'kwaito',
                        'dancehall', 'reggae', 'latin', 'soca', 'highlife',
                        'r&b', 'soul', 'gospel', 'jazz', 'blues', 'folk',
                        'acoustic', 'classical', 'neo soul', 'trap soul',
                        'gengetone', 'bongo flava', 'afrosoul'])) {
    aiScore = Math.min(aiScore, 0.20);
  }

  if (isGenre(genres, ['edm', 'electronic', 'synth', 'ambient'])) {
    aiScore = Math.max(aiScore, 0.35);
  }

  return buildResult({
    aiScore,
    pitchCorrection: 'Low-Moderate', breathPresence: 'Moderate',
    timingRegularity: 'Moderate', spectralSmoothing: 'Low-Moderate',
    dynamicRange: 'Moderate', confidence: 0.35, method: 'genre-heuristics'
  });
}

function buildResult({ aiScore, pitchCorrection, breathPresence, timingRegularity, spectralSmoothing, dynamicRange, confidence, method }) {
  return {
    pitchCorrection, breathPresence, timingRegularity, spectralSmoothing, dynamicRange,
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