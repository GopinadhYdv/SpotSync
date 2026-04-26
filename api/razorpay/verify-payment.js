import crypto from 'node:crypto';
import { readJsonBody } from '../_lib/env.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({ error: 'Razorpay is not configured' });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await readJsonBody(req);

    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ status: 'failure', message: 'Invalid signature' });
    }

    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Razorpay verify-payment error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
}
