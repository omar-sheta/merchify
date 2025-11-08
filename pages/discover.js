import React, { useState, useRef } from 'react';

// Trending videos
const trendingVideos = [
  { id: 't1', thumbnail: '/trending-1.jpg', url: '/trending-1.mp4', title: 'Epic Hoodie Drop', views: '10K' },
  { id: 't2', thumbnail: '/trending-2.jpg', url: '/trending-2.mp4', title: 'AI Fashion Revolution', views: '8.5K' },
  { id: 't3', thumbnail: '/trending-3.jpg', url: '/trending-3.mp4', title: 'Street Style 2025', views: '12K' },
  { id: 't4', thumbnail: '/trending-4.jpg', url: '/trending-4.mp4', title: 'Retro Vibes Collection', views: '9.2K' },
  { id: 't5', thumbnail: '/trending-5.jpg', url: '/trending-5.mp4', title: 'Minimalist Aesthetic', views: '15K' },
  { id: 't6', thumbnail: '/trending-6.jpg', url: '/trending-6.mp4', title: 'Urban Legends Merch', views: '11K' }
];

const creators = [
  {
    id: 1,
    name: 'Alice Banana',
    avatar: '/creator-alice.jpg',
    bio: 'Streetwear designer & banana enthusiast 🍌',
    videos: [
      { id: 'a1', thumbnail: '/mock-video-thumb-1.jpg', url: '/mock-video-1.mp4', title: 'Banana Drop 1' },
      { id: 'a2', thumbnail: '/mock-video-thumb-2.jpg', url: '/mock-video-2.mp4', title: 'Banana Drop 2' }
    ],
    merch: [
      { id: 101, image: '/mock-merch-1.jpg', title: 'Banana Hoodie', likes: 23, comments: 5 },
      { id: 102, image: '/mock-merch-2.jpg', title: 'Banana Tee', likes: 17, comments: 2 }
    ]
  },
  {
    id: 2,
    name: 'Bob Gemini',
    avatar: '/creator-bob.jpg',
    bio: 'AI art meets fashion. Gemini drops every week ✨',
    videos: [
      { id: 'b1', thumbnail: '/mock-video-thumb-3.jpg', url: '/mock-video-3.mp4', title: 'Gemini Launch' },
      { id: 'b2', thumbnail: '/mock-video-thumb-4.jpg', url: '/mock-video-4.mp4', title: 'Gemini Behind the Scenes' }
    ],
    merch: [
      { id: 201, image: '/mock-merch-3.jpg', title: 'Gemini Cap', likes: 12, comments: 1 },
      { id: 202, image: '/mock-merch-4.jpg', title: 'Gemini Hoodie', likes: 9, comments: 0 }
    ]
  },
  {
    id: 3,
    name: 'Carlos Retro',
    avatar: '/creator-carlos.jpg',
    bio: 'Vintage vibes & 90s nostalgia 📼',
    videos: [
      { id: 'c1', thumbnail: '/mock-video-thumb-5.jpg', url: '/mock-video-5.mp4', title: 'Retro Collection' },
      { id: 'c2', thumbnail: '/mock-video-thumb-6.jpg', url: '/mock-video-6.mp4', title: '90s Inspired' }
    ],
    merch: [
      { id: 301, image: '/mock-merch-5.jpg', title: 'Retro Tee', likes: 31, comments: 8 },
      { id: 302, image: '/mock-merch-6.jpg', title: 'Vintage Cap', likes: 19, comments: 3 }
    ]
  },
  {
    id: 4,
    name: 'Diana Minimal',
    avatar: '/creator-diana.jpg',
    bio: 'Less is more. Minimalist designs 🖤',
    videos: [
      { id: 'd1', thumbnail: '/mock-video-thumb-7.jpg', url: '/mock-video-7.mp4', title: 'Minimal Aesthetic' },
      { id: 'd2', thumbnail: '/mock-video-thumb-8.jpg', url: '/mock-video-8.mp4', title: 'Clean Lines' }
    ],
    merch: [
      { id: 401, image: '/mock-merch-7.jpg', title: 'Minimal Hoodie', likes: 42, comments: 12 },
      { id: 402, image: '/mock-merch-8.jpg', title: 'Basic Tee', likes: 28, comments: 4 }
    ]
  },
  {
    id: 5,
    name: 'Ethan Urban',
    avatar: '/creator-ethan.jpg',
    bio: 'Street culture & urban legends 🌃',
    videos: [
      { id: 'e1', thumbnail: '/mock-video-thumb-9.jpg', url: '/mock-video-9.mp4', title: 'Urban Legends' },
      { id: 'e2', thumbnail: '/mock-video-thumb-10.jpg', url: '/mock-video-10.mp4', title: 'City Nights' }
    ],
    merch: [
      { id: 501, image: '/mock-merch-9.jpg', title: 'Urban Jacket', likes: 56, comments: 15 },
      { id: 502, image: '/mock-merch-10.jpg', title: 'Street Cap', likes: 33, comments: 7 }
    ]
  }
];

export default function Discover() {
  const [expanded, setExpanded] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const trendingScrollRef = useRef(null);

  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -500 : 500;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Autoplay functionality for trending videos
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (trendingScrollRef.current) {
        const maxSlides = trendingVideos.length;
        const nextSlide = (currentSlide + 1) % maxSlides;
        setCurrentSlide(nextSlide);
        
        // Scroll to next video
        const scrollWidth = trendingScrollRef.current.scrollWidth;
        const containerWidth = trendingScrollRef.current.clientWidth;
        const scrollPosition = (scrollWidth / maxSlides) * nextSlide;
        
        trendingScrollRef.current.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }, 4000); // Change video every 4 seconds

    return () => clearInterval(interval);
  }, [currentSlide]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Trending Now Section */}
      <div className="w-full mb-12 bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-8 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Trending Now</h2>
          </div>
          <div className="relative group px-16">
            <button
              onClick={() => scroll(trendingScrollRef, 'left')}
              className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white hover:bg-gray-100 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-gray-200"
              aria-label="Scroll left"
            >
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              onClick={() => scroll(trendingScrollRef, 'right')}
              className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white hover:bg-gray-100 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-gray-200"
              aria-label="Scroll right"
            >
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            </button>
          <div ref={trendingScrollRef} className="flex gap-6 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
            {trendingVideos.map((video) => (
              <a
                key={video.id}
                href={`/?video=${video.id}`}
                className="group flex-shrink-0 w-[500px]"
              >
                <div className="relative w-full h-[280px] rounded-2xl overflow-hidden bg-gray-900 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-7 h-7 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
                      {video.views} views
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="font-bold text-xl text-white mb-1">{video.title}</h3>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
          </div>
        </div>
      </div>

      <div className="w-full px-8 pb-10">
        <div className="max-w-[1600px] mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Discover Creators</h1>
          <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide">
          {creators.map((creator) => (
            <div key={creator.id} className="min-w-[400px] bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col gap-4 border border-gray-200">
              <div className="flex items-center gap-4">
                <img src={creator.avatar} alt={creator.name} className="w-16 h-16 rounded-full object-cover border-2 border-gray-200" />
                <div className="flex-1">
                  <div className="text-xl font-bold text-gray-900 mb-0.5">{creator.name}</div>
                  <div className="text-sm text-gray-600">{creator.bio}</div>
                </div>
              </div>
              {/* Video carousel */}
              <div className="mt-2">
                <div className="text-sm font-semibold text-gray-700 mb-3">Videos</div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {creator.videos.map((video) => (
                    <a
                      key={video.id}
                      href={`/?video=${video.id}`}
                      className="group block min-w-[160px]"
                      title={video.title}
                    >
                      <div className="relative w-40 h-24 rounded-xl overflow-hidden mb-2 bg-gray-100 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors duration-300">
                          <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          </div>
                        </div>
                      </div>
                      <div className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors">{video.title}</div>
                    </a>
                  ))}
                </div>
              </div>
              {/* Merch carousel */}
              <div className="mt-4">
                <div className="text-sm font-semibold text-gray-700 mb-3">Popular Merch</div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {creator.merch.map((item) => (
                    <div key={item.id} className="min-w-[140px] bg-gray-50 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-3 flex flex-col items-center">
                      <img src={item.image} alt={item.title} className="w-24 h-24 object-cover rounded-lg mb-2" />
                      <div className="font-semibold text-sm mb-1.5 text-gray-900 text-center">{item.title}</div>
                      <div className="flex items-center gap-2.5 mt-1">
                        <div className="flex items-center gap-1 text-red-500">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" className="w-4 h-4"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg>
                          <span className="font-medium text-xs">{item.likes}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                          <span className="font-medium text-xs">{item.comments}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}
