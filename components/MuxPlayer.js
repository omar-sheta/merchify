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
      <div className="p-4 border rounded text-sm text-gray-600">No playback ID provided. Paste a Mux playback ID to preview the stream.</div>
    )
  }

  const hlsSrc = `https://stream.mux.com/${playbackId}.m3u8`

  return (
    <div className="mux-player border rounded overflow-hidden bg-black">
      <video ref={videoRef} controls className="w-full max-h-[520px] bg-black" playsInline>
        <source src={hlsSrc} type="application/x-mpegURL" />
        Your browser does not support HLS playback natively. Integrate hls.js in `components/MuxPlayer.js` to enable playback in most browsers.
      </video>
      <div className="p-2 text-xs text-gray-300 bg-gray-800">Playback ID: {playbackId}</div>
    </div>
  )
}
