import { api } from "@/lib/axios";

export async function getCart() {
  const response = await api.get("/cart/me");
  return response;
}

export async function addToCart(productId: number, quantity: number = 1) {
  const response = await api.post(`/cart/${productId}`, { quantity });
  return response;
}

export async function updateCartItem(itemId: number, quantity: number) {
  const response = await api.patch(`/cart/${itemId}`, { quantity });
  return response;
}

export async function removeCartItem(itemId: number) {
  const response = await api.delete(`/cart/item/${itemId}`);
  return response;
}

export async function deleteCart() {
  const response = await api.delete("/cart");
  return response;
}
