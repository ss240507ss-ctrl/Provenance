"""
Provenance Accuracy Test
-------------------------
Runs a predefined set of known tracks against the live Provenance API
and logs the results to a CSV for analysis.

Usage:
  python accuracy_test.py

Results saved to: accuracy_results.csv

Update PROVENANCE_API_URL below if your Railway URL changes.
"""

import requests
import csv
import time
import json
from datetime import datetime

PROVENANCE_API_URL = "https://provenance-production-3c25.up.railway.app/api/trace"

# ── Known test tracks ─────────────────────────────────────────────────────
# Format: (spotify_url, expected_label, genre, notes)
# expected_label: 'ai' or 'human'
TEST_TRACKS = [
    # ── Confirmed AI ──────────────────────────────────────────────────────
    ("https://open.spotify.com/track/3WMj8moIAXJhHsyLaqIIHl", "ai", "rnb-soul",    "Sienna Rose - Into the Blue (confirmed AI)"),
    ("https://open.spotify.com/track/2MGd5GGkV6FB9PqrUVWJNt", "ai", "rnb-soul",    "L$30 - Bahamas Blue (MJ voice clone)"),

    # ── Confirmed Human ───────────────────────────────────────────────────
    ("https://open.spotify.com/track/7s1k6Uv0bgTn9RgOqVLRMT", "human", "rnb-soul",  "Sienna Rose - Where Your Warmth Begins (control)"),
    ("https://open.spotify.com/track/3dYD57lRAFysGfBRFCzXcC", "human", "amapiano",  "Uncle Waffles - Zenzele feat. Royal MusiQ"),
    ("https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT", "human", "hiphop",    "Eminem - Lose Yourself"),
    ("https://open.spotify.com/track/5Q0Nhxo0l2bP3pNjpGJwV1", "human", "hiphop",    "Jay-Z - 99 Problems"),
    ("https://open.spotify.com/track/0pqnGHJpmpxLKifKRmU6WP", "human", "rnb-soul",  "Jazmine Sullivan - BPW"),
    ("https://open.spotify.com/track/0ikz6tENMONtK6qGkOrU3c", "human", "hiphop",    "Eve - Let Me Blow Ya Mind"),
    ("https://open.spotify.com/track/2XU9yMYbj5MYXM1mh0nqvO", "human", "reggae",    "Bob Marley - No Woman No Cry"),
    ("https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT", "human", "neo-soul",  "D'Angelo - Brown Sugar"),
    ("https://open.spotify.com/track/5Q0Nhxo0l2bP3pNjpGJwV1", "human", "jazz",      "Miles Davis - So What"),
    ("https://open.spotify.com/track/6K4t31amVTZDgR3sKmwUJJ", "human", "blues",     "B.B. King - The Thrill Is Gone"),
    ("https://open.spotify.com/track/7lQ8MOhq6IN2w8EYcFNSUk", "human", "pop",       "Adele - Hello"),
    ("https://open.spotify.com/track/2374M0fQpWi3dLnB54qaLX", "human", "rock",      "Queen - Bohemian Rhapsody"),
    ("https://open.spotify.com/track/5ChkMS8OtdzJeqyybCc9R5", "human", "folk-country", "Johnny Cash - Ring of Fire"),
    ("https://open.spotify.com/track/5uqCQaDpnuNxKDOJNdUGEE", "human", "gospel",    "Kirk Franklin - Stomp"),
    ("https://open.spotify.com/track/2374M0fQpWi3dLnB54qaLX", "human", "electronic", "Daft Punk - Get Lucky"),
    ("https://open.spotify.com/track/0RiRZpuVRbi7oqHpOA0D9T", "human", "afrobeats", "Burna Boy - Last Last"),
    ("https://open.spotify.com/track/3dYD57lRAFysGfBRFCzXcC", "human", "amapiano",  "Kabza De Small - Sponono"),
    ("https://open.spotify.com/track/2374M0fQpWi3dLnB54qaLX", "human", "latin",     "Bad Bunny - Tití Me Preguntó"),
]

def trace_track(spotify_url):
    try:
        response = requests.post(
            PROVENANCE_API_URL,
            json={"input": spotify_url},
            timeout=30
        )
        if response.status_code == 200:
            return response.json()
        return None
    except Exception as e:
        print(f"  ERROR: {e}")
        return None

def main():
    print(f"\nProvenance Accuracy Test")
    print(f"API: {PROVENANCE_API_URL}")
    print(f"Tracks: {len(TEST_TRACKS)}")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    results = []
    correct = 0
    total = 0

    for i, (url, expected, genre, note) in enumerate(TEST_TRACKS, 1):
        print(f"[{i}/{len(TEST_TRACKS)}] {note}")
        data = trace_track(url)

        if data is None:
            print(f"  FAILED — no response")
            results.append({
                'track': note, 'genre': genre, 'expected': expected,
                'got': 'error', 'score': '', 'verdict': '',
                'correct': 'ERROR', 'url': url
            })
            continue

        score = data.get('summary', {}).get('aiLikelihoodScore', 0)
        verdict = data.get('summary', {}).get('aiVerdict', '')
        got_label = 'ai' if score >= 0.65 else 'human'
        is_correct = got_label == expected

        if is_correct:
            correct += 1
        total += 1

        status = '✓' if is_correct else '✗'
        print(f"  {status} Expected: {expected} | Got: {got_label} | Score: {score:.2f} | {verdict}")

        results.append({
            'track': note, 'genre': genre, 'expected': expected,
            'got': got_label, 'score': round(score, 3),
            'verdict': verdict, 'correct': 'YES' if is_correct else 'NO',
            'url': url
        })

        time.sleep(1.5)  # Be respectful to the API

    # ── Summary ──────────────────────────────────────────────────────────
    accuracy = correct / total * 100 if total > 0 else 0
    print(f"\n{'='*55}")
    print(f"  ACCURACY: {correct}/{total} = {accuracy:.1f}%")

    by_genre = {}
    for r in results:
        g = r['genre']
        if g not in by_genre:
            by_genre[g] = {'correct': 0, 'total': 0}
        if r['correct'] == 'YES':
            by_genre[g]['correct'] += 1
        if r['correct'] != 'ERROR':
            by_genre[g]['total'] += 1

    print(f"\n  By genre:")
    for genre, counts in sorted(by_genre.items()):
        pct = counts['correct'] / counts['total'] * 100 if counts['total'] > 0 else 0
        print(f"    {genre}: {counts['correct']}/{counts['total']} = {pct:.0f}%")
    print(f"{'='*55}\n")

    # ── Save CSV ──────────────────────────────────────────────────────────
    csv_path = f"accuracy_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['track', 'genre', 'expected', 'got', 'score', 'verdict', 'correct', 'url'])
        writer.writeheader()
        writer.writerows(results)

    print(f"Results saved to: {csv_path}")
    input("\nPress Enter to close...")

if __name__ == "__main__":
    main()
