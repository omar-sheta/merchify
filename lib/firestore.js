import { collection, addDoc, doc, getDoc, getDocs, query, where, updateDoc, deleteDoc, serverTimestamp, arrayUnion, arrayRemove, setDoc } from 'firebase/firestore'
import { ref, uploadString, getDownloadURL } from 'firebase/storage'
import { db, storage } from './firebase'

/**
 * Firestore Data Structure:
 * 
 * designs/ (collection)
 *   - designId (auto-generated)
 *     - videoId: string (identifies which video this design is from)
 *     - videoSrc: string (URL/path to the video)
 *     - capturedFrame: string (base64 image data)
 *     - product: object { id, name, price, icon }
 *     - color: object { id, name, hex }
 *     - size: string
 *     - quantity: number
 *     - prompt: string (AI generation prompt)
 *     - mockupImage: string (AI-generated mockup URL)
 *     - createdAt: timestamp
 *     - totalPrice: number
 * 
 * users/ (collection)
 *   - userId (Firebase Auth UID)
 *     - email: string
 *     - displayName: string
 *     - likes: array of designIds
 *     - createdAt: timestamp
 *     - updatedAt: timestamp
 */

// ============================================
// DESIGN FUNCTIONS (related to videos)
// ============================================

/**
 * Upload a base64 image to Firebase Storage
 * @param {string} base64Data - Base64 encoded image data
 * @param {string} path - Storage path (e.g., 'designs/image-id.jpg')
 * @returns {Promise<string>} - Download URL of the uploaded image
 */
async function uploadImageToStorage(base64Data, path) {
  try {
    // Check if it's already a URL (not base64)
    if (base64Data.startsWith('http://') || base64Data.startsWith('https://')) {
      return base64Data
    }

    const storageRef = ref(storage, path)
    await uploadString(storageRef, base64Data, 'data_url')
    const downloadURL = await getDownloadURL(storageRef)
    return downloadURL
  } catch (error) {
    console.error('Error uploading image to storage:', error)
    throw error
  }
}

/**
 * Save a design after checkout
 * @param {Object} designData - Design data including video info, product, mockup, etc.
 * @returns {Promise<string>} - The ID of the created design document
 */
export async function saveDesign(designData) {
  try {
    // Generate a unique ID for this design
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 9)
    const designId = `design-${timestamp}-${randomStr}`

    // Upload images to Firebase Storage if they are base64
    let capturedFrameUrl = designData.capturedFrame
    let mockupImageUrl = designData.mockupImage

    // Only upload if the data is base64 (not already a URL)
    if (capturedFrameUrl && capturedFrameUrl.startsWith('data:')) {
      console.log('Uploading captured frame to Storage...')
      capturedFrameUrl = await uploadImageToStorage(
        capturedFrameUrl,
        `designs/${designId}/captured-frame.jpg`
      )
    }

    if (mockupImageUrl && mockupImageUrl.startsWith('data:')) {
      console.log('Uploading mockup image to Storage...')
      mockupImageUrl = await uploadImageToStorage(
        mockupImageUrl,
        `designs/${designId}/mockup.jpg`
      )
    }

    // Create the design document with Storage URLs
    const designDoc = {
      videoId: designData.videoId || null,
      videoSrc: designData.videoSrc || null,
      capturedFrame: capturedFrameUrl,
      product: designData.product,
      color: designData.color,
      size: designData.size,
      quantity: designData.quantity,
      prompt: designData.prompt || '',
      mockupImage: mockupImageUrl || null,
      totalPrice: parseFloat(designData.totalPrice) || 0,
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, 'designs'), designDoc)
    console.log('Design saved with ID:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('Error saving design:', error)
    throw error
  }
}

/**
 * Get all designs
 * @returns {Promise<Array>} - Array of design objects with IDs
 */
export async function getAllDesigns() {
  try {
    const querySnapshot = await getDocs(collection(db, 'designs'))
    const designs = []
    querySnapshot.forEach((doc) => {
      designs.push({
        id: doc.id,
        ...doc.data(),
      })
    })
    return designs
  } catch (error) {
    console.error('Error getting designs:', error)
    throw error
  }
}

/**
 * Get designs for a specific video
 * @param {string} videoId - The ID of the video
 * @returns {Promise<Array>} - Array of design objects
 */
export async function getDesignsByVideo(videoId) {
  try {
    const q = query(collection(db, 'designs'), where('videoId', '==', videoId))
    const querySnapshot = await getDocs(q)
    const designs = []
    querySnapshot.forEach((doc) => {
      designs.push({
        id: doc.id,
        ...doc.data(),
      })
    })
    return designs
  } catch (error) {
    console.error('Error getting designs by video:', error)
    throw error
  }
}

/**
 * Get a single design by ID
 * @param {string} designId - The design document ID
 * @returns {Promise<Object>} - Design object
 */
export async function getDesignById(designId) {
  try {
    const docRef = doc(db, 'designs', designId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      }
    } else {
      throw new Error('Design not found')
    }
  } catch (error) {
    console.error('Error getting design:', error)
    throw error
  }
}

// ============================================
// USER LIKES FUNCTIONS (related to users)
// ============================================

/**
 * Initialize user document if it doesn't exist
 * @param {string} userId - Firebase Auth UID
 * @param {Object} userData - User data (email, displayName)
 * @returns {Promise<void>}
 */
export async function initializeUserDocument(userId, userData) {
  try {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        email: userData.email || '',
        displayName: userData.displayName || '',
        likes: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      console.log('User document initialized for:', userId)
    }
  } catch (error) {
    console.error('Error initializing user document:', error)
    throw error
  }
}

/**
 * Add a like to a design for a specific user
 * @param {string} userId - Firebase Auth UID
 * @param {string} designId - The design document ID
 * @returns {Promise<void>}
 */
export async function likeDesign(userId, designId) {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      likes: arrayUnion(designId),
      updatedAt: serverTimestamp(),
    })
    console.log('Design liked:', designId)
  } catch (error) {
    console.error('Error liking design:', error)
    throw error
  }
}

/**
 * Remove a like from a design for a specific user
 * @param {string} userId - Firebase Auth UID
 * @param {string} designId - The design document ID
 * @returns {Promise<void>}
 */
export async function unlikeDesign(userId, designId) {
  try {
    const userRef = doc(db, 'users', userId)
    await updateDoc(userRef, {
      likes: arrayRemove(designId),
      updatedAt: serverTimestamp(),
    })
    console.log('Design unliked:', designId)
  } catch (error) {
    console.error('Error unliking design:', error)
    throw error
  }
}

/**
 * Get all liked designs for a user
 * @param {string} userId - Firebase Auth UID
 * @returns {Promise<Array>} - Array of design IDs that the user has liked
 */
export async function getUserLikes(userId) {
  try {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)
    
    if (userSnap.exists()) {
      const userData = userSnap.data()
      return userData.likes || []
    } else {
      return []
    }
  } catch (error) {
    console.error('Error getting user likes:', error)
    throw error
  }
}

/**
 * Get full design objects for all designs a user has liked
 * @param {string} userId - Firebase Auth UID
 * @returns {Promise<Array>} - Array of full design objects
 */
export async function getLikedDesigns(userId) {
  try {
    const likedIds = await getUserLikes(userId)
    
    if (likedIds.length === 0) {
      return []
    }

    // Fetch all liked designs
    const designs = []
    for (const designId of likedIds) {
      try {
        const design = await getDesignById(designId)
        designs.push(design)
      } catch (error) {
        console.warn('Could not fetch design:', designId)
      }
    }
    
    return designs
  } catch (error) {
    console.error('Error getting liked designs:', error)
    throw error
  }
}

/**
 * Check if a user has liked a specific design
 * @param {string} userId - Firebase Auth UID
 * @param {string} designId - The design document ID
 * @returns {Promise<boolean>}
 */
export async function hasUserLikedDesign(userId, designId) {
  try {
    const likes = await getUserLikes(userId)
    return likes.includes(designId)
  } catch (error) {
    console.error('Error checking if design is liked:', error)
    return false
  }
}

/**
 * Toggle like status for a design
 * @param {string} userId - Firebase Auth UID
 * @param {string} designId - The design document ID
 * @returns {Promise<boolean>} - True if now liked, false if unliked
 */
export async function toggleLike(userId, designId) {
  try {
    const isLiked = await hasUserLikedDesign(userId, designId)
    
    if (isLiked) {
      await unlikeDesign(userId, designId)
      return false
    } else {
      await likeDesign(userId, designId)
      return true
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    throw error
  }
}
