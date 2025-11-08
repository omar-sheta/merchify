/**
 * Storage Service for managing browser storage
 */
class StorageService {
  /**
   * Save captured frame to session storage
   * @param {string} frameUrl
   */
  saveCapturedFrame(frameUrl) {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('capturedFrame', frameUrl)
    }
  }

  /**
   * Get captured frame from session storage
   * @returns {string|null}
   */
  getCapturedFrame() {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('capturedFrame')
    }
    return null
  }

  /**
   * Save order data to session storage
   * @param {object} orderData
   */
  saveOrderData(orderData) {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('orderData', JSON.stringify(orderData))
    }
  }

  /**
   * Get order data from session storage
   * @returns {object|null}
   */
  getOrderData() {
    if (typeof window !== 'undefined') {
      const data = sessionStorage.getItem('orderData')
      return data ? JSON.parse(data) : null
    }
    return null
  }

  /**
   * Clear all session data
   */
  clearSessionData() {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('capturedFrame')
      sessionStorage.removeItem('orderData')
    }
  }
}

export default new StorageService()
