"use client";

import { api } from "@/lib/axios";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCurrency, formatDate, getStatusColor } from "@/utils/helpers";
import { PageLoader } from "@/components/ui/Loader";

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  items: Array<{
    quantity: number;
    price: number;
    product: { name: string };
  }>;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/order");
        setOrders(response.data.data?.orders || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <PageLoader />;

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">No Orders Yet</h1>
        <p className="text-gray-600 mb-8">
          Start shopping to place your first order
        </p>
        <Link
          href="/products"
          className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-wrap justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-600">Order #{order.id}</p>
                <p className="text-sm text-gray-600">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
              >
                {order.status}
              </span>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">
                {order.items?.length || 0} item
                {order.items?.length !== 1 ? "s" : ""}
              </p>
              <div className="flex justify-between items-center">
                <span className="font-bold">
                  {formatCurrency(order.totalAmount)}
                </span>
                <Link
                  href={`/order/confirmation/${order.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
