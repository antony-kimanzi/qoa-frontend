import { api } from "@/lib/axios";

export async function fetchProducts() {
  const response = await api.get("/product");
  return response.data;
}

export async function fetchProductById(id: number) {
  const response = await api.get(`/product/${id}`);
  return response.data;
}
