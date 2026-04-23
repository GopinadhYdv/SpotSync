import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const news =
      await sql`SELECT * FROM news ORDER BY published_at DESC LIMIT 10`;
    return Response.json(news);
  } catch (error) {
    return Response.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
