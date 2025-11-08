/**
 * API Client for Shopify Operations
 */
class ShopifyApiClient {
  /**
   * Execute Shopify GraphQL query
   * @param {string} query
   * @param {object} variables
   * @returns {Promise<object>}
   */
  async executeQuery(query, variables = {}) {
    const response = await fetch('/api/shopify-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Shopify query failed')
    }

    return await response.json()
  }

  /**
   * Get products from Shopify
   * @returns {Promise<Array>}
   */
  async getProducts() {
    const query = `
      query GetProducts {
        products(first: 10) {
          edges {
            node {
              id
              title
              description
              variants(first: 1) {
                edges {
                  node {
                    id
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    `

    const result = await this.executeQuery(query)
    return result.data?.products?.edges?.map(edge => edge.node) || []
  }
}

export default new ShopifyApiClient()
