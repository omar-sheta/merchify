/**
 * IVideoRepository Interface
 * Port for video storage and processing
 */
class IVideoRepository {
  /**
   * Upload video and create asset
   * @param {File} file
   * @returns {Promise<VideoAsset>}
   */
  async uploadVideo(file) {
    throw new Error('Method not implemented')
  }

  /**
   * Get video asset by ID
   * @param {string} assetId
   * @returns {Promise<VideoAsset>}
   */
  async getAsset(assetId) {
    throw new Error('Method not implemented')
  }

  /**
   * Get thumbnail URL for asset
   * @param {string} assetId
   * @returns {Promise<string>}
   */
  async getThumbnail(assetId) {
    throw new Error('Method not implemented')
  }
}

module.exports = IVideoRepository
