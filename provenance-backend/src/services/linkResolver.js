const SPOTIFY_TRACK_REGEX  = /spotify\.com\/track\/([a-zA-Z0-9]+)/;
const SPOTIFY_URL_REGEX    = /open\.spotify\.com/;
const YOUTUBE_REGEX        = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/;
const SOUNDCLOUD_REGEX     = /soundcloud\.com\/([^/]+)\/([^/?]+)/;

async function resolve(input) {
  // Clean input — remove query params
  const clean = input.split('?')[0].trim();

  if (SPOTIFY_URL_REGEX.test(clean)) {
    const match = clean.match(SPOTIFY_TRACK_REGEX);
    if (match) {
      return {
        type: 'spotify',
        spotifyId: match[1],
        originalUrl: clean
      };
    }
    const err = new Error('Could not extract Spotify track ID');
    err.code = 'LINK_UNSUPPORTED';
    throw err;
  }

  if (YOUTUBE_REGEX.test(clean)) {
    const match = clean.match(YOUTUBE_REGEX);
    return {
      type: 'youtube',
      videoId: match[1],
      originalUrl: clean
    };
  }

  if (SOUNDCLOUD_REGEX.test(clean)) {
    const match = clean.match(SOUNDCLOUD_REGEX);
    return {
      type: 'soundcloud',
      user: match[1],
      track: match[2],
      originalUrl: clean
    };
  }

  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    const err = new Error('Link type not supported');
    err.code = 'LINK_UNSUPPORTED';
    throw err;
  }

  return {
    type: 'text',
    query: input
  };
}

module.exports = { resolve };
