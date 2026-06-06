# Provenance Backend

Music transparency, lineage, and AI detection API.

---

## Architecture

```
provenance-backend/
├── src/
│   ├── server.js              # Express entry point
│   ├── routes/
│   │   ├── trace.js           # POST /api/trace — core analysis
│   │   ├── discover.js        # GET /api/discover — editorial content
│   │   └── health.js          # GET /api/health
│   ├── services/
│   │   ├── linkResolver.js    # Detect link type (Spotify/YouTube/SoundCloud/text)
│   │   ├── songIdentifier.js  # Identify the song (AudD + Spotify)
│   │   ├── audioAnalyser.js   # Production signal analysis
│   │   ├── lineageEngine.js   # Influence + lineage detection
│   │   └── spotifyService.js  # Spotify API wrapper
│   └── models/
│       ├── artistDatabase.js  # Reference artists for influence detection
│       ├── genreLineage.js    # Genre → cultural lineage mapping
│       └── editorialContent.js
├── audio_service.py           # Python/librosa real audio analysis
├── scripts/test-trace.js      # Test runner
├── .env.example               # Environment variables template
└── package.json
```

---

## Quick Start

### 1. Install Node dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your API keys (see below).

### 3. Start the Node server

```bash
npm run dev
```

The API will be at `http://localhost:3001`.

### 4. (Optional) Start the Python audio service

For real audio analysis (required for YouTube/SoundCloud):

```bash
pip install flask librosa numpy requests yt-dlp
python3 audio_service.py
```

---

## API Keys You Need

### AudD (song identification from audio/URLs)
- Sign up at https://dashboard.audd.io
- Free tier: 300 recognitions/month
- $10/month for 10,000 recognitions
- **Needed for**: YouTube and SoundCloud link identification

### Spotify Web API (metadata, search, audio features)
- Create an app at https://developer.spotify.com/dashboard
- Completely free
- **Needed for**: Song search, metadata, audio features (energy/tempo/danceability)

### YouTube Data API (optional — improves YouTube support)
- Get a key at https://console.cloud.google.com
- Free tier: 10,000 requests/day
- **Needed for**: Getting YouTube video titles as fallback

---

## API Reference

### POST /api/trace

Trace a song's origins, AI likelihood, and creative lineage.

**Request body:**
```json
{
  "input": "Thriller Michael Jackson"
}
```

Input can be:
- A song name: `"Thriller Michael Jackson"`
- A Spotify link: `"https://open.spotify.com/track/5ChkMS8OtdzJeqyybCc9R5"`
- A YouTube link: `"https://www.youtube.com/watch?v=sOnqjkJTMaA"`
- A SoundCloud link: `"https://soundcloud.com/artist/track"`

**Response:**
```json
{
  "traceId": "uuid",
  "song": {
    "title": "Thriller",
    "artist": "Michael Jackson",
    "year": 1982,
    "streams": 1200000000,
    "isAiGenerated": false
  },
  "summary": {
    "aiVerdict": "Low likelihood of AI-assisted production",
    "aiLikelihoodScore": 0.12,
    "verdictSentence": "This track sounds like Michael Jackson..."
  },
  "productionSignals": {
    "pitchCorrection": "Moderate",
    "breathPresence": "Moderate-High",
    "timingRegularity": "High",
    "spectralSmoothing": "Moderate"
  },
  "humanContribution": {
    "songwriting": "Human-led",
    "vocalPerformance": "Likely human",
    "production": "Human-led"
  },
  "creativeLineage": {
    "influences": [
      {
        "name": "Michael Jackson",
        "type": "Vocal influence",
        "displayPercentage": 65
      }
    ],
    "genreLineage": [...]
  },
  "artistRecognition": {
    "message": "Michael Jackson's estate currently receives no automatic compensation..."
  }
}
```

### GET /api/discover

Get editorial content.

**Query params:**
- `type`: `all` | `production` | `culture` | `between` | `notes` | `sessions`
- `limit`: number (default 20)
- `offset`: number (default 0)

### GET /api/health

Check service status.

---

## Connecting the Frontend

In your `provenance-app.html`, update the `startTrace()` function:

```javascript
async function startTrace() {
  const val = document.getElementById('ts-input').value.trim();
  if (!val) return;

  // Show loading state
  showLoading();

  try {
    const response = await fetch('http://localhost:3001/api/trace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: val })
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.error);
      return;
    }

    renderResult(data);

  } catch (err) {
    showError('Could not connect to the Provenance API. Is the server running?');
  }
}
```

---

## Deployment

The backend is deployable to any Node.js host:

- **Railway** — `railway up` (recommended, free tier available)
- **Render** — connect GitHub repo, auto-deploy
- **Fly.io** — `fly deploy`
- **Heroku** — `git push heroku main`
- **VPS (DigitalOcean/Linode)** — run with `pm2 start src/server.js`

The Python audio service needs a host that supports Python. Railway and Render both support this.

---

## How Influence Detection Works

Provenance uses a transparent, honest heuristic approach:

1. **Genre mapping** — Spotify's genre tags map to genre families (R&B → rnb-soul)
2. **Audio feature matching** — Spotify's audio features (energy, tempo, danceability) match against artist audio profiles
3. **AI score** — production signals (pitch correction, breath presence, timing regularity, spectral smoothing) combine into an AI likelihood score
4. **Influence scoring** — candidates from the artist database are scored and normalised

This is not a black-box ML model. Every decision is inspectable.

The Python microservice adds real audio analysis via librosa when audio is available (YouTube/SoundCloud links).

---

## What "Apologise Later" Means Here

Things that work now and are honest about their limitations:
- Spotify audio features are **real data** — tempo, energy, danceability, acousticness
- Genre detection is **real** — Spotify's genre tags
- AI platform detection from names is **reliable**
- Production signal scoring is **heuristic but documented**

Things we'll improve:
- Voice print comparison (requires building a reference audio dataset)
- Trained influence classifiers (requires labelled training data)
- YouTube/SoundCloud audio extraction (requires yt-dlp + ffmpeg on server)

---

## Licence

MIT
