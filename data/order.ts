import { api } from "@/lib/axios";
import { OrderData } from "@/lib/types";

export async function createOrder(data: OrderData) {
  const response = await api.post("/order", data);
  return response;
}

export async function getOrders() {
  const response = await api.get("/order");
  return response;
}

export async function getOrderById(id: number) {
  const response = await api.get(`/order/${id}`);
  return response;
}
