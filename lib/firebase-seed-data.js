/**
 * Firebase Data Seeding Script
 * 
 * This file contains the data structure and sample data for:
 * 1. Profiles (creators/users)
 * 2. Videos
 * 
 * You can use this data to manually add to Firebase Console
 * or run the seed script below
 */

// ============================================
// SAMPLE PROFILES DATA
// ============================================

export const sampleProfiles = [
  {
    // Document ID should be: profile1
    displayName: "Max Amini",
    email: "max.amini@example.com",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiOoA0CPet1puGU2CsaQeYXR38ZqobMsKlndkHzabEtsqOJH5G80g3PAr6PCsTc29KMd-NLsnmdv0kSux-urpd4v7yu3zANpLF7E_zx53NyqdcvYWmaKw23EmZJx53-1uyxMckb_lX4OzCt2ntPuDO7tSE-X4Af3BxLFWmWXWAq7ECJ29zLEOExNUGoAf0FRIG3utY9-oqdWMFOkzt_usKzCqJ0Tv2jFwbOqjItheqTTbjDRurOWdC2m-mPn0GSRKi6sOp9RKvPWI",
    bio: "Comedian and content creator. Making people laugh one video at a time! 🎭",
    videoCount: 5,
    followerCount: 125000,
    followingCount: 342
  },
  {
    // Document ID should be: profile2
    displayName: "Comedy Central",
    email: "comedy@example.com",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
    bio: "Official Comedy Central content. The best stand-up comedy clips! 🎤",
    videoCount: 8,
    followerCount: 2500000,
    followingCount: 89
  },
  {
    // Document ID should be: profile3
    displayName: "Sarah Johnson",
    email: "sarah.j@example.com",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    bio: "Storyteller & comedian. Life is funny, let me show you! 😄",
    videoCount: 3,
    followerCount: 45000,
    followingCount: 156
  }
]

// ============================================
// SAMPLE VIDEOS DATA
// ============================================

export const sampleVideos = [
  {
    title: "Epic Hoodie Drop",
    description: "Check out this amazing hoodie design and how it was created!",
    videoUrl: "/feed/creator_1/1.mp4",
    thumbnailUrl: "/feed/creator_1/1_thumb.jpg",
    creatorId: "profile1",
    creatorName: "Max Amini",
    creatorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiOoA0CPet1puGU2CsaQeYXR38ZqobMsKlndkHzabEtsqOJH5G80g3PAr6PCsTc29KMd-NLsnmdv0kSux-urpd4v7yu3zANpLF7E_zx53NyqdcvYWmaKw23EmZJx53-1uyxMckb_lX4OzCt2ntPuDO7tSE-X4Af3BxLFWmWXWAq7ECJ29zLEOExNUGoAf0FRIG3utY9-oqdWMFOkzt_usKzCqJ0Tv2jFwbOqjItheqTTbjDRurOWdC2m-mPn0GSRKi6sOp9RKvPWI",
    duration: 59,
    views: 12300,
    likes: 1240,
    tags: ["fashion", "merch", "design"],
    category: "merch"
  },
  {
    title: "Streetwear Collection",
    description: "My latest streetwear designs - what do you think?",
    videoUrl: "/feed/creator_2/2.mp4",
    thumbnailUrl: "/feed/creator_2/2_thumb.jpg",
    creatorId: "profile1",
    creatorName: "Max Amini",
    creatorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiOoA0CPet1puGU2CsaQeYXR38ZqobMsKlndkHzabEtsqOJH5G80g3PAr6PCsTc29KMd-NLsnmdv0kSux-urpd4v7yu3zANpLF7E_zx53NyqdcvYWmaKw23EmZJx53-1uyxMckb_lX4OzCt2ntPuDO7tSE-X4Af3BxLFWmWXWAq7ECJ29zLEOExNUGoAf0FRIG3utY9-oqdWMFOkzt_usKzCqJ0Tv2jFwbOqjItheqTTbjDRurOWdC2m-mPn0GSRKi6sOp9RKvPWI",
    duration: 45,
    views: 8500,
    likes: 890,
    tags: ["streetwear", "fashion", "design"],
    category: "merch"
  },
  {
    title: "Zohran Wins | Nimesh Patel",
    description: "Hilarious stand-up comedy routine by Nimesh Patel",
    videoUrl: "/feed/creator_3/Zohran Wins _ Nimesh Patel.mp4",
    thumbnailUrl: "/feed/creator_3/Zohran Wins _ Nimesh Patel_thumb.jpg",
    creatorId: "profile2",
    creatorName: "Comedy Central",
    creatorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
    duration: 120,
    views: 45000,
    likes: 3200,
    tags: ["standup", "comedy", "funny"],
    category: "standup"
  },
  {
    title: "Racism is NEVER Wrong",
    description: "A provocative stand-up comedy bit that challenges perspectives",
    videoUrl: "/feed/creator_4/Racism is NEVER Wrong.mp4",
    thumbnailUrl: "/feed/creator_4/Racism is NEVER Wrong_thumb.jpg",
    creatorId: "profile3",
    creatorName: "Sarah Johnson",
    creatorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    duration: 95,
    views: 23400,
    likes: 2100,
    tags: ["comedy", "standup", "controversial"],
    category: "comedy"
  }
    thumbnailUrl: "https://images.unsplash.com/photo-1464047736614-af63643285bf?w=800&h=600&fit=crop",
    creatorId: "profile2",
    creatorName: "Comedy Central",
    creatorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
    duration: 120,
    views: 45000,
    likes: 3200,
    tags: ["standup", "comedy", "travel"],
    category: "standup"
  },
  {
    title: "Dating in Your 30s",
    description: "Why is dating so complicated? Let me tell you...",
    videoUrl: "/feed/creator3/video1.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=800&h=600&fit=crop",
    creatorId: "profile3",
    creatorName: "Sarah Johnson",
    creatorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    duration: 95,
    views: 23400,
    likes: 2100,
    tags: ["comedy", "dating", "relationships"],
    category: "comedy"
  },
  {
    title: "Working From Home Reality",
    description: "The truth about working from home that nobody tells you",
    videoUrl: "/feed/creator3/video2.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800&h=600&fit=crop",
    creatorId: "profile3",
    creatorName: "Sarah Johnson",
    creatorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    duration: 78,
    views: 15600,
    likes: 1450,
    tags: ["comedy", "work", "relatable"],
    category: "comedy"
  },
  {
    title: "Restaurant Etiquette Gone Wrong",
    description: "When dining out goes hilariously wrong!",
    videoUrl: "/feed/creator1/video3.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&h=600&fit=crop",
    creatorId: "profile1",
    creatorName: "Max Amini",
    creatorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiOoA0CPet1puGU2CsaQeYXR38ZqobMsKlndkHzabEtsqOJH5G80g3PAr6PCsTc29KMd-NLsnmdv0kSux-urpd4v7yu3zANpLF7E_zx53NyqdcvYWmaKw23EmZJx53-1uyxMckb_lX4OzCt2ntPuDO7tSE-X4Af3BxLFWmWXWAq7ECJ29zLEOExNUGoAf0FRIG3utY9-oqdWMFOkzt_usKzCqJ0Tv2jFwbOqjItheqTTbjDRurOWdC2m-mPn0GSRKi6sOp9RKvPWI",
    duration: 67,
    views: 9800,
    likes: 920,
    tags: ["comedy", "food", "funny"],
    category: "comedy"
  }
]

// ============================================
// HOW TO USE THIS DATA
// ============================================

/**
 * OPTION 1: Manual Entry in Firebase Console
 * --------------------------------------------
 * 1. Go to Firebase Console > Firestore Database
 * 2. Create collection "profiles"
 * 3. For each profile in sampleProfiles:
 *    - Click "Add Document"
 *    - Set Document ID manually (e.g., "profile1", "profile2", "profile3")
 *    - Add fields from the profile object
 *    - For createdAt and updatedAt, use "Timestamp" type and select current time
 * 
 * 4. Create collection "videos"
 * 5. For each video in sampleVideos:
 *    - Click "Add Document"
 *    - Let Firebase auto-generate the ID (or set a custom one)
 *    - Add fields from the video object
 *    - For createdAt and updatedAt, use "Timestamp" type and select current time
 * 
 * 
 * OPTION 2: Run Seed Script (see seed-firebase.js)
 * ------------------------------------------------
 * Run: node scripts/seed-firebase.js
 */

// ============================================
// FIREBASE SECURITY RULES
// ============================================

/**
 * Add these rules to Firestore Security Rules:
 * 
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     
 *     // Videos collection - public read, authenticated write
 *     match /videos/{videoId} {
 *       allow read: if true;
 *       allow write: if request.auth != null;
 *     }
 *     
 *     // Profiles collection - public read, owner write
 *     match /profiles/{userId} {
 *       allow read: if true;
 *       allow write: if request.auth != null && request.auth.uid == userId;
 *     }
 *     
 *     // Designs collection (existing)
 *     match /designs/{designId} {
 *       allow read: if true;
 *       allow write: if request.auth != null;
 *     }
 *     
 *     // Users collection (existing)
 *     match /users/{userId} {
 *       allow read, write: if request.auth != null && request.auth.uid == userId;
 *     }
 *   }
 * }
 */
