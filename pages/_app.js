import '../styles/globals.css'
import { AuthProvider } from '../context/AuthContext'
import ProtectedRoute from '../components/ProtectedRoute'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useRouter } from 'next/router'

const publicPages = ['/login', '/register']

export default function MyApp({ Component, pageProps }) {
  const router = useRouter()
  const isPublicPage = publicPages.includes(router.pathname)

  return (
    <AuthProvider>
      {isPublicPage ? (
        <Component {...pageProps} />
      ) : (
        <ProtectedRoute>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              <Component {...pageProps} />
            </main>
            <Footer />
          </div>
        </ProtectedRoute>
      )}
    </AuthProvider>
  )
}
