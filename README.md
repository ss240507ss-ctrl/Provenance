\# Provenance



\*\*Music transparency and AI detection platform.\*\*



> \*AI learned from artists. Artists should be remembered.\*



Provenance traces any song back to its cultural lineage, flags whether it is likely AI-generated, and surfaces the real human artists, songwriters, and producers whose work AI systems may have drawn from — without acknowledgment or compensation.



\---



\## What it does



1\. \*\*Identifies the song\*\* — accepts a Spotify link, YouTube link, or plain search query

2\. \*\*Detects AI likelihood\*\* — using a multi-layer verification system and a trained ML model

3\. \*\*Traces cultural lineage\*\* — surfaces genre roots, era context, and stylistic influences

4\. \*\*Credits real contributors\*\* — shows verified songwriter and producer credits from Genius

5\. \*\*No login required\*\* — trace history saved locally on the user's device



\---



\## Live product



\*\*→ \[provenance-trace.netlify.app](https://provenance-trace.netlify.app)\*\*



\---



\## Accuracy



\*\*100% on a 27-track structured test across 13 genre families (June 2026)\*\*



| Genre | Result |

|-------|--------|

| Afrobeats | 2/2 (100%) |

| Amapiano | 2/2 (100%) |

| Blues | 2/2 (100%) |

| Electronic | 1/1 (100%) |

| Folk / Country | 1/1 (100%) |

| Hip-hop | 4/4 (100%) |

| Jazz | 1/1 (100%) |

| Latin | 2/2 (100%) |

| Neo-soul | 1/1 (100%) |

| Pop | 1/1 (100%) |

| Reggae | 2/2 (100%) |

| R\&B / Soul | 6/6 (100%) |

| Rock | 2/2 (100%) |



Test run against the live production API using search queries across confirmed AI and confirmed human tracks. Methodology and full results CSV available on request.



\---



\## AI Detection System



Detection uses a layered waterfall approach — each layer adds evidence before a final verdict is reached:



\### Layer 0 — Confirmed human override (instant)

\- A curated list of known real artists that overrides all other signals — protects legitimate artists from community blocklist false positives



\### Layer 1 — Explicit signals (instant)

\- GitHub AI blocklist: 1,642+ confirmed Spotify artist IDs maintained by the open-source community

\- Known AI platform name signals: Suno, Udio, Obscurest Vinyl, Banned Vinyl, etc.



\### Layer 2 — Multi-source artist verification (fast, parallel)

\- \*\*Wikipedia\*\*: confirms real human musician status AND detects AI confirmation phrases

\- \*\*MusicBrainz\*\*: gold-standard open music database — only contains human-made music

\- \*\*Last.fm\*\*: listener counts as a human-presence signal (established artists have listeners)

\- \*\*Discogs\*\*: physical release history — AI artists never have vinyl or CD releases

\- \*\*Genius\*\*: songwriter/producer credit verification



\### Layer 3 — Web search verification (for uncertain cases)

\- \*\*DuckDuckGo Instant Answer API\*\*: free, no key required — checks for public reporting of AI generation or voice cloning

\- \*\*Google Custom Search\*\* (when configured): corroborating search signal



\### Layer 4 — Trained ML model (when audio is available)

\- Random Forest classifier trained on \*\*1,255 labeled tracks\*\* (630 human, 625 AI)

\- \*\*18 librosa audio features\*\*: tempo, pitch correction, breath presence, spectral characteristics, MFCCs, dynamic range, timing regularity

\- Deployed on Railway Python microservice via Flask

\- Falls back to Spotify audio-features heuristics when live audio cannot be retrieved



\---



\## Cultural Lineage Engine



\- \*\*Genre detection\*\*: 16 genre families from Amapiano to Classical, detected from Spotify + Last.fm tags

\- \*\*Wikipedia pools\*\*: real artist names fetched live from Wikipedia category and list pages across 14 genre families — hundreds to thousands of names per genre, refreshed every 24 hours, filtered to reject non-artist pages

\- \*\*Era-proximity scoring\*\*: artists whose active period overlaps the track's release year are weighted higher than era-mismatched legacy names

\- \*\*Gender-aware selection\*\*: Wikipedia pronoun detection matches influence references to the traced artist's gender

\- \*\*Featured artist genre override\*\*: for genre-fluid producers, a featured vocalist's clearer genre signal takes priority

\- \*\*Last.fm similar artists\*\*: real artist-similarity data for human tracks, Wikipedia-validated before use to reject obscure or non-music suggestions



\---



\## Contributors Feature



Real songwriter and producer credits sourced from Genius's documented API, shown for every trace where data exists. Coverage is honest — if Genius doesn't have a track, the section doesn't show rather than showing placeholder content.



\---



\## Stack



| Layer | Technology |

|-------|-----------|

| Frontend | Single-file HTML/CSS/JS — Netlify |

| Backend API | Node.js + Express — Railway |

| Audio analysis | Python + Flask + librosa — Railway |

| Song identification | Spotify Web API + AudD |

| Music data | Last.fm, MusicBrainz, Discogs, Genius |

| AI detection data | GitHub community blocklist, Wikipedia, DuckDuckGo |

| Storage | localStorage (client-side, no login required) |



\---



\## Dataset



| | Count |

|--|--|

| Human tracks | 630 |

| AI tracks | 625 |

| \*\*Total labeled\*\* | \*\*1,255\*\* |

| Human genres covered | 13 |

| Structured test accuracy | \*\*100% (27/27 tracks, June 2026)\*\* |

| ML model accuracy | 77.6% (v2), 81.7% (v1) |



Human tracks sourced from curated genre playlists across 13 genre families. AI tracks sourced from Spotify playlists explicitly labeled as AI-generated music (2025-2026).



Dataset is actively growing. Target: 3,000+ tracks before next model retrain.



\---



\## Known limitations



\- Audio analysis only runs when the audio waterfall (Internet Archive → SoundCloud → YouTube) successfully retrieves audio — many traces rely on metadata-based detection

\- AI voice cloning detection requires either public reporting to have been indexed or real audio analysis — purely metadata-based verification cannot identify this independently

\- Artists using AI vocal processing as a deliberate creative tool (distinct from AI-generated music) may score inconsistently depending on how publicly documented their process is

\- Dataset label quality relies on Spotify playlist curation for AI tracks — independently verified track-by-track labeling is an ongoing improvement



\---



\## Roadmap



\- \[ ] Expand dataset to 3,000+ tracks and retrain model (v3)

\- \[ ] Re-enable Claude API verification once billing is configured

\- \[ ] Boomplay API integration (application pending) for African music audio access

\- \[ ] Community discussion features (Supabase backend)

\- \[ ] Artist/estate notification system for confirmed AI usage

\- \[ ] Partnership discussions with music platforms and artist rights organizations



\---



\## Authorship



Concept, design, and development: \*\*Julie Susan Wawira Njiruh\*\*

First published: \*\*5 June 2026\*\*

Structured accuracy test: \*\*26 June 2026\*\*

ID: PRV-2026-JN-001



\---



\*Provenance is a v1 product actively being developed. Detection accuracy improves with dataset growth. Bug reports and feedback welcome.\*

