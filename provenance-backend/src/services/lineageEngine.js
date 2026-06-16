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

// Influences AI music is most likely trained on, by genre family
const AI_GENRE_INFLUENCES = {
  'rnb-soul': [
    { name: 'Aaliyah', type: 'Vocal influence', description: "Aaliyah's smooth R&B vocal style is heavily replicated in AI-generated R&B." },
    { name: 'Brandy', type: 'Vocal influence', description: "Brandy's layered harmonics and vocal texture are foundational to 90s R&B AI training data." },
    { name: 'Mariah Carey', type: 'Vocal influence', description: "Mariah's melismatic runs and vocal range are among the most imitated in AI music." }
  ],
  'neo-soul': [
    { name: 'Erykah Badu', type: 'Vocal and production influence', description: "Erykah Badu's neo soul aesthetic is deeply embedded in AI training data." },
    { name: 'Lauryn Hill', type: 'Vocal influence', description: "Lauryn Hill's vocal style and songwriting are foundational to neo soul AI imitation." },
    { name: "D'Angelo", type: 'Production influence', description: "D'Angelo's production style defined neo soul and is widely replicated by AI." }
  ],
  'trap-soul': [
    { name: 'Bryson Tiller', type: 'Vocal influence', description: 'Bryson Tiller defined trap soul — AI heavily imitates his whisper-to-belt vocal style.' },
    { name: 'Summer Walker', type: 'Vocal influence', description: "Summer Walker's raw R&B vulnerability is widely replicated in AI trap soul." },
    { name: 'SZA', type: 'Vocal and production influence', description: "SZA's alternative R&B sound is among the most imitated by AI music generators." }
  ],
  'hiphop': [
    { name: 'Kendrick Lamar', type: 'Lyrical influence', description: "Kendrick's flow and production aesthetic are heavily present in AI hip-hop training data." },
    { name: 'Drake', type: 'Vocal influence', description: "Drake's melodic rap style is among the most replicated in AI-generated hip-hop." },
    { name: 'J. Cole', type: 'Lyrical influence', description: "J. Cole's introspective style is widely used in AI hip-hop training datasets." }
  ],
  'pop': [
    { name: 'Beyoncé', type: 'Vocal influence', description: "Beyoncé's vocal power and production scale are deeply embedded in AI pop training data." },
    { name: 'Rihanna', type: 'Vocal influence', description: "Rihanna's distinctive vocal tone is one of the most replicated in AI pop music." },
    { name: 'Adele', type: 'Vocal influence', description: "Adele's emotional delivery and dynamics are widely imitated by AI vocal generators." }
  ],
  'amapiano': [
    { name: 'Kabza De Small', type: 'Production influence', description: "Kabza De Small's piano and log drum arrangements define the Amapiano sound AI replicates." },
    { name: 'DJ Maphorisa', type: 'Production influence', description: "DJ Maphorisa's production style is the foundation of Amapiano that AI systems learn from." },
    { name: 'Uncle Waffles', type: 'Performance influence', description: "Uncle Waffles brought Amapiano's energy to global audiences whose work AI now imitates." }
  ],
  'afrobeats': [
    { name: 'Burna Boy', type: 'Vocal and production influence', description: "Burna Boy's Afrofusion style is among the most replicated African sounds in AI music." },
    { name: 'Wizkid', type: 'Vocal influence', description: "Wizkid's smooth Afrobeats vocals are heavily present in AI training datasets." },
    { name: 'Davido', type: 'Production influence', description: "Davido's Afrobeats production aesthetic is widely imitated by AI music generators." }
  ]
};

// Default fallback for AI tracks in genres we haven't mapped — always non-empty
const AI_GENERIC_INFLUENCES = [
  { name: 'Whitney Houston', type: 'Vocal influence', description: "Whitney Houston's vocal techniques are among the most foundational signals in AI vocal training data." },
  { name: 'Michael Jackson', type: 'Vocal and production influence', description: "Michael Jackson's vocal and production style is one of the most replicated references in AI-generated music." },
  { name: 'Stevie Wonder', type: 'Compositional influence', description: "Stevie Wonder's melodic and harmonic sensibility runs through a huge amount of AI training data." }
];

function buildInfluences(similarArtists, currentArtist, genreFamily, productionSignals) {
  const similar    = similarArtists?.similarartists?.artist || [];
  const isAiTrack  = productionSignals.aiLikelihoodScore > 0.65;
  const weights    = [0.65, 0.20, 0.10];

  // Highest priority: web-verified confirmed voice clone (e.g. Claude found
  // public reporting that this AI track clones a specific named artist's voice)
  if (productionSignals.confirmedClonedArtist) {
    const clonedName = productionSignals.confirmedClonedArtist;
    const primary = [{
      name: clonedName,
      estate: null,
      hasEstate: false,
      type: 'Confirmed voice clone',
      description: productionSignals.verificationSummary
        ? `Public reporting confirms this track uses an AI-cloned voice of ${clonedName}. ${productionSignals.verificationSummary}`
        : `Public reporting confirms this track uses an AI-cloned voice of ${clonedName}.`,
      score: weights[0],
      displayPercentage: 65
    }];
    const rest = (AI_GENRE_INFLUENCES[genreFamily] || AI_GENERIC_INFLUENCES)
      .filter(inf => inf.name !== clonedName)
      .slice(0, 2)
      .map((inf, i) => ({
        name: inf.name, estate: null, hasEstate: false,
        type: inf.type, description: inf.description,
        score: weights[i + 1] || 0.05, displayPercentage: [20, 10][i] || 5
      }));
    return [...primary, ...rest];
  }

  // Real audio-similarity match (from librosa feature comparison) — most accurate
  if (productionSignals.similarArtists && productionSignals.similarArtists.length > 0) {
    return productionSignals.similarArtists.slice(0, 3).map((a, i) => ({
      name: a.name,
      estate: null,
      hasEstate: false,
      type: isAiTrack ? 'Vocal/production similarity (audio-matched)' : guessInfluenceType(genreFamily),
      description: isAiTrack
        ? `Audio analysis found this track's vocal and production characteristics closely resemble ${a.name} (${Math.round(a.similarity * 100)}% similarity).`
        : `${a.name} shares strong sonic and stylistic characteristics with this track (${Math.round(a.similarity * 100)}% similarity).`,
      score: weights[i] || 0.05,
      displayPercentage: [65, 20, 10][i] || 5
    }));
  }

  // AI tracks without audio match — show the real human artists AI likely learned this style from
  if (isAiTrack) {
    const influences = AI_GENRE_INFLUENCES[genreFamily] || AI_GENERIC_INFLUENCES;
    return influences.map((inf, i) => ({
      name: inf.name,
      estate: null,
      hasEstate: false,
      type: inf.type,
      description: inf.description,
      score: weights[i] || 0.05,
      displayPercentage: [65, 20, 10][i] || 5
    }));
  }

  // Human tracks — use Last.fm similar artists if available
  if (similar.length > 0) {
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

  // Fallback to hardcoded human artist database
  const candidates = ARTIST_DATABASE.filter(a => a.genreFamilies.includes(genreFamily));
  if (candidates.length === 0) {
    return AI_GENERIC_INFLUENCES.map((inf, i) => ({
      name: inf.name, estate: null, hasEstate: false,
      type: inf.type, description: inf.description,
      score: weights[i] || 0.05, displayPercentage: [65, 20, 10][i] || 5
    }));
  }
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
