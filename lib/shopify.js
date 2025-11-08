// Placeholder helpers for Shopify Storefront API
const fetch = require('node-fetch')

async function storefrontQuery(query, variables = {}) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN
  const token = process.env.SHOPIFY_STOREFRONT_TOKEN
  if (!domain || !token) throw new Error('Missing SHOPIFY env vars')

  const url = `https://${domain}/api/2024-10/graphql.json`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  })
  return res.json()
}

module.exports = { storefrontQuery }
