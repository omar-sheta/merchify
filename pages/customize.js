import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FALLBACK_CAPTURE_IMAGE } from '../lib/placeholders'
import { getDesignById } from '../lib/firestore'
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
  const [loadingDesign, setLoadingDesign] = useState(false)

  // Load design from URL parameter if present
  useEffect(() => {
    const loadDesignFromUrl = async () => {
      if (!router.isReady) return;
      
      const designId = router.query.design;
      if (designId) {
        setLoadingDesign(true);
        try {
          const design = await getDesignById(designId);
          
          // Load the design data
          setCapturedFrame(design.capturedFrame || FALLBACK_CAPTURE_IMAGE);
          setGeneratedMockup(design.mockupImage);
          setPrompt(design.prompt || '');
          
          // Set product details
          if (design.product?.id) {
            setSelectedProduct(design.product.id);
          }
          if (design.color?.id) {
            setSelectedColor(design.color.id);
          }
          if (design.size) {
            setSelectedSize(design.size);
          }
          if (design.quantity) {
            setQuantity(design.quantity);
          }
          
          // Set video data if available
          if (design.videoId) {
            setVideoData({
              id: design.videoId,
              src: design.videoSrc
            });
          }
          
          console.log('Loaded design:', designId);
        } catch (error) {
          console.error('Error loading design:', error);
          // Fall back to session storage if design loading fails
        } finally {
          setLoadingDesign(false);
        }
      }
    };

    loadDesignFromUrl();
  }, [router.isReady, router.query.design]);

  useEffect(() => {
    // Load captured frame and video data from sessionStorage (if not loading from URL)
    if (typeof window !== 'undefined' && !router.query.design) {
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
    { id: 'black', name: 'Black', hex: '#212121' },
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
      <div className="min-h-screen flex items-center justify-center bg-bg-deep-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 bg-bg-deep-black">
      <Head>
        <title>Jokester — Customize Your Merch</title>
      </Head>

      <div className="max-w-7xl mx-auto px-6">
        <SectionHeading
          eyebrow="Step 2: Customize Your Masterpiece"
          title="Design Your Merch"
          subtitle="Choose your product, pick a color, and give our AI Designer a prompt. We'll blend your captured frame to create a one-of-a-kind item."
          align="left"
          className="mb-4"
        />

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Preview */}
          <Card padding="p-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Preview</h2>
            
            <div className="relative rounded-xl p-6 mb-6 min-h-[380px] flex items-center justify-center bg-bg-deep-black">
              {generatedMockup ? (
                <div className="text-center w-full">
                  <img 
                    src={generatedMockup} 
                    alt="AI-generated mockup"
                    className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg border-4 border-bg-card-light"
                  />
                  <p className="text-sm text-green-400 font-medium mt-4">✨ Generated by AI Designer</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-6xl mb-4">{selectedProductData.icon}</div>
                  <p className="text-text-primary font-medium mb-4">{selectedProductData.name} - {colors.find(c => c.id === selectedColor).name}</p>
                  <img 
                    src={capturedFrame} 
                    alt="Merchandise preview"
                    className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg border-4 border-bg-card-light"
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
                  Generate Mockup (AI Designer)
                </>
              )}
            </Button>

            {generationError && (
              <div className="bg-accent-yellow/10 rounded-lg p-4 border border-accent-yellow/20 mb-4">
                <p className="text-sm text-accent-yellow"><strong>Note:</strong> {generationError}</p>
              </div>
            )}
            <div className="bg-bg-card-light/50 rounded-lg p-4 border border-bg-card-light text-sm text-text-secondary">
              <strong>Tip:</strong> Add a short style or effect (e.g. "retro pop art" or "add neon outline"). Keep it under 140 characters.
            </div>
          </Card>

          {/* Customization Options */}
          <Card padding="p-8">
            {/* Product Selection */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wide">Product</h3>
              <div className="flex w-full bg-bg-card rounded-lg p-1 border border-bg-card-light">
                {products.map(product => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product.id)}
                    className={`flex-1 text-center px-4 py-2 rounded-md text-sm font-medium transition-all ${selectedProduct === product.id ? 'bg-bg-card-light shadow-sm text-text-primary' : 'text-text-secondary hover:bg-bg-card-light/50'}`}
                  >
                    {product.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wide">Color</h3>
              <div className="flex gap-4">
                {colors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color.id)}
                    aria-label={color.name}
                    className={`relative w-10 h-10 rounded-full border-2 transition-all ${selectedColor === color.id ? 'border-transparent ring-2 ring-accent-orange' : 'border-bg-card-light'}`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                  </button>
                ))}
              </div>
            </div>

            {/* Size & Quantity */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wide">Size & Quantity</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-2">Size</label>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1.5 rounded-md border font-medium transition-all text-sm ${
                          selectedSize === size
                            ? 'bg-bg-card-light border-transparent text-text-primary'
                            : 'border-bg-card-light hover:bg-bg-card text-text-secondary'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-2">Quantity</label>
                  <div className="flex items-center gap-3">
                    <Button variant="subtle" size="md" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</Button>
                    <span className="text-xl font-bold text-text-primary min-w-[2rem] text-center">{quantity}</span>
                    <Button variant="subtle" size="md" onClick={() => setQuantity(quantity + 1)}>+</Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Prompt for designer / AI */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wide">Prompt for AI Designer</h3>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Retro pop art, center the face..."
                className="w-full px-4 py-3 bg-bg-card border border-bg-card-light rounded-xl focus:ring-2 focus:ring-accent-orange focus:border-transparent transition-colors min-h-[100px] text-text-primary"
              />
            </div>

            {/* Price Summary & Checkout */}
            <div className="border-t border-bg-card-light pt-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg text-text-secondary">Total Price:</span>
                <span className="text-4xl font-bold text-text-primary">${totalPrice}</span>
              </div>

              <Button
                onClick={proceedToCheckout}
                variant={generatedMockup ? 'primary' : 'secondary'}
                size="lg"
                className="w-full"
                disabled={!generatedMockup}
              >
                Proceed to Checkout
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>

              <Link href="/" className="block text-center mt-4 text-accent-orange hover:text-accent-orange/80 transition-colors text-sm">
                ← Go back and capture a different frame
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
