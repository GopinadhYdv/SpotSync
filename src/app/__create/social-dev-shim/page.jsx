'use client';

import { useEffect } from 'react';
import { useNavigate } from 'react-router';

// This page is no longer needed with Clerk authentication.
// Redirects to the main sign-in page.
export default function SocialDevShimPage() {
	const navigate = useNavigate();

	useEffect(() => {
		navigate('/account/signin');
	}, [navigate]);

	return null;
}
