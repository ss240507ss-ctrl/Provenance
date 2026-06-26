"""
Provenance Accuracy Test v2
----------------------------
Tests known tracks against the live Provenance API and logs results.
Spotify URLs verified correct for each track.
"""

import requests
import csv
import time
from datetime import datetime

PROVENANCE_API_URL = "https://provenance-production-3c25.up.railway.app/api/trace"

TEST_TRACKS = [
    # ── Confirmed AI ──────────────────────────────────────────────────────
    ("https://open.spotify.com/track/3WMj8moIAXJhHsyLaqIIHl", "ai",    "rnb-soul",     "Sienna Rose - Into the Blue (confirmed AI)"),
    ("https://open.spotify.com/track/0RBmMbjpSlFKxTKcHhAInB", "ai",    "rnb-soul",     "Sienna Rose - Where Your Warmth Begins (confirmed AI)"),

    # ── Confirmed Human ───────────────────────────────────────────────────
    # Hip-hop
    ("https://open.spotify.com/track/5Z01UMMf7V1o0MzF86s6WJ", "human", "hiphop",       "Eminem - Lose Yourself"),
    ("https://open.spotify.com/track/7oHXUMDmZBnrFKTYfpBTaQ", "human", "hiphop",       "Jay-Z - 99 Problems"),
    ("https://open.spotify.com/track/5ghIJDpPoe3CfHMGu71E6T", "human", "hiphop",       "Eve - Let Me Blow Ya Mind"),
    # R&B / Soul
    ("https://open.spotify.com/track/0pqnGHJpmpxLKifKRmU6WP", "human", "rnb-soul",     "Jazmine Sullivan - BPW"),
    ("https://open.spotify.com/track/6KuHuzkHh6MXwHNVUIm7G2", "human", "neo-soul",     "D'Angelo - Brown Sugar"),
    ("https://open.spotify.com/track/1bGBTYjuBHxFkHVSJhMjnx", "human", "rnb-soul",     "Marvin Gaye - Sexual Healing"),
    # Amapiano / Afrobeats
    ("https://open.spotify.com/track/5DfExdNEjBLbSRNFZAHsLG", "human", "amapiano",     "Uncle Waffles - Zenzele"),
    ("https://open.spotify.com/track/5RGglCTkSKMRJpAhlXjBGe", "human", "afrobeats",    "Burna Boy - Last Last"),
    ("https://open.spotify.com/track/3oKIPbkfcQKJJHmRKW1VqL", "human", "afrobeats",    "Wizkid - Essence feat. Tems"),
    # Reggae
    ("https://open.spotify.com/track/54flyrjcdnQdco7300avMV", "human", "reggae",        "Bob Marley - No Woman No Cry"),
    ("https://open.spotify.com/track/6QgjcU0zLnzq5OrUoSZ3OK", "human", "reggae",        "Sean Paul - Temperature"),
    # Blues / Jazz
    ("https://open.spotify.com/track/6FJxoadUE4JNVwWHghBwnb", "human", "jazz",          "Miles Davis - So What"),
    ("https://open.spotify.com/track/75JFxkI2RXiU7L9VmCAV6T", "human", "blues",         "Muddy Waters - Mannish Boy"),
    # Pop / Rock / Electronic
    ("https://open.spotify.com/track/4aebBr4JAihzJQR0CiIZJv", "human", "pop",           "Adele - Hello"),
    ("https://open.spotify.com/track/7tFiyTwD0nx5a1eklYtX2J", "human", "rock",          "Queen - Bohemian Rhapsody"),
    ("https://open.spotify.com/track/2gMXnyrvkj4QJaFNMFTNRP", "human", "electronic",    "Daft Punk - Get Lucky"),
    # Gospel / Folk / Latin
    ("https://open.spotify.com/track/5ChkMS8OtdzJeqyybCc9R5", "human", "folk-country",  "Johnny Cash - Ring of Fire"),
    ("https://open.spotify.com/track/7oGJHhAEDiCBU4qnFKXuMG", "human", "latin",         "Bad Bunny - Tití Me Preguntó"),
]

def trace_track(spotify_url):
    try:
        response = requests.post(
            PROVENANCE_API_URL,
            json={"input": spotify_url},
            timeout=45
        )
        if response.status_code == 200:
            return response.json()
        print(f"  HTTP {response.status_code}")
        return None
    except Exception as e:
        print(f"  ERROR: {e}")
        return None

def main():
    print(f"\nProvenance Accuracy Test v2")
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

        score   = data.get('summary', {}).get('aiLikelihoodScore', 0)
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

        time.sleep(2)

    accuracy = correct / total * 100 if total > 0 else 0
    errors   = sum(1 for r in results if r['correct'] == 'ERROR')

    print(f"\n{'='*55}")
    print(f"  ACCURACY: {correct}/{total} = {accuracy:.1f}%")
    if errors:
        print(f"  FAILED (no response): {errors} tracks — check Spotify URLs")

    by_genre = {}
    for r in results:
        if r['correct'] == 'ERROR':
            continue
        g = r['genre']
        if g not in by_genre:
            by_genre[g] = {'correct': 0, 'total': 0}
        if r['correct'] == 'YES':
            by_genre[g]['correct'] += 1
        by_genre[g]['total'] += 1

    print(f"\n  By genre:")
    for genre, counts in sorted(by_genre.items()):
        pct = counts['correct'] / counts['total'] * 100 if counts['total'] > 0 else 0
        bar = '█' * int(pct / 10) + '░' * (10 - int(pct / 10))
        print(f"    {genre:<15} {bar} {counts['correct']}/{counts['total']} ({pct:.0f}%)")
    print(f"{'='*55}\n")

    csv_path = f"accuracy_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=['track','genre','expected','got','score','verdict','correct','url'])
        writer.writeheader()
        writer.writerows(results)

    print(f"Results saved to: {csv_path}")
    input("\nPress Enter to close...")

if __name__ == "__main__":
    main()