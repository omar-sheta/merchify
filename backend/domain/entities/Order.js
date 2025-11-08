/**
 * Order Entity
 * Represents a customer order in the domain
 */
class Order {
  constructor({ id, capturedFrame, product, color, size, quantity, totalPrice, status = 'pending' }) {
    this.id = id
    this.capturedFrame = capturedFrame
    this.product = product
    this.color = color
    this.size = size
    this.quantity = quantity
    this.totalPrice = totalPrice
    this.status = status
    this.createdAt = new Date()
  }

  /**
   * Validate order data
   * @returns {boolean}
   */
  isValid() {
    return !!(
      this.capturedFrame &&
      this.product &&
      this.color &&
      this.size &&
      this.quantity > 0
    )
  }

  /**
   * Mark order as completed
   */
  complete() {
    this.status = 'completed'
    this.completedAt = new Date()
  }

  /**
   * Mark order as failed
   */
  fail() {
    this.status = 'failed'
    this.failedAt = new Date()
  }
}

module.exports = Order
