import Razorpay from 'razorpay';
import { readJsonBody } from '../_lib/env.js';

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return res.status(503).json({ error: 'Razorpay is not configured' });
    }

    const { amount, currency = 'INR', receipt } = await readJsonBody(req);
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(numericAmount * 100),
      currency,
      receipt,
    });

    res.status(200).json(order);
  } catch (error) {
    console.error('Razorpay create-order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
}
