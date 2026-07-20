"""
Provenance Fingerprint Lookup Module (v2 — 34 features)
------------------------------------------------------------
Loaded by the Python audio service on startup. When a song is identified
by title + artist, this module looks up its pre-computed features in the
fingerprint database and returns a direct ML prediction — no audio
download needed.

Place this file alongside audio_service.py in provenance-backend/python-service/
"""

import os
import re
import json
import joblib
import numpy as np

DB_PATH     = os.path.join(os.path.dirname(__file__), 'fingerprint_db.json')
MODEL_PATH  = os.path.join(os.path.dirname(__file__), 'ai_detector.pkl')
SCALER_PATH = os.path.join(os.path.dirname(__file__), 'scaler.pkl')

FEATURES = [
    'tempo', 'timing_regularity', 'pitch_correction', 'breath_presence',
    'dynamic_range_db', 'spectral_centroid', 'spectral_bandwidth',
    'spectral_rolloff', 'spectral_flatness', 'spectral_variation',
    'zero_crossing_rate', 'rms_mean', 'rms_std',
    'mfcc_1', 'mfcc_2', 'mfcc_3', 'mfcc_4', 'mfcc_5',
    'mfcc_6', 'mfcc_7', 'mfcc_8', 'mfcc_9', 'mfcc_10',
    'mfcc_11', 'mfcc_12', 'mfcc_13',
    'harmonic_ratio', 'onset_strength_mean', 'onset_strength_var',
    'spectral_contrast_mean', 'chroma_variation',
    'tempo_stability', 'silence_ratio', 'vibrato_regularity'
]

_db     = {}
_model  = None
_scaler = None

def _normalize_key(text):
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# Build a secondary index by search_key for fast title+artist lookup
_search_index = {}

def _load():
    global _db, _model, _scaler, _search_index
    if os.path.exists(DB_PATH):
        with open(DB_PATH, 'r', encoding='utf-8') as f:
            _db = json.load(f)
        # Build search index from stored search_key and artist+title fields
        for filename_key, entry in _db.items():
            # Index by stored search_key
            sk = entry.get('search_key', '')
            if sk:
                _search_index[sk] = entry
            # Also index by normalized artist+title
            artist = entry.get('artist', '')
            title  = entry.get('title', '')
            if artist and title:
                key1 = _normalize_key(f"{title} {artist}")
                key2 = _normalize_key(f"{artist} {title}")
                _search_index[key1] = entry
                _search_index[key2] = entry
            # Also index by title alone
            if title:
                _search_index[_normalize_key(title)] = entry
        print(f"Fingerprint DB loaded: {len(_db)} tracks ({len(_search_index)} search keys)")
    else:
        print(f"WARNING: fingerprint_db.json not found at {DB_PATH}")

    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        _model  = joblib.load(MODEL_PATH)
        _scaler = joblib.load(SCALER_PATH)
        print("ML model and scaler loaded (v3, 34 features)")
    else:
        print("WARNING: ai_detector.pkl or scaler.pkl not found")

_load()

def lookup(title, artist):
    if not _db or not _model or not _scaler:
        return None

    candidates = [
        _normalize_key(f"{title} {artist}"),
        _normalize_key(f"{artist} {title}"),
        _normalize_key(title),
    ]

    matched_entry = None

    # Check search index first (fast exact match)
    for key in candidates:
        if key in _search_index:
            matched_entry = _search_index[key]
            break

    # Fuzzy fallback — check if candidate words are subset of any search key
    if not matched_entry:
        for key in candidates:
            key_words = set(key.split())
            if len(key_words) >= 2:
                for sk, entry in _search_index.items():
                    sk_words = set(sk.split())
                    if key_words.issubset(sk_words) or sk_words.issubset(key_words):
                        matched_entry = entry
                        break
            if matched_entry:
                break

    if not matched_entry:
        return None

    features = matched_entry['features']
    # Defensive: skip if this entry doesn't have all 34 features
    # (e.g. an old-format entry that wasn't rebuilt with v2 extraction)
    if not all(f in features for f in FEATURES):
        return None

    feature_vector = np.array([[features.get(f, 0.0) for f in FEATURES]])

    try:
        scaled  = _scaler.transform(feature_vector)
        proba   = _model.predict_proba(scaled)[0]
        ai_prob = float(proba[1])

        return {
            'found': True,
            'source': 'fingerprint_db',
            'label': matched_entry['label'],
            'genre': matched_entry['genre'],
            'aiProbability': ai_prob,
            'humanProbability': 1.0 - ai_prob,
            'features': features,
            'matchedKey': matched_entry['filename']
        }
    except Exception as e:
        print(f"Fingerprint lookup ML error: {e}")
        return None

def stats():
    if not _db:
        return {'loaded': False, 'count': 0}
    human = sum(1 for v in _db.values() if v['label'] == 'human')
    ai    = sum(1 for v in _db.values() if v['label'] == 'ai')
    return {'loaded': True, 'count': len(_db), 'human': human, 'ai': ai}
