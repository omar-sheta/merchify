import { useEffect, useRef } from 'react'

export default function MuxPlayer({ playbackId }) {
  const videoRef = useRef(null)

  useEffect(() => {
    // Placeholder: for non-Safari browsers you can integrate hls.js here.
    // Example (to be added by frontend dev):
    // if (playbackId && Hls.isSupported()) {
    //   const hls = new Hls()
    //   hls.loadSource(`https://stream.mux.com/${playbackId}.m3u8`)
    //   hls.attachMedia(videoRef.current)
    // }
  }, [playbackId])

  if (!playbackId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300">
        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-500 text-center">No playback ID provided.<br />Enter an ID above to preview the Mux stream.</p>
      </div>
    )
  }

  const hlsSrc = `https://stream.mux.com/${playbackId}.m3u8`

  return (
    <div className="space-y-3">
      <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl">
        <video
          ref={videoRef}
          controls
          className="w-full max-h-[500px] bg-black"
          playsInline
        >
          <source src={hlsSrc} type="application/x-mpegURL" />
          Your browser does not support HLS playback natively. Integrate hls.js in `components/MuxPlayer.js` to enable playback in most browsers.
        </video>
        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
          Mux Stream
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 border border-gray-200">
        <strong>Playback ID:</strong> <code className="bg-white px-2 py-1 rounded text-xs">{playbackId}</code>
      </div>
    </div>
  )
}
