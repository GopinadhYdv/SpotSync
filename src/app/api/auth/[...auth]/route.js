// Auth is now handled by Clerk. This route is no longer needed.
export async function GET() {
  return new Response(JSON.stringify({ message: 'Auth is handled by Clerk' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST() {
  return new Response(JSON.stringify({ message: 'Auth is handled by Clerk' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
