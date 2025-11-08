import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '../lib/firebase'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'

export default function Login() {
  const router = useRouter()
  const { returnUrl } = router.query
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push(returnUrl || '/')
    } catch (err) {
      console.error('Login error:', err)
      if (err.code === 'auth/invalid-credential') {
        setError('Invalid email or password')
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email')
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)

    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      router.push(returnUrl || '/')
    } catch (err) {
      console.error('Google login error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Login - Jokester</title>
      </Head>

      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-bg-deep-black">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-text-primary mb-2">
              Welcome Back! 👋
            </h1>
            <p className="text-text-secondary">
              Sign in to continue creating hilarious merch.
            </p>
          </div>

          {/* Login Form */}
          <Card padding="p-8">
            <form onSubmit={handleEmailLogin} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-lg">
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 bg-bg-card border border-bg-card-light placeholder-text-secondary text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-4 py-3 bg-bg-card border border-bg-card-light placeholder-text-secondary text-text-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              {/* Forgot Password Link */}
              <div className="flex items-center justify-end">
                <Link href="/forgot-password" className="text-sm text-accent-orange hover:text-accent-orange/80">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                className="w-full"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-bg-card-light"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-bg-card text-text-secondary">Or continue with</span>
                </div>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              variant="secondary"
              className="mt-6 w-full"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </Button>
          </Card>

          {/* Sign Up Link */}
          <p className="text-center text-text-secondary">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-accent-orange hover:text-accent-orange/80">
              Sign up for free
            </Link>
          </p>

          {/* Back to Home */}
          <div className="text-center">
            <Link href="/" className="text-sm text-text-secondary hover:text-text-primary">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
