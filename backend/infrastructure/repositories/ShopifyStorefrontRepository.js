const IShopifyRepository = require('../../domain/repositories/IShopifyRepository')

/**
 * ShopifyStorefrontRepository
 * Adapter for Shopify Storefront API
 */
class ShopifyStorefrontRepository extends IShopifyRepository {
  constructor() {
    super()
    this.domain = process.env.SHOPIFY_STORE_DOMAIN
    this.token = process.env.SHOPIFY_STOREFRONT_TOKEN
  }

  /**
   * Execute Shopify Storefront GraphQL query
   * @param {string} query
   * @param {object} variables
   * @returns {Promise<any>}
   */
  async executeQuery(query, variables = {}) {
    if (!this.domain || !this.token) {
      throw new Error('Missing SHOPIFY environment variables')
    }

    const url = `https://${this.domain}/api/2024-10/graphql.json`
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': this.token,
        },
        body: JSON.stringify({ query, variables }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      throw new Error(`Shopify query failed: ${error.message}`)
    }
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

  /**
   * Create checkout session
   * @param {Array} lineItems
   * @returns {Promise<object>}
   */
  async createCheckout(lineItems) {
    const mutation = `
      mutation CreateCheckout($input: CheckoutCreateInput!) {
        checkoutCreate(input: $input) {
          checkout {
            id
            webUrl
          }
          checkoutUserErrors {
            message
            field
          }
        }
      }
    `

    const variables = {
      input: {
        lineItems: lineItems.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity
        }))
      }
    }

    const result = await this.executeQuery(mutation, variables)
    
    if (result.data?.checkoutCreate?.checkoutUserErrors?.length > 0) {
      throw new Error(result.data.checkoutCreate.checkoutUserErrors[0].message)
    }

    return result.data?.checkoutCreate?.checkout
  }
}

module.exports = ShopifyStorefrontRepository
