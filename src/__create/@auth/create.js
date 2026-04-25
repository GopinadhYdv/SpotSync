import { getToken } from '@auth/core/jwt';
import { getContext } from 'hono/context-storage';

function getSecureCookieFlag() {
	const authUrl = process.env.AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || '';
	return authUrl.startsWith('https://');
}

export default function CreateAuth() {
	const auth = async () => {
		const c = getContext();
		const token = await getToken({
			req: c.req.raw,
			secret: process.env.AUTH_SECRET,
			secureCookie: getSecureCookieFlag(),
		});
		if (token) {
			return {
				user: {
					id: token.sub,
					email: token.email,
					name: token.name,
					image: token.picture,
				},
				expires: token.exp.toString(),
			};
		}
	};
	return {
		auth,
	};
}
