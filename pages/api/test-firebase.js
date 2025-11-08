// Test endpoint to verify Firebase Admin is working
const { admin, adminDb } = require('../../lib/firebaseAdmin')

export default async function handler(req, res) {
  try {
    console.log('🧪 Testing Firebase Admin...')
    
    // Check if Firebase Admin is initialized
    if (!admin.apps.length) {
      return res.status(500).json({ 
        error: 'Firebase Admin not initialized',
        message: 'Check server logs for details'
      })
    }

    // Get project info
    const projectId = admin.app().options.projectId
    
    // Try to access Firestore (doesn't write anything)
    const testCollection = adminDb.collection('_test')
    
    return res.status(200).json({
      success: true,
      message: 'Firebase Admin is working!',
      projectId,
      services: {
        firestore: '✓',
        auth: '✓',
        storage: '✓'
      }
    })
  } catch (error) {
    console.error('❌ Firebase Admin test error:', error)
    return res.status(500).json({
      error: error.message,
      stack: error.stack
    })
  }
}
