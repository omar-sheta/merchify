// API stub for uploading video to Mux and returning a thumbnail URL.
// Replace with real multipart parsing and mux-node usage.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // TODO: Parse multipart form-data and upload to Mux or your storage.
  // For Sprint 1, this stub returns a mock thumbnail URL and a mock asset id.

  const mock = {
    assetId: 'mock-asset-123',
    playbackId: 'mock-playback-456',
    thumbnail: 'https://via.placeholder.com/512x288.png?text=Mock+Thumbnail'
  }

  return res.status(200).json(mock)
}
