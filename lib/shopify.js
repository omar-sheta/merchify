// Deprecated: Please use backend/infrastructure/repositories/ShopifyStorefrontRepository.js
// This file is kept for backwards compatibility

const { getContainer } = require('../backend/infrastructure/di/container')

async function storefrontQuery(query, variables = {}) {
  const container = getContainer()
  const executeShopifyQueryUseCase = container.getUseCase('executeShopifyQuery')
  
  return await executeShopifyQueryUseCase.execute(query, variables)
}

module.exports = { storefrontQuery }
