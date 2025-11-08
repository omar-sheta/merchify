import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function Discover() {
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const trendingScrollRef = useRef(null);

  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -500 : 500;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Fetch data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch videos
        const videosRes = await fetch('/api/feed');
        const videosData = await videosRes.json();
        
        // Fetch designs
        const designsRes = await fetch('/api/designs');
        const designsData = await designsRes.json();
        
        // Format trending videos (top 6 by views)
        const trending = videosData.items
          ?.sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 6)
          .map(video => ({
            id: video.id,
            thumbnail: video.poster,
            url: video.src,
            title: video.title,
            views: formatViews(video.views || 0)
          })) || [];
        
        console.log('Trending videos loaded:', trending.length, 'videos');
        if (trending.length > 0) {
          console.log('First trending video ID:', trending[0].id);
        }
        
        setTrendingVideos(trending);
        
        // Fetch profiles
        const profilesRes = await fetch('/api/profiles');
        const profilesData = await profilesRes.json();
        
        // Group videos by creator
        const creatorMap = {};
        videosData.items?.forEach(video => {
          const creatorId = video.creator?.id || video.creatorId;
          if (!creatorMap[creatorId]) {
            creatorMap[creatorId] = [];
          }
          creatorMap[creatorId].push({
            id: video.id,
            thumbnail: video.poster,
            url: video.src,
            title: video.title
          });
        });
        
        // Group designs by video ID
        const designsByVideo = {};
        designsData.designs?.forEach(design => {
          if (design.videoId) {
            if (!designsByVideo[design.videoId]) {
              designsByVideo[design.videoId] = [];
            }
            designsByVideo[design.videoId].push({
              id: design.id,
              image: design.mockupImage || design.capturedFrame,
              title: design.product?.name || 'Custom Design',
              likes: 0, // Can be added later
              comments: 0, // Can be added later
              product: design.product,
              price: design.totalPrice
            });
          }
        });
        
        // Format creators with their videos and designs
        const creatorsWithVideos = profilesData.profiles?.map(profile => {
          const creatorVideos = creatorMap[profile.id] || [];
          
          // Collect all designs from this creator's videos
          const creatorDesigns = [];
          creatorVideos.forEach(video => {
            const videoDesigns = designsByVideo[video.id] || [];
            creatorDesigns.push(...videoDesigns);
          });
          
          return {
            id: profile.id,
            name: profile.displayName,
            avatar: profile.avatar,
            bio: profile.bio,
            videos: creatorVideos,
            merch: creatorDesigns.slice(0, 6) 
          };
        }) || [];
        
        setCreators(creatorsWithVideos);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to format view counts
  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
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
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading creators...</p>
          </div>
        </div>
      ) : (
        <>
      {/* Trending Now Section */}
      <div className="w-full mb-12 bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-8 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Trending Now</h2>
          </div>
          {trendingVideos.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No trending videos available yet
            </div>
          ) : (
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
              <Link
                key={video.id}
                href={`/?video=${video.id}`}
                className="group flex-shrink-0"
              >
                <div className="relative w-[315px] h-[560px] rounded-2xl overflow-hidden bg-gray-900 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  {video.thumbnail && video.thumbnail.endsWith('.mp4') ? (
                    <video 
                      src={video.thumbnail} 
                      className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-all duration-300" 
                      muted 
                      loop 
                      autoPlay 
                      playsInline 
                    />
                  ) : (
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-all duration-300" />
                  )}
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
              </Link>
            ))}
          </div>
          </div>
          )}
        </div>
      </div>

      <div className="w-full px-8 pb-10">
        <div className="max-w-[1600px] mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Discover Creators</h1>
          {creators.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No creators available yet
            </div>
          ) : (
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
                    <Link
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
                    </Link>
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
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
}
