/**
 * IShopifyRepository Interface
 * Port for e-commerce operations
 */
class IShopifyRepository {
  /**
   * Execute Shopify Storefront GraphQL query
   * @param {string} query
   * @param {object} variables
   * @returns {Promise<any>}
   */
  async executeQuery(query, variables) {
    throw new Error('Method not implemented')
  }

  /**
   * Get products from Shopify
   * @returns {Promise<Array>}
   */
  async getProducts() {
    throw new Error('Method not implemented')
  }

  /**
   * Create checkout session
   * @param {Array} lineItems
   * @returns {Promise<object>}
   */
  async createCheckout(lineItems) {
    throw new Error('Method not implemented')
  }
}

module.exports = IShopifyRepository
