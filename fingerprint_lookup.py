"""
Provenance Fingerprint Lookup Module
--------------------------------------
Loaded by the Python audio service on startup. When a song is identified
by title + artist, this module looks up its pre-computed features in the
fingerprint database and returns a direct ML prediction — no audio
download needed.

Place this file alongside app.py in provenance-backend/python-service/
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
    'mfcc_1', 'mfcc_2', 'mfcc_3', 'mfcc_4', 'mfcc_5'
]

# Load database and model on module import
_db     = {}
_model  = None
_scaler = None

def _normalize_key(text):
    """Normalize a title/artist string to a lookup key."""
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def _load():
    global _db, _model, _scaler
    if os.path.exists(DB_PATH):
        with open(DB_PATH, 'r', encoding='utf-8') as f:
            _db = json.load(f)
        print(f"Fingerprint DB loaded: {len(_db)} tracks")
    else:
        print(f"WARNING: fingerprint_db.json not found at {DB_PATH}")

    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        _model  = joblib.load(MODEL_PATH)
        _scaler = joblib.load(SCALER_PATH)
        print("ML model and scaler loaded")
    else:
        print("WARNING: ai_detector.pkl or scaler.pkl not found")

_load()

def lookup(title, artist):
    """
    Look up a track by title + artist in the fingerprint database.
    Returns a prediction dict if found, None if not in database.

    The lookup tries multiple key formats to maximize match rate:
    - "title artist" combined
    - "title" alone
    - "artist title" reversed
    """
    if not _db or not _model or not _scaler:
        return None

    candidates = [
        _normalize_key(f"{title} {artist}"),
        _normalize_key(title),
        _normalize_key(f"{artist} {title}"),
    ]

    matched_entry = None
    for key in candidates:
        if key in _db:
            matched_entry = _db[key]
            break
        # Fuzzy match — check if any db key contains all words from our key
        key_words = set(key.split())
        if len(key_words) >= 2:
            for db_key, entry in _db.items():
                db_words = set(db_key.split())
                if key_words.issubset(db_words) or db_words.issubset(key_words):
                    matched_entry = entry
                    break
        if matched_entry:
            break

    if not matched_entry:
        return None

    # Run the ML model on the stored features
    features = matched_entry['features']
    feature_vector = np.array([[features.get(f, 0.0) for f in FEATURES]])

    try:
        scaled  = _scaler.transform(feature_vector)
        proba   = _model.predict_proba(scaled)[0]
        ai_prob = float(proba[1])  # probability of being AI

        return {
            'found':          True,
            'source':         'fingerprint_db',
            'label':          matched_entry['label'],
            'genre':          matched_entry['genre'],
            'aiProbability':  ai_prob,
            'humanProbability': 1.0 - ai_prob,
            'features':       features,
            'matchedKey':     matched_entry['filename']
        }
    except Exception as e:
        print(f"Fingerprint lookup ML error: {e}")
        return None

def stats():
    """Return basic stats about the loaded database."""
    if not _db:
        return {'loaded': False, 'count': 0}
    human = sum(1 for v in _db.values() if v['label'] == 'human')
    ai    = sum(1 for v in _db.values() if v['label'] == 'ai')
    return {
        'loaded': True,
        'count': len(_db),
        'human': human,
        'ai': ai
    }
