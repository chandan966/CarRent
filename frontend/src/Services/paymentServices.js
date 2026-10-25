import { apiRequest } from "./Api";

export async function createPaymentOrder(bookingId) {
  const result = await apiRequest("/api/payments/order", {
    method: "POST",
    body: { bookingId },
  });
  return result;
}

export async function verifyPayment(bookingId, paymentResponse) {
  return apiRequest("/api/payments/verify", {
    method: "POST",
    body: {
      bookingId,
      razorpay_order_id: paymentResponse.razorpay_order_id,
      razorpay_payment_id: paymentResponse.razorpay_payment_id,
      razorpay_signature: paymentResponse.razorpay_signature,
    },
  });
}
