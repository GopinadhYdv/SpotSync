// Auth tokens are now handled by Clerk.
export async function GET() {
  return new Response(JSON.stringify({ message: 'Auth is handled by Clerk' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
