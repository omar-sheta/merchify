/**
 * API Client for Video Operations
 */
class VideoApiClient {
  /**
   * Upload video to Mux
   * @param {File} file
   * @returns {Promise<object>}
   */
  async uploadVideo(file) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/upload-mux', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Upload failed')
    }

    return await response.json()
  }
}

export default new VideoApiClient()
