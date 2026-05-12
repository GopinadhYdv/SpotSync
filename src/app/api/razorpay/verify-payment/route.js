import crypto from "node:crypto";

export async function action({ request }) {
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }
  return POST(request);
}

export async function POST(request) {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return Response.json({ error: "Razorpay is not configured" }, { status: 503 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return Response.json({ status: "failure", message: "Invalid signature" }, { status: 400 });
    }

    return Response.json({ status: "success" });
  } catch (error) {
    console.error("Razorpay Verify Payment Error:", error);
    return Response.json({ error: "Verification failed" }, { status: 500 });
  }
}
