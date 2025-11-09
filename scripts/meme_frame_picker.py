#!/usr/bin/env python3
"""
meme_frame_picker.py - Chunked version for long videos

Processes videos in 30s chunks, outputting results incrementally.
"""

import argparse
import json
import math
import os
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from typing import List, Tuple

import numpy as np
from tqdm import tqdm
from PIL import Image
import cv2
import torch
import open_clip
import time
import shutil

# Optional OCR
try:
    import pytesseract
    HAS_TESS = True
except Exception:
    HAS_TESS = False


REACTION_PROMPTS = [
    "reaction face, shocked expression, wide eyes",
    "deadpan stare, unimpressed reaction",
    "facepalm reaction, cringe moment",
    "laughing reaction, mouth open, joyful",
    "confused reaction, tilted head, squinting",
    "smirk reaction, sarcastic smile",
    "excited reaction, celebratory gesture",
    "disappointed reaction, sighing look",
    "pointing at screen reaction",
    "sarcastic eyebrow raise, skeptical reaction",
    "cringe wince, awkward reaction",
    "jaw drop, surprised gasp reaction",
    "internal screaming, silent panic reaction",
    "plotting evil grin, mischievous reaction",
    "victory fist pump, triumphant reaction",
    "slow blink disbelief reaction",
    "utter disbelief, hands on head reaction",
    "proud nod, approving reaction",
    "disgusted reaction, scrunched nose",
    "side eye reaction, judging look",
    "mind blown reaction, exploding brain concept",
    "dawning realization, sudden understanding reaction",
    "suppressed laugh, trying not to laugh reaction",
    "overjoyed reaction, ecstatic expression",
    "camera stare reaction, breaking the fourth wall",
    "smug satisfaction reaction",
    "dramatic gasp, theatrical reaction",
    "eye roll reaction, annoyed expression",
    "double take reaction, shocked second look",
    "nervous smile, uncomfortable reaction",
]


@dataclass
class FrameInfo:
    t: float
    path: str
    seg_id: int
    clip_score: float
    face_score: float
    sharp_score: float
    total: float


def run_ffprobe_duration(video_path: str) -> float:
    cmd = ["ffprobe", "-v", "error", "-select_streams", "v:0",
           "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", video_path]
    out = subprocess.check_output(cmd).decode("utf-8").strip()
    return float(out)


def extract_frames(video_path: str, t0: float, t1: float, fps: float, outdir: str) -> List[Tuple[float, str]]:
    os.makedirs(outdir, exist_ok=True)
    segment_dir = tempfile.mkdtemp(prefix="seg_", dir=outdir)
    output_pattern = os.path.join(segment_dir, "frame_%06d.png")
    cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-ss", f"{t0:.3f}", "-to", f"{t1:.3f}",
           "-i", video_path, "-vf", f"fps={fps}", "-q:v", "2", output_pattern]
    subprocess.check_call(cmd)
    frames = sorted([f for f in os.listdir(segment_dir) if f.lower().endswith(".png")])
    return [(t0 + i / fps, os.path.join(segment_dir, fname)) for i, fname in enumerate(frames)]


def normalize01(x: float, lo: float, hi: float) -> float:
    if hi <= lo:
        return 0.0
    return float(np.clip((x - lo) / (hi - lo), 0.0, 1.0))


def sharpness_score(img_bgr: np.ndarray) -> float:
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    lap_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    return normalize01(lap_var, lo=50.0, hi=500.0)


def face_features(img_bgr: np.ndarray, face_cascade) -> Tuple[float, float]:
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(40, 40))
    h, w = gray.shape[:2]
    area_ratio = 0.0
    if len(faces) == 0:
        return 0.0, 0.0
    cx, cy = w / 2.0, h / 2.0
    for (x, y, fw, fh) in faces:
        area = (fw * fh) / float(w * h)
        fx, fy = x + fw / 2.0, y + fh / 2.0
        dist = math.hypot((fx - cx) / w, (fy - cy) / h)
        center_w = 1.0 - min(dist * 2.0, 1.0)
        area_ratio += area * center_w
    return normalize01(area_ratio, 0.0, 0.2), float(len(faces))


def load_clip(device: str = None):
    device = device or ("cuda" if torch.cuda.is_available() else "cpu")
    model, _, preprocess = open_clip.create_model_and_transforms("ViT-B-32", pretrained="openai", device=device)
    tokenizer = open_clip.get_tokenizer("ViT-B-32")
    return model, preprocess, tokenizer, device


@torch.no_grad()
def clip_reaction_score_batch(pil_images: List[Image.Image], model, preprocess, tokenizer, device, prompts: List[str]) -> List[float]:
    if not pil_images:
        return []
    images = torch.stack([preprocess(img) for img in pil_images]).to(device)
    texts = tokenizer(prompts).to(device)
    image_features = model.encode_image(images)
    text_features = model.encode_text(texts)
    image_features = image_features / image_features.norm(dim=-1, keepdim=True)
    text_features = text_features / text_features.norm(dim=-1, keepdim=True)
    sims = (image_features @ text_features.T).float().cpu().numpy()
    sims01 = (sims + 1.0) / 2.0
    return [float(np.max(s)) for s in sims01]


def non_max_suppression(frames: List[FrameInfo], min_gap: float) -> List[FrameInfo]:
    frames_sorted = sorted(frames, key=lambda f: -f.total)
    kept = []
    used_times = []
    for f in frames_sorted:
        if all(abs(f.t - ut) >= min_gap for ut in used_times):
            kept.append(f)
            used_times.append(f.t)
    return kept


def ocr_text_from_frame(bgr: np.ndarray, ocr_roi_height: float) -> str:
    if not HAS_TESS:
        return ""
    h, w = bgr.shape[:2]
    roi_h = max(1, int(h * float(ocr_roi_height)))
    crop = bgr[h - roi_h:h, 0:w]
    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    gray_eq = cv2.equalizeHist(gray)
    thr = cv2.adaptiveThreshold(gray_eq, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    inv = cv2.bitwise_not(thr)
    _, otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    txt1 = pytesseract.image_to_string(thr, config='--psm 6 --oem 3').strip()
    txt2 = pytesseract.image_to_string(inv, config='--psm 6 --oem 3').strip()
    txt3 = pytesseract.image_to_string(otsu, config='--psm 6 --oem 3').strip()
    best = max([txt1, txt2, txt3], key=len)
    return best.lower()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--video", required=True)
    parser.add_argument("--outdir", default="meme_frames")
    parser.add_argument("--segments", type=int, default=10)
    parser.add_argument("--fps", type=float, default=2.0)
    parser.add_argument("--min_gap", type=float, default=2.0)
    parser.add_argument("--topk", type=int, default=5)
    parser.add_argument("--batch_size", type=int, default=32)
    parser.add_argument("--enable_ocr", action="store_true")
    parser.add_argument("--ocr_bonus", type=float, default=0.25)
    parser.add_argument("--ocr_roi_height", type=float, default=0.40)
    parser.add_argument("--chunk_duration", type=float, default=30.0)
    args = parser.parse_args()

    global_start_time = time.perf_counter()
    os.makedirs(args.outdir, exist_ok=True)

    try:
        dur = run_ffprobe_duration(args.video)
    except Exception as e:
        print(f"[error] ffprobe failed: {e}", file=sys.stderr)
        sys.exit(1)

    # Determine chunks
    chunk_size = args.chunk_duration
    num_chunks = int(np.ceil(dur / chunk_size))
    chunk_ranges = [(i * chunk_size, min((i + 1) * chunk_size, dur)) for i in range(num_chunks)]

    print(f"[info] Video duration: {dur:.2f}s, processing in {num_chunks} chunk(s) of ~{chunk_size}s each")

    # Init CV + CLIP once
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    model, preprocess, tokenizer, device = load_clip()

    manifest_path = os.path.join(args.outdir, "meme_frames_manifest.json")
    all_manifest = []
    chunk_timings = []
    global_rank = 1

    for chunk_idx, (chunk_start, chunk_end) in enumerate(chunk_ranges, start=1):
        chunk_start_time = time.perf_counter()
        print(f"\n[chunk {chunk_idx}/{num_chunks}] Processing {chunk_start:.1f}s - {chunk_end:.1f}s...")

        chunk_dur = chunk_end - chunk_start
        seg_len = chunk_dur / args.segments
        windows = [(chunk_start + i * seg_len, min(chunk_start + (i + 1) * seg_len, chunk_end)) for i in range(args.segments)]

        all_frames = []
        frame_data = []
        temp_dirs_all = set()

        for seg_id, (t0, t1) in enumerate(tqdm(windows, desc=f"Chunk {chunk_idx} extract")):
            try:
                frames = extract_frames(args.video, t0, t1, args.fps, args.outdir)
                for _, fpath in frames:
                    temp_dirs_all.add(os.path.dirname(fpath))
            except subprocess.CalledProcessError as e:
                print(f"[warn] ffmpeg extract failed: {e}", file=sys.stderr)
                continue
            for ts, fpath in frames:
                bgr = cv2.imread(fpath, cv2.IMREAD_COLOR)
                if bgr is not None:
                    frame_data.append((ts, fpath, bgr, seg_id))

        if not frame_data:
            print(f"[warn] No frames for chunk {chunk_idx}", file=sys.stderr)
            chunk_timings.append((chunk_idx, 0.0))
            continue

        candidates = []
        for ts, fpath, bgr, seg_id in tqdm(frame_data, desc=f"Chunk {chunk_idx} metrics"):
            sharp = sharpness_score(bgr)
            face_area_score, _ = face_features(bgr, face_cascade)
            candidates.append((ts, fpath, bgr, seg_id, sharp, face_area_score))

        if not candidates:
            print(f"[warn] No candidates for chunk {chunk_idx}", file=sys.stderr)
            chunk_timings.append((chunk_idx, 0.0))
            continue

        print(f"Running CLIP on {len(candidates)} frames...")
        pil_images = [Image.fromarray(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)) for _, _, bgr, _, _, _ in candidates]

        try:
            clip_scores = []
            for i in range(0, len(pil_images), args.batch_size):
                batch = pil_images[i:i+args.batch_size]
                scores = clip_reaction_score_batch(batch, model, preprocess, tokenizer, device, REACTION_PROMPTS)
                clip_scores.extend(scores)
        except Exception as e:
            print(f"[error] CLIP failed: {e}", file=sys.stderr)
            clip_scores = [0.0] * len(candidates)

        for i, (ts, fpath, bgr, seg_id, sharp, face_area_score) in enumerate(candidates):
            clip_s = clip_scores[i]
            base_total = 0.55 * clip_s + 0.30 * face_area_score + 0.15 * sharp
            bonus = 0.0
            if args.enable_ocr and HAS_TESS:
                text = ocr_text_from_frame(bgr, args.ocr_roi_height)
                if text and len(text) > 3:
                    bonus = args.ocr_bonus
            total = base_total * (1.0 + bonus)
            all_frames.append(FrameInfo(
                t=ts, path=fpath, seg_id=seg_id,
                clip_score=clip_s, face_score=face_area_score, sharp_score=sharp, total=total
            ))

        best_per_seg = {}
        for f in all_frames:
            if f.seg_id not in best_per_seg or f.total > best_per_seg[f.seg_id].total:
                best_per_seg[f.seg_id] = f
        candidates_nms = list(best_per_seg.values())
        candidates_nms = sorted(candidates_nms, key=lambda f: -f.total)
        picked = non_max_suppression(candidates_nms, min_gap=args.min_gap)[:args.topk]

        temp_dirs = set()
        for f in picked:
            base = f"meme_{global_rank:02d}_t{f.t:.2f}s_score{f.total:.3f}.png"
            out_path = os.path.join(args.outdir, base)
            try:
                # Read the image first before moving
                img = cv2.imread(f.path, cv2.IMREAD_COLOR)
                if img is None:
                    print(f"[warn] Failed to read {f.path}, skipping", file=sys.stderr)
                    continue
                # Write to destination
                cv2.imwrite(out_path, img)
                # Track temp dir for cleanup
                temp_dirs.add(os.path.dirname(f.path))
            except Exception as e:
                print(f"[warn] Failed to save {f.path}: {e}", file=sys.stderr)
                continue
                
            all_manifest.append({
                "rank": global_rank,
                "timestamp_sec": round(f.t, 2),
                "image": out_path,
                "chunk": chunk_idx,
                "scores": {
                    "total": round(f.total, 4),
                    "clip_reaction": round(f.clip_score, 4),
                    "face": round(f.face_score, 4),
                    "sharpness": round(f.sharp_score, 4)
                }
            })
            global_rank += 1

        # Only cleanup temp dirs for this chunk after all files are copied
        for temp_dir in temp_dirs:
            if os.path.exists(temp_dir) and temp_dir.startswith(args.outdir):
                try:
                    shutil.rmtree(temp_dir)
                except Exception as e:
                    print(f"[warn] cleanup failed: {e}", file=sys.stderr)

        with open(manifest_path, "w", encoding="utf-8") as fjs:
            json.dump(all_manifest, fjs, indent=2)

        chunk_elapsed = time.perf_counter() - chunk_start_time
        chunk_timings.append((chunk_idx, chunk_elapsed))
        print(f"[chunk {chunk_idx}] Complete in {chunk_elapsed:.2f}s")

    print("[info] Final cleanup of temp directories...")
    for item in os.listdir(args.outdir):
        if item.startswith("seg_"):
            seg_path = os.path.join(args.outdir, item)
            if os.path.isdir(seg_path):
                try:
                    shutil.rmtree(seg_path)
                    print(f"[info] Removed stray temp dir: {item}")
                except Exception as e:
                    print(f"[warn] Could not remove {item}: {e}", file=sys.stderr)

    global_elapsed = time.perf_counter() - global_start_time

    print(json.dumps({
        "video": args.video,
        "duration_sec": round(dur, 2),
        "picked": all_manifest,
        "manifest": manifest_path,
        "elapsed_sec": round(global_elapsed, 2)
    }, indent=2))

    print(f"\n[info] Total elapsed time: {global_elapsed:.2f}s")
    print("[info] Per-chunk timings:")
    for chunk_idx, elapsed in chunk_timings:
        print(f"  Segment {chunk_idx}: {elapsed:.1f}s")


if __name__ == "__main__":
    main()
