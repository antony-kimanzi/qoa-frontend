"use client";

import { formatCurrency } from "@/utils/helpers";
import { CartItem } from "@/lib/types";
import Image from "next/image";

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  isSubmitting?: boolean;
}

export function OrderSummary({
  items,
  subtotal,
  shipping,
  total,
  isSubmitting,
}: OrderSummaryProps) {
  return (
    <div className="lg:min-w-[450px] bg-gray-50 p-6 rounded-lg sticky top-4">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>

      <div className="max-h-64 overflow-y-auto space-y-3 mb-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 border-b pb-3">
            <div className="relative w-16 h-16 flex-shrink-0">
              <Image
                src={item.product.imageUrl}
                alt={item.product.name}
                fill
                className="object-cover rounded"
              />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{item.product.name}</p>
              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              <p className="text-sm font-semibold">
                {formatCurrency(item.product.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Shipping</span>
          <span>{formatCurrency(shipping)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold pt-2 border-t">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full mt-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors text-lg font-semibold"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            Processing...
          </span>
        ) : (
          `Place Order • ${formatCurrency(total)}`
        )}
      </button>
    </div>
  );
}
