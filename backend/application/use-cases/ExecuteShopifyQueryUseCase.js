/**
 * ExecuteShopifyQueryUseCase
 * Handles Shopify GraphQL queries business logic
 */
class ExecuteShopifyQueryUseCase {
  /**
   * @param {IShopifyRepository} shopifyRepository
   */
  constructor(shopifyRepository) {
    this.shopifyRepository = shopifyRepository
  }

  /**
   * Execute Shopify query
   * @param {string} query
   * @param {object} variables
   * @returns {Promise<any>}
   */
  async execute(query, variables = {}) {
    if (!query) {
      throw new Error('Query is required')
    }

    // Execute query through repository
    const result = await this.shopifyRepository.executeQuery(query, variables)

    // Check for GraphQL errors
    if (result.errors && result.errors.length > 0) {
      throw new Error(`Shopify query failed: ${result.errors[0].message}`)
    }

    return result
  }
}

module.exports = ExecuteShopifyQueryUseCase
