/**
 * Provenance Backend — Test Script
 * Run with: node scripts/test-trace.js
 */

const axios = require('axios');

const BASE = process.env.API_URL || 'http://localhost:3001';

const tests = [
  { input: 'Thriller Michael Jackson',   expect: 'spotify-search' },
  { input: 'https://open.spotify.com/track/5ChkMS8OtdzJeqyybCc9R5', expect: 'spotify-link' },
  { input: 'suno ai r&b track',          expect: 'ai-text' },
  { input: 'Superstition Stevie Wonder', expect: 'funk-soul' },
  { input: 'Think Aretha Franklin',      expect: 'gospel-soul' }
];

async function run() {
  console.log(`\n🧪 Testing Provenance API at ${BASE}\n`);

  // Health check
  try {
    const health = await axios.get(`${BASE}/api/health`);
    console.log('✓ Health check passed:', health.data.services);
  } catch (err) {
    console.error('✗ Health check failed — is the server running?');
    console.error('  Run: npm start\n');
    process.exit(1);
  }

  console.log('\n── Trace tests ──────────────────────────────────────\n');

  for (const test of tests) {
    try {
      console.log(`Testing: "${test.input}"`);
      const start = Date.now();
      const res = await axios.post(`${BASE}/api/trace`, { input: test.input });
      const ms = Date.now() - start;

      const r = res.data;
      console.log(`  ✓ ${r.song.title} by ${r.song.artist}`);
      console.log(`    AI verdict: ${r.summary.aiVerdict}`);
      console.log(`    AI score:   ${(r.summary.aiLikelihoodScore * 100).toFixed(0)}%`);
      console.log(`    Influences: ${r.creativeLineage.influences.map(i => i.name).join(', ')}`);
      console.log(`    Method:     ${r.technical.analysisMethod}`);
      console.log(`    Time:       ${ms}ms\n`);
    } catch (err) {
      const errData = err.response?.data || err.message;
      console.log(`  ✗ Failed: ${JSON.stringify(errData)}\n`);
    }
  }

  console.log('── Done ─────────────────────────────────────────────\n');
}

run().catch(console.error);
