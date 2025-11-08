import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FALLBACK_CAPTURE_IMAGE } from '../lib/placeholders'

export default function Customize() {
  const router = useRouter()
  const [capturedFrame, setCapturedFrame] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState('tshirt')
  const [selectedColor, setSelectedColor] = useState('white')
  const [selectedSize, setSelectedSize] = useState('M')
  const [quantity, setQuantity] = useState(1)
  const [prompt, setPrompt] = useState('')
  const [generatedMockup, setGeneratedMockup] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState(null)

  useEffect(() => {
    // Load captured frame from sessionStorage
    if (typeof window !== 'undefined') {
      const frame = sessionStorage.getItem('capturedFrame')
      if (!frame) {
        // Redirect back to home if no frame captured
        router.push('/')
      } else {
        const normalizedFrame = frame.startsWith('data:') ? frame : FALLBACK_CAPTURE_IMAGE
        setCapturedFrame(normalizedFrame)
        if (normalizedFrame !== frame) {
          sessionStorage.setItem('capturedFrame', normalizedFrame)
        }
      }
    }
  }, [router])

  const products = [
    { id: 'tshirt', name: 'T-Shirt', price: 24.99, icon: '👕' },
    { id: 'hoodie', name: 'Hoodie', price: 44.99, icon: '🧥' },
    { id: 'mug', name: 'Mug', price: 14.99, icon: '☕' },
    { id: 'poster', name: 'Poster', price: 19.99, icon: '🖼️' },
  ]

  const colors = [
    { id: 'white', name: 'White', hex: '#FFFFFF' },
    { id: 'black', name: 'Black', hex: '#000000' },
    { id: 'navy', name: 'Navy', hex: '#1E3A8A' },
    { id: 'red', name: 'Red', hex: '#DC2626' },
  ]

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

  const selectedProductData = products.find(p => p.id === selectedProduct)
  const totalPrice = selectedProductData ? (selectedProductData.price * quantity).toFixed(2) : '0.00'

  async function generateMockup() {
    setIsGenerating(true)
    setGenerationError(null)
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          capturedFrame,
          product: selectedProductData,
          color: colors.find(c => c.id === selectedColor),
          prompt
        })
      })

      const contentType = response.headers.get('content-type') || ''
      let result = null
      if (contentType.includes('application/json')) {
        result = await response.json()
      } else {
        const responseText = await response.text()
        try {
          result = JSON.parse(responseText)
        } catch (_) {
          result = { error: responseText }
        }
      }

      if (!response.ok) {
        const statusNote = `Request failed (${response.status})`
        throw new Error(result?.error ? `${statusNote}: ${result.error}` : statusNote)
      }

      if (result?.imageUrl) {
        setGeneratedMockup(result.imageUrl)
        if (result.error) {
          setGenerationError(result.error)
        }
      } else {
        setGenerationError(result?.error || 'Failed to generate mockup')
      }
    } catch (err) {
      console.error('Mockup generation failed:', err)
      setGenerationError(err.message || 'Network error')
    } finally {
      setIsGenerating(false)
    }
  }

  function proceedToCheckout() {
    // Store order data
    if (typeof window !== 'undefined') {
      const orderData = {
        capturedFrame,
        product: selectedProductData,
        color: colors.find(c => c.id === selectedColor),
        size: selectedSize,
        quantity,
        totalPrice,
        prompt,
        mockupImage: generatedMockup || null,
      }
      sessionStorage.setItem('orderData', JSON.stringify(orderData))
      router.push('/checkout')
    }
  }

  if (!capturedFrame) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-purple-50 min-h-screen py-12">
      <Head>
        <title>Customize Your Merchandise — Merchify</title>
      </Head>

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center px-3 py-1 bg-purple-100 rounded-full text-sm font-medium text-purple-700 mb-4">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            Step 2 of 3 — Customize Your Design
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Choose Your <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Product</span>
          </h1>
          <p className="text-xl text-gray-600">Select your product, color, and size to create your custom merchandise</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Preview */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Preview</h2>
            
            <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-8 mb-6 min-h-[400px] flex items-center justify-center">
              {generatedMockup ? (
                <div className="text-center w-full">
                  <img 
                    src={generatedMockup} 
                    alt="AI-generated mockup"
                    className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg border-4 border-white"
                  />
                  <p className="text-sm text-green-700 font-medium mt-4">✨ Generated by Nano Banana (Gemini AI)</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-6xl mb-4">{selectedProductData.icon}</div>
                  <p className="text-gray-600 font-medium mb-4">{selectedProductData.name} - {colors.find(c => c.id === selectedColor).name}</p>
                  <img 
                    src={capturedFrame} 
                    alt="Merchandise preview"
                    className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg border-4 border-white"
                  />
                </div>
              )}
            </div>

            <button
              onClick={generateMockup}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center mb-4"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating with Nano Banana...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate with Nano Banana (Gemini AI)
                </>
              )}
            </button>

            {generationError && (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Note:</strong> {generationError}
                </p>
              </div>
            )}

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Fill in the prompt below before generating to guide the AI. Add details about colors, style, text, or positioning for better results.
              </p>
            </div>
          </div>

          {/* Customization Options */}
          <div className="space-y-6">
            {/* Product Selection */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Select Product</h3>
              <div className="grid grid-cols-2 gap-4">
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedProduct === product.id
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-4xl mb-2">{product.icon}</div>
                    <div className="font-semibold text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-600">${product.price}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Select Color</h3>
              <div className="flex gap-4">
                {colors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color.id)}
                    className={`w-12 h-12 rounded-full border-4 transition-all ${
                      selectedColor === color.id ? 'border-purple-600 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Size & Quantity */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Size & Quantity</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                <div className="flex gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                        selectedSize === size
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold"
                  >
                    −
                  </button>
                  <span className="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Prompt for designer / AI */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Add a prompt for Nano Banana</h3>
              <p className="text-sm text-gray-600 mb-4">Add instructions or creative direction for the design. This will be sent to Nano Banana (designer) and used for AI mockup generation at checkout.</p>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Make the colors pop, add a retro grain, center the face and include bold text 'LOL'"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors min-h-[120px]"
              />
              <p className="text-xs text-gray-500 mt-2">Tip: Keep prompts concise (1-2 sentences) for best results.</p>
            </div>

            {/* Price Summary */}
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 text-white">
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg">Total Price:</span>
                <span className="text-4xl font-bold">${totalPrice}</span>
              </div>

              <button
                onClick={proceedToCheckout}
                className="w-full bg-white hover:bg-gray-100 text-purple-600 font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center shadow-lg"
              >
                Proceed to Checkout
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>

              <Link href="/" className="block text-center mt-4 text-purple-100 hover:text-white transition-colors">
                ← Go back and capture a different frame
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
