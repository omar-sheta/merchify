import { useRef, useState } from 'react'
import CapturePreview from './CapturePreview'

export default function VideoPlayer() {
  const videoRef = useRef(null)
  const [preview, setPreview] = useState(null)

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

  return (
    <div>
      <div className="border rounded p-2">
        <video
          ref={videoRef}
          controls
          className="w-full max-h-[360px] bg-black"
          src="/sample-comedy.mp4"
        />
        <div className="mt-2">
          <button onClick={captureFrame} className="px-3 py-2 bg-green-600 text-white rounded">Capture Frame</button>
        </div>
      </div>

      {preview && (
        <div className="mt-4">
          <CapturePreview dataUrl={preview} />
        </div>
      )}
    </div>
  )
}
