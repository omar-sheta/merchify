#!/usr/bin/env node

/**
 * Video Thumbnail Generator
 * 
 * This script generates thumbnail images from video files in the public/feed directory.
 * It uses ffmpeg to extract a frame from each video at the 2-second mark.
 * 
 * Requirements:
 *   - ffmpeg must be installed (brew install ffmpeg on macOS)
 * 
 * Usage:
 *   node scripts/generate-thumbnails.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FEED_DIR = path.join(__dirname, '../public/feed');
const THUMBNAIL_TIME = '00:00:02.000'; // Extract frame at 2 seconds

// Check if ffmpeg is installed
function checkFFmpeg() {
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    console.error('❌ ffmpeg is not installed!');
    console.log('\n📦 To install ffmpeg:');
    console.log('  macOS:   brew install ffmpeg');
    console.log('  Ubuntu:  sudo apt-get install ffmpeg');
    console.log('  Windows: Download from https://ffmpeg.org/download.html\n');
    return false;
  }
}

// Get all video files recursively
function getVideoFiles(dir) {
  const videos = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      videos.push(...getVideoFiles(fullPath));
    } else if (entry.isFile() && /\.(mp4|mov|avi|mkv|webm)$/i.test(entry.name)) {
      videos.push(fullPath);
    }
  }
  
  return videos;
}

// Generate thumbnail for a video
function generateThumbnail(videoPath) {
  const dir = path.dirname(videoPath);
  const basename = path.basename(videoPath, path.extname(videoPath));
  const thumbnailPath = path.join(dir, `${basename}_thumb.jpg`);
  
  // Skip if thumbnail already exists
  if (fs.existsSync(thumbnailPath)) {
    console.log(`⏭️  Thumbnail already exists: ${path.relative(FEED_DIR, thumbnailPath)}`);
    return thumbnailPath;
  }
  
  try {
    // Use ffmpeg to extract a frame
    const command = `ffmpeg -ss ${THUMBNAIL_TIME} -i "${videoPath}" -vframes 1 -q:v 2 "${thumbnailPath}" -y`;
    execSync(command, { stdio: 'pipe' });
    
    const relativePath = path.relative(FEED_DIR, thumbnailPath);
    console.log(`✅ Generated: ${relativePath}`);
    return thumbnailPath;
  } catch (error) {
    console.error(`❌ Failed to generate thumbnail for: ${path.basename(videoPath)}`);
    console.error(`   Error: ${error.message}`);
    return null;
  }
}

// Main function
async function main() {
  console.log('🎬 Video Thumbnail Generator\n');
  
  // Check prerequisites
  if (!checkFFmpeg()) {
    process.exit(1);
  }
  
  // Check if feed directory exists
  if (!fs.existsSync(FEED_DIR)) {
    console.error(`❌ Feed directory not found: ${FEED_DIR}`);
    process.exit(1);
  }
  
  console.log(`📁 Scanning: ${FEED_DIR}\n`);
  
  // Get all video files
  const videoFiles = getVideoFiles(FEED_DIR);
  
  if (videoFiles.length === 0) {
    console.log('⚠️  No video files found!');
    process.exit(0);
  }
  
  console.log(`📹 Found ${videoFiles.length} video(s)\n`);
  
  // Generate thumbnails
  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;
  
  for (const videoPath of videoFiles) {
    const relativePath = path.relative(FEED_DIR, videoPath);
    console.log(`\n🎥 Processing: ${relativePath}`);
    
    const thumbnailPath = path.join(path.dirname(videoPath), `${path.basename(videoPath, path.extname(videoPath))}_thumb.jpg`);
    
    if (fs.existsSync(thumbnailPath)) {
      skipCount++;
    } else {
      const result = generateThumbnail(videoPath);
      if (result) {
        successCount++;
      } else {
        failCount++;
      }
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Summary:');
  console.log(`   ✅ Generated: ${successCount}`);
  console.log(`   ⏭️  Skipped:   ${skipCount} (already exist)`);
  console.log(`   ❌ Failed:    ${failCount}`);
  console.log('='.repeat(50));
  
  if (successCount > 0 || skipCount > 0) {
    console.log('\n🎉 Done! Thumbnails are saved next to their video files with "_thumb.jpg" suffix.');
    console.log('\n📝 Example paths:');
    console.log('   Video:     /feed/creator_1/1.mp4');
    console.log('   Thumbnail: /feed/creator_1/1_thumb.jpg');
    console.log('\n💡 Update your Firebase seed data to use these thumbnail URLs!');
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
