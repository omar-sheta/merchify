/**
 * API Client for Image Generation Operations
 */
class ImageApiClient {
  /**
   * Generate image from prompt
   * @param {string} prompt
   * @param {any} imageData
   * @returns {Promise<object>}
   */
  async generateImage(prompt, imageData = null) {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, image: imageData }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Generation failed')
    }

    return await response.json()
  }
}

export default new ImageApiClient()
