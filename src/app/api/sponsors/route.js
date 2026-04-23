import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const sponsors = await sql`SELECT * FROM sponsors ORDER BY created_at DESC`;
    return Response.json(sponsors);
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch sponsors" },
      { status: 500 },
    );
  }
}
