const VideoAsset = require('../../domain/entities/VideoAsset')

/**
 * UploadVideoUseCase
 * Handles video upload business logic
 */
class UploadVideoUseCase {
  /**
   * @param {IVideoRepository} videoRepository
   */
  constructor(videoRepository) {
    this.videoRepository = videoRepository
  }

  /**
   * Execute video upload
   * @param {File} file
   * @returns {Promise<VideoAsset>}
   */
  async execute(file) {
    if (!file) {
      throw new Error('File is required')
    }

    // Upload video through repository
    const videoAsset = await this.videoRepository.uploadVideo(file)

    // Validate the created asset
    if (!videoAsset.assetId) {
      throw new Error('Failed to create video asset')
    }

    return videoAsset
  }
}

module.exports = UploadVideoUseCase
