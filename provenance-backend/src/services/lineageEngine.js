/**
 * Lineage Engine — powered by Last.fm
 *
 * Uses Last.fm API for real artist similarity, tags, and influence data
 * covering millions of artists including Amapiano, Afrobeats, Neo Soul etc.
 */

const axios = require('axios');
const ARTIST_DATABASE = require('../models/artistDatabase');
const GENRE_LINEAGE   = require('../models/genreLineage');

const LASTFM_BASE = 'https://ws.audioscrobbler.com/2.0/';
const LASTFM_KEY  = process.env.LASTFM_API_KEY;

async function lastfmGet(method, params) {
  try {
    const response = await axios.get(LASTFM_BASE, {
      params: { method, api_key: LASTFM_KEY, format: 'json', ...params },
      timeout: 8000
    });
    return response.data;
  } catch (err) {
    console.warn(`Last.fm ${method} failed:`, err.message);
    return null;
  }
}

async function getSimilarArtists(artistName) {
  return lastfmGet('artist.getSimilar', { artist: artistName, limit: 5 });
}

async function getArtistTags(artistName) {
  return lastfmGet('artist.getTopTags', { artist: artistName });
}

async function getTrackTags(artist, track) {
  return lastfmGet('track.getTopTags', { artist, track });
}

async function trace(songData, spotifyData, productionSignals) {
  const artist = songData.artist || '';
  const title  = songData.title  || '';
  const genres = normaliseGenres(songData.genres, spotifyData?.genres);

  const [similarArtists, artistTags, trackTags] = await Promise.all([
    getSimilarArtists(artist),
    getArtistTags(artist),
    getTrackTags(artist, title)
  ]);

  const lastfmTags = extractTags(artistTags, trackTags);
  const allGenres  = [...genres, ...lastfmTags].map(g => g.toLowerCase());
  const genreFamily = detectGenreFamily(allGenres, artist.toLowerCase());

  const influences = buildInfluences(similarArtists, artist, genreFamily, productionSignals);
  const genreLineage = GENRE_LINEAGE[genreFamily]?.lineage || [];
  const culturalContext = GENRE_LINEAGE[genreFamily]?.culturalContext || null;
  const humanContribution = assessHumanContribution(productionSignals);
  const artistRecognition = buildArtistRecognition(influences, artist);
  const influenceScores = influences.map(inf => ({ name: inf.name, score: inf.score, type: inf.type }));

  return { influences, genreLineage, culturalContext, humanContribution, artistRecognition, influenceScores };
}

function buildInfluences(similarArtists, currentArtist, genreFamily, productionSignals) {
  const similar = similarArtists?.similarartists?.artist || [];
  
  if (similar.length > 0) {
    const weights = [0.65, 0.20, 0.10];
    return similar.slice(0, 3).map((a, idx) => ({
      name: a.name,
      estate: null,
      hasEstate: false,
      type: guessInfluenceType(genreFamily),
      description: `${a.name} shares strong sonic and stylistic characteristics with this track.`,
      score: weights[idx] || 0.05,
      displayPercentage: [65, 20, 10][idx] || 5
    }));
  }

  // Fallback to hardcoded database
  const candidates = ARTIST_DATABASE.filter(a => a.genreFamilies.includes(genreFamily));
  if (candidates.length === 0) return [];
  const weights = [0.65, 0.20, 0.10];
  return candidates
    .sort((a, b) => b.baseInfluenceScore - a.baseInfluenceScore)
    .slice(0, 3)
    .map((c, i) => ({
      name: c.name, estate: c.estate, hasEstate: c.hasEstate,
      type: c.influenceType, description: c.influenceDescription,
      score: weights[i] || 0.05, displayPercentage: Math.round((weights[i] || 0.05) * 100)
    }));
}

function extractTags(artistTags, trackTags) {
  const tags = [];
  (artistTags?.toptags?.tag || []).slice(0, 5).forEach(t => tags.push(t.name));
  (trackTags?.toptags?.tag || []).slice(0, 5).forEach(t => tags.push(t.name));
  return tags;
}

function detectGenreFamily(genres, artist) {
  const g = genres.join(' ');
  if (matches(g, ['amapiano', 'piano', 'log drum', 'south african house', 'sa house'])) return 'amapiano';
  if (matches(g, ['afrobeats', 'afropop', 'afro', 'highlife', 'afrofusion', 'afroswing'])) return 'afrobeats';
  if (matches(g, ['neo soul', 'neosoul', 'alternative r&b', 'neo-soul'])) return 'neo-soul';
  if (matches(g, ['trap soul', 'trapsoul', 'rnb trap', 'melodic trap'])) return 'trap-soul';
  if (matches(g, ['r&b', 'rnb', 'soul', 'motown', 'funk'])) return 'rnb-soul';
  if (matches(g, ['gospel', 'christian', 'worship', 'spiritual'])) return 'gospel';
  if (matches(g, ['hip hop', 'hip-hop', 'rap', 'trap', 'drill', 'grime'])) return 'hiphop';
  if (matches(g, ['jazz', 'bebop', 'swing', 'jazz fusion'])) return 'jazz';
  if (matches(g, ['blues', 'delta blues', 'chicago blues'])) return 'blues';
  if (matches(g, ['rock', 'alternative', 'indie rock', 'punk', 'metal'])) return 'rock';
  if (matches(g, ['electronic', 'edm', 'techno', 'house', 'ambient', 'synth'])) return 'electronic';
  if (matches(g, ['reggae', 'dancehall', 'ska', 'reggaeton'])) return 'reggae';
  if (matches(g, ['classical', 'orchestral', 'opera', 'baroque'])) return 'classical';
  if (matches(g, ['country', 'folk', 'americana', 'bluegrass'])) return 'folk-country';
  if (matches(g, ['latin', 'salsa', 'bossa nova', 'cumbia'])) return 'latin';
  return 'pop';
}

function assessHumanContribution(productionSignals) {
  const ai = productionSignals.aiLikelihoodScore;
  return {
    songwriting:      'Human-led',
    composition:      'Human-led',
    vocalPerformance: ai > 0.80 ? 'AI-assisted' : ai > 0.65 ? 'Mixed indicators' : 'Likely human',
    production:       ai > 0.65 ? 'AI-assisted' : ai > 0.35 ? 'Mixed indicators' : 'Human-led',
    mixingMastering:  ai > 0.85 ? 'Mixed indicators' : 'Human-led'
  };
}

function buildArtistRecognition(influences, currentArtist) {
  if (!influences || influences.length === 0) return null;
  const primary = influences.find(i => i.name.toLowerCase() !== currentArtist.toLowerCase()) || influences[0];
  return {
    artistName: primary.name,
    estateName: primary.estate || null,
    message: primary.hasEstate
      ? `${primary.estate} currently receives no automatic compensation from AI systems influenced by their work. Provenance documents this so the conversation can happen.`
      : `${primary.name}'s creative work has shaped this sound. Their contribution currently goes unacknowledged in AI-generated music. Provenance documents this so the conversation can happen.`
  };
}

function guessInfluenceType(genreFamily) {
  const map = {
    'rnb-soul': 'Vocal and production influence', 'gospel': 'Vocal and cultural influence',
    'hiphop': 'Rhythmic and production influence', 'jazz': 'Compositional influence',
    'blues': 'Rhythmic and vocal influence', 'rock': 'Guitar and production influence',
    'electronic': 'Production influence', 'afrobeats': 'Rhythmic and cultural influence',
    'amapiano': 'Production and rhythmic influence', 'neo-soul': 'Vocal and production influence',
    'trap-soul': 'Vocal and production influence', 'reggae': 'Rhythmic and vocal influence'
  };
  return map[genreFamily] || 'Creative influence';
}

function normaliseGenres(g1, g2) {
  return [...new Set([...(g1 || []), ...(g2 || [])].map(g => g.toLowerCase()))];
}

function matches(str, keywords) {
  return keywords.some(kw => str.includes(kw));
}

module.exports = { trace };
