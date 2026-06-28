"""
Provenance Fingerprint Database Builder
-----------------------------------------
Extracts acoustic features from every track in your training data
and saves them to a JSON database that the Railway backend can use
to make direct audio-based predictions without needing to re-fetch
audio from the internet.

Run this ONCE (takes ~45-60 min for 1255 tracks), then upload the
resulting fingerprint_db.json to Railway.

Usage:
  python build_fingerprint_db.py
"""

import os
import re
import json
import time
import numpy as np

try:
    import librosa
except ImportError:
    print("librosa not installed. Run: pip install librosa")
    exit(1)

TRAINING_DATA   = r"C:\PROVENANCE TRAINING TRACKS\TRAINING DATA"
HUMAN_DIR       = os.path.join(TRAINING_DATA, "human-tracks")
AI_DIR          = os.path.join(TRAINING_DATA, "ai-tracks")
OUTPUT_PATH     = r"C:\PROVENANCE TRAINING TRACKS\fingerprint_db.json"
INTERIM_PATH    = r"C:\PROVENANCE TRAINING TRACKS\fingerprint_db_interim.json"

FEATURES = [
    'tempo', 'timing_regularity', 'pitch_correction', 'breath_presence',
    'dynamic_range_db', 'spectral_centroid', 'spectral_bandwidth',
    'spectral_rolloff', 'spectral_flatness', 'spectral_variation',
    'zero_crossing_rate', 'rms_mean', 'rms_std',
    'mfcc_1', 'mfcc_2', 'mfcc_3', 'mfcc_4', 'mfcc_5'
]

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
        timing_regularity = 1.0 - min(1.0, float(np.std(beat_intervals)) / (float(np.mean(beat_intervals)) + 1e-6)) if len(beat_intervals) > 0 else 0.5

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
        return None

def filename_to_search_key(filename):
    """
    Creates a normalized search key from the filename that can be
    matched against what Spotify/AudD returns for a song title + artist.
    Strips download tool suffixes, punctuation, brackets etc.
    """
    name = os.path.splitext(filename)[0]
    name = re.sub(r'_spotdown\.org.*$', '', name, flags=re.IGNORECASE)
    name = re.sub(r'_\d+$', '', name)
    name = re.sub(r'[\[\(].*?[\]\)]', '', name)
    name = re.sub(r'[_]+', ' ', name)
    name = re.sub(r'[^\w\s]', '', name)
    name = name.lower().strip()
    return name

def load_interim():
    if os.path.exists(INTERIM_PATH):
        with open(INTERIM_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_interim(db):
    with open(INTERIM_PATH, 'w', encoding='utf-8') as f:
        json.dump(db, f)

def collect_files():
    files = []
    if os.path.exists(HUMAN_DIR):
        for genre in os.listdir(HUMAN_DIR):
            genre_path = os.path.join(HUMAN_DIR, genre)
            if os.path.isdir(genre_path):
                for fname in os.listdir(genre_path):
                    if fname.lower().endswith('.mp3'):
                        files.append({
                            'path': os.path.join(genre_path, fname),
                            'filename': fname,
                            'genre': genre,
                            'label': 'human',
                            'key': filename_to_search_key(fname)
                        })
    if os.path.exists(AI_DIR):
        for fname in os.listdir(AI_DIR):
            if fname.lower().endswith('.mp3'):
                files.append({
                    'path': os.path.join(AI_DIR, fname),
                    'filename': fname,
                    'genre': 'ai',
                    'label': 'ai',
                    'key': filename_to_search_key(fname)
                })
    return files

def main():
    print("\nProvenance Fingerprint Database Builder")
    print(f"Output: {OUTPUT_PATH}\n")

    all_files = collect_files()
    print(f"Found {len(all_files)} audio files ({sum(1 for f in all_files if f['label']=='human')} human, {sum(1 for f in all_files if f['label']=='ai')} AI)\n")

    # Load any previously processed files so we can resume if interrupted
    db = load_interim()
    already_done = set(db.keys())
    print(f"Already processed: {len(already_done)} files (resuming)\n" if already_done else "Starting fresh\n")

    processed = 0
    errors    = 0
    start     = time.time()

    for i, file_info in enumerate(all_files, 1):
        search_key = file_info['key']

        if search_key in already_done:
            continue

        features = extract_features(file_info['path'])

        if features is None:
            errors += 1
        else:
            db[search_key] = {
                'label':    file_info['label'],
                'genre':    file_info['genre'],
                'filename': file_info['filename'],
                'features': features
            }
            processed += 1

        # Save interim every 50 tracks
        if processed % 50 == 0 and processed > 0:
            save_interim(db)
            elapsed  = time.time() - start
            rate     = processed / elapsed
            remaining = (len(all_files) - i) / rate / 60 if rate > 0 else 0
            print(f"  [{i}/{len(all_files)}] {processed} processed, {errors} errors | ~{remaining:.0f} min left")

    # Save final database
    save_interim(db)
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=2)

    human_count = sum(1 for v in db.values() if v['label'] == 'human')
    ai_count    = sum(1 for v in db.values() if v['label'] == 'ai')

    print(f"\n{'='*55}")
    print(f"  Database built: {len(db)} tracks")
    print(f"  Human: {human_count} | AI: {ai_count}")
    print(f"  Errors/skipped: {errors}")
    print(f"  Saved to: {OUTPUT_PATH}")
    print(f"{'='*55}")
    print("\nNext step: upload fingerprint_db.json to your Railway")
    print("Python service at provenance-backend/python-service/")
    input("\nPress Enter to close...")

if __name__ == "__main__":
    main()
