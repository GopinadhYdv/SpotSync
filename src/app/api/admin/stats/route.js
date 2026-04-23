import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
    const stats = await sql.transaction([
      sql`SELECT COUNT(*) as total_events FROM events`,
      sql`SELECT COUNT(*) as total_users FROM (SELECT DISTINCT user_id FROM bookings) as u`,
      sql`SELECT COUNT(*) as total_bookings FROM bookings`,
      sql`SELECT SUM(total_price) as total_revenue FROM bookings WHERE payment_status = 'paid'`,
      sql`SELECT 
            TO_CHAR(created_at, 'Mon') as month, 
            SUM(total_price) as revenue 
          FROM bookings 
          WHERE payment_status = 'paid' 
          GROUP BY TO_CHAR(created_at, 'Mon'), DATE_TRUNC('month', created_at)
          ORDER BY DATE_TRUNC('month', created_at)
          LIMIT 6`,
    ]);

    return Response.json({
      totalEvents: parseInt(stats[0][0].total_events),
      totalUsers: parseInt(stats[1][0].total_users),
      totalBookings: parseInt(stats[2][0].total_bookings),
      totalRevenue: parseFloat(stats[3][0].total_revenue || 0),
      revenueData: stats[4],
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
