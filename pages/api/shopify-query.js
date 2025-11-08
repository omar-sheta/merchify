// Proxy endpoint for Shopify Storefront GraphQL queries
import { getContainer } from '../../backend/infrastructure/di/container'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { query, variables } = req.body || {}
  if (!query) {
    return res.status(400).json({ error: 'Missing query' })
  }

  try {
    const container = getContainer()
    const executeShopifyQueryUseCase = container.getUseCase('executeShopifyQuery')

    const data = await executeShopifyQueryUseCase.execute(query, variables)
    return res.status(200).json(data)
  } catch (error) {
    console.error('Shopify query error:', error)
    return res.status(500).json({ 
      error: error.message || 'Shopify query failed' 
    })
  }
}
