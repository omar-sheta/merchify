import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Card from '../components/ui/Card';
import SectionHeading from '../components/ui/SectionHeading';
import { useRouter } from 'next/router';
import { auth } from '../lib/firebase';
import { likeDesign, unlikeDesign, getUserLikes } from '../lib/firestore';

export default function Discover() {
	const [trendingVideos, setTrendingVideos] = useState([]);
	const [creators, setCreators] = useState([]);
	const [loading, setLoading] = useState(true);
	const [expanded, setExpanded] = useState(null);
	const [currentSlide, setCurrentSlide] = useState(0);
	const [userLikes, setUserLikes] = useState([]);
	const [currentUser, setCurrentUser] = useState(null);
	const [currentCreatorIndex, setCurrentCreatorIndex] = useState(0);
	const trendingScrollRef = useRef(null);
	const creatorsScrollRef = useRef(null);
	const videoRefs = useRef([]);
	const router = useRouter();

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
				const trending =
					videosData.items
						?.sort((a, b) => (b.views || 0) - (a.views || 0))
						.slice(0, 6)
						.map((video) => ({
							id: video.id,
							thumbnail: video.poster,
							url: video.src,
							title: video.title,
							views: formatViews(video.views || 0),
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
				videosData.items?.forEach((video) => {
					const creatorId = video.creator?.id || video.creatorId;
					if (!creatorMap[creatorId]) {
						creatorMap[creatorId] = [];
					}
					creatorMap[creatorId].push({
						id: video.id,
						thumbnail: video.poster,
						url: video.src,
						title: video.title,
					});
				});

				// Group designs by video ID
				const designsByVideo = {};
				designsData.designs?.forEach((design) => {
					if (design.videoId) {
						if (!designsByVideo[design.videoId]) {
							designsByVideo[design.videoId] = [];
						}
						designsByVideo[design.videoId].push({
							id: design.id,
							image: design.mockupImage || design.capturedFrame,
							title: design.product?.name || 'Custom Design',
							likes: design.likeCount || 0,
							comments: 0, // Can be added later
							product: design.product,
							price: design.totalPrice,
						});
					}
				});

				// Format creators with their videos and designs
				const creatorsWithVideos =
					profilesData.profiles?.map((profile) => {
						const creatorVideos = creatorMap[profile.id] || [];

						// Collect all designs from this creator's videos
						const creatorDesigns = [];
						creatorVideos.forEach((video) => {
							const videoDesigns = designsByVideo[video.id] || [];
							creatorDesigns.push(...videoDesigns);
						});

						return {
							id: profile.id,
							name: profile.displayName,
							avatar: profile.avatar,
							bio: profile.bio,
							videos: creatorVideos,
							merch: creatorDesigns.slice(0, 6),
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

	// Listen for auth state changes and fetch user likes
	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged(async (user) => {
			setCurrentUser(user);
			if (user) {
				try {
					const likes = await getUserLikes(user.uid);
					setUserLikes(likes);
				} catch (error) {
					console.error('Error fetching user likes:', error);
				}
			} else {
				setUserLikes([]);
			}
		});

		return () => unsubscribe();
	}, []);

	// Handle like/unlike
	const handleLikeToggle = async (designId, e) => {
		e.preventDefault();
		e.stopPropagation();

		let user = currentUser;
		if (!user) {
			// Sign in anonymously for testing
			const { signInAnonymously } = await import('firebase/auth');
			try {
				const result = await signInAnonymously(auth);
				user = result.user;
				setCurrentUser(user);
			} catch (error) {
				console.error('Error signing in anonymously:', error);
				alert('Please sign in to like designs');
				return;
			}
		}

		const isLiked = userLikes.includes(designId);

		try {
			if (isLiked) {
				await unlikeDesign(user.uid, designId);
				setUserLikes(userLikes.filter((id) => id !== designId));

				// Update the like count in UI
				setCreators((prevCreators) =>
					prevCreators.map((creator) => ({
						...creator,
						merch: creator.merch.map((item) =>
							item.id === designId
								? { ...item, likes: Math.max(0, item.likes - 1) }
								: item
						),
					}))
				);
			} else {
				await likeDesign(user.uid, designId);
				setUserLikes([...userLikes, designId]);

				// Update the like count in UI
				setCreators((prevCreators) =>
					prevCreators.map((creator) => ({
						...creator,
						merch: creator.merch.map((item) =>
							item.id === designId ? { ...item, likes: item.likes + 1 } : item
						),
					}))
				);
			}
		} catch (error) {
			console.error('Error toggling like:', error);
			alert('Failed to update like. Please try again.');
		}
	};

	// Handle merch click - navigate to checkout page with design
	const handleMerchClick = (designId, e) => {
		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}
		router.push(`/checkout?design=${designId}`);
	};

	// Helper function to format view counts
	const formatViews = (views) => {
		if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
		if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
		return views.toString();
	};

	// Play videos when they mount and handle autoplay
	React.useEffect(() => {
		console.log('Trending videos loaded:', trendingVideos.length);
		trendingVideos.forEach((v, i) => {
			console.log(`Video ${i} URL:`, v.url, 'ends with .mp4?', v.url?.endsWith('.mp4'));
		});

		// Attempt to play all videos immediately
		const playVideos = () => {
			console.log('Attempting to play', videoRefs.current.length, 'videos');
			videoRefs.current.forEach((video, index) => {
				if (video) {
					console.log(`Playing video ${index}:`, video.src);
					video.muted = true;
					video.play()
						.then(() => console.log(`Video ${index} playing`))
						.catch((err) => console.log(`Video ${index} autoplay failed:`, err.message));
				}
			});
		};

		if (trendingVideos.length > 0) {
			setTimeout(playVideos, 500);
		}
	}, [trendingVideos]);

	// Autoplay functionality for trending videos
	React.useEffect(() => {
		if (trendingVideos.length === 0) return;

		const interval = setInterval(() => {
			setCurrentSlide((prev) => {
				const nextSlide = (prev + 1) % trendingVideos.length;
				
				if (trendingScrollRef.current) {
					// Calculate scroll position based on card width
					const cardWidth = 315; // w-[315px]
					const gap = 24; // gap-6 = 24px
					const scrollPosition = nextSlide * (cardWidth + gap);

					trendingScrollRef.current.scrollTo({
						left: scrollPosition,
						behavior: 'smooth',
					});
				}
				
				return nextSlide;
			});
		}, 5000); // Change video every 5 seconds

		return () => clearInterval(interval);
	}, [trendingVideos.length]);

	// Auto-scroll through creators
	React.useEffect(() => {
		if (creators.length === 0) return;

		const interval = setInterval(() => {
			setCurrentCreatorIndex((prev) => (prev + 1) % creators.length);
		}, 6000); // Change creator every 6 seconds

		return () => clearInterval(interval);
	}, [creators.length]);

	// Scroll to current creator
	React.useEffect(() => {
		if (creatorsScrollRef.current && creators.length > 0) {
			const cardWidth = 400; // Width of each card
			const gap = 32; // gap-8 = 32px
			const scrollPosition = currentCreatorIndex * (cardWidth + gap);

			creatorsScrollRef.current.scrollTo({
				left: scrollPosition,
				behavior: 'smooth',
			});
		}
	}, [currentCreatorIndex, creators.length]);

	return (
		<div className="min-h-screen bg-bg-deep-black">
			{loading ? (
				<div className="flex items-center justify-center min-h-screen">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-orange mx-auto mb-4"></div>
						<p className="text-text-secondary">Loading creators...</p>
					</div>
				</div>
			) : (
				<>
					{/* Trending Now Section */}
					<div className="w-full mb-12 pt-10">
						<div className="max-w-[1600px] mx-auto px-8">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-4xl pb-3 montserrat-bold pt-3 text-text-primary text-center justify-center w-full">
									Trending Now
								</h2>
							</div>
							{trendingVideos.length === 0 ? (
								<div className="text-center py-10 text-text-secondary">
									No trending videos available yet
								</div>
							) : (
								<div className="relative group px-16">
									<button
										onClick={() => scroll(trendingScrollRef, 'left')}
										className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-bg-card hover:bg-bg-card-light rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-bg-card-light"
										aria-label="Scroll left"
									>
										<svg
											className="w-6 h-6 text-text-primary"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M15 19l-7-7 7-7"
											/>
										</svg>
									</button>
									<button
										onClick={() => scroll(trendingScrollRef, 'right')}
										className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-bg-card hover:bg-bg-card-light rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-bg-card-light"
										aria-label="Scroll right"
									>
										<svg
											className="w-6 h-6 text-text-primary"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</button>
									<div
										ref={trendingScrollRef}
										className="flex gap-6 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide"
									>
										{trendingVideos.map((video, index) => (
											<Link
												key={video.id}
												href={`/?video=${video.id}`}
												className="group flex-shrink-0"
											>
												<div className="relative w-[315px] h-[560px] rounded-2xl overflow-hidden bg-bg-card shadow-xl group-hover:shadow-2xl transition-shadow duration-300">
													{video.url &&
													video.url.endsWith('.mp4') ? (
														<video
															ref={(el) => {
																videoRefs.current[index] = el;
																if (el) {
																	el.muted = true;
																	el.play().catch(() => {});
																}
															}}
															src={video.url}
															className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-all duration-300"
															muted
															loop
															autoPlay
															playsInline
															onLoadedData={(e) => {
																e.target.muted = true;
																e.target.play().catch(() => {});
															}}
														/>
													) : (
														<img
															src={video.thumbnail}
															alt={video.title}
															className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-all duration-300"
														/>
													)}
													<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
														<div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
															<div className="w-16 h-16 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl">
																<svg
																	className="w-7 h-7 text-white ml-1"
																	fill="currentColor"
																	viewBox="0 0 24 24"
																>
																	<path d="M8 5v14l11-7z" />
																</svg>
															</div>
														</div>
														<div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
															{video.views} views
														</div>
														<div className="absolute bottom-0 left-0 right-0 p-5">
															<h3 className="font-bold text-xl text-white mb-1">
																{video.title}
															</h3>
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
							<h1 className="text-4xl montserrat-bold text-orange-500 font-extrabold mb-8 text-center">
								Discover Creators
							</h1>
							{creators.length === 0 ? (
								<div className="text-center py-10 text-text-secondary">
									No creators available yet
								</div>
							) : (
								<div 
									ref={creatorsScrollRef}
									className="flex gap-8 overflow-x-scroll pb-4 px-4 justify-center items-start snap-x snap-mandatory scrollbar-hide"
								>
									{creators.map((creator) => (
										<Card
											key={creator.id}
											className="w-[400px] flex-shrink-0 p-6 flex flex-col gap-4 snap-center bg-[#F5F5F0]"
										>
											<div className="flex items-center gap-4">
												<div className="relative">
													<div className="absolute inset-0 bg-accent-orange/30 blur-xl rounded-full"></div>
													<img
														src={creator.avatar}
														alt={creator.name}
														className="relative w-16 h-16 rounded-full object-cover shadow-xl ring-2 ring-accent-orange/50"
													/>
												</div>
												<div className="flex-1 relative">
													<div className="relative inline-block">
														<div className="absolute inset-0 rounded-full transform scale-110"></div>
														<div className="text-xl font-bold text-gray-900 mb-0.5 relative z-10 montserrat-bold">
															{creator.name}
														</div>
													</div>
													<div className="text-sm text-gray-700 relative z-10 mt-1">
														{creator.bio}
													</div>
												</div>
											</div>
											{/* Video carousel */}
											<div className="mt-2">
												<div className="text-sm font-semibold text-gray-800 mb-3">
													Videos
												</div>
												<div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
													{creator.videos.map((video) => (
														<Link
															key={video.id}
															href={`/?video=${video.id}`}
															className="group block min-w-[160px]"
															title={video.title}
														>
															<div className="relative w-40 h-24 rounded-xl overflow-hidden mb-2 bg-bg-card shadow-md group-hover:shadow-lg transition-shadow duration-300">
																<img
																	src={video.thumbnail}
																	alt={video.title}
																	className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
																/>
																<div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors duration-300">
																	<div className="w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
																		<svg
																			className="w-5 h-5 text-white ml-0.5"
																			fill="currentColor"
																			viewBox="0 0 24 24"
																		>
																			<path d="M8 5v14l11-7z" />
																		</svg>
																	</div>
																</div>
															</div>
															<div className="w-40">
																<div className="font-medium text-sm text-text-primary group-hover:text-accent-orange transition-colors line-clamp-2">
																	{video.title}
																</div>
															</div>
														</Link>
													))}
												</div>
											</div>
											{/* Merch carousel */}
											<div className="mt-4">
												<div className="text-sm font-semibold text-gray-800 mb-3">
													Popular Merch
												</div>
												<div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
													{/* Merch items would be mapped here */}
													{creator.merch.map((item) => {
														const isLiked = userLikes.includes(item.id);
														return (
															<Link
																key={item.id}
																href={`/checkout?design=${item.id}`}
																className="min-w-[140px] bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-3 flex flex-col items-center cursor-pointer"
															>
																<img
																	src={item.image}
																	alt={item.title}
																	className="w-24 h-24 object-cover rounded-lg mb-2"
																/>
																<div className="font-semibold text-sm mb-1.5 text-gray-900 text-center">
																	{item.title}
																</div>
																<div className="flex items-center gap-2.5 mt-1">
																	<div
																		className={`like-button flex items-center gap-1 transition-all duration-200 cursor-pointer ${
																			isLiked
																				? 'text-red-500'
																				: 'text-gray-400 hover:text-red-500'
																		}`}
																		onClick={(e) => handleLikeToggle(item.id, e)}
																	>
																		<svg
																			xmlns="http://www.w3.org/2000/svg"
																			fill={isLiked ? 'currentColor' : 'none'}
																			viewBox="0 0 24 24"
																			stroke="currentColor"
																			className="w-4 h-4"
																		>
																			<path
																				strokeLinecap="round"
																				strokeLinejoin="round"
																				strokeWidth="2"
																				d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
																			/>
																		</svg>
																		<span className="font-medium text-xs">
																			{item.likes}
																		</span>
																	</div>
																	<div className="flex items-center gap-1 text-gray-500">
																		<svg
																			xmlns="http://www.w3.org/2000/svg"
																			fill="none"
																			viewBox="0 0 24 24"
																			stroke="currentColor"
																			className="w-4 h-4"
																		>
																			<path
																				strokeLinecap="round"
																				strokeLinejoin="round"
																				strokeWidth="2"
																				d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
																			/>
																		</svg>
																		<span className="font-medium text-xs">
																			{item.comments}
																		</span>
																	</div>
																</div>
															</Link>
														);
													})}
												</div>
											</div>
										</Card>
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
