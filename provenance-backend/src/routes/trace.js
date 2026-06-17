const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const linkResolver = require('../services/linkResolver');
const songIdentifier = require('../services/songIdentifier');
const audioAnalyser = require('../services/audioAnalyser');
const lineageEngine = require('../services/lineageEngine');
const spotifyService = require('../services/spotifyService');

/**
 * POST /api/trace
 * Body: { input: "spotify link | youtube link | soundcloud link | song name" }
 *
 * Returns a full provenance result with:
 * - AI likelihood assessment
 * - Production signals
 * - Human contribution indicators
 * - Creative lineage
 * - Artist recognition note
 */
router.post('/', async (req, res) => {
  const { input } = req.body;

  if (!input || typeof input !== 'string' || input.trim().length === 0) {
    return res.status(400).json({ error: 'Please provide a song name, artist, or link to trace.' });
  }

  const traceId = uuidv4();
  const startTime = Date.now();

  console.log(`[${traceId}] Tracing: "${input.trim()}"`);

  try {
    // ── STEP 1: Resolve the input ──────────────────────────────────────
    // Determine if this is a link or a text search
    const resolved = await linkResolver.resolve(input.trim());
    console.log(`[${traceId}] Resolved:`, resolved.type, resolved.title || resolved.query);

    // ── STEP 2: Identify the song ──────────────────────────────────────
    // Get song metadata — title, artist, album, release year, streams
    const songData = await songIdentifier.identify(resolved);
    console.log(`[${traceId}] Identified: "${songData.title}" by ${songData.artist}`);

    // ── STEP 3: Get enriched metadata from Spotify ─────────────────────
    const spotifyData = await spotifyService.enrich(songData);

    // ── STEP 4: Analyse audio production signals ───────────────────────
    // This calls the Python microservice if available, falls back to heuristics
    const productionSignals = await audioAnalyser.analyse(resolved, songData);

    // ── STEP 5: Run lineage engine ─────────────────────────────────────
    // Maps the song characteristics to known artist influences and cultural lineage
    const lineage = await lineageEngine.trace(songData, spotifyData, productionSignals);

    // ── BUILD RESULT ───────────────────────────────────────────────────
    const result = buildResult({
      traceId,
      input: input.trim(),
      songData,
      spotifyData,
      productionSignals,
      lineage,
      processingMs: Date.now() - startTime
    });

    console.log(`[${traceId}] Complete in ${result.meta.processingMs}ms`);
    res.json(result);

  } catch (err) {
    console.error(`[${traceId}] Error:`, err.message);

    // Handle known error types gracefully
    if (err.code === 'SONG_NOT_FOUND') {
      return res.status(404).json({
        error: 'We couldn\'t identify this track. Try a different search or check the link.',
        traceId
      });
    }

    if (err.code === 'LINK_UNSUPPORTED') {
      return res.status(400).json({
        error: 'This link type isn\'t supported yet. Try Spotify, YouTube, SoundCloud, or a song name.',
        traceId
      });
    }

    res.status(500).json({
      error: 'Something went wrong while tracing this track. Please try again.',
      traceId
    });
  }
});

/**
 * GET /api/trace/:traceId
 * Retrieve a previously computed trace result (from cache/DB in production)
 */
router.get('/:traceId', (req, res) => {
  // In production: look up from database
  // For now, return a not-found — results are computed fresh
  res.status(404).json({ error: 'Trace result not found. Results are not yet persisted.' });
});

// ─── BUILD RESULT ────────────────────────────────────────────────────────────
function buildResult({ traceId, input, songData, spotifyData, productionSignals, lineage, processingMs }) {

  // Determine AI likelihood verdict
  const aiScore = productionSignals.aiLikelihoodScore;
  let aiVerdict, aiPillClass;
  if (aiScore >= 0.65) {
    aiVerdict = 'High likelihood of AI-assisted production';
    aiPillClass = 'vp-hi';
  } else if (aiScore >= 0.35) {
    aiVerdict = 'Moderate likelihood of AI-assisted production';
    aiPillClass = 'vp-md';
  } else {
    aiVerdict = 'Low likelihood of AI-assisted production';
    aiPillClass = 'vp-lo';
  }

  // Build the human-readable verdict sentence
  const verdictSentence = buildVerdictSentence(songData, lineage);

  return {
    traceId,
    meta: {
      input,
      processingMs,
      disclaimer: 'These characteristics can also occur in carefully engineered human recordings.'
    },

    // The song
    song: {
      title: songData.title,
      artist: songData.artist,
      album: songData.album || null,
      year: songData.year || null,
      streams: spotifyData?.streams || null,
      source: songData.source,
      imageUrl: spotifyData?.imageUrl || null,
      spotifyUrl: spotifyData?.spotifyUrl || null,
      isAiGenerated: songData.isAiGenerated || false,
      aiTool: songData.aiTool || null
    },

    // Layer 1: Summary
    summary: {
      aiVerdict,
      aiPillClass,
      aiLikelihoodScore: aiScore,
      verdictSentence,
      disclaimer: 'These characteristics can also occur in carefully engineered human recordings.'
    },

    // Layer 2: Production signals
    productionSignals: {
      pitchCorrection:    productionSignals.pitchCorrection,
      breathPresence:     productionSignals.breathPresence,
      timingRegularity:   productionSignals.timingRegularity,
      spectralSmoothing:  productionSignals.spectralSmoothing,
      dynamicRange:       productionSignals.dynamicRange,
      overallAssessment:  aiVerdict,
      note: 'These characteristics can also occur in carefully engineered human recordings.'
    },

    // Layer 3: Human contribution
    humanContribution: {
      songwriting:      lineage.humanContribution.songwriting,
      composition:      lineage.humanContribution.composition,
      vocalPerformance: lineage.humanContribution.vocalPerformance,
      production:       lineage.humanContribution.production,
      mixingMastering:  lineage.humanContribution.mixingMastering
    },

    // Layer 4: Creative lineage
    creativeLineage: {
      influences: lineage.influences,
      genreLineage: lineage.genreLineage,
      culturalContext: lineage.culturalContext,
      note: 'This section documents influence. It does not imply ownership or infringement.'
    },

    // Layer 4.5: Contributors — real, sourced songwriter and producer credits
    // from Genius. Gives visible recognition to the people behind a track,
    // including (for AI-flagged tracks) those whose work may have been
    // used in training without acknowledgement or compensation.
    contributors: productionSignals.credits ? {
      primaryArtist: productionSignals.credits.primaryArtist,
      featuredArtists: productionSignals.credits.featuredArtists,
      writers: productionSignals.credits.writers,
      producers: productionSignals.credits.producers,
      source: 'Genius',
      sourceUrl: productionSignals.credits.geniusUrl,
      note: 'Credits sourced from Genius. Coverage may be incomplete; absence of a name here does not mean they were uncredited.'
    } : null,

    // Justice note
    artistRecognition: lineage.artistRecognition,

    // Layer 5: Technical (for advanced users)
    technical: {
      influenceScores: lineage.influenceScores,
      modelConfidence: productionSignals.modelConfidence,
      signalConfidence: productionSignals.signalConfidence,
      analysisMethod: productionSignals.method
    }
  };
}

function buildVerdictSentence(songData, lineage) {
  const influences = lineage.influences;
  if (!influences || influences.length === 0) {
    return `This track shows characteristics consistent with ${songData.artist}'s style.`;
  }

  const names = influences.slice(0, 3).map(i => `<em>${i.name}</em>`);

  let sentence;
  if (names.length === 1) {
    sentence = `This track has influences from ${names[0]}.`;
  } else if (names.length === 2) {
    sentence = `This track has influences from ${names[0]} and ${names[1]}.`;
  } else {
    sentence = `This track has influences from ${names[0]}, ${names[1]}, and ${names[2]}.`;
  }

  return sentence;
}

module.exports = router;
