"use client";

import { api } from "@/lib/axios";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
    id: number;
    quantity: number;
    price: number;
    product: {
      name: string;
      brand: string;
      imageUrl: string;
    };
  }>;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/order/${params.id}`);
        setOrder(response.data.data?.order);
      } catch (error) {
        console.error("Error fetching order:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [params.id, router]);

  if (loading) return <PageLoader />;

  if (!order) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold">Order Confirmed!</h1>
        <p className="text-gray-600">Thank you for your purchase</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600">Order Number</p>
            <p className="font-semibold">#{order.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Order Date</p>
            <p className="font-semibold">{formatDate(order.createdAt)}</p>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-600">Status</p>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
          >
            {order.status}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Order Items</h2>
        <div className="space-y-4">
          {order.items?.map((item) => (
            <div key={item.id} className="flex justify-between border-b pb-4">
              <div>
                <p className="font-semibold">{item.product.name}</p>
                <p className="text-sm text-gray-600">{item.product.brand}</p>
                <p className="text-sm">Qty: {item.quantity}</p>
              </div>
              <p className="font-semibold">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4 pt-4 border-t">
          <span className="font-bold">Total</span>
          <span className="font-bold">{formatCurrency(order.totalAmount)}</span>
        </div>
      </div>

      <Link
        href="/shop"
        className="block w-full py-3 bg-black text-white text-center rounded-lg hover:bg-gray-800 transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
