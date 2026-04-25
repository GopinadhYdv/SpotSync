import { getToken } from '@auth/core/jwt';

function getSecureCookieFlag() {
	const authUrl = process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || '';
	return authUrl.startsWith('https://');
}

export async function GET(request) {
	const [token, jwt] = await Promise.all([
		getToken({
			req: request,
			secret: process.env.AUTH_SECRET,
			secureCookie: getSecureCookieFlag(),
			raw: true,
		}),
		getToken({
			req: request,
			secret: process.env.AUTH_SECRET,
			secureCookie: getSecureCookieFlag(),
		}),
	]);

	if (!jwt) {
		return new Response(JSON.stringify({ error: 'Unauthorized' }), {
			status: 401,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}

	return new Response(
		JSON.stringify({
			jwt: token,
			user: {
				id: jwt.sub,
				email: jwt.email,
				name: jwt.name,
			},
		}),
		{
			headers: {
				'Content-Type': 'application/json',
			},
		}
	);
}
