import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { saveDesign, getDesignById } from '../lib/firestore'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import SectionHeading from '../components/ui/SectionHeading'

export default function Checkout() {
  const router = useRouter()
  const { design: designId } = router.query
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
    async function loadOrderData() {
      // Check if we have a design ID in the URL
      if (designId) {
        console.log('Loading design from Firestore:', designId)
        try {
          const design = await getDesignById(designId)
          if (design) {
            // Convert the existing design to order data format
            setOrderData({
              videoId: design.videoId,
              videoSrc: design.videoSrc,
              capturedFrame: design.capturedFrame,
              product: design.product,
              color: design.color,
              size: design.size,
              quantity: design.quantity,
              prompt: design.prompt || '',
              mockupImage: design.mockupImage,
              totalPrice: design.totalPrice,
            })
            return
          }
        } catch (error) {
          console.error('Error loading design:', error)
        }
      }

      // Otherwise, load order data from sessionStorage
      if (typeof window !== 'undefined') {
        const data = sessionStorage.getItem('orderData')
        if (!data) {
          // Redirect back to home if no order data and no design ID
          router.push('/')
        } else {
          setOrderData(JSON.parse(data))
        }
      }
    }

    if (router.isReady) {
      loadOrderData()
    }
  }, [router, router.isReady, designId])

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
      <div className="min-h-screen flex items-center justify-center bg-bg-deep-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center bg-bg-deep-black">
        <Head>
          <title>Order Complete — Jokester</title>
        </Head>

        <div className="max-w-2xl mx-auto px-6 w-full">
          <Card padding="p-12" className="text-center">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-500/20">
              <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-4xl font-bold text-text-primary mb-4">Order Confirmed!</h1>
            <p className="text-xl text-text-secondary mb-8">
              Thanks for your order! We'll send a confirmation to your email shortly.
            </p>

            <div className="bg-bg-card rounded-xl p-6 border border-bg-card-light mb-8">
              <p className="text-sm text-text-secondary">
                <strong>Order Number:</strong> #{Math.random().toString(36).substr(2, 9).toUpperCase()}
              </p>
              <p className="text-sm text-text-secondary mt-2">
                <strong>Email:</strong> {formData.email}
              </p>
            </div>

            <Link href="/">
              <Button variant="primary" size="lg">
                Create Another Masterpiece
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 bg-bg-deep-black">
      <Head>
        <title>Checkout — Jokester</title>
      </Head>

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <SectionHeading
          eyebrow="Step 3: Checkout"
          title="Finalize Your Order"
          subtitle="Confirm your shipping details and place your order. Your custom merch is just a few clicks away."
          align="left"
          className="mb-6"
        />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Section */}
              <Card padding="p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Contact</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-bg-card border border-bg-card-light rounded-xl focus:ring-2 focus:ring-accent-orange focus:border-transparent transition-colors text-text-primary"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-bg-card border border-bg-card-light rounded-xl focus:ring-2 focus:ring-accent-orange focus:border-transparent transition-colors text-text-primary"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </Card>

              {/* Shipping Section */}
              <Card padding="p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Shipping</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-text-secondary mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-bg-card border border-bg-card-light rounded-xl focus:ring-2 focus:ring-accent-orange focus:border-transparent transition-colors text-text-primary"
                      placeholder="123 Main St"
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-text-secondary mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-bg-card border border-bg-card-light rounded-xl focus:ring-2 focus:ring-accent-orange focus:border-transparent transition-colors text-text-primary"
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-text-secondary mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      required
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-bg-card border border-bg-card-light rounded-xl focus:ring-2 focus:ring-accent-orange focus:border-transparent transition-colors text-text-primary"
                      placeholder="10001"
                    />
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-text-secondary mb-2">
                      Country *
                    </label>
                    <select
                      id="country"
                      name="country"
                      required
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-bg-card border border-bg-card-light rounded-xl focus:ring-2 focus:ring-accent-orange focus:border-transparent transition-colors text-text-primary"
                    >
                      <option>United States</option>
                      <option>Canada</option>
                      <option>United Kingdom</option>
                      <option>Australia</option>
                    </select>
                  </div>
                </div>
              </Card>

              <div className="flex gap-4 pt-2">
                <Link href="/customize" className="flex-1">
                  <Button variant="subtle" className="w-full">← Back to Customize</Button>
                </Link>
                <Button type="submit" disabled={isProcessing} variant="primary" className="flex-1">
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
                </Button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24" padding="p-6">
              <h2 className="text-lg font-semibold text-text-primary mb-4">Order Summary</h2>

              <div className="mb-5">
                <img 
                  src={orderData.mockupImage || orderData.capturedFrame} 
                  alt="Your merch mockup" 
                  className="w-full rounded-lg shadow-md border border-bg-card-light mb-4"
                />
                {orderData.prompt && (
                  <div className="mb-3 p-3 bg-bg-card rounded-md border border-bg-card-light">
                    <div className="text-sm text-text-secondary font-medium mb-1">Designer / AI Prompt</div>
                    <div className="text-sm text-text-secondary whitespace-pre-wrap">{orderData.prompt}</div>
                  </div>
                )}
                <div className="text-base font-semibold text-text-primary mb-1">
                  {orderData.product.icon} {orderData.product.name}
                </div>
                <div className="text-xs text-text-secondary">
                  Color: {orderData.color.name} | Size: {orderData.size} | Qty: {orderData.quantity}
                </div>
              </div>

              <div className="border-t border-bg-card-light pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal</span>
                  <span>${orderData.totalPrice}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Shipping</span>
                  <span className="text-green-400 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Tax</span>
                  <span>${(parseFloat(orderData.totalPrice) * 0.1).toFixed(2)}</span>
                </div>
                <div className="border-t border-bg-card-light pt-3 flex justify-between text-base font-bold text-text-primary">
                  <span>Total</span>
                  <span>${(parseFloat(orderData.totalPrice) * 1.1).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-4 bg-bg-card-light/50 rounded-lg p-3 border border-bg-card-light">
                <p className="text-[11px] text-text-secondary"><strong>🔒 Secure:</strong> Payment info is encrypted.</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
