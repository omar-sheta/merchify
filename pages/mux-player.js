import { useState } from 'react'
import MuxPlayer from '../components/MuxPlayer'

export default function MuxPlayerPage() {
  const [playbackId, setPlaybackId] = useState('')
  const [input, setInput] = useState('')

  function load() {
    setPlaybackId(input.trim())
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <main className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-3">Mux Player — Integration Placeholder</h1>
        <p className="mb-4 text-sm text-gray-600">Paste a Mux playback ID (from your asset playback ID) and click Load to preview the stream. This page is intentionally minimal so your frontend teammate can integrate the real Mux player or hls.js.</p>

        <div className="flex gap-2 mb-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter playback ID (e.g. abc123XYZ)"
            className="border p-2 rounded flex-1"
          />
          <button onClick={load} className="px-4 py-2 bg-blue-600 text-white rounded">Load</button>
        </div>

        <MuxPlayer playbackId={playbackId} />

        <div className="mt-6 text-sm text-gray-500">
          <strong>Notes for integrator:</strong>
          <ul className="list-disc ml-5 mt-2">
            <li>For Safari, the native &lt;video&gt; element will play HLS (.m3u8) URLs.</li>
            <li>For Chrome/Firefox, include <code>hls.js</code> and attach the m3u8 to the video element (see commented example in <code>components/MuxPlayer.js</code>).</li>
            <li>If you have a signed playback URL or different domain, replace the generated m3u8 URL accordingly.</li>
          </ul>
        </div>
      </main>
    </div>
  )
}
