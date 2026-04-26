import { getPool } from '../_lib/db.js';
import { readJsonBody } from '../_lib/env.js';

const pool = getPool();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
    } = await readJsonBody(req);

    const bookingResult = await pool.query(
      `
        INSERT INTO bookings (
          id,
          event_id,
          user_id,
          user_name,
          user_email,
          ticket_count,
          total_amount,
          payment_id,
          order_id,
          status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'confirmed')
        RETURNING id
      `,
      [ticketId, eventId, userId, userName, userEmail, ticketCount, totalAmount, paymentId, orderId]
    );

    if (Array.isArray(seats)) {
      for (const seat of seats) {
        const [sectionId, seatPos] = String(seat).split('-');
        const rowLabel = seatPos?.charAt(0) || '';
        const colIndex = Number.parseInt(seatPos?.slice(1) || '0', 10);

        await pool.query(
          `
            INSERT INTO seats (
              event_id,
              booking_id,
              seat_identifier,
              section_id,
              row_label,
              col_index
            )
            VALUES ($1, $2, $3, $4, $5, $6)
          `,
          [eventId, bookingResult.rows[0].id, seat, sectionId, rowLabel, colIndex]
        );
      }
    }

    res.status(200).json({ status: 'success', bookingId: bookingResult.rows[0].id });
  } catch (error) {
    console.error('Booking confirm error:', error);
    res.status(500).json({ error: 'Failed to confirm booking' });
  }
}
