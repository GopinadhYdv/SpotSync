import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

let pool = null;
neonConfig.webSocketConstructor = ws;

const getPool = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  return pool;
};

export async function POST(request) {
  const pool = getPool();

  try {
    const {
      ticketId,
      eventId,
      userId,
      userName,
      userEmail,
      ticketCount,
      totalAmount,
      paymentId,
      orderId,
      seats,
    } = await request.json();

    const bookingSql = `
      INSERT INTO bookings (id, event_id, user_id, user_name, user_email, ticket_count, total_amount, payment_id, order_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'confirmed')
      RETURNING id
    `;
    const bookingResult = await pool.query(bookingSql, [
      ticketId,
      eventId,
      userId,
      userName,
      userEmail,
      ticketCount,
      totalAmount,
      paymentId,
      orderId,
    ]);
    const bookingId = bookingResult.rows[0].id;

    if (seats && Array.isArray(seats)) {
      for (const seat of seats) {
        const seatSql = `
          INSERT INTO seats (event_id, booking_id, seat_identifier, section_id, row_label, col_index)
          VALUES ($1, $2, $3, $4, $5, $6)
        `;
        const parts = String(seat).split("-");
        const sectionId = parts[0];
        const seatPos = parts[1];
        const rowLabel = seatPos?.charAt(0) || "";
        const colIndex = parseInt(seatPos?.substring(1) || "0", 10);
        await pool.query(seatSql, [eventId, bookingId, seat, sectionId, rowLabel, colIndex]);
      }
    }

    return Response.json({ status: "success", bookingId });
  } catch (error) {
    console.error("Booking Confirmation Error:", error);
    return Response.json({ error: "Failed to confirm booking" }, { status: 500 });
  }
}
