const Order = require('../../domain/entities/Order')

/**
 * CreateOrderUseCase
 * Handles order creation business logic
 */
class CreateOrderUseCase {
  /**
   * @param {IShopifyRepository} shopifyRepository
   */
  constructor(shopifyRepository) {
    this.shopifyRepository = shopifyRepository
  }

  /**
   * Execute order creation
   * @param {object} orderData
   * @returns {Promise<Order>}
   */
  async execute(orderData) {
    // Create order entity
    const order = new Order({
      id: Date.now().toString(),
      ...orderData
    })

    // Validate order
    if (!order.isValid()) {
      throw new Error('Invalid order data')
    }

    // Create checkout in Shopify
    const lineItems = [
      {
        variantId: order.product.id,
        quantity: order.quantity
      }
    ]

    try {
      const checkout = await this.shopifyRepository.createCheckout(lineItems)
      order.checkoutUrl = checkout.webUrl
      order.complete()
    } catch (error) {
      order.fail()
      throw error
    }

    return order
  }
}

module.exports = CreateOrderUseCase
