// components/checkout/PaymentModal.tsx
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/Dialog";

interface PaymentModalProps {
  isOpen: boolean;
  paymentStatus: "idle" | "processing" | "success" | "error" | "pending";
  checkoutRequestID: string;
  orderId: number | null;
  errorMessage: string;
  paymentDetails?: any;
  calculatedTotal: number;
  onClose: () => void;
  onRetry: () => void;
}

export function PaymentModal({
  isOpen,
  paymentStatus,
  checkoutRequestID,
  orderId,
  errorMessage,
  paymentDetails,
  calculatedTotal,
  onClose,
  onRetry,
}: PaymentModalProps) {
  const renderContent = () => {
    switch (paymentStatus) {
      case "processing":
        return (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
            <h3 className="text-xl font-semibold mb-2">Processing Payment</h3>
            <p className="text-gray-600">
              Please enter your M-Pesa PIN on your phone to complete the
              payment.
            </p>
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                You should receive an STK Push notification on your phone
                shortly.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Checkout Request ID: {checkoutRequestID}
              </p>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Amount: KES {calculatedTotal.toFixed(2)}
            </p>
          </div>
        );

      case "pending":
        return (
          <div className="text-center py-8">
            <div className="animate-pulse text-4xl mb-4">⏳</div>
            <h3 className="text-xl font-semibold mb-2">Waiting for Payment</h3>
            <p className="text-gray-600">
              Please complete the payment on your phone.
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                We're waiting for your M-Pesa confirmation. This may take a few
                moments.
              </p>
            </div>
          </div>
        );

      case "success":
        return (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold mb-2 text-green-600">
              Payment Successful!
            </h3>
            <p className="text-gray-600">
              Your order has been confirmed. Order #{orderId}
            </p>
            {paymentDetails?.mpesaReceipt && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  M-Pesa Receipt: {paymentDetails.mpesaReceipt}
                </p>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-4">
              Redirecting to order confirmation...
            </p>
          </div>
        );

      case "error":
        return (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-semibold mb-2 text-red-600">
              Payment Failed
            </h3>
            <p className="text-gray-600 mb-4">
              {errorMessage || "An error occurred during payment processing."}
            </p>
            <button
              onClick={onRetry}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
            >
              Retry Payment
            </button>
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                If you already completed the payment, please wait a moment and
                try checking your order status.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {paymentStatus === "success"
              ? "Payment Confirmed"
              : paymentStatus === "error"
                ? "Payment Failed"
                : "Complete Payment"}
          </DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
