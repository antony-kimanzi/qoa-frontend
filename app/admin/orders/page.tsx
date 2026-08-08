"use client";

import AdminLayout from "@/components/layout/AdminLayout";
import AdminOrders from "./components/AdminOrders";

export default function AdminOrdersPage() {
  return (
    <AdminLayout>
      <AdminOrders />
    </AdminLayout>
  );
}
