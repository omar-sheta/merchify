// Proxy endpoint for Shopify Storefront GraphQL queries. Use server-side env vars.

import { storefrontQuery } from '../../lib/shopify'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { query, variables } = req.body || {}
  if (!query) return res.status(400).json({ error: 'Missing query' })

  try {
    const data = await storefrontQuery(query, variables)
    return res.status(200).json(data)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message || 'Shopify query failed' })
  }
}
