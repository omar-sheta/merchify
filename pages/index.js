import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useRef, useEffect } from 'react'
import { FALLBACK_CAPTURE_IMAGE } from '../lib/placeholders'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import SectionHeading from '../components/ui/SectionHeading'

export default function Home() {
  const router = useRouter();
  const [capturedFrame, setCapturedFrame] = useState(null)
  const videoRef = useRef(null)
  const [previewFrame, setPreviewFrame] = useState(null)
  const lastPreviewRef = useRef(0)

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

  function captureFrame() {
    const videoEl = videoRef.current;
    if (videoEl && videoEl.videoWidth && videoEl.videoHeight) {
      const canvas = document.createElement('canvas');
      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;
      const ctx = canvas.getContext('2d');
      try {
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88)
        setCapturedFrame(dataUrl)
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('capturedFrame', dataUrl)
          // Store video data along with the frame
          if (activeVideo) {
            sessionStorage.setItem('videoData', JSON.stringify({
              id: activeVideo.id,
              src: activeVideo.src,
              title: activeVideo.title || 'Untitled Video'
            }))
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
      sessionStorage.setItem('capturedFrame', imageUrl)
      // No video data for fallback image
      sessionStorage.removeItem('videoData')
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
    } catch (err) {
      setPreviewFrame(capturedFrame || activeVideo?.thumb || activeVideo?.poster || FALLBACK_CAPTURE_IMAGE)
    }
  }

  // when an active video's generated thumbnail becomes available, use it for the preview
  useEffect(() => {
    if (activeVideo?.thumb) {
      setPreviewFrame(activeVideo.thumb)
    }
  }, [activeVideo?.thumb, activeVideo?.id])

  return (
    <div className="min-h-screen" style={{background: 'var(--brand-bg)'}}>
      <Head>
        <title>Merchify — Create Custom Merchandise from Videos</title>
      </Head>

      {/* Hero Section */}
      <section className="relative pt-20 pb-10 overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-6 text-center mb-10">
          <SectionHeading
            eyebrow="Step 1 of 3 — Capture Your Moment"
            title="Turn Your video into merch people actually want"
            subtitle="Play a clip, pause on the punchline, and capture the exact frame you love. We’ll print it perfectly on premium products."
          />
        </div>
      </section>

      {/* Video Player Section */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <Card>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Play your video</h2>
            <p className="text-gray-600">Pause at the perfect moment and capture the frame for your merch.</p>
          </div>

          <div className="relative bg-black rounded-xl overflow-hidden shadow-lg mb-6 border border-black/40">
            {/* Player: show active video if available, otherwise the static image */}
            {activeVideo && activeVideo.src ? (
              <video
                ref={videoRef}
                controls
                className="w-full max-h-[500px] bg-black rounded-xl"
                src={activeVideo.src}
                poster={undefined}
                onLoadedData={e => { e.target.currentTime = 0; }}
              />
            ) : (
              videos.length > 0 && (
                <video
                  ref={videoRef}
                  controls
                  className="w-full max-h-[500px] bg-black rounded-xl"
                  src={videos[0].src}
                  poster={undefined}
                  onLoadedData={e => { e.target.currentTime = 0; }}
                />
              )
            )}

            {/* Ensure playback works by setting activeVideo to the first video */}
            {videos.length > 0 && !activeVideo && (
              <video
                ref={videoRef}
                controls
                className="w-full max-h-[500px] bg-black rounded-xl"
                src={videos[0].src}
                poster={undefined}
                onLoadedData={e => { e.target.currentTime = 0; }}
              />
            )}
          </div>

          {/* Move the full video list below the player so users can choose another video */}
          <div className="mb-6">
            <h4 className="text-sm text-gray-400 mb-2">Choose a video</h4>
            <div className="flex gap-3 overflow-x-auto py-2">
              {videos.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setActiveVideo(v)}
                  className={`flex-shrink-0 w-40 h-24 rounded-lg overflow-hidden border-2 ${activeVideo?.id === v.id ? 'border-blue-500' : 'border-gray-200'}`}
                  title={v.title}
                >
                  <img src={v.thumb || v.poster} alt={v.title} className="w-full h-full object-cover bg-black" />
                </button>
              ))}
            </div>
          </div>

          <Button onClick={captureFrame} size="lg" className="w-full">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Capture This Frame
          </Button>

          {capturedFrame && (
            <div className="mt-8 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center mb-4">
                <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900">Frame Captured!</h3>
              </div>
              
              <div className="mb-6">
                <img src={capturedFrame} alt="Captured frame" className="w-full max-w-md mx-auto rounded-lg shadow-md border border-gray-200" />
              </div>

              <Link 
                href="/customize"
                className="inline-flex items-center justify-center w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Continue to Customize Merchandise
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          )}
        </Card>
      </section>

      {/* How it Works */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <SectionHeading
          eyebrow="Simple flow"
          title="From punchline to product in three steps"
          subtitle="Capture the frame • Customize the product • Checkout with confidence"
        />

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              step: '1', 
              title: 'Capture Frame', 
              desc: 'Play your video and capture the perfect moment',
              color: 'from-purple-500 to-violet-600',
              current: true
            },
            { 
              step: '2', 
              title: 'Customize', 
              desc: 'Choose your product and customize the design',
              color: 'from-violet-500 to-indigo-600',
              current: false
            },
            { 
              step: '3', 
              title: 'Checkout', 
              desc: 'Review and complete your order',
              color: 'from-orange-500 to-amber-600',
              current: false
            },
          ].map((item, i) => (
            <div key={i} className={`relative bg-white rounded-xl p-8 shadow-lg border-2 ${item.current ? 'border-blue-500' : 'border-gray-200'}`}>
              <div className={`absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                {item.step}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
