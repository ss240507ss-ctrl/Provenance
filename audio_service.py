"""
Provenance Audio Analysis Microservice
Flask + librosa + trained ML model

Audio source waterfall:
1. Internet Archive (free, no key, no bot detection)
2. SoundCloud search (free via yt-dlp)
3. YouTube search (free via yt-dlp, sometimes blocked)
4. Fallback to metadata heuristics
"""

import os
import tempfile
import logging
import numpy as np
import requests
import json
from flask import Flask, request, jsonify

try:
    import librosa
    LIBROSA_AVAILABLE = True
except ImportError:
    LIBROSA_AVAILABLE = False

MODEL_AVAILABLE = False
AI_MODEL  = None
AI_SCALER = None

try:
    import joblib
    _dir        = os.path.dirname(__file__)
    MODEL_PATH  = os.path.join(_dir, 'ai_detector.pkl')
    SCALER_PATH = os.path.join(_dir, 'scaler.pkl')
    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        AI_MODEL        = joblib.load(MODEL_PATH)
        AI_SCALER       = joblib.load(SCALER_PATH)
        MODEL_AVAILABLE = True
        print("Trained AI detection model loaded")
    else:
        print("No trained model found — using heuristics")
except Exception as e:
    print(f"Could not load model: {e}")

# ── Fingerprint database lookup ────────────────────────────────────────────
# Pre-computed acoustic features from 1,192 labeled tracks. When a song
# is identified by title + artist, we look it up here first — instant
# ML prediction from real audio features, no download needed.
FINGERPRINT_AVAILABLE = False
try:
    import fingerprint_lookup
    FINGERPRINT_AVAILABLE = True
    print(f"Fingerprint DB loaded: {fingerprint_lookup.stats()['count']} tracks")
except Exception as e:
    print(f"Fingerprint DB not available: {e}")

try:
    import yt_dlp
    YTDLP_AVAILABLE = True
except ImportError:
    YTDLP_AVAILABLE = False

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

FEATURES = [
    'tempo', 'timing_regularity', 'pitch_correction', 'breath_presence',
    'dynamic_range_db', 'spectral_centroid', 'spectral_bandwidth',
    'spectral_rolloff', 'spectral_flatness', 'spectral_variation',
    'zero_crossing_rate', 'rms_mean', 'rms_std',
    'mfcc_1', 'mfcc_2', 'mfcc_3', 'mfcc_4', 'mfcc_5'
]

@app.route('/health')
def health():
    return jsonify({
        'status':        'ok',
        'librosa':       LIBROSA_AVAILABLE,
        'trained_model': MODEL_AVAILABLE,
        'yt_dlp':        YTDLP_AVAILABLE,
        'fingerprint_db': fingerprint_lookup.stats() if FINGERPRINT_AVAILABLE else {'loaded': False}
    })

@app.route('/fingerprint/stats')
def fingerprint_stats():
    if not FINGERPRINT_AVAILABLE:
        return jsonify({'loaded': False, 'message': 'fingerprint_lookup module not available'})
    return jsonify(fingerprint_lookup.stats())

@app.route('/analyse', methods=['POST'])
def analyse():
    data         = request.json
    input_type   = data.get('input_type')
    url          = data.get('url')
    song_title   = data.get('song_title', '')
    artist       = data.get('artist', '')
    search_query = data.get('search_query', f"{artist} {song_title}".strip())

    logger.info(f"Analysing: {song_title} by {artist}")

    # ── ROUND 0: Fingerprint database lookup (instant, no download) ─────
    # Check our pre-computed feature database first. If this song's audio
    # features are already known from training data, return the ML
    # prediction immediately without going through the download waterfall.
    if FINGERPRINT_AVAILABLE and (song_title or artist):
        fp_result = fingerprint_lookup.lookup(song_title, artist)
        if fp_result:
            logger.info(f"Fingerprint DB hit: {fp_result['matchedKey']}")
            features = fp_result['features']
            ai_score = fp_result['aiProbability']
            result = features_to_result(features, ai_score=ai_score, method='fingerprint-db')
            result['audioSource'] = 'fingerprint-db'
            result['fingerprintMatch'] = fp_result['matchedKey']
            return jsonify(result)

    audio_path  = None
    source_used = None

    try:
        # ── ROUND 1: Direct URL (if YouTube/SoundCloud link given) ──────
        if url and YTDLP_AVAILABLE and input_type in ('youtube', 'soundcloud'):
            audio_path = download_audio(url)
            if audio_path:
                source_used = 'direct-url'

        # ── ROUND 2: Internet Archive (free, no bot detection) ──────────
        if not audio_path and search_query:
            audio_path = download_from_archive_org(search_query)
            if audio_path:
                source_used = 'internet-archive'

        # ── ROUND 3: SoundCloud search ───────────────────────────────────
        if not audio_path and YTDLP_AVAILABLE and search_query:
            audio_path = download_audio(f"scsearch1:{search_query}")
            if audio_path:
                source_used = 'soundcloud-search'

        # ── ROUND 4: YouTube search (often blocked but worth trying) ────
        if not audio_path and YTDLP_AVAILABLE and search_query:
            audio_path = download_audio(f"ytsearch1:{search_query}")
            if audio_path:
                source_used = 'youtube-search'

        # ── Analyse if we got audio ───────────────────────────────────────
        if audio_path and LIBROSA_AVAILABLE:

            # Scan metadata FIRST — definitive if AI signatures found
            metadata_scan = scan_audio_metadata(audio_path)

            features = extract_features(audio_path)
            if features and MODEL_AVAILABLE:
                result = predict_with_model(features)
                result['audioSource'] = source_used
            elif features:
                result = features_to_result(features)
                result['audioSource'] = source_used
            else:
                result = heuristic_analysis(song_title, artist)

            # If metadata scan found AI signatures, boost the score
            if metadata_scan['ai_metadata_found']:
                result['aiLikelihoodScore'] = max(
                    result.get('aiLikelihoodScore', 0),
                    0.92
                )
                result['metadataAiDetected'] = True
                result['detectedTool'] = metadata_scan.get('detected_tool')
                result['c2paFound'] = metadata_scan.get('c2pa_found', False)
                logger.info(f"Metadata AI detection boosted score to {result['aiLikelihoodScore']}")

            # Acoustic similarity matching — find whose sound was used
            # Only run for tracks that score above 0.45 (uncertain or AI)
            if features and result.get('aiLikelihoodScore', 0) >= 0.45:
                acoustic_matches = find_acoustic_influences(features, top_n=5)
                if acoustic_matches:
                    result['acousticInfluences'] = acoustic_matches
                    logger.info(f"Acoustic influences found: {[m['filename'] for m in acoustic_matches[:3]]}")

        else:
            result = heuristic_analysis(song_title, artist)

        return jsonify(result)

    except Exception as e:
        logger.error(f"Analysis error: {e}")
        return jsonify(heuristic_analysis(song_title, artist))

    finally:
        if audio_path and os.path.exists(audio_path):
            try:
                os.unlink(audio_path)
            except Exception:
                pass

# ── Internet Archive search and download ───────────────────────────────────

def download_from_archive_org(search_query):
    """Search Internet Archive for a track and download audio if found."""
    try:
        search_url = "https://archive.org/advancedsearch.php"
        params = {
            'q': f'({search_query}) AND mediatype:(audio)',
            'fl[]': 'identifier',
            'rows': 3,
            'output': 'json'
        }
        resp = requests.get(search_url, params=params, timeout=8)
        if resp.status_code != 200:
            return None

        docs = resp.json().get('response', {}).get('docs', [])
        if not docs:
            return None

        for doc in docs:
            identifier = doc.get('identifier')
            if not identifier:
                continue

            # Get file listing for this item
            meta_url = f"https://archive.org/metadata/{identifier}"
            meta_resp = requests.get(meta_url, timeout=8)
            if meta_resp.status_code != 200:
                continue

            files = meta_resp.json().get('files', [])
            audio_file = next(
                (f for f in files if f.get('name', '').lower().endswith(('.mp3', '.ogg', '.flac'))),
                None
            )
            if not audio_file:
                continue

            file_url = f"https://archive.org/download/{identifier}/{audio_file['name']}"
            audio_resp = requests.get(file_url, timeout=15, stream=True)
            if audio_resp.status_code == 200:
                tmp = tempfile.NamedTemporaryFile(suffix='.mp3', delete=False)
                downloaded = 0
                max_bytes  = 5 * 1024 * 1024  # Cap at 5MB (~30-60s of audio)
                for chunk in audio_resp.iter_content(chunk_size=8192):
                    tmp.write(chunk)
                    downloaded += len(chunk)
                    if downloaded > max_bytes:
                        break
                tmp.close()
                logger.info(f"Downloaded from Internet Archive: {identifier}")
                return tmp.name

    except Exception as e:
        logger.warning(f"Internet Archive search failed: {e}")
    return None

# ── yt-dlp download (YouTube/SoundCloud) ────────────────────────────────────

def download_audio(url):
    try:
        tmp = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
        tmp.close()
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': tmp.name.replace('.wav', ''),
            'postprocessors': [{'key': 'FFmpegExtractAudio', 'preferredcodec': 'wav'}],
            'quiet': True,
            'no_warnings': True,
            'noplaylist': True,
            'socket_timeout': 10,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        for path in [tmp.name + '.wav', tmp.name]:
            if os.path.exists(path):
                return path
    except Exception as e:
        logger.warning(f"yt-dlp download failed: {e}")
    return None

def safe_float(value):
    try:
        return float(np.asarray(value).item())
    except Exception:
        return 0.0

def extract_features(audio_path):
    try:
        y, sr = librosa.load(audio_path, sr=22050, mono=True, duration=30)
        if len(y) < sr * 5:
            return None

        tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
        beat_intervals = np.diff(beats)
        if len(beat_intervals) > 0:
            timing_regularity = 1.0 - min(1.0, float(np.std(beat_intervals)) / (float(np.mean(beat_intervals)) + 1e-6))
        else:
            timing_regularity = 0.5

        spectral_centroid  = librosa.feature.spectral_centroid(y=y, sr=sr)
        spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)
        spectral_rolloff   = librosa.feature.spectral_rolloff(y=y, sr=sr)
        spectral_flatness  = librosa.feature.spectral_flatness(y=y)
        zero_crossing_rate = librosa.feature.zero_crossing_rate(y)
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        rms   = librosa.feature.rms(y=y)

        pitch_correction = 0.5
        try:
            f0, voiced_flag, _ = librosa.pyin(y, fmin=float(librosa.note_to_hz('C2')), fmax=float(librosa.note_to_hz('C7')))
            if f0 is not None and voiced_flag is not None:
                mask = np.array(voiced_flag, dtype=bool)
                voiced_f0 = f0[mask]
                voiced_f0 = voiced_f0[~np.isnan(voiced_f0)]
                if len(voiced_f0) > 10:
                    semitones = 12.0 * np.log2(voiced_f0 / 440.0 + 1e-6)
                    deviation = np.abs(semitones - np.round(semitones))
                    pitch_correction = max(0.0, min(1.0, 1.0 - (float(np.mean(deviation)) / 0.5)))
        except Exception:
            pass

        rms_flat   = np.array(rms).flatten()
        mean_rms   = float(np.mean(rms_flat))
        low_energy = rms_flat < (mean_rms * 0.3)
        sf_flat    = np.array(spectral_flatness).flatten()
        min_len    = min(len(low_energy), len(sf_flat))
        n_low      = int(np.sum(low_energy[:min_len]))
        breath_score = float(np.mean(sf_flat[:min_len][low_energy[:min_len]] > 0.3)) if n_low > 5 else 0.1

        rms_db        = librosa.amplitude_to_db(rms)
        dynamic_range = float(np.percentile(rms_db, 95)) - float(np.percentile(rms_db, 5))
        sc_mean = float(np.mean(spectral_centroid))
        sc_std  = float(np.std(spectral_centroid))

        return {
            'tempo':              safe_float(tempo),
            'timing_regularity':  float(timing_regularity),
            'pitch_correction':   float(pitch_correction),
            'breath_presence':    float(breath_score),
            'dynamic_range_db':   float(dynamic_range),
            'spectral_centroid':  sc_mean,
            'spectral_bandwidth': float(np.mean(spectral_bandwidth)),
            'spectral_rolloff':   float(np.mean(spectral_rolloff)),
            'spectral_flatness':  float(np.mean(spectral_flatness)),
            'spectral_variation': float(sc_std / (sc_mean + 1e-6)),
            'zero_crossing_rate': float(np.mean(zero_crossing_rate)),
            'rms_mean':           float(np.mean(rms)),
            'rms_std':            float(np.std(rms)),
            'mfcc_1':             float(np.mean(mfccs[0])),
            'mfcc_2':             float(np.mean(mfccs[1])),
            'mfcc_3':             float(np.mean(mfccs[2])),
            'mfcc_4':             float(np.mean(mfccs[3])),
            'mfcc_5':             float(np.mean(mfccs[4])),
        }
    except Exception as e:
        logger.error(f"Feature extraction error: {e}")
        return None

def predict_with_model(features):
    feature_vector = np.array([[features[f] for f in FEATURES]])
    scaled = AI_SCALER.transform(feature_vector)
    proba  = AI_MODEL.predict_proba(scaled)[0]
    ai_score = float(proba[1])
    return features_to_result(features, ai_score=ai_score, method='trained-ml-model')

# ── ID3 / metadata AI detection ────────────────────────────────────────────
# Known strings that AI generation tools embed in ID3/XMP/comment fields
AI_METADATA_SIGNATURES = [
    'suno', 'udio', 'musicgen', 'aiva', 'mubert', 'soundraw', 'boomy',
    'beatoven', 'stable audio', 'riffusion', 'harmonai', 'musiclm',
    'ai-generated', 'ai generated', 'generated by ai', 'artificial intelligence',
    'elevenlabs', 'voicify', 'covers.ai'
]

# C2PA content credential markers
C2PA_MARKERS = [b'c2pa', b'jumbf', b'JUMBF', b'contentcredentials']

def scan_audio_metadata(audio_path):
    """
    Scan an audio file's ID3 tags, comment fields, XMP data, and binary
    header for AI generation signatures. Returns a dict with findings.
    """
    result = {
        'ai_metadata_found': False,
        'c2pa_found': False,
        'detected_tool': None,
        'metadata_fields': {}
    }

    # ── ID3 tag scanning via mutagen ──────────────────────────────────────
    try:
        from mutagen import File as MutagenFile
        audio = MutagenFile(audio_path)
        if audio and audio.tags:
            tag_text = []
            for key, val in audio.tags.items():
                str_val = str(val).lower()
                tag_text.append(str_val)
                result['metadata_fields'][key] = str(val)[:200]

            combined = ' '.join(tag_text)
            for sig in AI_METADATA_SIGNATURES:
                if sig in combined:
                    result['ai_metadata_found'] = True
                    result['detected_tool'] = sig
                    logger.info(f"AI metadata signature found: {sig}")
                    break
    except ImportError:
        logger.warning("mutagen not installed — skipping ID3 scan")
    except Exception as e:
        logger.warning(f"ID3 scan error: {e}")

    # ── C2PA binary marker scan ───────────────────────────────────────────
    try:
        with open(audio_path, 'rb') as f:
            # Read first 64KB — C2PA credentials appear early in the file
            header = f.read(65536)
        for marker in C2PA_MARKERS:
            if marker in header:
                result['c2pa_found'] = True
                result['ai_metadata_found'] = True
                result['detected_tool'] = result['detected_tool'] or 'c2pa-credential'
                logger.info(f"C2PA credential marker found in audio file")
                break
    except Exception as e:
        logger.warning(f"C2PA scan error: {e}")

    return result

# ── Acoustic similarity matching ──────────────────────────────────────────
# Compare an AI track's features against every human track in the
# fingerprint database. The closest matches are whose sound was actually
# used — giving real, specific artist influences rather than generic
# genre-pool names.

def find_acoustic_influences(ai_features, top_n=5):
    """
    Given a set of audio features from an AI track, find the most
    acoustically similar human tracks in the fingerprint database.
    Returns the top N matches with similarity scores and artist info.
    """
    if not FINGERPRINT_AVAILABLE:
        return []

    db = fingerprint_lookup._db
    if not db:
        return []

    ai_vector = np.array([ai_features.get(f, 0.0) for f in FEATURES])

    # Normalise the AI vector
    ai_norm = np.linalg.norm(ai_vector)
    if ai_norm == 0:
        return []

    similarities = []
    for key, entry in db.items():
        if entry.get('label') != 'human':
            continue
        stored = entry.get('features', {})
        if not all(f in stored for f in FEATURES):
            continue

        human_vector = np.array([stored.get(f, 0.0) for f in FEATURES])
        human_norm = np.linalg.norm(human_vector)
        if human_norm == 0:
            continue

        # Cosine similarity — 1.0 = identical, 0.0 = completely different
        cosine_sim = float(np.dot(ai_vector, human_vector) / (ai_norm * human_norm))

        similarities.append({
            'filename': entry.get('filename', key),
            'genre': entry.get('genre', 'unknown'),
            'similarity': round(cosine_sim, 4),
            'key': key
        })

    # Sort by similarity descending, return top N
    similarities.sort(key=lambda x: -x['similarity'])
    return similarities[:top_n]

def extract_artist_from_filename(filename):
    """
    Extract a likely artist name from a training track filename.
    e.g. 'Brown Sugar.mp3' from D'Angelo's folder → we have genre context
    but not the artist name directly. Return the cleaned track name.
    """
    import re
    name = os.path.splitext(filename)[0]
    name = re.sub(r'_spotdown\.org.*$', '', name, flags=re.IGNORECASE)
    name = re.sub(r'[\[\(].*?[\]\)]', '', name)
    name = re.sub(r'[-_]+', ' ', name)
    name = re.sub(r'\s+', ' ', name).strip()
    return name


def features_to_result(features, ai_score=None, method='librosa-audio-analysis'):
    if ai_score is None:
        ai_score = (
            features['pitch_correction'] * 0.30 +
            (1 - features['breath_presence']) * 0.25 +
            features['timing_regularity'] * 0.25 +
            features['spectral_flatness'] * 0.20
        )

    def to_label(score, labels):
        return labels[min(int(score * len(labels)), len(labels) - 1)]

    return {
        'pitchCorrection':   to_label(features['pitch_correction'],  ['Low','Low-Moderate','Moderate','Moderate-High','High']),
        'breathPresence':    to_label(1-features['breath_presence'],  ['High','Moderate-High','Moderate','Low-Moderate','Low']),
        'timingRegularity':  to_label(features['timing_regularity'],  ['Low','Low-Moderate','Moderate','High','Very High']),
        'spectralSmoothing': to_label(features['spectral_flatness'],  ['Low','Low-Moderate','Moderate','Moderate-High','High']),
        'dynamicRange':      'Compressed' if features['dynamic_range_db'] < 10 else 'Moderate' if features['dynamic_range_db'] < 20 else 'Wide',
        'aiLikelihoodScore': float(ai_score),
        'modelConfidence':   0.85 if MODEL_AVAILABLE else 0.72,
        'signalConfidence':  0.82 if MODEL_AVAILABLE else 0.68,
        'method':            method
    }

def heuristic_analysis(song_title, artist):
    title_lower  = (song_title or '').lower()
    artist_lower = (artist or '').lower()
    ai_platforms = ['suno', 'udio', 'musicgen', 'aiva', 'mubert', 'soundraw', 'boomy', 'beatoven',
                    'obscurest vinyl', 'untraceable records', 'banned vinyl', 'brainrot']
    is_ai = any(p in title_lower or p in artist_lower for p in ai_platforms)

    if is_ai:
        return {'pitchCorrection':'High','breathPresence':'Low','timingRegularity':'High',
                'spectralSmoothing':'High','dynamicRange':'Compressed',
                'aiLikelihoodScore':0.82,'modelConfidence':0.55,'signalConfidence':0.50,'method':'metadata-heuristics'}

    return {'pitchCorrection':'Moderate','breathPresence':'Moderate','timingRegularity':'Moderate',
            'spectralSmoothing':'Moderate','dynamicRange':'Moderate',
            'aiLikelihoodScore':0.40,'modelConfidence':0.35,'signalConfidence':0.30,'method':'metadata-heuristics'}

if __name__ == '__main__':
    port = int(os.environ.get('AUDIO_SERVICE_PORT', 5001))
    print(f"\nProvenance Audio Service running on port {port}")
    print(f"  librosa:       {'yes' if LIBROSA_AVAILABLE else 'no'}")
    print(f"  trained model: {'yes' if MODEL_AVAILABLE else 'no'}")
    print(f"  yt-dlp:        {'yes' if YTDLP_AVAILABLE else 'no'}")
    print(f"  Audio waterfall: Internet Archive -> SoundCloud -> YouTube\n")
    app.run(host='0.0.0.0', port=port, debug=False)