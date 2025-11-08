import Head from 'next/head'
import Link from 'next/link'
import { useState, useRef } from 'react'
import StorageService from '../frontend/services/StorageService'

export default function Home() {
  const [capturedFrame, setCapturedFrame] = useState(null)
  const videoRef = useRef(null)

  // For demo: use static image as captured frame
  function captureFrame() {
    const imageUrl = '/images/rinku_meme.jpeg'
    setCapturedFrame(imageUrl)
    StorageService.saveCapturedFrame(imageUrl)
  }

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-blue-50 min-h-screen">
      <Head>
        <title>Merchify — Create Custom Merchandise from Videos</title>
      </Head>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 right-0 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
          <div className="absolute -bottom-40 left-0 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-6 text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 bg-blue-100 rounded-full text-sm font-medium text-blue-700 mb-6">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            Step 1 of 3 — Capture Your Moment
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Turn Your Video Into
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Custom Merchandise</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Play your video, pause at the perfect moment, and capture the frame. Then customize your merchandise and checkout.
          </p>
        </div>
      </section>

      {/* Video Player Section */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Play Your Video</h2>
            <p className="text-gray-600">Pause at the perfect moment and capture the frame for your merchandise</p>
          </div>

          <div className="relative bg-black rounded-xl overflow-hidden shadow-lg mb-6">
            <div className="flex items-center justify-center min-h-[300px] bg-black rounded-xl overflow-auto">
              <img
                src="/images/rinku_meme.jpeg"
                alt="Captured frame preview"
                className="rounded-xl shadow-lg border border-gray-200 bg-black"
                style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
              />
            </div>
            <span className="block text-center mt-2 text-gray-500 text-sm">Demo: This is the captured frame for merchandise</span>
          </div>

          <button
            onClick={captureFrame}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Capture This Frame
          </button>

          {capturedFrame && (
            <div className="mt-8 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center mb-4">
                <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-900">Frame Captured!</h3>
              </div>
              
              <div className="mb-6">
                <img src={capturedFrame} alt="Captured frame" className="w-full max-w-md mx-auto rounded-lg shadow-md border border-gray-200" />
              </div>

              <Link 
                href="/customize"
                className="inline-flex items-center justify-center w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Continue to Customize Merchandise
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600">Three simple steps to create your custom merchandise</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              step: '1', 
              title: 'Capture Frame', 
              desc: 'Play your video and capture the perfect moment',
              color: 'from-blue-500 to-blue-600',
              current: true
            },
            { 
              step: '2', 
              title: 'Customize', 
              desc: 'Choose your product and customize the design',
              color: 'from-purple-500 to-purple-600',
              current: false
            },
            { 
              step: '3', 
              title: 'Checkout', 
              desc: 'Review and complete your order',
              color: 'from-pink-500 to-pink-600',
              current: false
            },
          ].map((item, i) => (
            <div key={i} className={`relative bg-white rounded-xl p-8 shadow-lg border-2 ${item.current ? 'border-blue-500' : 'border-gray-200'}`}>
              <div className={`absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg`}>
                {item.step}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
