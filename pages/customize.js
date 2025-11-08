import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FALLBACK_CAPTURE_IMAGE } from '../lib/placeholders'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import SectionHeading from '../components/ui/SectionHeading'

export default function Customize() {
  const router = useRouter()
  const [capturedFrame, setCapturedFrame] = useState(null)
  const [videoData, setVideoData] = useState(null) // Store video info
  const [selectedProduct, setSelectedProduct] = useState('tshirt')
  const [selectedColor, setSelectedColor] = useState('white')
  const [selectedSize, setSelectedSize] = useState('M')
  const [quantity, setQuantity] = useState(1)
  const [prompt, setPrompt] = useState('')
  const [generatedMockup, setGeneratedMockup] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState(null)

  useEffect(() => {
    // Load captured frame and video data from sessionStorage
    if (typeof window !== 'undefined') {
      const frame = sessionStorage.getItem('capturedFrame')
      const videoInfo = sessionStorage.getItem('videoData')
      
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
      
      // Load video data if available
      if (videoInfo) {
        try {
          setVideoData(JSON.parse(videoInfo))
        } catch (e) {
          console.warn('Could not parse video data:', e)
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
    // Store order data including video information
    if (typeof window !== 'undefined') {
      const orderData = {
        videoId: videoData?.id || null,
        videoSrc: videoData?.src || null,
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
    <div className="min-h-screen py-12">
      <Head>
        <title>Customize Your Merchandise — Merchify</title>
      </Head>

      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          eyebrow="Step 2 of 3 — Customize"
          title="Refine the moment into merch"
          subtitle="Pick your product and give the AI Designer a short prompt. We’ll blend the captured frame seamlessly."
          align="left"
          className="mb-4"
        />

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Preview */}
          <Card padding="p-6">
            <h2 className="text-xl font-semibold text-gray-100 mb-4">Preview</h2>
            
            <div className="relative rounded-xl p-6 mb-6 min-h-[380px] flex items-center justify-center border border-white/10 bg-white/5">
              {generatedMockup ? (
                <div className="text-center w-full">
                  <img 
                    src={generatedMockup} 
                    alt="AI-generated mockup"
                    className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg border-4 border-white/20"
                  />
                  <p className="text-sm text-gray-300 font-medium mt-4">✨ Generated by AI Designer</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-6xl mb-4">{selectedProductData.icon}</div>
                  <p className="text-gray-400 font-medium mb-4">{selectedProductData.name} - {colors.find(c => c.id === selectedColor).name}</p>
                  <img 
                    src={capturedFrame} 
                    alt="Merchandise preview"
                    className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg border-4 border-white/20"
                  />
                </div>
              )}
            </div>

            <Button onClick={generateMockup} disabled={isGenerating} size="lg" variant="primary" className={`w-full mb-4 ${isGenerating ? 'animate-pulse' : ''}`}>
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating with AI Designer...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate mockup (AI Designer)
                </>
              )}
            </Button>

            {generationError && (
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 mb-4">
                <p className="text-sm text-amber-800"><strong>Note:</strong> {generationError}</p>
              </div>
            )}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10 text-sm text-gray-300">
              <strong className="text-gray-200">Tip:</strong> Add a short style or effect (e.g. "retro pop art" or "add neon outline"). Keep it under 140 characters.
            </div>
          </Card>

          {/* Customization Options - Unified Panel */}
          <Card padding="p-6">
            {/* Product - Segmented control */}
            <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Product</h3>
            <div className="inline-flex rounded-lg overflow-hidden border border-white/10 mb-6">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => setSelectedProduct(product.id)}
                  className={`px-4 py-2 text-sm flex items-center gap-2 transition-colors ${selectedProduct === product.id ? 'bg-[var(--brand-surface-alt)] text-[var(--brand-primary)]' : 'bg-transparent text-gray-300 hover:bg-white/5'}`}
                >
                  <span className="text-lg">{product.icon}</span>
                  <span>{product.name}</span>
                </button>
              ))}
            </div>

            {/* Color */}
            <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Color</h3>
            <div className="flex gap-4 mb-6">
              {colors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color.id)}
                  aria-label={color.name}
                  className={`w-10 h-10 rounded-full border-4 transition-all ${selectedColor === color.id ? 'border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/50' : 'border-white/20 hover:border-white/30'}`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>

            {/* Size & Quantity */}
            <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Size & Quantity</h3>
            <div className="mb-6">
              <div className="flex gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg border font-medium transition-all ${
                      selectedSize === size
                        ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] bg-white/10'
                        : 'border-white/15 text-gray-300 hover:border-white/30'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-6">
              <div className="flex items-center gap-4">
                <Button variant="subtle" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</Button>
                <span className="text-2xl font-bold text-gray-100 min-w-[3rem] text-center">{quantity}</span>
                <Button variant="subtle" onClick={() => setQuantity(quantity + 1)}>+</Button>
              </div>
            </div>

            {/* Prompt */}
            <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Prompt for AI Designer</h3>
            <p className="text-sm text-gray-400 mb-3">Add instructions or creative direction (style, color, small effects). Keep it short for best results.</p>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Retro pop art, center the face, add bold caption 'WHO'S THAT GUY?'"
              className="w-full px-4 py-3 bg-white/5 text-gray-100 placeholder-gray-400 border border-white/10 rounded-xl focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent transition-colors min-h-[120px]"
            />
            <p className="text-xs text-gray-500 mt-2">Tip: Keep prompts concise (under 140 characters).</p>

            {/* Integrated price + proceed */}
            <div className="mt-8 flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-400">Total Price</span>
                <div className="text-3xl font-bold text-gray-100">${totalPrice}</div>
              </div>
              <Button onClick={proceedToCheckout} variant={generatedMockup ? 'primary' : 'subtle'} size="lg" className="min-w-[260px]">
                Proceed to Checkout
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </div>

            <Link href="/" className="block text-center mt-4 text-gray-400 hover:text-gray-200 transition-colors">
              ← Go back and capture a different frame
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
