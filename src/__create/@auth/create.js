// Auth is now handled by Clerk on the client side.
// This module is kept as a stub for backward compatibility.
export default function CreateAuth() {
	return {
		auth: async () => null,
	};
}
