/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@/lib/axios";

export async function fetchProfile() {
  const response = await api.get("/user/me");
  return response.data?.user;
}

export async function updateProfile(data: any) {
  const response = await api.patch("/user/me", data);
  return response.data;
}
