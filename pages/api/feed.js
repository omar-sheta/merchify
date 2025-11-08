import { getAllVideos } from '../../lib/videos'

export default async function handler(req, res) {
  try {
    // Fetch videos from Firebase
    const videos = await getAllVideos()
    
    // Transform Firebase data to match expected format
    const items = videos.map(video => ({
      id: video.id,
      title: video.title,
      src: video.videoUrl,
      poster: video.thumbnailUrl,
      description: video.description,
      creator: {
        id: video.creatorId,
        name: video.creatorName,
        avatar: video.creatorAvatar
      },
      duration: video.duration,
      views: video.views,
      likes: video.likes,
      tags: video.tags,
      category: video.category,
      createdAt: video.createdAt
    }))
    
    return res.status(200).json({ items })
  } catch (error) {
    console.error('Error fetching videos:', error)
    // Fallback to empty array if Firebase fails
    return res.status(200).json({ items: [] })
  }
}
