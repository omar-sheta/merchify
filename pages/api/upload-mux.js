// API endpoint for uploading video to Mux
import { getContainer } from '../../backend/infrastructure/di/container'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const container = getContainer()
    const uploadVideoUseCase = container.getUseCase('uploadVideo')

    // TODO: Parse multipart form-data properly
    // For now, working with mock file data
    const file = req.body?.file || null

    const videoAsset = await uploadVideoUseCase.execute(file)

    return res.status(200).json({
      assetId: videoAsset.assetId,
      playbackId: videoAsset.playbackId,
      thumbnail: videoAsset.thumbnail
    })
  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json({ 
      error: error.message || 'Upload failed' 
    })
  }
}
