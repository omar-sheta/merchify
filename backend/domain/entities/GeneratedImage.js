/**
 * GeneratedImage Entity
 * Represents an AI-generated image in the domain
 */
class GeneratedImage {
  constructor({ id, url, prompt, seedData, status = 'generating' }) {
    this.id = id
    this.url = url
    this.prompt = prompt
    this.seedData = seedData
    this.status = status
    this.createdAt = new Date()
  }

  /**
   * Check if image generation is complete
   * @returns {boolean}
   */
  isComplete() {
    return this.status === 'complete' && !!this.url
  }

  /**
   * Mark image as complete
   * @param {string} url
   */
  markComplete(url) {
    this.url = url
    this.status = 'complete'
  }

  /**
   * Mark image generation as failed
   */
  markFailed() {
    this.status = 'failed'
  }
}

module.exports = GeneratedImage
