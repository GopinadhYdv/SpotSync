import Razorpay from "razorpay";

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export async function action({ request }) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  return POST(request);
}

export async function POST(request) {
  try {
    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return Response.json({ error: "Razorpay is not configured" }, { status: 503 });
    }

    const { amount, currency = "INR", receipt } = await request.json();
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return Response.json({ error: "Invalid amount" }, { status: 400 });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(numericAmount * 100),
      currency,
      receipt,
    });

    return Response.json(order);
  } catch (error) {
    console.error("Razorpay Create Order Error:", error);
    return Response.json({ error: "Failed to create order" }, { status: 500 });
  }
}
