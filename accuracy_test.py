"""
Provenance Accuracy Test v3
----------------------------
Uses search queries instead of Spotify URLs to avoid region-locking
and URL validity issues. Matches how real users interact with the app.
"""

import requests
import csv
import time
from datetime import datetime

PROVENANCE_API_URL = "https://provenance-production-3c25.up.railway.app/api/trace"

TEST_TRACKS = [
    # ── Confirmed AI ──────────────────────────────────────────────────────
    ("Into the Blue Sienna Rose",           "ai",    "rnb-soul",    "Sienna Rose - Into the Blue"),
    ("Where Your Warmth Begins Sienna Rose","ai",    "rnb-soul",    "Sienna Rose - Where Your Warmth Begins"),
    ("Quit Jizzin Obscurest Vinyl",         "ai",    "rnb-soul",    "Obscurest Vinyl - confirmed AI"),

    # ── Confirmed Human ───────────────────────────────────────────────────
    # Hip-hop
    ("Lose Yourself Eminem",                "human", "hiphop",      "Eminem - Lose Yourself"),
    ("99 Problems Jay-Z",                   "human", "hiphop",      "Jay-Z - 99 Problems"),
    ("Let Me Blow Ya Mind Eve",             "human", "hiphop",      "Eve - Let Me Blow Ya Mind"),
    ("HUMBLE Kendrick Lamar",               "human", "hiphop",      "Kendrick Lamar - HUMBLE"),
    # R&B / Soul / Neo-soul
    ("BPW Jazmine Sullivan",                "human", "rnb-soul",    "Jazmine Sullivan - BPW"),
    ("Brown Sugar D Angelo",                "human", "neo-soul",    "D'Angelo - Brown Sugar"),
    ("Sexual Healing Marvin Gaye",          "human", "rnb-soul",    "Marvin Gaye - Sexual Healing"),
    ("Crashes Into Me Snoh Aalegra",        "human", "rnb-soul",    "Snoh Aalegra - Crashes Into Me"),
    # Amapiano / Afrobeats
    ("Zenzele Uncle Waffles",               "human", "amapiano",    "Uncle Waffles - Zenzele"),
    ("Last Last Burna Boy",                 "human", "afrobeats",   "Burna Boy - Last Last"),
    ("Essence Wizkid Tems",                 "human", "afrobeats",   "Wizkid - Essence"),
    ("John Vuli Gate Mapara A Jazz",        "human", "amapiano",    "Mapara A Jazz - John Vuli Gate"),
    # Reggae / Dancehall
    ("No Woman No Cry Bob Marley",          "human", "reggae",      "Bob Marley - No Woman No Cry"),
    ("Temperature Sean Paul",               "human", "reggae",      "Sean Paul - Temperature"),
    # Blues / Jazz
    ("So What Miles Davis",                 "human", "jazz",        "Miles Davis - So What"),
    ("The Thrill Is Gone BB King",          "human", "blues",       "B.B. King - The Thrill Is Gone"),
    ("Mannish Boy Muddy Waters",            "human", "blues",       "Muddy Waters - Mannish Boy"),
    # Pop / Rock / Electronic
    ("Hello Adele",                         "human", "pop",         "Adele - Hello"),
    ("Bohemian Rhapsody Queen",             "human", "rock",        "Queen - Bohemian Rhapsody"),
    ("Get Lucky Daft Punk",                 "human", "electronic",  "Daft Punk - Get Lucky"),
    ("Smells Like Teen Spirit Nirvana",     "human", "rock",        "Nirvana - Smells Like Teen Spirit"),
    # Gospel / Folk / Latin
    ("Ring of Fire Johnny Cash",            "human", "folk-country","Johnny Cash - Ring of Fire"),
    ("Ti Ti Me Pregunto Bad Bunny",         "human", "latin",       "Bad Bunny - Tití Me Preguntó"),
    ("Aye Ayy Ayy Shakira",                 "human", "latin",       "Shakira - Hips Don't Lie"),
]

def trace_track(query):
    try:
        response = requests.post(
            PROVENANCE_API_URL,
            json={"input": query},
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
    print(f"\nProvenance Accuracy Test v3")
    print(f"API: {PROVENANCE_API_URL}")
    print(f"Tracks: {len(TEST_TRACKS)}")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    results = []
    correct = 0
    total   = 0
    errors  = 0

    for i, (query, expected, genre, note) in enumerate(TEST_TRACKS, 1):
        print(f"[{i}/{len(TEST_TRACKS)}] {note}")
        data = trace_track(query)

        if data is None:
            print(f"  FAILED — no response")
            errors += 1
            results.append({
                'track': note, 'genre': genre, 'expected': expected,
                'got': 'error', 'score': '', 'verdict': '',
                'identified_as': '', 'correct': 'ERROR', 'query': query
            })
            continue

        score        = data.get('summary', {}).get('aiLikelihoodScore', 0)
        verdict      = data.get('summary', {}).get('aiVerdict', '')
        identified   = f"{data.get('song',{}).get('title','')} · {data.get('song',{}).get('artist','')}"
        got_label    = 'ai' if score >= 0.65 else 'human'
        is_correct   = got_label == expected

        if is_correct:
            correct += 1
        total += 1

        status = '✓' if is_correct else '✗'
        print(f"  {status} Identified: {identified}")
        print(f"     Expected: {expected} | Got: {got_label} | Score: {score:.2f} | {verdict}")

        results.append({
            'track': note, 'genre': genre, 'expected': expected,
            'got': got_label, 'score': round(score, 3),
            'verdict': verdict, 'identified_as': identified,
            'correct': 'YES' if is_correct else 'NO', 'query': query
        })

        time.sleep(2)

    accuracy = correct / total * 100 if total > 0 else 0

    print(f"\n{'='*55}")
    print(f"  ACCURACY: {correct}/{total} = {accuracy:.1f}%")
    if errors:
        print(f"  FAILED: {errors} tracks")

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
        writer = csv.DictWriter(f, fieldnames=['track','genre','expected','got','score','verdict','identified_as','correct','query'])
        writer.writeheader()
        writer.writerows(results)

    print(f"Results saved to: {csv_path}")
    input("\nPress Enter to close...")

if __name__ == "__main__":
    main()