import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const { event_id, ticket_count, total_price, user_id } = body;

    // Check capacity first
    const [event] =
      await sql`SELECT capacity FROM events WHERE id = ${event_id}`;
    const [booked] =
      await sql`SELECT SUM(ticket_count) as total FROM bookings WHERE event_id = ${event_id} AND booking_status = 'confirmed'`;

    const remaining = (event.capacity || 0) - parseInt(booked.total || 0);

    if (remaining < ticket_count) {
      return Response.json(
        { error: "Not enough tickets available" },
        { status: 400 },
      );
    }

    const result = await sql`
      INSERT INTO bookings (event_id, ticket_count, total_price, user_id, payment_status)
      VALUES (${event_id}, ${ticket_count}, ${total_price}, ${user_id || "guest"}, 'paid')
      RETURNING *
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error creating booking:", error);
    return Response.json(
      { error: "Failed to process booking" },
      { status: 500 },
    );
  }
}
