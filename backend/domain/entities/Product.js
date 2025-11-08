/**
 * Product Entity
 * Represents a merchandise product in the domain
 */
class Product {
  constructor({ id, name, price, type, icon }) {
    this.id = id
    this.name = name
    this.price = price
    this.type = type
    this.icon = icon
  }

  /**
   * Calculate total price based on quantity
   * @param {number} quantity
   * @returns {number}
   */
  calculateTotal(quantity) {
    return this.price * quantity
  }

  /**
   * Validate product data
   * @returns {boolean}
   */
  isValid() {
    return !!(this.id && this.name && this.price && this.type)
  }
}

module.exports = Product
