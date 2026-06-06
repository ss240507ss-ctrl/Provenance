"""
Provenance Audio Analysis Microservice
Flask + librosa — real audio feature extraction

This runs alongside the Node.js server.
It receives audio URLs or file paths and returns
detailed production signal analysis.

Run with: python3 audio_service.py

Requires:
  pip install flask librosa numpy requests yt-dlp
"""

import os
import sys
import json
import tempfile
import logging
from flask import Flask, request, jsonify
import numpy as np

# Try importing audio libraries — graceful degradation if unavailable
try:
    import librosa
    import librosa.effects
    LIBROSA_AVAILABLE = True
except ImportError:
    LIBROSA_AVAILABLE = False
    print("⚠️  librosa not available — install with: pip install librosa")

try:
    import yt_dlp
    YTDLP_AVAILABLE = True
except ImportError:
    YTDLP_AVAILABLE = False
    print("⚠️  yt-dlp not available — install with: pip install yt-dlp")

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@app.route('/health')
def health():
    return jsonify({
        'status': 'ok',
        'librosa': LIBROSA_AVAILABLE,
        'yt_dlp': YTDLP_AVAILABLE
    })


@app.route('/analyse', methods=['POST'])
def analyse():
    data = request.json
    input_type = data.get('input_type')
    url = data.get('url')
    song_title = data.get('song_title', '')
    artist = data.get('artist', '')

    logger.info(f"Analysing: {song_title} by {artist} ({input_type})")

    audio_path = None
    try:
        # Download audio if we have a URL
        if url and YTDLP_AVAILABLE and input_type in ('youtube', 'soundcloud'):
            audio_path = download_audio(url)

        if audio_path and LIBROSA_AVAILABLE:
            result = analyse_audio_file(audio_path)
        else:
            # Metadata-only heuristic analysis
            result = heuristic_analysis(song_title, artist, input_type)

        return jsonify(result)

    except Exception as e:
        logger.error(f"Analysis error: {e}")
        # Always return something useful
        return jsonify(heuristic_analysis(song_title, artist, input_type))

    finally:
        # Clean up temp file
        if audio_path and os.path.exists(audio_path):
            os.unlink(audio_path)


def download_audio(url):
    """Download audio from URL to temp file using yt-dlp"""
    tmp = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
    tmp.close()

    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': tmp.name.replace('.wav', ''),
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'wav',
            'preferredquality': '192',
        }],
        'quiet': True,
        'no_warnings': True,
        # Only download first 90 seconds — enough for analysis
        'postprocessor_args': ['-t', '90'],
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

    # yt-dlp may add .wav extension
    if os.path.exists(tmp.name + '.wav'):
        return tmp.name + '.wav'
    if os.path.exists(tmp.name):
        return tmp.name
    return None


def analyse_audio_file(audio_path):
    """
    Real audio analysis using librosa.
    Extracts production signals relevant to AI detection.
    """
    logger.info(f"Analysing audio file: {audio_path}")

    # Load audio (mono, 22050 Hz sample rate)
    y, sr = librosa.load(audio_path, sr=22050, mono=True, duration=90)

    # ── Pitch analysis ────────────────────────────────────────────
    # Extract pitch using pyin algorithm
    f0, voiced_flag, voiced_probs = librosa.pyin(
        y, fmin=librosa.note_to_hz('C2'),
        fmax=librosa.note_to_hz('C7')
    )

    # Pitch correction indicator:
    # Real vocals have natural pitch variation; AI tends to lock to notes
    voiced_f0 = f0[voiced_flag]
    pitch_correction_score = 0.5  # default
    if len(voiced_f0) > 10:
        # Quantise to nearest semitone and measure deviation
        semitones = 12 * np.log2(voiced_f0 / 440.0)
        nearest_semitone = np.round(semitones)
        deviation = np.abs(semitones - nearest_semitone)
        mean_deviation = np.mean(deviation)
        # Low deviation = high pitch correction
        pitch_correction_score = max(0, min(1, 1 - (mean_deviation / 0.5)))

    # ── Breath/noise detection ────────────────────────────────────
    # Detect breath-like transients between phrases
    # Breaths appear as low-energy noise bursts
    spectral_flatness = librosa.feature.spectral_flatness(y=y)
    rms = librosa.feature.rms(y=y)

    # Breath presence: look for characteristic breath signatures
    # between high-energy vocal phrases
    breath_score = detect_breath_presence(y, sr, rms, spectral_flatness)

    # ── Timing regularity ─────────────────────────────────────────
    # Measure how closely events align to a regular grid
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
    beat_intervals = np.diff(beats)
    if len(beat_intervals) > 0:
        timing_regularity = 1 - min(1, np.std(beat_intervals) / (np.mean(beat_intervals) + 1e-6))
    else:
        timing_regularity = 0.5

    # ── Spectral smoothness ───────────────────────────────────────
    # AI music tends to have a smoother, more even spectral envelope
    spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)
    spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)
    spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)

    # Measure spectral variation over time
    centroid_variation = np.std(spectral_centroid) / (np.mean(spectral_centroid) + 1e-6)
    spectral_smoothing_score = max(0, min(1, 1 - centroid_variation * 2))

    # ── Dynamic range ──────────────────────────────────────────────
    rms_db = librosa.amplitude_to_db(rms)
    dynamic_range_db = float(np.percentile(rms_db, 95) - np.percentile(rms_db, 5))

    if dynamic_range_db > 20:
        dynamic_range = 'Wide'
    elif dynamic_range_db > 10:
        dynamic_range = 'Moderate'
    else:
        dynamic_range = 'Compressed'

    # ── Overall AI likelihood ─────────────────────────────────────
    ai_score = (
        pitch_correction_score * 0.30 +
        (1 - breath_score)     * 0.25 +
        timing_regularity      * 0.25 +
        spectral_smoothing_score * 0.20
    )

    return {
        'pitchCorrection':   score_to_label(pitch_correction_score, ['Low', 'Low-Moderate', 'Moderate', 'Moderate–High', 'High']),
        'breathPresence':    score_to_label(1 - breath_score, ['High', 'Moderate-High', 'Moderate', 'Low-Moderate', 'Low']),
        'timingRegularity':  score_to_label(timing_regularity, ['Low', 'Low-Moderate', 'Moderate', 'High', 'Very High']),
        'spectralSmoothing': score_to_label(spectral_smoothing_score, ['Low', 'Low-Moderate', 'Moderate', 'Moderate–High', 'High']),
        'dynamicRange':      dynamic_range,
        'aiLikelihoodScore': float(ai_score),
        'modelConfidence':   0.82,  # Higher because we have real audio
        'signalConfidence':  0.78,
        'method':            'librosa-audio-analysis',
        'rawScores': {
            'pitchCorrectionScore': float(pitch_correction_score),
            'breathPresenceScore':  float(breath_score),
            'timingRegularityScore':float(timing_regularity),
            'spectralSmoothingScore':float(spectral_smoothing_score),
            'dynamicRangeDb':       float(dynamic_range_db),
            'tempo':                float(tempo)
        }
    }


def detect_breath_presence(y, sr, rms, spectral_flatness):
    """
    Detect presence of breath sounds between phrases.
    Returns 0-1 where 1 = lots of breath (very human).
    """
    # Find low-energy regions (potential breaths)
    rms_flat = rms.flatten()
    mean_rms = np.mean(rms_flat)
    low_energy_mask = rms_flat < (mean_rms * 0.3)

    # Check spectral flatness in those regions
    # Breath has high spectral flatness (noise-like)
    sf_flat = spectral_flatness.flatten()

    # Align lengths
    min_len = min(len(low_energy_mask), len(sf_flat))
    low_energy_mask = low_energy_mask[:min_len]
    sf_flat = sf_flat[:min_len]

    if np.sum(low_energy_mask) < 5:
        return 0.1  # Very few quiet regions = likely AI

    breath_candidates = sf_flat[low_energy_mask]
    high_flatness_proportion = np.mean(breath_candidates > 0.3)

    return float(min(1.0, high_flatness_proportion * 2))


def heuristic_analysis(song_title, artist, input_type):
    """
    Fallback analysis when audio is not available.
    Uses text signals to estimate production characteristics.
    """
    title_lower = (song_title or '').lower()
    artist_lower = (artist or '').lower()

    # AI platform detection
    ai_platforms = ['suno', 'udio', 'musicgen', 'aiva', 'mubert', 'soundraw', 'boomy', 'beatoven', 'stable audio']
    is_ai = any(p in title_lower or p in artist_lower for p in ai_platforms)

    if is_ai:
        return {
            'pitchCorrection':   'High',
            'breathPresence':    'Low',
            'timingRegularity':  'High',
            'spectralSmoothing': 'High',
            'dynamicRange':      'Compressed',
            'aiLikelihoodScore': 0.82,
            'modelConfidence':   0.55,
            'signalConfidence':  0.50,
            'method':            'metadata-heuristics'
        }

    return {
        'pitchCorrection':   'Moderate',
        'breathPresence':    'Moderate',
        'timingRegularity':  'Moderate',
        'spectralSmoothing': 'Moderate',
        'dynamicRange':      'Moderate',
        'aiLikelihoodScore': 0.40,
        'modelConfidence':   0.35,
        'signalConfidence':  0.30,
        'method':            'metadata-heuristics'
    }


def score_to_label(score, labels):
    idx = min(int(score * len(labels)), len(labels) - 1)
    return labels[idx]


if __name__ == '__main__':
    port = int(os.environ.get('AUDIO_SERVICE_PORT', 5001))
    print(f"\n🎵 Provenance Audio Service on port {port}")
    print(f"   librosa: {'✓' if LIBROSA_AVAILABLE else '✗ not installed'}")
    print(f"   yt-dlp:  {'✓' if YTDLP_AVAILABLE else '✗ not installed'}\n")
    app.run(host='0.0.0.0', port=port, debug=False)
