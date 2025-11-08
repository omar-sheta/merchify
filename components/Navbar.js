import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import Button from './ui/Button' // Assuming Button can be used here.

export default function Navbar() {
  const { user, signOut } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-bg-deep-black border-b border-bg-card-light shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/discover" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-accent-orange rounded-lg flex items-center justify-center text-white font-bold text-2xl">
            J
          </div>
          <span className="text-xl font-bold text-text-primary">Jokester</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/discover" className="text-text-primary hover:text-accent-orange font-medium transition-colors">
            Discover
          </Link>
          <a
            href="https://github.com/omar-sheta/merchify"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-bg-card-light hover:bg-bg-card text-text-primary text-sm rounded-lg font-medium transition-colors border border-transparent"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </a>

          {/* User Menu */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-bg-card transition-colors"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || user.email}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-accent-orange rounded-full flex items-center justify-center text-white font-medium">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-text-primary">
                  {user.displayName || user.email}
                </span>
                <svg
                  className={`w-4 h-4 text-text-secondary transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-bg-card rounded-lg shadow-lg border border-bg-card-light py-1">
                  <div className="px-4 py-2 border-b border-bg-card-light">
                    <p className="text-sm font-medium text-text-primary">{user.displayName || 'User'}</p>
                    <p className="text-xs text-text-secondary truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false)
                      signOut()
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-text-primary hover:text-accent-orange hover:bg-bg-card-light transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
