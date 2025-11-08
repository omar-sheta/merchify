import { useRef, useState } from 'react'
import CapturePreview from './CapturePreview'

export default function VideoPlayer() {
  const videoRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)

  function captureFrame() {
    const video = videoRef.current
    if (!video) return

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, video.currentTime * 0 + 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/png')
    setPreview(dataUrl)
  }

  function handlePlay() {
    setIsPlaying(true)
  }

  function handlePause() {
    setIsPlaying(false)
  }

  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-xl overflow-hidden shadow-lg">
        <video
          ref={videoRef}
          controls
          className="w-full max-h-[400px] bg-black"
          src="/sample-comedy.mp4"
          onPlay={handlePlay}
          onPause={handlePause}
          onEnded={() => setIsPlaying(false)}
        />
        <div className="absolute top-3 left-3">
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            isPlaying ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${isPlaying ? 'bg-green-300' : 'bg-gray-400'}`}></div>
            {isPlaying ? 'Playing' : 'Paused'}
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={captureFrame}
          className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Capture Frame
        </button>
      </div>

      {preview && (
        <div className="mt-6">
          <CapturePreview dataUrl={preview} />
        </div>
      )}
    </div>
  )
}
