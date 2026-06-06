/**
 * Link Resolver Service
 *
 * Determines the type of input (Spotify link, YouTube link,
 * SoundCloud link, or plain text query) and normalises it
 * into a consistent format for downstream services.
 */

const SPOTIFY_TRACK_REGEX  = /spotify\.com\/track\/([a-zA-Z0-9]+)/;
const SPOTIFY_URL_REGEX    = /open\.spotify\.com/;
const YOUTUBE_REGEX        = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;
const SOUNDCLOUD_REGEX     = /soundcloud\.com\/([^/]+)\/([^/?]+)/;

async function resolve(input) {
  // ── Spotify track link ───────────────────────────────
  if (SPOTIFY_URL_REGEX.test(input)) {
    const match = input.match(SPOTIFY_TRACK_REGEX);
    if (match) {
      return {
        type: 'spotify',
        spotifyId: match[1],
        originalUrl: input
      };
    }
    const err = new Error('Could not extract Spotify track ID from URL');
    err.code = 'LINK_UNSUPPORTED';
    throw err;
  }

  // ── YouTube link ─────────────────────────────────────
  if (YOUTUBE_REGEX.test(input)) {
    const match = input.match(YOUTUBE_REGEX);
    return {
      type: 'youtube',
      videoId: match[1],
      originalUrl: input
    };
  }

  // ── SoundCloud link ──────────────────────────────────
  if (SOUNDCLOUD_REGEX.test(input)) {
    const match = input.match(SOUNDCLOUD_REGEX);
    return {
      type: 'soundcloud',
      user: match[1],
      track: match[2],
      originalUrl: input
    };
  }

  // ── Generic URL ──────────────────────────────────────
  if (input.startsWith('http://') || input.startsWith('https://')) {
    const err = new Error('Link type not supported');
    err.code = 'LINK_UNSUPPORTED';
    throw err;
  }

  // ── Plain text search ────────────────────────────────
  return {
    type: 'text',
    query: input
  };
}

module.exports = { resolve };
