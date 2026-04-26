import sql from "@/app/api/utils/sql";

function mapDbEvent(event) {
  return {
    id: String(event.id),
    title: event.title,
    category: event.category_name || event.category || "General",
    location: event.location,
    venueAddress: event.venue_address || event.location,
    date: event.event_date,
    time: event.event_time || "18:00",
    price: Number(event.price || 0),
    capacity: Number(event.capacity || 100),
    featured: Boolean(event.featured),
    badge: event.badge || "New Event",
    color: event.color || "#7c3aed",
    accent: event.accent || "#3b82f6",
    poster: event.image_url || "/events/tech-summit.png",
    description: event.short_description || event.description || "",
    shortDescription: event.short_description || event.description || "",
    longDescription: event.long_description || event.description || "",
    organizer: event.organizer || "Ease Events",
    seatLayout: event.seat_layout || null,
  };
}

async function findOrCreateCategoryId(categoryName) {
  const normalized = (categoryName || "General").trim();
  const existing = await sql`SELECT id FROM categories WHERE LOWER(name) = LOWER(${normalized}) LIMIT 1`;
  if (existing[0]?.id) return existing[0].id;

  const inserted = await sql`
    INSERT INTO categories (name)
    VALUES (${normalized})
    RETURNING id
  `;
  return inserted[0].id;
}

async function selectEvents({ category, search, limit = 50 }) {
  let query = `
    SELECT
      e.*,
      c.name AS category_name
    FROM events e
    LEFT JOIN categories c ON e.category_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (category) {
    params.push(category);
    query += ` AND c.name = $${params.length}`;
  }

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (
      e.title ILIKE $${params.length}
      OR COALESCE(e.short_description, e.description, '') ILIKE $${params.length}
      OR e.location ILIKE $${params.length}
    )`;
  }

  query += ` ORDER BY e.event_date ASC, COALESCE(e.event_time, '18:00') ASC LIMIT $${params.length + 1}`;
  params.push(Number(limit) || 50);

  return sql(query, params);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const limit = searchParams.get("limit") || 50;

    const events = await selectEvents({ category, search, limit });
    return Response.json(events.map(mapDbEvent));
  } catch (error) {
    console.error("Error fetching events:", error);
    return Response.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const categoryId = await findOrCreateCategoryId(body.category);

    const result = await sql`
      INSERT INTO events (
        title,
        description,
        short_description,
        long_description,
        event_date,
        event_time,
        location,
        venue_address,
        price,
        category_id,
        image_url,
        capacity,
        featured,
        badge,
        color,
        accent,
        organizer,
        seat_layout
      )
      VALUES (
        ${body.title},
        ${body.description || body.shortDescription || ""},
        ${body.shortDescription || body.description || ""},
        ${body.longDescription || body.description || body.shortDescription || ""},
        ${body.date},
        ${body.time || "18:00"},
        ${body.location},
        ${body.venueAddress || body.location},
        ${Number(body.price || 0)},
        ${categoryId},
        ${body.poster || null},
        ${Number(body.capacity || 100)},
        ${Boolean(body.featured)},
        ${body.badge || "New Event"},
        ${body.color || "#7c3aed"},
        ${body.accent || "#3b82f6"},
        ${body.organizer || "Ease Events"},
        ${JSON.stringify(body.seatLayout || null)}::jsonb
      )
      RETURNING *
    `;

    const categoryRow = await sql`SELECT name FROM categories WHERE id = ${categoryId} LIMIT 1`;
    return Response.json(mapDbEvent({ ...result[0], category_name: categoryRow[0]?.name }));
  } catch (error) {
    console.error("Error creating event:", error);
    return Response.json({ error: "Failed to create event" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return Response.json({ error: "Event id is required" }, { status: 400 });
    }

    const body = await request.json();
    const categoryId = await findOrCreateCategoryId(body.category);

    const result = await sql`
      UPDATE events
      SET
        title = ${body.title},
        description = ${body.description || body.shortDescription || ""},
        short_description = ${body.shortDescription || body.description || ""},
        long_description = ${body.longDescription || body.description || body.shortDescription || ""},
        event_date = ${body.date},
        event_time = ${body.time || "18:00"},
        location = ${body.location},
        venue_address = ${body.venueAddress || body.location},
        price = ${Number(body.price || 0)},
        category_id = ${categoryId},
        image_url = ${body.poster || null},
        capacity = ${Number(body.capacity || 100)},
        featured = ${Boolean(body.featured)},
        badge = ${body.badge || "New Event"},
        color = ${body.color || "#7c3aed"},
        accent = ${body.accent || "#3b82f6"},
        organizer = ${body.organizer || "Ease Events"},
        seat_layout = ${JSON.stringify(body.seatLayout || null)}::jsonb
      WHERE id = ${id}
      RETURNING *
    `;

    if (!result[0]) {
      return Response.json({ error: "Event not found" }, { status: 404 });
    }

    const categoryRow = await sql`SELECT name FROM categories WHERE id = ${categoryId} LIMIT 1`;
    return Response.json(mapDbEvent({ ...result[0], category_name: categoryRow[0]?.name }));
  } catch (error) {
    console.error("Error updating event:", error);
    return Response.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return Response.json({ error: "Event id is required" }, { status: 400 });
    }

    await sql`DELETE FROM events WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return Response.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
