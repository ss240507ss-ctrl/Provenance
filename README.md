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



\*\*97.7% overall accuracy on 3,507 labeled tracks across 16 genre families (July 2026)\*\*



| Genre | Result |

|-------|--------|

| Afrobeats | 332/336 (99%) |

| Amapiano | 247/250 (99%) |

| Blues | 70/70 (100%) |

| Classical | 39/40 (98%) |

| Disco / Funk | 98/98 (100%) |

| Electronic | 60/61 (98%) |

| Folk / Country | 104/105 (99%) |

| Gospel | 305/311 (98%) |

| Hip-hop | 81/81 (100%) |

| Jazz | 100/101 (99%) |

| Latin | 197/198 (99%) |

| Neo-soul | 156/159 (98%) |

| Pop | 409/413 (99%) |

| Reggae | 58/58 (100%) |

| R\&B / Soul | 158/162 (98%) |

| Rock | 197/197 (100%) |

| \*\*AI tracks\*\* | \*\*815/867 (94%)\*\* |



Tested directly against pre-computed acoustic fingerprints using a 34-feature Random Forest / Gradient Boosting model. Separate structured live API test: 100% on 27 tracks across 13 genres (June 2026). Full methodology and results available on request.



\---



\## AI Detection System



Detection uses a layered waterfall approach — each layer adds evidence before a final verdict is reached:



\### Layer 0 — Confirmed human override (instant)

\- A curated list of known real artists that overrides all other signals — protects legitimate artists from community blocklist false positives



\### Layer 1 — Explicit signals (instant)

\- GitHub AI blocklist: 1,645+ confirmed Spotify artist IDs maintained by the open-source community

\- Known AI platform name signals: Suno, Udio, Obscurest Vinyl, Banned Vinyl, etc.



\### Layer 2 — Multi-source artist verification (fast, parallel)

\- \*\*Wikipedia\*\*: confirms real human musician status AND detects AI confirmation phrases

\- \*\*MusicBrainz\*\*: gold-standard open music database — only contains human-made music

\- \*\*Last.fm\*\*: listener counts as a human-presence signal (established artists have listeners)

\- \*\*Discogs\*\*: physical release history — AI artists never have vinyl or CD releases

\- \*\*Genius\*\*: songwriter/producer credit verification



\### Layer 3 — Web search verification (for uncertain cases)

\- \*\*Google Custom Search\*\* (when configured): corroborating search signal



\### Layer 4 — Acoustic fingerprint database (instant, 3,317 known tracks)

\- Pre-computed 34-feature acoustic fingerprints for 2,450 human and 867 AI tracks

\- When a known track is identified, returns an instant ML prediction from stored features

\- No audio download required — result in milliseconds



\### Layer 5 — Trained ML model (when live audio is available)

\- Gradient Boosting classifier trained on \*\*3,507 labeled tracks\*\* (2,640 human, 867 AI)

\- \*\*34 librosa audio features\*\*: tempo, pitch correction, breath presence, spectral characteristics, MFCCs, harmonic ratio, onset strength variation, vibrato regularity, chroma variation, and more

\- Deployed on Railway Python microservice via Flask



\---



\## Acoustic Influence Matching



When a track is flagged as AI-generated, Provenance identifies whose human artistry was acoustically used:



\- Compares the AI track's 34-feature fingerprint against 2,450 human track fingerprints

\- Returns the top 3 closest acoustic matches with similarity scores (e.g. "87% similarity to Erykah Badu")

\- Artist names sourced directly from ID3 metadata — no guessing from filenames

\- Works even without internet access to the original audio



\---



\## Cultural Lineage Engine



\- \*\*Genre detection\*\*: 16 genre families from Amapiano to Classical, detected from Spotify + Last.fm tags

\- \*\*Wikipedia pools\*\*: real artist names fetched live from Wikipedia category and list pages across 16 genre families — hundreds to thousands of names per genre, refreshed every 24 hours, filtered to reject non-artist pages

\- \*\*Era-proximity scoring\*\*: artists whose active period overlaps the track's release year are weighted higher

\- \*\*Gender-aware selection\*\*: Wikipedia pronoun detection matches influence references to the traced artist's gender

\- \*\*Last.fm similar artists\*\*: real artist-similarity data for human tracks, Wikipedia-validated before use



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

| AI detection data | GitHub community blocklist, Wikipedia |

| Storage | localStorage (client-side, no login required) |



\---



\## Dataset



| | Count |

|--|--|

| Human tracks | 2,640 |

| AI tracks | 867 |

| \*\*Total labeled\*\* | \*\*3,507\*\* |

| Human genres covered | 16 |

| Fingerprinted tracks | 3,317 |

| Overall accuracy | \*\*97.7% (July 2026)\*\* |

| Live API test | \*\*100% (27/27 tracks, June 2026)\*\* |



Human tracks sourced from curated genre playlists across 16 genre families. AI tracks sourced from Spotify playlists explicitly labeled as AI-generated music and Suno-generated tracks (2025-2026).



\---



\## Known limitations



\- Audio analysis only runs when the audio waterfall (Internet Archive → SoundCloud → YouTube) successfully retrieves audio — many traces rely on metadata-based detection and the fingerprint database

\- AI voice cloning detection requires either public reporting to have been indexed or real audio analysis

\- Artists using AI vocal processing as a deliberate creative tool may score inconsistently

\- Modern worship and contemporary gospel production shares acoustic characteristics with AI music due to heavily polished studio production — this is a known and documented limitation

\- Dataset label quality relies on Spotify playlist curation for AI tracks — independently verified track-by-track labeling is an ongoing improvement



\---



\## Roadmap



\- \[x] Expand dataset to 3,000+ tracks and retrain model

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

Full dataset accuracy test: \*\*July 2026\*\*

ID: PRV-2026-JN-001



\---



\*Provenance is a v1 product actively being developed. Detection accuracy improves with dataset growth. Bug reports and feedback welcome.\*

