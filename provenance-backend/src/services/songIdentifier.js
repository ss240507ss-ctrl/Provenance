/**
 * Song Identifier Service
 *
 * Identifies songs from:
 * - Spotify track IDs (direct API lookup)
 * - YouTube video IDs (audio extraction + AudD fingerprint)
 * - SoundCloud links (AudD fingerprint)
 * - Text search (Spotify search API)
 *
 * Returns normalised song data regardless of input source.
 */

const axios = require('axios');
const spotifyService = require('./spotifyService');

// Known AI music generation platforms
// Used to detect if a track is AI-generated from its source/artist name
const AI_PLATFORM_SIGNALS = [
  'suno', 'udio', 'musicgen', 'stable audio', 'aiva', 'mubert',
  'soundraw', 'boomy', 'loudly', 'beatoven', 'ai music', 'generated',
  'obscurest vinyl', 'untraceable records', 'banned vinyl',
  'brainrot', 'ai generated', 'artificial intelligence',
  'musicgen', 'riffusion', 'harmonai', 'splash music'
];

async function identify(resolved) {
  switch (resolved.type) {
    case 'spotify':
      return identifyFromSpotify(resolved.spotifyId);
    case 'youtube':
      return identifyFromYouTube(resolved.videoId, resolved.originalUrl);
    case 'soundcloud':
      return identifyFromSoundCloud(resolved.originalUrl);
    case 'text':
      return identifyFromText(resolved.query);
    default:
      throw Object.assign(new Error('Unknown input type'), { code: 'SONG_NOT_FOUND' });
  }
}

// ── Spotify direct lookup ──────────────────────────────────────────────────
async function identifyFromSpotify(trackId) {
  const track = await spotifyService.getTrack(trackId);

  if (!track) {
    throw Object.assign(new Error('Track not found on Spotify'), { code: 'SONG_NOT_FOUND' });
  }

  return normalise(track, 'spotify');
}

// ── YouTube: extract audio URL, send to AudD ──────────────────────────────
async function identifyFromYouTube(videoId, url) {
  // First try AudD with the YouTube URL directly — AudD supports this
  try {
    const auddResult = await queryAudd({ url });
    if (auddResult) return normalise(auddResult, 'youtube');
  } catch (err) {
    console.warn('AudD YouTube lookup failed, trying Spotify search from title');
  }

  // Fallback: get YouTube title and search Spotify
  const title = await getYouTubeTitle(videoId);
  if (title) {
    const spotifyResult = await spotifyService.search(title);
    if (spotifyResult) return normalise(spotifyResult, 'youtube');
  }

  throw Object.assign(new Error('Could not identify track from YouTube'), { code: 'SONG_NOT_FOUND' });
}

// ── SoundCloud ─────────────────────────────────────────────────────────────
async function identifyFromSoundCloud(url) {
  try {
    const auddResult = await queryAudd({ url });
    if (auddResult) return normalise(auddResult, 'soundcloud');
  } catch (err) {
    console.warn('AudD SoundCloud lookup failed');
  }

  throw Object.assign(new Error('Could not identify track from SoundCloud'), { code: 'SONG_NOT_FOUND' });
}

// ── Text search ────────────────────────────────────────────────────────────
async function identifyFromText(query) {
  // Try Spotify search first
  const spotifyResult = await spotifyService.search(query);
  if (spotifyResult) return normalise(spotifyResult, 'search');

  // If Spotify fails, return a minimal result so we can still do heuristic analysis
  // This handles cases like "suno ai track" where there's no Spotify listing
  return {
    title: query,
    artist: 'Unknown Artist',
    album: null,
    year: null,
    genres: [],
    source: 'search',
    isAiGenerated: detectAiFromText(query),
    aiTool: detectAiTool(query),
    popularity: 0,
    durationMs: null
  };
}

// ── AudD API call ──────────────────────────────────────────────────────────
async function queryAudd({ url, audio }) {
  if (!process.env.AUDD_API_KEY) {
    console.warn('No AudD API key configured — skipping audio fingerprint');
    return null;
  }

  const FormData = require('form-data');
  const form = new FormData();
  form.append('api_token', process.env.AUDD_API_KEY);
  form.append('return', 'spotify,apple_music,deezer');

  if (url)   form.append('url', url);
  if (audio) form.append('audio', audio);

  const response = await axios.post('https://api.audd.io/', form, {
    headers: form.getHeaders(),
    timeout: 15000
  });

  if (response.data.status === 'success' && response.data.result) {
    return response.data.result;
  }

  return null;
}

// ── YouTube title lookup ───────────────────────────────────────────────────
async function getYouTubeTitle(videoId) {
  if (!process.env.YOUTUBE_API_KEY) return null;

  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        id: videoId,
        part: 'snippet',
        key: process.env.YOUTUBE_API_KEY
      },
      timeout: 5000
    });

    const item = response.data.items?.[0];
    return item ? item.snippet.title : null;
  } catch {
    return null;
  }
}

// ── Normalise song data ────────────────────────────────────────────────────
function normalise(raw, source) {
  // Handle AudD format
  if (raw.title && raw.artist && !raw.name) {
    const artistName = typeof raw.artist === 'string' ? raw.artist : raw.artist;
    const isAi = detectAiFromText(`${raw.title} ${artistName}`);

    return {
      title: raw.title,
      artist: artistName,
      album: raw.album || null,
      year: raw.release_date ? new Date(raw.release_date).getFullYear() : null,
      genres: [],
      source,
      isAiGenerated: isAi,
      aiTool: isAi ? detectAiTool(`${raw.title} ${artistName}`) : null,
      popularity: raw.spotify?.popularity || 0,
      durationMs: null,
      spotifyId: raw.spotify?.id || null
    };
  }

  // Handle Spotify format
  const artistName = raw.artists?.[0]?.name || raw.artist || 'Unknown';
  const isAi = detectAiFromText(`${raw.name || raw.title} ${artistName}`);

  return {
    title: raw.name || raw.title,
    artist: artistName,
    album: raw.album?.name || null,
    year: raw.album?.release_date ? new Date(raw.album.release_date).getFullYear() : null,
    genres: raw.genres || [],
    source,
    isAiGenerated: isAi,
    aiTool: isAi ? detectAiTool(`${raw.name} ${artistName}`) : null,
    popularity: raw.popularity || 0,
    durationMs: raw.duration_ms || null,
    spotifyId: raw.id || null
  };
}

// ── AI detection heuristics ────────────────────────────────────────────────
function detectAiFromText(text) {
  const lower = text.toLowerCase();
  return AI_PLATFORM_SIGNALS.some(signal => lower.includes(signal));
}

function detectAiTool(text) {
  const lower = text.toLowerCase();
  const tools = ['suno', 'udio', 'musicgen', 'aiva', 'mubert', 'soundraw', 'boomy', 'beatoven', 'stable audio'];
  return tools.find(t => lower.includes(t)) || null;
}

module.exports = { identify };
