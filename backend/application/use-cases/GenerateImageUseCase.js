const GeneratedImage = require('../../domain/entities/GeneratedImage')

/**
 * GenerateImageUseCase
 * Handles AI image generation business logic
 */
class GenerateImageUseCase {
  /**
   * @param {IImageGenerationRepository} imageRepository
   */
  constructor(imageRepository) {
    this.imageRepository = imageRepository
  }

  /**
   * Execute image generation
   * @param {string} prompt
   * @param {any} seedData
   * @returns {Promise<GeneratedImage>}
   */
  async execute(prompt, seedData = null) {
    if (!prompt && !seedData) {
      throw new Error('Either prompt or seed data is required')
    }

    // Generate image through repository
    const generatedImage = await this.imageRepository.generateImage(
      prompt || 'Photorealistic t-shirt mockup',
      seedData
    )

    // Validate the generated image
    if (!generatedImage.url) {
      throw new Error('Failed to generate image')
    }

    return generatedImage
  }
}

module.exports = GenerateImageUseCase
