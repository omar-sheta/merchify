import Head from 'next/head'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { FALLBACK_CAPTURE_IMAGE } from '../lib/placeholders'

export default function Home() {
  const [capturedFrame, setCapturedFrame] = useState(null)
  const videoRef = useRef(null)

  // Video feed will be fetched from the server API which lists files in /public/feed
  const [videos, setVideos] = useState([])
  const [activeVideo, setActiveVideo] = useState(null)

  useEffect(() => {
    async function loadFeed() {
      try {
        const res = await fetch('/api/feed')
        const json = await res.json()
        if (json.items && json.items.length) {
          setVideos(json.items)
          setActiveVideo(json.items[0])
          // generate client-side thumbnails from the video files (same-origin)
          if (typeof window !== 'undefined') {
            generateThumbnails(json.items)
          }
        }
      } catch (err) {
        console.error('Failed to load feed', err)
      }
    }
    loadFeed()
  }, [])

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
    // If there's an active HTMLVideoElement, capture from it. Otherwise fall back to static image.
    const videoEl = videoRef.current
    if (videoEl && videoEl.videoWidth && videoEl.videoHeight) {
      const canvas = document.createElement('canvas')
      canvas.width = videoEl.videoWidth
      canvas.height = videoEl.videoHeight
      const ctx = canvas.getContext('2d')
      try {
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height)
  const dataUrl = canvas.toDataURL('image/jpeg', 0.88)
        setCapturedFrame(dataUrl)
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('capturedFrame', dataUrl)
        }
        return
      } catch (err) {
        // drawing may fail if the video is cross-origin; fall back to static image
        console.warn('capture failed, falling back to static image', err)
      }
    }

    const imageUrl = FALLBACK_CAPTURE_IMAGE
    setCapturedFrame(imageUrl)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('capturedFrame', imageUrl)
    }
  }

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-blue-50 min-h-screen">
      <Head>
        <title>Merchify — Create Custom Merchandise from Videos</title>
      </Head>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 right-0 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-40 left-0 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 bg-blue-100 rounded-full text-sm font-medium text-blue-700 mb-6">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            Step 1 of 3 — Capture Your Moment
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Turn Your Video Into
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Custom Merchandise</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Play your video, pause at the perfect moment, and capture the frame. Then customize your merchandise and checkout.
          </p>
        </div>
      </section>

      {/* Video Player Section */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Play Your Video</h2>
            <p className="text-gray-600">Pause at the perfect moment and capture the frame for your merchandise</p>
          </div>

          <div className="relative bg-black rounded-xl overflow-hidden shadow-lg mb-6">
            {/* Player: show active video if available, otherwise the static image */}
            {activeVideo && activeVideo.src ? (
              <video
                ref={videoRef}
                controls
                className="w-full max-h-[500px] bg-black rounded-xl"
                src={activeVideo.src}
                poster={activeVideo.poster}
              />
            ) : (
              <div className="flex items-center justify-center min-h-[300px] bg-black rounded-xl overflow-auto">
                <img
                  src={FALLBACK_CAPTURE_IMAGE}
                  alt="Captured frame preview"
                  className="rounded-xl shadow-lg border border-gray-200 bg-black"
                  style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
                />
              </div>
            )}

            <div className="mt-4">
              <h4 className="text-sm text-gray-400 mb-2">Video Feed</h4>
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
          </div>

          <button
            onClick={captureFrame}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Capture This Frame
          </button>

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
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600">Three simple steps to create your custom merchandise</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              step: '1', 
              title: 'Capture Frame', 
              desc: 'Play your video and capture the perfect moment',
              color: 'from-blue-500 to-blue-600',
              current: true
            },
            { 
              step: '2', 
              title: 'Customize', 
              desc: 'Choose your product and customize the design',
              color: 'from-purple-500 to-purple-600',
              current: false
            },
            { 
              step: '3', 
              title: 'Checkout', 
              desc: 'Review and complete your order',
              color: 'from-pink-500 to-pink-600',
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
