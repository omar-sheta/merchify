import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function Navbar() {
	const router = useRouter()
	const isActive = (path) => router.pathname === path
	const { user, signOut } = useAuth()
	const [open, setOpen] = useState(false)

	return (
		<header className="sticky top-0 z-40">
			<div className="max-w-7xl mx-auto px-6 py-4">
				<div className="glass-card rounded-2xl px-6 py-3 flex items-center justify-between">
					<Link href="/discover" className="flex items-center gap-2">
						<span className="inline-block w-2 h-6 bg-[#FDE047] rounded-full" />
						<span className="font-extrabold tracking-tight text-gray-100">Merchify</span>
					</Link>
					<div className="flex items-center gap-6">
									<nav className="flex items-center gap-6">
										<Link
											href="/discover"
											className={`text-sm transition-colors ${isActive('/discover') ? 'text-[var(--brand-primary)]' : 'text-gray-300 hover:text-gray-200'}`}
										>
											Discover
										</Link>
									</nav>
						{user && (
							<div className="relative">
												<button
													onClick={() => setOpen((o) => !o)}
													className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--brand-surface-alt)] border border-white/10 hover:border-[var(--brand-primary)]/60 transition-colors"
												>
									{user.photoURL ? (
										<img src={user.photoURL} alt={user.displayName || 'Profile'} className="w-8 h-8 rounded-full object-cover border border-white/20" />
									) : (
														<div className="w-8 h-8 rounded-full bg-[var(--brand-primary)]/25 flex items-center justify-center text-sm font-bold text-[var(--brand-primary)]">
											{(user.displayName || user.email || '?')[0].toUpperCase()}
										</div>
									)}
									<span className="text-sm font-medium text-gray-200 max-w-[120px] truncate">{user.displayName || user.email}</span>
									<svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
									</svg>
								</button>
								{open && (
													<div className="absolute right-0 mt-2 w-56 rounded-xl bg-[var(--brand-surface)] border border-white/10 shadow-lg py-2 animate-fade-in">
														<div className="px-4 py-3 border-b border-white/10">
															<p className="text-xs text-gray-400 mb-1">Signed in as</p>
															<p className="text-sm font-medium text-gray-100 truncate">{user.email}</p>
														</div>
														<button
															onClick={() => { setOpen(false); signOut(); }}
															className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-[var(--brand-primary)] hover:bg-[var(--brand-surface-alt)]/70 transition-colors"
														>
															<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12a9 9 0 0118 0 9 9 0 01-18 0z" /></svg>
															Sign Out
														</button>
													</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</header>
	)
}
