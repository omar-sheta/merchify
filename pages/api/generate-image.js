// API stub that would call Gemini / Nano Banana to generate an image from a prompt

import { generateImageFromPrompt } from '../../lib/gemini'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { prompt, image } = req.body || {}
  if (!prompt && !image) return res.status(400).json({ error: 'Missing prompt or image data' })

  try {
    // In real code: call the server-side Gemini client with your API key
    const out = await generateImageFromPrompt(prompt || 'Photorealistic t-shirt mockup', image)
    return res.status(200).json(out)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message || 'Generation failed' })
  }
}
