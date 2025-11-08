/**
 * API Client for Order Operations
 */
class OrderApiClient {
  /**
   * Create order
   * @param {object} orderData
   * @returns {Promise<object>}
   */
  async createOrder(orderData) {
    const response = await fetch('/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Order creation failed')
    }

    return await response.json()
  }
}

export default new OrderApiClient()
