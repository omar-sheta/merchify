import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { saveDesign } from '../lib/firestore'

export default function Checkout() {
  const router = useRouter()
  const [orderData, setOrderData] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'United States',
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [savedDesignId, setSavedDesignId] = useState(null)

  useEffect(() => {
    // Load order data from sessionStorage
    if (typeof window !== 'undefined') {
      const data = sessionStorage.getItem('orderData')
      if (!data) {
        // Redirect back to home if no order data
        router.push('/')
      } else {
        setOrderData(JSON.parse(data))
      }
    }
  }, [router])

  function handleInputChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setIsProcessing(true)

    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Save the design to Firestore (images will be uploaded to Storage)
      console.log('Saving design and uploading images...')
      const designData = {
        videoId: orderData.videoId || null,
        videoSrc: orderData.videoSrc || null,
        capturedFrame: orderData.capturedFrame,
        product: orderData.product,
        color: orderData.color,
        size: orderData.size,
        quantity: orderData.quantity,
        prompt: orderData.prompt || '',
        mockupImage: orderData.mockupImage || null,
        totalPrice: orderData.totalPrice,
      }

      const designId = await saveDesign(designData)
      setSavedDesignId(designId)
      console.log('Design saved with ID:', designId)

      setIsProcessing(false)
      setOrderComplete(true)

      // Clear session storage
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('capturedFrame')
        sessionStorage.removeItem('orderData')
      }
    } catch (error) {
      console.error('Error processing order:', error)
      setIsProcessing(false)
      
      // Show more helpful error message
      const errorMessage = error.message || 'There was an error processing your order.'
      alert(`Error: ${errorMessage}\n\nPlease try again or contact support if the issue persists.`)
    }
  }

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (orderComplete) {
    return (
      <div className="bg-gradient-to-b from-slate-50 via-white to-green-50 min-h-screen py-12">
        <Head>
          <title>Order Complete — Merchify</title>
        </Head>

        <div className="max-w-2xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-2xl p-12 border border-gray-100 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
            <p className="text-xl text-gray-600 mb-8">
              Thank you for your order. We'll send you an email confirmation shortly.
            </p>

            <div className="bg-green-50 rounded-xl p-6 border border-green-200 mb-8">
              <p className="text-sm text-green-800">
                <strong>Order Number:</strong> #{Math.random().toString(36).substr(2, 9).toUpperCase()}
              </p>
              <p className="text-sm text-green-800 mt-2">
                <strong>Email:</strong> {formData.email}
              </p>
            </div>

            <Link 
              href="/"
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Create Another Merchandise
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-pink-50 min-h-screen py-12">
      <Head>
        <title>Checkout — Merchify</title>
      </Head>

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center px-3 py-1 bg-pink-100 rounded-full text-sm font-medium text-pink-700 mb-4">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            Step 3 of 3 — Complete Your Order
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            <span className="bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">Checkout</span>
          </h1>
          <p className="text-xl text-gray-600">Review your order and enter shipping details</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Shipping Information</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="John Doe"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="123 Main St"
                  />
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="New York"
                  />
                </div>

                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    required
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="10001"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                    Country *
                  </label>
                  <select
                    id="country"
                    name="country"
                    required
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option>United States</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                    <option>Australia</option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <Link 
                  href="/customize"
                  className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-all text-center"
                >
                  ← Back to Customize
                </Link>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-6 rounded-xl transition-all disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading & Processing...
                    </>
                  ) : (
                    <>
                      Complete Order
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 sticky top-24">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Order Summary</h2>

              <div className="mb-6">
                <img 
                  src={orderData.mockupImage || orderData.capturedFrame} 
                  alt="Your merch mockup" 
                  className="w-full rounded-lg shadow-md border border-gray-200 mb-4"
                />
                {orderData.prompt && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-md border border-gray-100">
                    <div className="text-sm text-gray-700 font-medium mb-1">Designer / AI Prompt</div>
                    <div className="text-sm text-gray-600 whitespace-pre-wrap">{orderData.prompt}</div>
                  </div>
                )}
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {orderData.product.icon} {orderData.product.name}
                </div>
                <div className="text-sm text-gray-600">
                  Color: {orderData.color.name} | Size: {orderData.size} | Qty: {orderData.quantity}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${orderData.totalPrice}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>${(parseFloat(orderData.totalPrice) * 0.1).toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>${(parseFloat(orderData.totalPrice) * 1.1).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-xs text-blue-800">
                  <strong>🔒 Secure Checkout:</strong> Your payment information is encrypted and secure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
