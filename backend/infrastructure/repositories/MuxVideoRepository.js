const IVideoRepository = require('../../domain/repositories/IVideoRepository')
const VideoAsset = require('../../domain/entities/VideoAsset')

/**
 * MuxVideoRepository
 * Adapter for Mux video service
 */
class MuxVideoRepository extends IVideoRepository {
  constructor() {
    super()
    this.mux = null
    this.initializeMux()
  }

  initializeMux() {
    try {
      const { Mux } = require('mux-node')
      const tokenId = process.env.MUX_TOKEN_ID
      const tokenSecret = process.env.MUX_TOKEN_SECRET

      if (tokenId && tokenSecret) {
        this.mux = new Mux({
          accessToken: tokenId,
          secret: tokenSecret,
        })
      }
    } catch (error) {
      console.warn('Mux client not initialized:', error.message)
    }
  }

  /**
   * Upload video and create asset
   * @param {File} file
   * @returns {Promise<VideoAsset>}
   */
  async uploadVideo(file) {
    // TODO: Implement real file upload to Mux
    // For now, return mock data
    const mockAsset = {
      id: `asset-${Date.now()}`,
      assetId: `mock-asset-${Date.now()}`,
      playbackId: `mock-playback-${Date.now()}`,
      thumbnail: 'https://via.placeholder.com/512x288.png?text=Mock+Thumbnail',
      status: 'ready'
    }

    return new VideoAsset(mockAsset)
  }

  /**
   * Get video asset by ID
   * @param {string} assetId
   * @returns {Promise<VideoAsset>}
   */
  async getAsset(assetId) {
    if (!this.mux) {
      throw new Error('Mux client not initialized')
    }

    try {
      const asset = await this.mux.video.assets.retrieve(assetId)
      return new VideoAsset({
        id: asset.id,
        assetId: asset.id,
        playbackId: asset.playback_ids?.[0]?.id,
        thumbnail: asset.static_renditions?.files?.[0]?.name,
        status: asset.status
      })
    } catch (error) {
      throw new Error(`Failed to retrieve asset: ${error.message}`)
    }
  }

  /**
   * Get thumbnail URL for asset
   * @param {string} assetId
   * @returns {Promise<string>}
   */
  async getThumbnail(assetId) {
    const asset = await this.getAsset(assetId)
    return asset.thumbnail || 'https://via.placeholder.com/512x288.png'
  }
}

module.exports = MuxVideoRepository
