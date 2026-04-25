import { useCallback } from 'react';
import { toast } from 'sonner';

const useRazorpay = () => {
  const loadRazorpay = useCallback(() => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }, []);

  const processPayment = useCallback(async ({ amount, eventTitle, userName, userEmail, userContact, onSuccess, onFailure }) => {
    try {
      // 1. Create order on the server
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, receipt: `receipt_${Date.now()}` }),
      });

      const order = await response.json();

      if (order.error) {
        toast.error('Failed to create payment order');
        if (onFailure) onFailure();
        return;
      }

      // 2. Configure Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '', // Enter the Key ID generated from the Dashboard
        amount: order.amount,
        currency: order.currency,
        name: 'Ease Events',
        description: `Ticket for ${eventTitle}`,
        order_id: order.id,
        handler: async function (response) {
          // 3. Verify payment on the server
          const verifyRes = await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const result = await verifyRes.json();
          if (result.status === 'success') {
            toast.success('Payment Successful!');
            if (onSuccess) onSuccess(response);
          } else {
            toast.error('Payment Verification Failed');
            if (onFailure) onFailure();
          }
        },
        modal: {
          ondismiss: function() {
            if (onFailure) onFailure();
          }
        },
        prefill: {
          name: userName || '',
          email: userEmail || '',
          contact: userContact || '',
        },
        theme: {
          color: '#7c3aed',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error('An error occurred during payment');
      if (onFailure) onFailure();
    }
  }, []);

  return { processPayment };
};

export default useRazorpay;
