import { api } from "@/lib/axios";
import { PaymentOrder } from "@/lib/types";

export async function initiatePayment(data: PaymentOrder) {
  const response = await api.post("/payment/initiate", data);
  return response;
}

export async function verifyPayment(orderId: number) {
  const response = await api.get(`/payment/verify/${orderId}`);
  return response;
}

export async function queryPaymentStatus(checkoutRequestID: string) {
  const response = await api.get(`/payment/status/${checkoutRequestID}`);
  return response;
}
