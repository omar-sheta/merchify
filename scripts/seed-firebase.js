#!/usr/bin/env node

/**
 * Firebase Database Seeding Script
 * 
 * This script seeds your Firebase Firestore with sample profiles and videos.
 * 
 * Usage:
 *   node scripts/seed-firebase.js
 * 
 * Make sure you have your Firebase credentials set up in .env.local
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');

// You need to download your Firebase Admin SDK service account key
// Go to: Firebase Console > Project Settings > Service Accounts > Generate New Private Key
// Save it as firebase-admin-key.json in the root directory (add to .gitignore!)

let serviceAccount;
try {
  serviceAccount = require('../firebase-admin-key.json');
} catch (error) {
  console.error('❌ Error: firebase-admin-key.json not found!');
  console.log('\n📝 To create this file:');
  console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
  console.log('2. Click "Generate New Private Key"');
  console.log('3. Save the file as "firebase-admin-key.json" in the root directory');
  console.log('4. Add "firebase-admin-key.json" to your .gitignore\n');
  process.exit(1);
}

// Initialize Firebase Admin
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// Sample data
const sampleProfiles = [
  {
    id: 'profile1',
    displayName: "Max Amini",
    email: "max.amini@example.com",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiOoA0CPet1puGU2CsaQeYXR38ZqobMsKlndkHzabEtsqOJH5G80g3PAr6PCsTc29KMd-NLsnmdv0kSux-urpd4v7yu3zANpLF7E_zx53NyqdcvYWmaKw23EmZJx53-1uyxMckb_lX4OzCt2ntPuDO7tSE-X4Af3BxLFWmWXWAq7ECJ29zLEOExNUGoAf0FRIG3utY9-oqdWMFOkzt_usKzCqJ0Tv2jFwbOqjItheqTTbjDRurOWdC2m-mPn0GSRKi6sOp9RKvPWI",
    bio: "Comedian and content creator. Making people laugh one video at a time! 🎭",
    videoCount: 3,
    followerCount: 125000,
    followingCount: 342
  },
  {
    id: 'profile2',
    displayName: "Comedy Central",
    email: "comedy@example.com",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
    bio: "Official Comedy Central content. The best stand-up comedy clips! 🎤",
    videoCount: 1,
    followerCount: 2500000,
    followingCount: 89
  },
  {
    id: 'profile3',
    displayName: "Sarah Johnson",
    email: "sarah.j@example.com",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    bio: "Storyteller & comedian. Life is funny, let me show you! 😄",
    videoCount: 2,
    followerCount: 45000,
    followingCount: 156
  }
];

const sampleVideos = [
  {
    title: "My Wife's Gotta See This",
    description: "Hilarious story about my wife and a funny moment at the grocery store",
    videoUrl: "/feed/creator1/video1.mp4",
    thumbnailUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBl4is-0gUpgamJ9vjybaGOcY0sbYY74wX0eLbQNIF3I6XYfpD2B48l8KkTC-9BLrcU7-Q_ut6iYJfbbm8bYPTnbej5BKE2Wda6uyC7CRocg9LEKomjswrKjtDDiersGa133MDBk7bc2zOZfo-D7TJJCBtO2xwNv9qGxJ_dWGNefHEYlOCgFt6r6-Cu7rb9T82VfaJt1yc_-LOYlsMS5PcSoE4mhGk0I276wMW1LjUR_lZvP1Bahfk8z3iuDvknb4AbXRhan2xo0Cg",
    creatorId: "profile1",
    creatorName: "Max Amini",
    creatorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiOoA0CPet1puGU2CsaQeYXR38ZqobMsKlndkHzabEtsqOJH5G80g3PAr6PCsTc29KMd-NLsnmdv0kSux-urpd4v7yu3zANpLF7E_zx53NyqdcvYWmaKw23EmZJx53-1uyxMckb_lX4OzCt2ntPuDO7tSE-X4Af3BxLFWmWXWAq7ECJ29zLEOExNUGoAf0FRIG3utY9-oqdWMFOkzt_usKzCqJ0Tv2jFwbOqjItheqTTbjDRurOWdC2m-mPn0GSRKi6sOp9RKvPWI",
    duration: 59,
    views: 12300,
    likes: 1240,
    tags: ["comedy", "storytelling", "funny"],
    category: "comedy"
  },
  {
    title: "When Your Mom Calls",
    description: "Every Persian kid knows this feeling!",
    videoUrl: "/feed/creator1/video2.mp4",
    thumbnailUrl: "https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=800&h=600&fit=crop",
    creatorId: "profile1",
    creatorName: "Max Amini",
    creatorAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBiOoA0CPet1puGU2CsaQeYXR38ZqobMsKlndkHzabEtsqOJH5G80g3PAr6PCsTc29KMd-NLsnmdv0kSux-urpd4v7yu3zANpLF7E_zx53NyqdcvYWmaKw23EmZJx53-1uyxMckb_lX4OzCt2ntPuDO7tSE-X4Af3BxLFWmWXWAq7ECJ29zLEOExNUGoAf0FRIG3utY9-oqdWMFOkzt_usKzCqJ0Tv2jFwbOqjItheqTTbjDRurOWdC2m-mPn0GSRKi6sOp9RKvPWI",
    duration: 45,
    views: 8500,
    likes: 890,
    tags: ["comedy", "family", "relatable"],
    category: "comedy"
  },
  {
    title: "Stand-Up: Airport Security",
    description: "My experience going through airport security. You won't believe what happened!",
    videoUrl: "/feed/creator2/video1.mp4",
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
];

async function seedDatabase() {
  console.log('🌱 Starting database seed...\n');
  
  try {
    // Seed Profiles
    console.log('📝 Seeding profiles...');
    for (const profile of sampleProfiles) {
      const { id, ...profileData } = profile;
      await db.collection('profiles').doc(id).set({
        ...profileData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log(`✅ Created profile: ${profileData.displayName}`);
    }
    
    console.log('\n📹 Seeding videos...');
    for (const video of sampleVideos) {
      const docRef = await db.collection('videos').add({
        ...video,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      console.log(`✅ Created video: ${video.title} (ID: ${docRef.id})`);
    }
    
    console.log('\n✨ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${sampleProfiles.length} profiles created`);
    console.log(`   - ${sampleVideos.length} videos created`);
    console.log('\n🎉 Done! You can now view your data in the Firebase Console.');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
