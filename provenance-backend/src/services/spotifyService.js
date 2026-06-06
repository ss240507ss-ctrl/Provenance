/**
 * Spotify Web API Service
 *
 * Handles authentication (client credentials flow),
 * track lookup, search, and metadata enrichment.
 */

const axios = require('axios');

let accessToken = null;
let tokenExpiry = 0;

// ── Authentication ─────────────────────────────────────────────────────────
async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpiry - 60000) {
    return accessToken;
  }

  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    console.warn('Spotify credentials not configured');
    return null;
  }

  try {
    const credentials = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString('base64');

    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 5000
      }
    );

    accessToken  = response.data.access_token;
    tokenExpiry  = Date.now() + (response.data.expires_in * 1000);
    return accessToken;
  } catch (err) {
    console.error('Spotify auth failed:', err.message);
    return null;
  }
}

// ── Get track by ID ────────────────────────────────────────────────────────
async function getTrack(trackId) {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const [trackRes, featuresRes] = await Promise.all([
      axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      }),
      axios.get(`https://api.spotify.com/v1/audio-features/${trackId}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 5000
      }).catch(() => ({ data: null }))
    ]);

    return {
      ...trackRes.data,
      audioFeatures: featuresRes.data
    };
  } catch (err) {
    console.error('Spotify track lookup failed:', err.message);
    return null;
  }
}

// ── Search ─────────────────────────────────────────────────────────────────
async function search(query, type = 'track', limit = 5) {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: { Authorization: `Bearer ${token}` },
      params: { q: query, type, limit },
      timeout: 5000
    });

    const tracks = response.data.tracks?.items;
    if (!tracks || tracks.length === 0) return null;

    // Return best match (first result)
    const track = tracks[0];

    // Also fetch audio features for the matched track
    try {
      const featRes = await axios.get(`https://api.spotify.com/v1/audio-features/${track.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 3000
      });
      track.audioFeatures = featRes.data;
    } catch {
      track.audioFeatures = null;
    }

    return track;
  } catch (err) {
    console.error('Spotify search failed:', err.message);
    return null;
  }
}

// ── Get artist with genres ─────────────────────────────────────────────────
async function getArtist(artistId) {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const response = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000
    });
    return response.data;
  } catch {
    return null;
  }
}

// ── Enrich song data with Spotify metadata ─────────────────────────────────
async function enrich(songData) {
  if (!songData.spotifyId) {
    // Try to find it
    const result = await search(`${songData.title} ${songData.artist}`);
    if (!result) return null;
    songData.spotifyId = result.id;

    return {
      streams: estimateStreams(result.popularity),
      imageUrl: result.album?.images?.[0]?.url || null,
      spotifyUrl: result.external_urls?.spotify || null,
      audioFeatures: result.audioFeatures,
      popularity: result.popularity,
      genres: result.genres || []
    };
  }

  const track = await getTrack(songData.spotifyId);
  if (!track) return null;

  // Get artist genres
  let genres = [];
  if (track.artists?.[0]?.id) {
    const artist = await getArtist(track.artists[0].id);
    genres = artist?.genres || [];
  }

  return {
    streams: estimateStreams(track.popularity),
    imageUrl: track.album?.images?.[0]?.url || null,
    spotifyUrl: track.external_urls?.spotify || null,
    audioFeatures: track.audioFeatures,
    popularity: track.popularity,
    genres
  };
}

// ── Estimate streams from popularity score (0-100) ─────────────────────────
// Spotify doesn't expose stream counts via API, so we estimate
function estimateStreams(popularity) {
  if (!popularity) return null;
  // Rough exponential estimate based on popularity score
  // popularity 100 ≈ 1B+, popularity 50 ≈ 10M, popularity 20 ≈ 500K
  return Math.floor(Math.pow(10, (popularity / 100) * 9));
}

module.exports = { getAccessToken, getTrack, search, getArtist, enrich };
