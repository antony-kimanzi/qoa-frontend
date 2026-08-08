"use client";

import { useEffect, useState } from "react";
import { useAdminStore } from "@/store/adminStore";
import { formatCurrency, formatDate, getStatusColor } from "@/utils/helpers";
import { Modal } from "@/components/ui/Modal";

type OrderStatus =
  | "pending"
  | "processing"
  | "completed"
  | "delivered"
  | "cancelled";

type FilterStatus = OrderStatus | "all";

type OrderItem = {
  product?: {
    name: string;
  };
  quantity: number;
  price: number;
};

type BillingInfo = {
  email?: string;
  phoneNumber?: string;
};

type Order = {
  id: number | string;
  status: OrderStatus;
  contact: string;
  billing?: BillingInfo;
  totalAmount: number;
  paymentMethod: string;
  shippingMethod?: string;
  createdAt: string;
  items?: OrderItem[];
};

export default function AdminOrders() {
  const { orders, fetchOrders, updateOrder, isLoading } = useAdminStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const ordersArray = Array.isArray(orders) ? orders : [];

  const filteredOrders = ordersArray.filter((order) => {
    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;
    const matchesSearch =
      searchTerm === "" ||
      order.id.toString().includes(searchTerm) ||
      order.contact?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        Loading orders...
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          type="text"
          placeholder="Search by ID or contact..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 border rounded-lg text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Order ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Amount
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Payment
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredOrders.map((order, index) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{index + 1}</td>
                <td className="px-4 py-3 text-sm font-medium">#{order.id}</td>
                <td className="px-4 py-3 text-sm">
                  <div>
                    <p className="font-medium">{order.contact}</p>
                    <p className="text-xs text-gray-500">
                      {order.billing?.email}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-semibold">
                  {formatCurrency(order.totalAmount)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{order.paymentMethod}</td>
                <td className="px-4 py-3 text-sm">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order #${selectedOrder?.id}`}
        maxWidth="lg"
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm text-gray-500">
                  Customer
                </h4>
                <p>{selectedOrder.contact}</p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.billing?.email}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.billing?.phoneNumber}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-500">
                  Order Details
                </h4>
                <p>Total: {formatCurrency(selectedOrder.totalAmount)}</p>
                <p>Payment: {selectedOrder.paymentMethod}</p>
                <p>Shipping: {selectedOrder.shippingMethod}</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-gray-500 mb-2">
                Items
              </h4>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left">Product</th>
                    <th className="px-3 py-2 text-left">Quantity</th>
                    <th className="px-3 py-2 text-left">Price</th>
                    <th className="px-3 py-2 text-left">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {selectedOrder.items?.map((item: OrderItem, idx: number) => (
                    <tr key={idx}>
                      <td className="px-3 py-2">{item.product?.name}</td>
                      <td className="px-3 py-2">{item.quantity}</td>
                      <td className="px-3 py-2">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-3 py-2">
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div>
                <label className="text-sm font-medium mr-2">
                  Update Status:
                </label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as OrderStatus;
                    updateOrder(Number(selectedOrder.id), {
                      status: newStatus,
                    });
                    setSelectedOrder({
                      ...selectedOrder,
                      status: newStatus,
                    });
                  }}
                  className="px-3 py-1 border rounded-lg text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
