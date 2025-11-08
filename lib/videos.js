import { collection, addDoc, doc, getDoc, getDocs, query, where, orderBy, updateDoc, deleteDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './firebase'

/**
 * Firestore Data Structure for Videos:
 * 
 * videos/ (collection)
 *   - videoId (auto-generated)
 *     - title: string
 *     - description: string
 *     - videoUrl: string (Firebase Storage URL or external URL)
 *     - thumbnailUrl: string (cover image)
 *     - creatorId: string (userId)
 *     - creatorName: string
 *     - creatorAvatar: string
 *     - duration: number (in seconds)
 *     - views: number
 *     - likes: number
 *     - createdAt: timestamp
 *     - updatedAt: timestamp
 *     - tags: array of strings
 *     - category: string
 * 
 * profiles/ (collection)
 *   - userId (Firebase Auth UID)
 *     - displayName: string
 *     - email: string
 *     - avatar: string (URL)
 *     - bio: string
 *     - videoCount: number
 *     - followerCount: number
 *     - followingCount: number
 *     - createdAt: timestamp
 *     - updatedAt: timestamp
 */

// ============================================
// VIDEO FUNCTIONS
// ============================================

/**
 * Create a new video
 */
export async function createVideo(videoData) {
  try {
    const videoRef = await addDoc(collection(db, 'videos'), {
      ...videoData,
      views: 0,
      likes: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return { id: videoRef.id, ...videoData }
  } catch (error) {
    console.error('Error creating video:', error)
    throw error
  }
}

/**
 * Get all videos (with optional filters)
 */
export async function getAllVideos(options = {}) {
  try {
    const { category, creatorId, limit = 50 } = options
    let q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'))
    
    if (category) {
      q = query(q, where('category', '==', category))
    }
    
    if (creatorId) {
      q = query(q, where('creatorId', '==', creatorId))
    }
    
    const snapshot = await getDocs(q)
    const videos = []
    snapshot.forEach((doc) => {
      videos.push({ id: doc.id, ...doc.data() })
    })
    
    return videos
  } catch (error) {
    console.error('Error getting videos:', error)
    throw error
  }
}

/**
 * Get a single video by ID
 */
export async function getVideoById(videoId) {
  try {
    const docRef = doc(db, 'videos', videoId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() }
    }
    return null
  } catch (error) {
    console.error('Error getting video:', error)
    throw error
  }
}

/**
 * Update video
 */
export async function updateVideo(videoId, updates) {
  try {
    const docRef = doc(db, 'videos', videoId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
    return { id: videoId, ...updates }
  } catch (error) {
    console.error('Error updating video:', error)
    throw error
  }
}

/**
 * Delete video
 */
export async function deleteVideo(videoId) {
  try {
    await deleteDoc(doc(db, 'videos', videoId))
    return true
  } catch (error) {
    console.error('Error deleting video:', error)
    throw error
  }
}

/**
 * Increment video views
 */
export async function incrementVideoViews(videoId) {
  try {
    const docRef = doc(db, 'videos', videoId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      const currentViews = docSnap.data().views || 0
      await updateDoc(docRef, {
        views: currentViews + 1
      })
    }
  } catch (error) {
    console.error('Error incrementing views:', error)
  }
}

// ============================================
// PROFILE FUNCTIONS
// ============================================

/**
 * Create or update user profile
 */
export async function createProfile(userId, profileData) {
  try {
    const docRef = doc(db, 'profiles', userId)
    await setDoc(docRef, {
      ...profileData,
      videoCount: 0,
      followerCount: 0,
      followingCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true })
    
    return { id: userId, ...profileData }
  } catch (error) {
    console.error('Error creating profile:', error)
    throw error
  }
}

/**
 * Get user profile by ID
 */
export async function getProfileById(userId) {
  try {
    const docRef = doc(db, 'profiles', userId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() }
    }
    return null
  } catch (error) {
    console.error('Error getting profile:', error)
    throw error
  }
}

/**
 * Update user profile
 */
export async function updateProfile(userId, updates) {
  try {
    const docRef = doc(db, 'profiles', userId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
    return { id: userId, ...updates }
  } catch (error) {
    console.error('Error updating profile:', error)
    throw error
  }
}

/**
 * Get all profiles (creators)
 */
export async function getAllProfiles() {
  try {
    const snapshot = await getDocs(collection(db, 'profiles'))
    const profiles = []
    snapshot.forEach((doc) => {
      profiles.push({ id: doc.id, ...doc.data() })
    })
    return profiles
  } catch (error) {
    console.error('Error getting profiles:', error)
    throw error
  }
}
