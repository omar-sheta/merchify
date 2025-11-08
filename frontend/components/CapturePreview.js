import { useState } from 'react'

export default function CapturePreview({ dataUrl }) {
  const [status, setStatus] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  async function sendToGenerate() {
    setIsGenerating(true)
    setStatus('')

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataUrl, prompt: 'Photorealistic t-shirt mockup' }),
      })
      const json = await res.json()
      if (res.ok) {
        setStatus(`✅ Generated image: ${json.url || 'Success'}`)
      } else {
        setStatus(`❌ Generation failed: ${json.error || res.statusText}`)
      }
    } catch (err) {
      setStatus(`❌ Error: ${err.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-800">Captured Frame</h3>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <img src={dataUrl} alt="captured frame" className="w-full max-w-md mx-auto rounded-lg shadow-md border border-gray-200" />
      </div>

      <div className="flex gap-3">
        <button
          onClick={sendToGenerate}
          disabled={isGenerating}
          className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Run Nano Banana
            </>
          )}
        </button>
      </div>

      {status && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          status.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' :
          status.startsWith('❌') ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-gray-50 text-gray-700 border border-gray-200'
        }`}>
          {status}
        </div>
      )}
    </div>
  )
}
