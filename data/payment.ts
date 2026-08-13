import { api } from "@/lib/axios";
import { PaymentOrder } from "@/lib/types";

// data/payment.ts
export async function initiatePayment(data: PaymentOrder) {
  const response = await api.post("/payment/initiate", data);

  // Log the full response for debugging
  console.log("📥 Payment initiate response:", {
    status: response.status,
    data: response.data,
    headers: response.headers,
  });

  return response;
}

export async function queryPaymentStatus(checkoutRequestID: string) {
  if (!checkoutRequestID || checkoutRequestID.trim() === "") {
    console.error("❌ Cannot query status: checkoutRequestID is empty");
    throw new Error("Checkout request ID is required");
  }

  const response = await api.get(`/payment/status/${checkoutRequestID}`);
  console.log("📥 Status query response:", response.data);
  return response;
}

export async function verifyPayment(orderId: number) {
  const response = await api.get(`/payment/verify/${orderId}`);
  return response;
}
