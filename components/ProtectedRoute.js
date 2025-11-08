import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

const LoadingSpinner = () => (
	<div className="min-h-screen flex items-center justify-center bg-[var(--brand-bg)]">
		<div className="text-center">
			<div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#FDE047] border-t-transparent"></div>
			<p className="mt-4 text-gray-400">Loading...</p>
		</div>
	</div>
);

export default function ProtectedRoute({ children }) {
	const { user, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading && !user) {
			const returnUrl = router.asPath;
			router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
		}
	}, [user, loading, router]);

	if (loading) {
		return <LoadingSpinner />;
	}

	if (!user) {
		return <LoadingSpinner />;
	}

	return <>{children}</>;
}
