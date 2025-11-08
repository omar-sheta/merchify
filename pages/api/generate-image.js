// API endpoint for AI image generation using Gemini
import { getContainer } from '../../backend/infrastructure/di/container'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt, image } = req.body || {}
  if (!prompt && !image) {
    return res.status(400).json({ error: 'Missing prompt or image data' })
  }

  try {
    const container = getContainer()
    const generateImageUseCase = container.getUseCase('generateImage')

    const generatedImage = await generateImageUseCase.execute(
      prompt || 'Photorealistic t-shirt mockup',
      image
    )

    return res.status(200).json({
      url: generatedImage.url,
      id: generatedImage.id,
      status: generatedImage.status
    })
  } catch (error) {
    console.error('Generation error:', error)
    return res.status(500).json({ 
      error: error.message || 'Generation failed' 
    })
  }
}
