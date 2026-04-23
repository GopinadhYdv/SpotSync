import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit") || 50;

    let query =
      "SELECT e.*, c.name as category_name FROM events e LEFT JOIN categories c ON e.category_id = c.id WHERE 1=1";
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND c.name = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (e.title ILIKE $${params.length} OR e.description ILIKE $${params.length})`;
    }

    query += ` ORDER BY e.event_date ASC LIMIT $${params.length + 1}`;
    params.push(limit);

    const events = await sql(query, params);
    return Response.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return Response.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      event_date,
      location,
      price,
      category_id,
      image_url,
      capacity,
    } = body;

    const result = await sql`
      INSERT INTO events (title, description, event_date, location, price, category_id, image_url, capacity)
      VALUES (${title}, ${description}, ${event_date}, ${location}, ${price}, ${category_id}, ${image_url}, ${capacity})
      RETURNING *
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error creating event:", error);
    return Response.json({ error: "Failed to create event" }, { status: 500 });
  }
}
