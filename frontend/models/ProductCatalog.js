/**
 * Product catalog with available merchandise
 */
export const PRODUCTS = [
  { id: 'tshirt', name: 'T-Shirt', price: 24.99, icon: '👕' },
  { id: 'hoodie', name: 'Hoodie', price: 44.99, icon: '🧥' },
  { id: 'mug', name: 'Mug', price: 14.99, icon: '☕' },
  { id: 'poster', name: 'Poster', price: 19.99, icon: '🖼️' },
]

/**
 * Available product colors
 */
export const COLORS = [
  { id: 'white', name: 'White', hex: '#FFFFFF' },
  { id: 'black', name: 'Black', hex: '#000000' },
  { id: 'navy', name: 'Navy', hex: '#1E3A8A' },
  { id: 'red', name: 'Red', hex: '#DC2626' },
]

/**
 * Available product sizes
 */
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

/**
 * Get product by ID
 * @param {string} id
 * @returns {object|null}
 */
export function getProductById(id) {
  return PRODUCTS.find(p => p.id === id) || null
}

/**
 * Get color by ID
 * @param {string} id
 * @returns {object|null}
 */
export function getColorById(id) {
  return COLORS.find(c => c.id === id) || null
}

/**
 * Calculate order total
 * @param {object} product
 * @param {number} quantity
 * @returns {string}
 */
export function calculateOrderTotal(product, quantity) {
  if (!product || !quantity) return '0.00'
  return (product.price * quantity).toFixed(2)
}
