// Firebase Admin SDK for server-side operations
const admin = require('firebase-admin')

console.log('🔍 Checking Firebase Admin environment variables...')
console.log('FIREBASE_SERVICE_ACCOUNT_KEY:', process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? 'SET ✓' : 'NOT SET ✗')
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'SET ✓' : 'NOT SET ✗')
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'SET ✓' : 'NOT SET ✗')
console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'SET ✓' : 'NOT SET ✗')

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    // Option 1: Using service account key file
    console.log('ℹ️ Initializing Firebase Admin...') 
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      console.log('📦 Initializing Firebase Admin with SERVICE_ACCOUNT_KEY...')
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      })
 
    } 
    // Option 2: Using individual credentials
    else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      console.log('📦 Initializing Firebase Admin with individual credentials...')
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      })
      console.log('✅ Firebase Admin initialized with individual credentials')
    }
    // Option 3: Default application credentials (for Cloud environments)
    else {
      console.log('⚠️ No Firebase Admin credentials found. Using default credentials (may fail locally).')
      admin.initializeApp()
      console.log('✅ Firebase Admin initialized with default credentials')
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error.message)
    console.error('Stack:', error.stack)
  }
} else {
  console.log('ℹ️ Firebase Admin already initialized')
}

const adminDb = admin.firestore()
const adminAuth = admin.auth()
const adminStorage = admin.storage()

module.exports = {
  admin,
  adminDb,
  adminAuth,
  adminStorage,
}
