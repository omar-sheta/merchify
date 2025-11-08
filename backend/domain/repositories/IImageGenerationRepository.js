/**
 * IImageGenerationRepository Interface
 * Port for AI image generation
 */
class IImageGenerationRepository {
  /**
   * Generate image from prompt
   * @param {string} prompt
   * @param {any} seedData
   * @returns {Promise<GeneratedImage>}
   */
  async generateImage(prompt, seedData) {
    throw new Error('Method not implemented')
  }

  /**
   * Check generation status
   * @param {string} id
   * @returns {Promise<GeneratedImage>}
   */
  async getGenerationStatus(id) {
    throw new Error('Method not implemented')
  }
}

module.exports = IImageGenerationRepository
