// Auth is now handled by Clerk.
export async function GET() {
  return new Response(
    '<html><body><script>window.parent.postMessage({ type: "AUTH_SUCCESS", message: "Auth handled by Clerk" }, "*");</script></body></html>',
    { status: 200, headers: { 'Content-Type': 'text/html' } }
  );
}
