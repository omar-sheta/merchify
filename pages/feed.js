import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useAuth } from '../context/AuthContext'
import { getAllDesigns, toggleLike, getUserLikes } from '../lib/firestore'

export default function Feed() {
  const { user } = useAuth()
  const [designs, setDesigns] = useState([])
  const [userLikes, setUserLikes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDesigns()
  }, [user])

  async function loadDesigns() {
    try {
      setLoading(true)
      const allDesigns = await getAllDesigns()
      
      // Sort by creation date (newest first)
      allDesigns.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0
        const bTime = b.createdAt?.toMillis?.() || 0
        return bTime - aTime
      })
      
      setDesigns(allDesigns)

      // Load user's likes if authenticated
      if (user) {
        const likes = await getUserLikes(user.uid)
        setUserLikes(likes)
      }
    } catch (err) {
      console.error('Error loading designs:', err)
      setError('Failed to load designs')
    } finally {
      setLoading(false)
    }
  }

  async function handleLikeToggle(designId) {
    if (!user) {
      alert('Please sign in to like designs')
      return
    }

    try {
      const isNowLiked = await toggleLike(user.uid, designId)
      
      // Update local state
      if (isNowLiked) {
        setUserLikes([...userLikes, designId])
      } else {
        setUserLikes(userLikes.filter(id => id !== designId))
      }
    } catch (err) {
      console.error('Error toggling like:', err)
      alert('Failed to update like')
    }
  }

  function isLiked(designId) {
    return userLikes.includes(designId)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading designs...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-purple-50">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={loadDesigns}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-slate-50 via-white to-purple-50 min-h-screen py-12">
      <Head>
        <title>Design Feed — Merchify</title>
      </Head>

      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            Design <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Feed</span>
          </h1>
          <p className="text-xl text-gray-600">
            Explore custom merchandise designs from the community
          </p>
        </div>

        {/* Designs Grid */}
        {designs.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎨</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No designs yet</h2>
            <p className="text-gray-600 mb-6">Be the first to create and share a design!</p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Create a Design
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {designs.map((design) => (
              <DesignCard
                key={design.id}
                design={design}
                isLiked={isLiked(design.id)}
                onLikeToggle={() => handleLikeToggle(design.id)}
                user={user}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function DesignCard({ design, isLiked, onLikeToggle, user }) {
  const imageToShow = design.mockupImage || design.capturedFrame
  const createdDate = design.createdAt?.toDate?.()

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow overflow-hidden border border-gray-100">
      {/* Image */}
      <div className="relative bg-gray-100 aspect-square">
        <img
          src={imageToShow}
          alt={`${design.product?.name} design`}
          className="w-full h-full object-contain"
        />
        
        {/* Like Button Overlay */}
        <button
          onClick={onLikeToggle}
          disabled={!user}
          className={`absolute top-4 right-4 p-3 rounded-full shadow-lg transition-all ${
            isLiked
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-white/90 text-gray-600 hover:bg-white hover:scale-110'
          } ${!user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          title={!user ? 'Sign in to like' : isLiked ? 'Unlike' : 'Like'}
        >
          <svg
            className="w-6 h-6"
            fill={isLiked ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {/* AI Generated Badge */}
        {design.mockupImage && (
          <div className="absolute bottom-4 left-4 px-3 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
            ✨ AI Generated
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900">
            {design.product?.icon} {design.product?.name}
          </h3>
          <span className="text-lg font-bold text-purple-600">
            ${design.totalPrice}
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span>Color:</span>
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: design.color?.hex }}
              />
              <span className="font-medium">{design.color?.name}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span>Size:</span>
            <span className="font-medium">{design.size}</span>
          </div>

          <div className="flex items-center justify-between">
            <span>Quantity:</span>
            <span className="font-medium">{design.quantity}</span>
          </div>

          {design.prompt && (
            <div className="pt-3 mt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 italic">
                "{design.prompt}"
              </p>
            </div>
          )}

          {createdDate && (
            <div className="pt-2 text-xs text-gray-400">
              {createdDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}