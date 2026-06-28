"""
Provenance Full Dataset Accuracy Test
---------------------------------------
Tests every track in your training data folders against the live API.
250 human + 250 AI = 500 tracks sampled, or all if fewer available.
Results saved to CSV in your PROVENANCE TRAINING TRACKS folder.
"""

import os
import re
import csv
import time
import random
import requests
from datetime import datetime

PROVENANCE_API_URL = "https://provenance-production-3c25.up.railway.app/api/trace"
TRAINING_DATA      = r"C:\PROVENANCE TRAINING TRACKS\TRAINING DATA"
HUMAN_DIR          = os.path.join(TRAINING_DATA, "human-tracks")
AI_DIR             = os.path.join(TRAINING_DATA, "ai-tracks")

def filename_to_query(filename):
    name = os.path.splitext(filename)[0]
    name = re.sub(r'_spotdown\.org.*$', '', name, flags=re.IGNORECASE)
    name = re.sub(r'_\d+$', '', name)
    name = re.sub(r'[\[\(].*?[\]\)]', '', name)
    name = re.sub(r'[_]+', ' ', name)
    name = name.strip(' -.,')
    return name.strip()

def collect_human_tracks():
    tracks = []
    if not os.path.exists(HUMAN_DIR):
        print(f"Human tracks folder not found: {HUMAN_DIR}")
        return tracks
    for genre in os.listdir(HUMAN_DIR):
        genre_path = os.path.join(HUMAN_DIR, genre)
        if not os.path.isdir(genre_path):
            continue
        for fname in os.listdir(genre_path):
            if fname.lower().endswith('.mp3'):
                query = filename_to_query(fname)
                if len(query) > 3:
                    tracks.append({
                        'query': query,
                        'filename': fname,
                        'genre': genre,
                        'expected': 'human'
                    })
    return tracks

def collect_ai_tracks():
    tracks = []
    if not os.path.exists(AI_DIR):
        print(f"AI tracks folder not found: {AI_DIR}")
        return tracks
    for fname in os.listdir(AI_DIR):
        if fname.lower().endswith('.mp3'):
            query = filename_to_query(fname)
            if len(query) > 3:
                tracks.append({
                    'query': query,
                    'filename': fname,
                    'genre': 'ai',
                    'expected': 'ai'
                })
    return tracks

def trace_track(query):
    try:
        response = requests.post(
            PROVENANCE_API_URL,
            json={"input": query},
            timeout=45
        )
        if response.status_code == 200:
            return response.json()
        return None
    except Exception:
        return None

def main():
    print("\nProvenance Full Dataset Accuracy Test")
    print(f"API: {PROVENANCE_API_URL}")
    print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    print("Loading track lists...")
    all_human = collect_human_tracks()
    all_ai    = collect_ai_tracks()
    print(f"Found: {len(all_human)} human tracks, {len(all_ai)} AI tracks")

    # Use everything
    random.seed(42)
    combined = all_human + all_ai
    random.shuffle(combined)

    est_minutes = len(combined) * 2.5 / 60
    print(f"Testing all {len(combined)} tracks")
    print(f"Estimated time: {est_minutes:.0f}-{est_minutes * 1.3:.0f} minutes\n")

    results = []
    correct = 0
    errors  = 0
    total   = 0
    start   = datetime.now()

    for i, track in enumerate(combined, 1):
        data = trace_track(track['query'])

        if data is None:
            errors += 1
            results.append({
                'track': track['filename'],
                'query': track['query'],
                'genre': track['genre'],
                'expected': track['expected'],
                'got': 'error',
                'score': '',
                'verdict': '',
                'identified_as': '',
                'correct': 'ERROR'
            })
        else:
            score      = data.get('summary', {}).get('aiLikelihoodScore', 0)
            verdict    = data.get('summary', {}).get('aiVerdict', '')
            identified = f"{data.get('song',{}).get('title','')} - {data.get('song',{}).get('artist','')}"
            got_label  = 'ai' if score >= 0.65 else 'human'
            is_correct = got_label == track['expected']

            if is_correct:
                correct += 1
            total += 1

            results.append({
                'track': track['filename'],
                'query': track['query'],
                'genre': track['genre'],
                'expected': track['expected'],
                'got': got_label,
                'score': round(score, 3),
                'verdict': verdict,
                'identified_as': identified,
                'correct': 'YES' if is_correct else 'NO'
            })

        if i % 25 == 0:
            elapsed   = (datetime.now() - start).seconds / 60
            remaining = (len(combined) - i) * 2.5 / 60
            accuracy  = correct / total * 100 if total > 0 else 0
            print(f"  [{i}/{len(combined)}] {correct}/{total} correct = {accuracy:.1f}% | {errors} errors | ~{remaining:.0f} min left")

        time.sleep(2)

    accuracy = correct / total * 100 if total > 0 else 0

    print(f"\n{'='*60}")
    print(f"  FINAL ACCURACY: {correct}/{total} = {accuracy:.1f}%")
    if errors:
        print(f"  No response (excluded): {errors} tracks")

    human_results = [r for r in results if r['expected'] == 'human' and r['correct'] != 'ERROR']
    ai_results    = [r for r in results if r['expected'] == 'ai'    and r['correct'] != 'ERROR']
    human_correct = sum(1 for r in human_results if r['correct'] == 'YES')
    ai_correct    = sum(1 for r in ai_results    if r['correct'] == 'YES')

    if human_results:
        print(f"  Human: {human_correct}/{len(human_results)} = {human_correct/len(human_results)*100:.1f}%")
    if ai_results:
        print(f"  AI:    {ai_correct}/{len(ai_results)} = {ai_correct/len(ai_results)*100:.1f}%")

    by_genre = {}
    for r in human_results:
        g = r['genre']
        if g not in by_genre:
            by_genre[g] = {'correct': 0, 'total': 0}
        if r['correct'] == 'YES':
            by_genre[g]['correct'] += 1
        by_genre[g]['total'] += 1

    if by_genre:
        print(f"\n  By genre (human tracks):")
        for genre, counts in sorted(by_genre.items()):
            pct = counts['correct'] / counts['total'] * 100 if counts['total'] > 0 else 0
            bar = '#' * int(pct / 10) + '.' * (10 - int(pct / 10))
            print(f"    {genre:<15} [{bar}] {counts['correct']}/{counts['total']} ({pct:.0f}%)")

    print(f"{'='*60}\n")

    csv_path = os.path.join(
        r"C:\PROVENANCE TRAINING TRACKS",
        f"accuracy_full_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
    )
    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'track','query','genre','expected','got',
            'score','verdict','identified_as','correct'
        ])
        writer.writeheader()
        writer.writerows(results)

    print(f"Results saved to:\n  {csv_path}")
    input("\nPress Enter to close...")

if __name__ == "__main__":
    main()