"use client";

import { formatCurrency } from "@/utils/helpers";

interface PaymentDetails {
  mpesaReceipt?: string;
  paymentAmount?: number;
  paymentPhone?: string;
  paymentDate?: string | number | Date;
}

interface PaymentModalProps {
  isOpen: boolean;
  paymentStatus: "idle" | "processing" | "success" | "error" | "pending";
  checkoutRequestID?: string;
  orderId?: number | null;
  errorMessage?: string;
  paymentDetails?: PaymentDetails;
  calculatedTotal?: number;
  onClose: () => void;
  onRetry?: () => void;
}

export function PaymentModal({
  isOpen,
  paymentStatus,
  checkoutRequestID,
  orderId,
  errorMessage,
  paymentDetails,
  calculatedTotal = 0,
  onClose,
  onRetry,
}: PaymentModalProps) {
  if (!isOpen) return null;

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case "processing":
        return "Waiting for you to complete payment on your phone...";
      case "pending":
        return "Payment is being processed. You can check back later.";
      case "success":
        return "Payment completed! Your order is being processed.";
      case "error":
        return "Payment failed. Please try again.";
      default:
        return "Processing payment...";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="p-6">
          {paymentStatus === "processing" && (
            <div className="text-center py-4">
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black"></div>
              </div>
              <p className="text-lg font-medium">{getStatusMessage()}</p>
              <p className="text-gray-600 text-sm mt-2">
                Please check your phone for the M-Pesa prompt. Enter your PIN to
                complete the payment.
              </p>
              {checkoutRequestID && (
                <p className="text-sm text-gray-500 mt-2 font-mono">
                  Reference: {checkoutRequestID}
                </p>
              )}
              <button
                onClick={onRetry}
                className="mt-4 px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
              >
                Manually Verify Payment
              </button>
            </div>
          )}

          {paymentStatus === "success" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-success-pulse">
                <span className="text-3xl text-green-600">✓</span>
              </div>
              <h3 className="text-xl font-bold text-green-600 mb-2">
                Payment Successful!
              </h3>
              {paymentDetails && (
                <div className="bg-gray-50 rounded-lg p-4 text-left text-sm space-y-2">
                  <p>
                    <strong>M-Pesa Receipt:</strong>{" "}
                    {paymentDetails.mpesaReceipt || "Pending"}
                  </p>
                  <p>
                    <strong>Amount:</strong>{" "}
                    {formatCurrency(
                      paymentDetails.paymentAmount || calculatedTotal,
                    )}
                  </p>
                  <p>
                    <strong>Phone:</strong> {paymentDetails.paymentPhone}
                  </p>
                  <p>
                    <strong>Time:</strong>{" "}
                    {paymentDetails.paymentDate
                      ? new Date(paymentDetails.paymentDate).toLocaleString()
                      : "Just now"}
                  </p>
                </div>
              )}
              <p className="text-gray-600 mt-2">
                Your order #{orderId} has been confirmed!
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
              >
                View Order Details
              </button>
            </div>
          )}

          {paymentStatus === "error" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-red-600">✗</span>
              </div>
              <h3 className="text-xl font-bold text-red-600 mb-2">
                Payment Failed
              </h3>
              <p className="text-gray-600">{getStatusMessage()}</p>
              {errorMessage && (
                <p className="text-sm text-red-600 mt-2 bg-red-50 p-3 rounded-lg">
                  {errorMessage}
                </p>
              )}
              <div className="flex gap-3 mt-4 justify-center">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                {onRetry && (
                  <button
                    onClick={onRetry}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                  >
                    Retry Payment
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
