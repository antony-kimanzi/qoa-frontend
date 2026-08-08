"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAdminStore } from "@/store/adminStore";
import { formatCurrency, getPaymentStatusColor } from "@/utils/helpers";
import { Modal } from "@/components/ui/Modal";

export default function AdminPaymentsPage() {
  const { payments, fetchPayments, updatePayment, isLoading } = useAdminStore();
  type Payment = (typeof payments)[number];
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const paymentsArray = Array.isArray(payments) ? payments : [];

  const filteredPayments = paymentsArray.filter((payment) => {
    const matchesStatus =
      filterStatus === "all" || payment.status === filterStatus;
    const matchesSearch =
      searchTerm === "" ||
      payment.id.toString().includes(searchTerm) ||
      payment.orderId.toString().includes(searchTerm) ||
      payment.phoneNumber?.includes(searchTerm) ||
      payment.mpesaReceipt?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          Loading payments...
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Payments</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="all">All Payments</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <input
            type="text"
            placeholder="Search by payment ID, order ID, phone, or receipt..."
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
                  Payment ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Receipt
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
              {filteredPayments.map((payment, index) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{index + 1}</td>
                  <td className="px-4 py-3 text-sm font-medium">
                    #{payment.id}
                  </td>
                  <td className="px-4 py-3 text-sm">#{payment.orderId}</td>
                  <td className="px-4 py-3 text-sm font-semibold">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-4 py-3 text-sm">{payment.phoneNumber}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(payment.status)}`}
                    >
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-xs">
                    {payment.mpesaReceipt || payment.checkoutRequestID || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {payment.transactionDate
                      ? new Date(payment.transactionDate).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedPayment(payment)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPayments.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No payments found
            </div>
          )}
        </div>

        {/* Payment Details Modal */}
        <Modal
          isOpen={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
          title={`Payment #${selectedPayment?.id}`}
          maxWidth="lg"
        >
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-500">
                    Payment Information
                  </h4>
                  <p>Order ID: #{selectedPayment.orderId}</p>
                  <p>Amount: {formatCurrency(selectedPayment.amount)}</p>
                  <p>Phone: {selectedPayment.phoneNumber}</p>
                  <p>Receipt: {selectedPayment.mpesaReceipt || "N/A"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-500">
                    Status
                  </h4>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${getPaymentStatusColor(selectedPayment.status)}`}
                  >
                    {selectedPayment.status}
                  </span>
                  <p className="mt-2 text-sm text-gray-500">
                    Created:{" "}
                    {new Date(selectedPayment.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <label className="text-sm font-medium mr-2">
                    Update Status:
                  </label>
                  <select
                    value={selectedPayment.status}
                    onChange={(e) => {
                      const status = e.target.value as
                        | "pending"
                        | "completed"
                        | "failed";
                      updatePayment(selectedPayment.id, {
                        status,
                      });
                      setSelectedPayment({
                        ...selectedPayment,
                        status,
                      });
                    }}
                    className="px-3 py-1 border rounded-lg text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
}
