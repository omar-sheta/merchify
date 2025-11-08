// Deprecated: Please use backend/infrastructure/repositories/GeminiImageRepository.js
// This file is kept for backwards compatibility

const { getContainer } = require('../backend/infrastructure/di/container')

async function generateImageFromPrompt(prompt, seedData) {
  const container = getContainer()
  const generateImageUseCase = container.getUseCase('generateImage')
  
  const result = await generateImageUseCase.execute(prompt, seedData)
  return { url: result.url }
}

module.exports = { generateImageFromPrompt }
