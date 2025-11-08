// Placeholder helpers for Mux integration. Replace with real implementation using mux-node.

const { Mux } = require('mux-node')

function createMuxClient() {
  // Use env MUX_TOKEN_ID and MUX_TOKEN_SECRET in server environment
  const tokenId = process.env.MUX_TOKEN_ID
  const tokenSecret = process.env.MUX_TOKEN_SECRET
  if (!tokenId || !tokenSecret) return null
  const mux = new Mux({
    accessToken: tokenId,
    secret: tokenSecret,
  })
  return mux
}

async function createAssetFromUploadedFile(fileUrl) {
  // TODO: call mux.video.assets.create with input file URL
  return { id: 'mock-asset-id', playbackId: 'mock-playback-id' }
}

module.exports = { createMuxClient, createAssetFromUploadedFile }
