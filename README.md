# Provenance

**Music transparency and AI detection platform.**

> *AI learned from artists. Artists should be remembered.*

Provenance traces any song back to its cultural lineage, flags whether it is likely AI-generated, and surfaces the real human artists, songwriters, and producers whose work AI systems may have drawn from — without acknowledgment or compensation.

---

## What it does

1. **Identifies the song** — accepts a Spotify link, YouTube link, or plain search query
2. **Detects AI likelihood** — using a multi-layer verification system and a trained ML model
3. **Traces cultural lineage** — surfaces genre roots, era context, and stylistic influences
4. **Credits real contributors** — shows verified songwriter and producer credits from Genius
5. **No login required** — trace history saved locally on the user's device

---

## Live product

**→ [provenance-trace.netlify.app](https://provenance-trace.netlify.app)**

---

## AI Detection System

Detection uses a layered waterfall approach — each layer adds evidence before a final verdict is reached:

### Layer 1 — Explicit signals (instant)
- GitHub AI blocklist: 1,642 confirmed Spotify artist IDs maintained by the open-source community
- Known AI platform name signals: Suno, Udio, Obscurest Vinyl, Banned Vinyl, etc.

### Layer 2 — Multi-source artist verification (fast, parallel)
- **Wikipedia**: confirms real human musician status AND detects AI confirmation phrases
- **MusicBrainz**: gold-standard open music database — only contains human-made music
- **Last.fm**: listener counts as a human-presence signal (established artists have listeners)
- **Discogs**: physical release history — AI artists never have vinyl or CD releases
- **Genius**: songwriter/producer credit verification

### Layer 3 — Web search verification (for uncertain cases)
- **DuckDuckGo Instant Answer API**: free, no key required — checks for public reporting of AI generation or voice cloning
- **Google Custom Search** (when configured): corroborating search signal

### Layer 4 — Trained ML model (when audio is available)
- Random Forest classifier trained on **1,255 labeled tracks** (630 human, 625 AI)
- **18 librosa audio features**: tempo, pitch correction, breath presence, spectral characteristics, MFCCs, dynamic range, timing regularity
- Deployed on Railway Python microservice via Flask
- Falls back to Spotify audio-features heuristics when live audio cannot be retrieved

---

## Cultural Lineage Engine

- **Genre detection**: 16 genre families from Amapiano to Classical, detected from Spotify + Last.fm tags
- **Wikipedia category pools**: real artist names fetched live from Wikipedia's category and list pages across all genre families — hundreds to thousands of names per genre, refreshed every 24 hours
- **Era-proximity scoring**: artists whose active period overlaps the track's release year are weighted higher than era-mismatched legacy names
- **Gender-aware selection**: Wikipedia pronoun detection matches influence references to the traced artist's gender (male artists get male references, female artists get female)
- **Featured artist genre override**: for genre-fluid producers (e.g. KAYTRANADA), a featured vocalist's clearer genre signal takes priority
- **Last.fm similar artists**: real artist-similarity data for human tracks, filtered by confidence threshold to reject weak genre-mismatched suggestions

---

## Contributors Feature

Real songwriter and producer credits sourced from Genius's documented API, shown for every trace where data exists. Coverage is honest — if Genius doesn't have a track, the section doesn't show rather than showing placeholder content.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Single-file HTML/CSS/JS — Netlify |
| Backend API | Node.js + Express — Railway |
| Audio analysis | Python + Flask + librosa — Railway |
| Song identification | Spotify Web API + AudD |
| Music data | Last.fm, MusicBrainz, Discogs, Genius |
| AI detection data | GitHub community blocklist, Wikipedia, DuckDuckGo |
| Storage | localStorage (client-side, no login required) |

---

## Dataset

| | Count |
|--|--|
| Human tracks | 630 |
| AI tracks | 625 |
| **Total labeled** | **1,255** |
| Human genres covered | 13 |
| Model accuracy | 77.6% (v2), 81.7% (v1) |

Human tracks sourced from curated genre playlists across 13 genre families. AI tracks sourced from Spotify playlists explicitly labeled as AI-generated music (2025-2026).

Dataset is actively growing. Target: 3,000+ tracks before next model retrain.

---

## Known limitations

- Audio analysis only runs when the audio waterfall (Internet Archive → SoundCloud → YouTube) successfully retrieves audio — many traces rely on metadata-based detection
- AI voice cloning detection (e.g. an artist using a real celebrity's cloned voice) requires either public reporting to have been indexed or real audio analysis — purely metadata-based verification cannot identify this independently
- Genre-fluid artists and cross-genre tracks may occasionally receive influence suggestions from adjacent genre pools
- Dataset label quality relies on Spotify playlist curation for AI tracks — independently verified track-by-track labeling is an ongoing improvement

---

## Roadmap

- [ ] Expand dataset to 3,000+ tracks and retrain model (v3)
- [ ] Re-enable Claude API verification once billing is configured
- [ ] Boomplay API integration (application pending) for African music audio access
- [ ] Community discussion features (Supabase backend)
- [ ] Artist/estate notification system for confirmed AI usage
- [ ] Partnership discussions with music platforms and artist rights organizations

---

## Authorship

Concept, design, and development: **Julie Susan Wawira Njiruh**
First published: **5 June 2026**
ID: PRV-2026-JN-001

---

*Provenance is a v1 product actively being developed. Detection accuracy improves with dataset growth. Bug reports and feedback welcome.*
