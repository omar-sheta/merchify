// Deprecated: Please use backend/infrastructure/repositories/MuxVideoRepository.js
// This file is kept for backwards compatibility

const { getContainer } = require('../backend/infrastructure/di/container')

function createMuxClient() {
  // Use the new repository pattern
  const container = getContainer()
  return container.getRepository('videoRepository')
}

async function createAssetFromUploadedFile(fileUrl) {
  const repository = createMuxClient()
  const result = await repository.uploadVideo({ url: fileUrl })
  
  return { 
    id: result.assetId, 
    playbackId: result.playbackId 
  }
}

module.exports = { createMuxClient, createAssetFromUploadedFile }
