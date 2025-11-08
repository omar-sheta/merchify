/**
 * VideoAsset Entity
 * Represents a video asset in the domain
 */
class VideoAsset {
  constructor({ id, assetId, playbackId, thumbnail, status = 'processing' }) {
    this.id = id
    this.assetId = assetId
    this.playbackId = playbackId
    this.thumbnail = thumbnail
    this.status = status
    this.createdAt = new Date()
  }

  /**
   * Check if video is ready for playback
   * @returns {boolean}
   */
  isReady() {
    return this.status === 'ready' && !!this.playbackId
  }

  /**
   * Mark video as ready
   */
  markReady() {
    this.status = 'ready'
  }

  /**
   * Mark video as failed
   */
  markFailed() {
    this.status = 'failed'
  }
}

module.exports = VideoAsset
