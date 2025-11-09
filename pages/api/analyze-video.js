// pages/api/analyze-video.js
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { videoPath } = req.body;

  if (!videoPath) {
    return res.status(400).json({ error: 'Missing video path' });
  }

  try {
    const scriptPath = path.join(process.cwd(), 'scripts', 'meme_frame_picker.py');
    const pythonPath = path.join(process.cwd(), 'venv', 'bin', 'python3');
    const outdir = path.join(process.cwd(), 'public', 'meme_frames');
    
    // Convert video URL to file path
    const actualVideoPath = videoPath.startsWith('/feed/') 
      ? path.join(process.cwd(), 'public', videoPath)
      : videoPath;
    
    // Ensure output directory exists
    if (!fs.existsSync(outdir)) {
      fs.mkdirSync(outdir, { recursive: true });
    }

    const args = [
      scriptPath,
      '--video', actualVideoPath,
      '--outdir', outdir,
      '--topk', '5',
      '--fps', '5.0',  // Higher FPS for more accurate timestamps
      '--min_gap', '1.0',  // Allow frames closer together
      '--segments', '15',  // More segments for better coverage
      '--chunk_duration', '30.0',
      '--batch_size', '32'
    ];

    const pythonProcess = spawn(pythonPath, args);
    
    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
      console.log('[Python]:', data.toString());
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
      console.error('[Python Error]:', data.toString());
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Python script failed:', stderr);
        return res.status(500).json({ 
          error: 'Analysis failed', 
          details: stderr,
          code 
        });
      }

      try {
        // Find the last complete JSON object in stdout
        // The script outputs progress logs followed by JSON
        let jsonStr = '';
        let depth = 0;
        let startIdx = -1;
        
        for (let i = stdout.length - 1; i >= 0; i--) {
          const char = stdout[i];
          if (char === '}') {
            if (depth === 0) startIdx = i;
            depth++;
          } else if (char === '{') {
            depth--;
            if (depth === 0 && startIdx !== -1) {
              jsonStr = stdout.substring(i, startIdx + 1);
              break;
            }
          }
        }
        
        if (!jsonStr) {
          throw new Error('No JSON found in output');
        }
        
        const result = JSON.parse(jsonStr);
        
        // Convert file paths to public URLs and sort by rank
        const frames = result.picked
          .map(frame => ({
            rank: frame.rank,
            imageUrl: frame.image.replace(path.join(process.cwd(), 'public'), '').replace(/\\/g, '/'),
            timestamp_sec: frame.timestamp_sec,
            scores: frame.scores
          }))
          .sort((a, b) => a.rank - b.rank)
          .slice(0, 5); // Only return top 5

        res.status(200).json({
          success: true,
          frames,
          manifest: result.manifest,
          duration: result.duration_sec,
          elapsed: result.elapsed_sec
        });
      } catch (parseError) {
        console.error('Failed to parse output:', parseError);
        console.error('Raw stdout:', stdout);
        res.status(500).json({ 
          error: 'Failed to parse results',
          parseError: parseError.message
        });
      }
    });

  } catch (error) {
    console.error('Error running analysis:', error);
    res.status(500).json({ 
      error: 'Server error',
      details: error.message 
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
    responseLimit: false,
  },
};
