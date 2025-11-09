# AI Meme Frame Picker Integration

## What it does
Automatically analyzes videos using AI to find the best 5 "meme-worthy" moments based on:
- Facial expressions and reactions
- Composition and sharpness
- Reaction quality (using CLIP AI model)

## Setup Complete ✅

1. Python script: `/scripts/meme_frame_picker.py`
2. Python dependencies installed in `/venv`
3. API endpoint: `/api/analyze-video`
4. UI integrated in homepage

## How it works

1. **When a video loads**: The AI automatically starts analyzing it in the background
2. **Real-time display**: As analysis completes, the top 5 frames appear below the video player
3. **Click to jump**: Click any AI-selected frame to jump to that moment in the video
4. **One-click capture**: Then hit "Merchify This" to capture that perfect frame

## Features

- **AI-Powered Selection**: Uses OpenAI's CLIP model to detect reaction faces
- **Face Detection**: Prioritizes frames with centered, visible faces
- **Sharpness Filter**: Only picks clear, high-quality frames
- **Scored Results**: Each frame gets a quality score (0-100%)
- **Timeline Labels**: Shows timestamp for each frame

## Demo Flow

1. User opens homepage
2. Selects a video
3. AI analyzes in background (shows "Analyzing..." spinner)
4. Top 5 frames appear below video
5. User clicks a frame → video jumps to that moment
6. User clicks "Merchify This" → captures frame
7. Proceeds to customize page

## Technical Stack

- **Python**: OpenCV, PyTorch, OpenCLIP, NumPy
- **Node.js API**: Spawns Python process, handles results
- **React UI**: Real-time display with thumbnails

## Performance

- Processes ~30s of video at a time
- Extracts 2 frames per second
- Analyzes in chunks for long videos
- Returns results incrementally

Ready to demo! 🚀
