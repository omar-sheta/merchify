import { useState } from 'react'

export default function CapturePreview({ dataUrl }) {
  const [status, setStatus] = useState('')

  async function sendToGenerate() {
    setStatus('Sending to Nano Banana (Gemini) API...')
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl, prompt: 'Photorealistic t-shirt mockup' }),
      })
      const json = await res.json()
      if (res.ok) setStatus('Generated image URL: ' + (json.url || 'none'))
      else setStatus('Generate failed: ' + (json.error || res.statusText))
    } catch (err) {
      setStatus('Error: ' + err.message)
    }
  }

  return (
    <div className="border rounded p-3 bg-white">
      <h3 className="font-semibold mb-2">Captured frame</h3>
      <img src={dataUrl} alt="capture" className="w-full max-w-md border" />
      <div className="mt-2 flex gap-2">
        <button onClick={sendToGenerate} className="px-3 py-2 bg-indigo-600 text-white rounded">Run Nano Banana</button>
        <span className="self-center text-sm text-gray-600">{status}</span>
      </div>
    </div>
  )
}
