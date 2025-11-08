import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useRouter } from 'next/router'
import { initializeUserDocument } from '../lib/firestore'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        })
        
        // Initialize user document in Firestore if it doesn't exist
        try {
          await initializeUserDocument(user.uid, {
            email: user.email,
            displayName: user.displayName,
          })
        } catch (error) {
          console.error('Error initializing user document:', error)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const value = {
    user,
    loading,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
