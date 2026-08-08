import { api } from "@/lib/axios";
import { LoginData, RegisterData } from "@/lib/types";

export async function login(data: LoginData) {
  const response = await api.post("/auth/login", data);
  return response;
}

export async function register(data: RegisterData) {
  const response = await api.post("/auth/register", data);
  return response;
}

export async function logout() {
  const response = await api.post("/auth/logout");
  return response;
}

export async function refreshToken() {
  const response = await api.post("/auth/refresh");
  return response;
}
