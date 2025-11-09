import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useRef, useEffect } from 'react'
import { FALLBACK_CAPTURE_IMAGE } from '../lib/placeholders'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import MerchifySnap from '../components/ui/MerchifySnap'

export default function Home() {
  const router = useRouter();
  const [capturedFrame, setCapturedFrame] = useState(null);
  const videoRef = useRef(null);
  const [previewFrame, setPreviewFrame] = useState(null);
  const lastPreviewRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const playbackRates = [0.5, 1, 1.5, 2];
  const [isFlashing, setIsFlashing] = useState(false);
  const [aiFrames, setAiFrames] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const analysisRequestRef = useRef(0); // Track current analysis request

  // Video feed will be fetched from the server API which lists files in /public/feed
  const [videos, setVideos] = useState([])
  const [activeVideo, setActiveVideo] = useState(null)

  useEffect(() => {
    // Wait for router to be ready before processing query params
    if (!router.isReady) return;
    
    async function loadFeed() {
      try {
        const res = await fetch('/api/feed');
        const json = await res.json();
        if (json.items && json.items.length) {
          setVideos(json.items);
          
          // Check if there's a video ID in the URL query
          const { video: videoId } = router.query;
          
          if (videoId) {
            // Find and set the video from the query parameter
            const selectedVideo = json.items.find(v => v.id === videoId);
            if (selectedVideo) {
              setActiveVideo(selectedVideo);
              console.log('Selected video from URL:', videoId, selectedVideo.title);
            } else {
              // Fallback to first video if ID not found
              console.log('Video ID not found:', videoId, 'using first video');
              setActiveVideo(json.items[0]);
            }
          } else {
            // No query parameter, use first video
            console.log('No video query param, using first video');
            setActiveVideo(json.items[0]);
          }
          
          // generate client-side thumbnails from the video files (same-origin)
          if (typeof window !== 'undefined') {
            generateThumbnails(json.items)
          }
        }
      } catch (err) {
        console.error('Failed to load feed', err);
      }
    }
    loadFeed();
  }, [router.isReady, router.query.video])

  // Attach video event listeners to update the live preview
  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    const onTime = () => updatePreview()
    const onPause = () => updatePreview()
    const onLoaded = () => updatePreview()
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('pause', onPause)
    el.addEventListener('loadeddata', onLoaded)
    // initial preview for poster
    updatePreview()
    return () => {
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('pause', onPause)
      el.removeEventListener('loadeddata', onLoaded)
    }
  }, [activeVideo])

  useEffect(() => {
    const videoEl = videoRef.current
    if (!videoEl) return
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)
    const handleRateChange = () => setPlaybackRate(videoEl.playbackRate)
    videoEl.addEventListener('play', handlePlay)
    videoEl.addEventListener('pause', handlePause)
    videoEl.addEventListener('ended', handleEnded)
    videoEl.addEventListener('ratechange', handleRateChange)
    return () => {
      videoEl.removeEventListener('play', handlePlay)
      videoEl.removeEventListener('pause', handlePause)
      videoEl.removeEventListener('ended', handleEnded)
      videoEl.removeEventListener('ratechange', handleRateChange)
    }
  }, [activeVideo?.id])

  useEffect(() => {
    const videoEl = videoRef.current
    if (!videoEl) return
    setIsPlaying(false)
    setPlaybackRate(1)
    setCurrentTime(0)
    setDuration(Number.isFinite(videoEl.duration) ? videoEl.duration : 0)
    videoEl.pause()
    videoEl.currentTime = 0
    videoEl.playbackRate = 1
    
    // Clear old AI frames immediately when video changes
    setAiFrames([])
    setIsAnalyzing(false)
    
    // Auto-analyze new video when it loads
    if (activeVideo?.src) {
      // Use a small delay to ensure video is fully loaded
      const timer = setTimeout(() => {
        analyzeVideo(activeVideo.src)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [activeVideo?.id, activeVideo?.src])

  useEffect(() => {
    const videoEl = videoRef.current
    if (videoEl) {
      videoEl.playbackRate = playbackRate
    }
  }, [playbackRate, activeVideo?.id])

  // Create thumbnails by drawing a frame from each video into a canvas.
  async function generateThumbnails(items) {
    // run sequentially to avoid heavy parallel loads
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      try {
        const dataUrl = await createThumbnail(item.src)
        if (dataUrl) {
          // update state immutably
          setVideos((prev) => prev.map((v) => (v.id === item.id ? { ...v, thumb: dataUrl } : v)))
        }
      } catch (e) {
        // ignore thumbnail failures
        console.warn('thumb gen failed for', item.src, e)
      }
    }
  }

  function createThumbnail(src) {
    return new Promise((resolve) => {
      try {
        const video = document.createElement('video')
        video.src = src
        video.crossOrigin = 'anonymous'
        video.muted = true
        video.playsInline = true
        // try to load small amount
        const cleanup = () => {
          video.src = ''
          video.load()
        }

        const makeCanvas = () => {
          try {
            const canvas = document.createElement('canvas')
            canvas.width = video.videoWidth || 320
            canvas.height = video.videoHeight || 180
            const ctx = canvas.getContext('2d')
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            const dataUrl = canvas.toDataURL('image/jpeg', 0.75)
            cleanup()
            resolve(dataUrl)
          } catch (err) {
            cleanup()
            resolve(null)
          }
        }

        const onLoaded = () => {
          // seek to 0.5s or 1s to get a good frame
          const t = Math.min(1, (video.duration || 1) / 2)
          const onSeeked = () => {
            makeCanvas()
          }
          video.removeEventListener('loadeddata', onLoaded)
          video.addEventListener('seeked', onSeeked, { once: true })
          try {
            video.currentTime = t
          } catch (e) {
            // some browsers restrict seeking before metadata; fallback
            setTimeout(makeCanvas, 500)
          }
        }

        video.addEventListener('loadeddata', onLoaded)
        video.addEventListener('error', () => resolve(null))
        // start loading
        video.load()
        // safety timeout
        setTimeout(() => resolve(null), 3000)
      } catch (err) {
        resolve(null)
      }
    })
  }

  async function analyzeVideo(videoSrc) {
    // Increment request counter to invalidate previous requests
    analysisRequestRef.current += 1;
    const currentRequest = analysisRequestRef.current;
    
    setIsAnalyzing(true);
    
    // Generate random placeholder frames from the video
    try {
      const placeholders = await generateRandomPlaceholders(videoSrc, 5);
      // Only update if this is still the current request
      if (currentRequest === analysisRequestRef.current) {
        setAiFrames(placeholders);
      } else {
        return; // This request was superseded
      }
    } catch (error) {
      console.error('Failed to generate placeholders:', error);
      // Fallback to loading placeholders
      if (currentRequest === analysisRequestRef.current) {
        setAiFrames([
          { rank: 1, timestamp_sec: 0, imageUrl: '', scores: { total: 0 }, loading: true },
          { rank: 2, timestamp_sec: 0, imageUrl: '', scores: { total: 0 }, loading: true },
          { rank: 3, timestamp_sec: 0, imageUrl: '', scores: { total: 0 }, loading: true },
          { rank: 4, timestamp_sec: 0, imageUrl: '', scores: { total: 0 }, loading: true },
          { rank: 5, timestamp_sec: 0, imageUrl: '', scores: { total: 0 }, loading: true },
        ]);
      } else {
        return; // This request was superseded
      }
    }
    
    try {
      const response = await fetch('/api/analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoPath: videoSrc }),
      });
      
      // Check if this request is still current before processing
      if (currentRequest !== analysisRequestRef.current) {
        console.log('Analysis result discarded - video changed');
        return;
      }
      
      const result = await response.json();
      if (result.success && result.frames) {
        // Sort by rank and take top 5
        const topFrames = result.frames
          .sort((a, b) => a.rank - b.rank)
          .slice(0, 5);
        
        // Final check before updating state
        if (currentRequest === analysisRequestRef.current) {
          setAiFrames(topFrames);
        }
      } else {
        console.error('Analysis failed:', result.error);
        if (currentRequest === analysisRequestRef.current) {
          setAiFrames([]);
        }
      }
    } catch (error) {
      console.error('Error analyzing video:', error);
      if (currentRequest === analysisRequestRef.current) {
        setAiFrames([]);
      }
    } finally {
      if (currentRequest === analysisRequestRef.current) {
        setIsAnalyzing(false);
      }
    }
  }

  async function generateRandomPlaceholders(videoSrc, count) {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = videoSrc;
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.playsInline = true;

      const placeholders = [];
      let framesGenerated = 0;

      video.addEventListener('loadedmetadata', () => {
        const duration = video.duration;
        if (!duration || !isFinite(duration)) {
          resolve([]);
          return;
        }

        // Generate random timestamps
        const timestamps = [];
        for (let i = 0; i < count; i++) {
          // Random time between 10% and 90% of video duration
          const randomTime = (Math.random() * 0.8 + 0.1) * duration;
          timestamps.push(randomTime);
        }
        timestamps.sort((a, b) => a - b);

        let currentIndex = 0;

        const captureFrame = () => {
          if (currentIndex >= timestamps.length) {
            video.src = '';
            video.load();
            resolve(placeholders);
            return;
          }

          const timestamp = timestamps[currentIndex];
          
          const onSeeked = () => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = video.videoWidth || 320;
              canvas.height = video.videoHeight || 180;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
              
              placeholders.push({
                rank: currentIndex + 1,
                timestamp_sec: timestamp,
                imageUrl: dataUrl,
                scores: { total: 0 },
                placeholder: true
              });
              
              currentIndex++;
              video.removeEventListener('seeked', onSeeked);
              
              // Small delay before next frame
              setTimeout(captureFrame, 50);
            } catch (err) {
              console.error('Failed to capture frame:', err);
              currentIndex++;
              video.removeEventListener('seeked', onSeeked);
              captureFrame();
            }
          };

          video.addEventListener('seeked', onSeeked, { once: true });
          video.currentTime = timestamp;
        };

        captureFrame();
      });

      video.addEventListener('error', () => {
        resolve([]);
      });

      // Safety timeout
      setTimeout(() => {
        if (placeholders.length === 0) {
          resolve([]);
        }
      }, 5000);

      video.load();
    });
  }

  function captureFrame() {
    const videoEl = videoRef.current;
    if (videoEl && videoEl.videoWidth && videoEl.videoHeight) {
      // 1. Flash effect
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 200);

      // 2. Freeze video
      videoEl.pause();

      const canvas = document.createElement('canvas');
      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;
      const ctx = canvas.getContext('2d');
      try {
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setCapturedFrame(dataUrl);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('capturedFrame', dataUrl);
          if (activeVideo) {
            sessionStorage.setItem('videoData', JSON.stringify({
              id: activeVideo.id,
              src: activeVideo.src,
              title: activeVideo.title || 'Untitled Video'
            }));
          }
        }
        return;
      } catch (err) {
        console.warn('Capture failed, falling back to static image', err);
      }
    }

    const imageUrl = FALLBACK_CAPTURE_IMAGE;
    setCapturedFrame(imageUrl);
    setPreviewFrame(imageUrl); // Fallback to static image
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('capturedFrame', imageUrl);
      sessionStorage.removeItem('videoData');
    }
  }

  // Update a small live preview from the currently playing/paused video.
  function updatePreview() {
    const now = Date.now()
    // throttle preview updates to ~250ms
    if (now - lastPreviewRef.current < 250) return
    lastPreviewRef.current = now
    const videoEl = videoRef.current
    if (!videoEl || !videoEl.videoWidth || !videoEl.videoHeight) {
      setPreviewFrame(capturedFrame || activeVideo?.thumb || activeVideo?.poster || FALLBACK_CAPTURE_IMAGE)
      setCurrentTime(0)
      setDuration(videoEl && Number.isFinite(videoEl.duration) ? videoEl.duration : 0)
      return
    }
    try {
      const canvas = document.createElement('canvas')
      canvas.width = Math.min(640, videoEl.videoWidth)
      canvas.height = Math.min(360, Math.round((canvas.width * videoEl.videoHeight) / videoEl.videoWidth))
      const ctx = canvas.getContext('2d')
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.6)
      setPreviewFrame(dataUrl)
      setCurrentTime(videoEl.currentTime || 0)
      setDuration(Number.isFinite(videoEl.duration) ? videoEl.duration : 0)
    } catch (err) {
      setPreviewFrame(capturedFrame || activeVideo?.thumb || activeVideo?.poster || FALLBACK_CAPTURE_IMAGE)
      setCurrentTime(videoEl?.currentTime || 0)
      setDuration(videoEl && Number.isFinite(videoEl.duration) ? videoEl.duration : 0)
    }
  }

  function togglePlayback() {
    const videoEl = videoRef.current
    if (!videoEl) return
    if (videoEl.paused || videoEl.ended) {
      videoEl.play().catch(err => console.warn('Playback start failed', err))
    } else {
      videoEl.pause()
    }
  }

  function seekBy(seconds) {
    const videoEl = videoRef.current
    if (!videoEl) return
    const duration = Number.isFinite(videoEl.duration) && videoEl.duration > 0 ? videoEl.duration : Number.MAX_SAFE_INTEGER
    const target = Math.min(Math.max((videoEl.currentTime || 0) + seconds, 0), duration)
    videoEl.currentTime = target
    setCurrentTime(target)
    lastPreviewRef.current = 0
    updatePreview()
  }

  function formatTime(seconds = 0) {
    if (!Number.isFinite(seconds)) return '0:00'
    const safe = Math.max(0, seconds)
    const mins = Math.floor(safe / 60)
    const secs = Math.floor(safe % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  function handleVideoLoaded(event) {
    const el = event.currentTarget
    setDuration(Number.isFinite(el.duration) ? el.duration : 0)
    setCurrentTime(el.currentTime || 0)
    lastPreviewRef.current = 0
    updatePreview()
  }

  // when an active video's generated thumbnail becomes available, use it for the preview
  useEffect(() => {
    if (activeVideo?.thumb) {
      setPreviewFrame(activeVideo.thumb)
    }
  }, [activeVideo?.thumb, activeVideo?.id])

  return (
    <div className="min-h-screen bg-bg-deep-black">
      <Head>
        <title>Merchify — Turn Moments into Merch</title>
      </Head>

      {/* Top spacing to balance layout after removing hero */}
      <div className="pt-12" />

      {/* Video Player Section */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <Card>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-text-primary mb-2">Pick Your Perfect Moment</h2>
            <p className="text-text-secondary">AI has analyzed your video. Click a moment below to jump to it, or browse manually.</p>
          </div>

          {/* AI-Selected Best Frames - Always visible, shown FIRST */}
          {!capturedFrame && (activeVideo?.src || videos[0]?.src) && (
            <div className="mb-6 bg-gradient-to-br from-bg-card/50 to-bg-card-light/30 rounded-xl p-4 border border-accent-orange/20">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-base font-bold text-text-primary flex items-center gap-2">
                    <span className="text-xl">🎯</span>
                    AI-Selected Best Moments
                  </h4>
                  <p className="text-xs text-text-secondary mt-1">
                    Click any moment to jump to it, then hit "Merchify This"
                  </p>
                </div>
                {isAnalyzing && (
                  <div className="flex items-center gap-2 bg-bg-card px-3 py-1.5 rounded-lg">
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-accent-orange border-t-transparent"></div>
                    <span className="text-xs text-accent-orange font-semibold">Analyzing...</span>
                  </div>
                )}
              </div>
              {aiFrames.length > 0 ? (
                <div className="grid grid-cols-5 gap-2">
                  {aiFrames.slice(0, 5).map((frame, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (!frame.loading && !frame.placeholder) {
                          const videoEl = videoRef.current;
                          if (videoEl) {
                            videoEl.currentTime = frame.timestamp_sec;
                            videoEl.pause();
                            // Scroll video into view
                            videoEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }
                      }}
                      disabled={frame.loading}
                      className={`group relative rounded-lg overflow-hidden border-2 transition-all ${
                        frame.loading 
                          ? 'border-bg-card-light animate-pulse cursor-wait' 
                          : frame.placeholder
                          ? 'border-accent-orange/20 opacity-75'
                          : 'border-accent-orange/40 hover:border-accent-orange hover:scale-105 hover:shadow-lg hover:shadow-accent-orange/25 active:scale-95'
                      }`}
                      title={
                        frame.loading 
                          ? 'Analyzing...' 
                          : frame.placeholder 
                          ? 'AI is ranking this moment...' 
                          : `Jump to ${formatTime(frame.timestamp_sec)} (Score: ${(frame.scores.total * 100).toFixed(0)}%)`
                      }
                    >
                      <div className="aspect-video relative bg-bg-card">
                        {frame.loading ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-orange border-t-transparent mb-2"></div>
                            <span className="text-xs text-text-secondary">#{frame.rank}</span>
                          </div>
                        ) : (
                          <>
                            <img 
                              src={frame.imageUrl} 
                              alt={`AI pick #${frame.rank}`} 
                              className="w-full h-full object-cover bg-black" 
                            />
                            {/* Rank badge */}
                            <div className={`absolute top-2 left-2 text-white text-xs font-bold px-2 py-1 rounded ${frame.placeholder ? 'bg-gray-600/80' : 'bg-black/80'}`}>
                              #{frame.rank}
                            </div>
                            {/* Score badge or analyzing indicator */}
                            {frame.placeholder ? (
                              <div className="absolute top-2 right-2 bg-accent-orange/60 text-white text-xs font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1">
                                <div className="animate-spin rounded-full h-2 w-2 border border-white border-t-transparent"></div>
                                <span>AI</span>
                              </div>
                            ) : (
                              <div className="absolute top-2 right-2 bg-accent-orange text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                                {(frame.scores.total * 100).toFixed(0)}%
                              </div>
                            )}
                            {/* Timestamp */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2">
                              <div className="text-white text-xs font-mono font-semibold text-center">
                                {formatTime(frame.timestamp_sec)}
                              </div>
                            </div>
                            {/* Play icon on hover (only for final frames) */}
                            {!frame.placeholder && (
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                                <div className="bg-accent-orange rounded-full p-2">
                                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : isAnalyzing ? (
                <div className="aspect-video bg-bg-card rounded-lg flex flex-col items-center justify-center text-center p-6">
                  <div className="animate-pulse mb-3">
                    <svg className="w-12 h-12 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <p className="text-sm text-text-secondary">AI is analyzing your video to find the best moments...</p>
                </div>
              ) : (
                <div className="aspect-video bg-bg-card rounded-lg flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-bg-card-light">
                  <svg className="w-12 h-12 text-text-secondary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p className="text-sm text-text-secondary">AI analysis will start automatically...</p>
                </div>
              )}
            </div>
          )}

          <div className={`relative bg-bg-deep-black rounded-xl overflow-hidden mb-6 border border-bg-card-light transition-all duration-200 ${isFlashing ? 'ring-2 ring-accent-yellow shadow-2xl' : 'ring-0'}`}>
            {(activeVideo?.src || videos[0]?.src) ? (
              <video
                key={activeVideo?.id || videos[0]?.id || 'default-player'}
                ref={videoRef}
                controls
                controlsList="nodownload"
                playsInline
                preload="metadata"
                className="w-full max-h-[500px] bg-black rounded-xl"
                src={activeVideo?.src || videos[0]?.src}
                poster={activeVideo?.poster || videos[0]?.poster || undefined}
                onLoadedMetadata={handleVideoLoaded}
              >
                Your browser does not support HTML5 video.
              </video>
            ) : (
              <div className="aspect-video flex items-center justify-center text-text-secondary text-sm">
                Upload a video to get started.
              </div>
            )}
          </div>

          {(activeVideo?.src || videos[0]?.src) && !capturedFrame && (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => seekBy(-2)}>-2s</Button>
                <Button variant="secondary" size="sm" onClick={togglePlayback}>{isPlaying ? 'Pause' : 'Play'}</Button>
                <Button variant="secondary" size="sm" onClick={() => seekBy(2)}>+2s</Button>
                <span className="text-xs text-text-secondary font-mono ml-2">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-2 sm:ml-auto">
                <span className="text-xs uppercase tracking-wide text-text-secondary">Speed</span>
                {playbackRates.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setPlaybackRate(rate)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors border ${playbackRate === rate ? 'bg-accent-orange text-white border-accent-orange' : 'border-bg-card-light text-text-secondary hover:text-text-primary hover:border-bg-card'}`}
                    type="button"
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          )}

          {!capturedFrame && (activeVideo?.src || videos[0]?.src) && (
            <Button 
              onClick={captureFrame} 
              size="lg" 
              variant="primary" 
              className="w-full transform active:scale-95 transition-all duration-200 hover:shadow-2xl hover:shadow-accent-orange/50 bg-gradient-to-r from-accent-orange to-orange-600 font-bold text-lg tracking-wide"
            >
              <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="relative">
                Merchify This
                <span className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-white/30 rounded-full"></span>
              </span>
            </Button>
          )}

          {/* Move the full video list below the player so users can choose another video */}
          <div className={capturedFrame ? "mb-0" : "mb-6"}>
            <h4 className="text-xs text-text-secondary mb-2 uppercase tracking-wide">Choose a video</h4>
            <div className="grid grid-cols-5 gap-2">
              {videos.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setActiveVideo(v)}
                  className={`group relative rounded-lg overflow-hidden border-2 transition-all ${activeVideo?.id === v.id ? 'border-accent-orange ring-1 ring-accent-orange/50' : 'border-bg-card-light hover:border-bg-card'}`}
                  title={v.title}
                >
                  <div className="aspect-video">
                    <img src={v.thumb || v.poster} alt={v.title} className="w-full h-full object-cover bg-black" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {capturedFrame && (
            <div className="animate-fade-in-up">
              <Card padding="p-6" className="bg-bg-card">
                <div className="flex items-center mb-4">
                  <svg className="w-6 h-6 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <h3 className="text-xl font-semibold text-text-primary">Frame Captured!</h3>
                </div>
                
                <div className="mb-6">
                  <MerchifySnap 
                    frameSrc={capturedFrame}
                    timestamp={formatTime(currentTime)}
                    videoTitle={activeVideo?.title}
                  />
                </div>

                <Link 
                  href="/customize"
                  passHref
                >
                  <Button as="a" variant="primary" size="lg" className="w-full">
                    Customize 
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
              </Card>
            </div>
          )}
        </Card>
      </section>

    </div>
  )
}
