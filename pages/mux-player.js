import { useState } from 'react'
import Head from 'next/head'
import MuxPlayer from '../frontend/components/MuxPlayer'

export default function MuxPlayerPage() {
  const [playbackId, setPlaybackId] = useState('')
  const [input, setInput] = useState('')

  function load() {
    setPlaybackId(input.trim())
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 py-12">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-3 py-1 bg-blue-100 rounded-full text-sm font-medium text-blue-700 mb-6">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/></svg>
            Professional Streaming
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Mux Player <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Integration</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Test Mux video playback by entering a playback ID. Built with industry-standard streaming technology.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 mb-8">
          <div className="mb-8">
            <label htmlFor="playback-id" className="block text-sm font-semibold text-gray-700 mb-3">
              Mux Playback ID
            </label>
            <div className="flex gap-4">
              <input
                id="playback-id"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && load()}
                placeholder="Paste your Mux playback ID here (e.g. abc123XYZdef456...)"
                className="flex-1 px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <button
                onClick={load}
                disabled={!input.trim()}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                Load Video
              </button>
            </div>
          </div>

          <MuxPlayer playbackId={playbackId} />
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            { icon: '🎬', title: 'HLS Streaming', desc: 'Stream videos reliably over HTTP Live Streaming protocol' },
            { icon: '🌍', title: 'Global CDN', desc: 'Content delivered through a worldwide network' },
            { icon: '📊', title: 'Analytics', desc: 'Track viewer engagement and playback metrics' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Integration Guide
          </h3>
          <div className="space-y-3 text-gray-700">
            <p><strong>Safari:</strong> Native HLS playback via &lt;video&gt; element</p>
            <p><strong>Chrome/Firefox:</strong> Install hls.js for broad compatibility</p>
            <p><strong>Production:</strong> Use Mux's official player SDK for enhanced features</p>
            <p className="text-sm text-gray-600 pt-2">See <code className="bg-white px-2 py-1 rounded text-xs">components/MuxPlayer.js</code> for implementation details.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
