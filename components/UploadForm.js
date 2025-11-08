import { useState } from 'react'

export default function UploadForm() {
  const [file, setFile] = useState(null)
  const [message, setMessage] = useState('')

  async function handleUpload(e) {
    e.preventDefault()
    if (!file) return setMessage('Select a file first')

    const fd = new FormData()
    fd.append('file', file)

    setMessage('Uploading...')
    try {
      const res = await fetch('/api/upload-mux', {
        method: 'POST',
        body: fd,
      })
      const data = await res.json()
      if (res.ok) {
        setMessage('Uploaded — sample thumbnail: ' + (data.thumbnail || 'none'))
      } else {
        setMessage('Upload failed: ' + (data.error || res.statusText))
      }
    } catch (err) {
      setMessage('Upload error: ' + err.message)
    }
  }

  return (
    <form onSubmit={handleUpload} className="space-y-3">
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block"
      />
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit">Upload to Mux</button>
        <span className="text-sm text-gray-600 self-center">{message}</span>
      </div>
    </form>
  )
}
