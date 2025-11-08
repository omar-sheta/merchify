import { useState } from 'react'
import VideoApiClient from '../services/api/VideoApiClient'

export default function UploadForm() {
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  async function handleUpload(e) {
    e.preventDefault()
    if (!file) return setMessage('Please select a video file first')

    setIsUploading(true)
    setMessage('')

    try {
      const data = await VideoApiClient.uploadVideo(file)
      setMessage(`✅ Upload successful! Thumbnail: ${data.thumbnail || 'Generated'}`)
    } catch (err) {
      setMessage(`❌ Upload error: ${err.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      <div className="relative">
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
          id="video-upload"
        />
        <label
          htmlFor="video-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">MP4, MOV, AVI up to 100MB</p>
          </div>
        </label>
        {file && (
          <div className="mt-2 p-2 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">Selected: {file.name}</p>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={!file || isUploading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isUploading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading to Mux...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload to Mux
          </>
        )}
      </button>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' :
          message.startsWith('❌') ? 'bg-red-50 text-red-700 border border-red-200' :
          'bg-gray-50 text-gray-700 border border-gray-200'
        }`}>
          {message}
        </div>
      )}
    </form>
  )
}
