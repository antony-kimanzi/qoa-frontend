"use client";

import React, { createContext, useContext, useCallback } from "react";
import toast from "react-hot-toast";

interface NotificationContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showPaymentSuccess: (data: {
    orderId: number;
    amount: number;
    mpesaReceipt?: string;
  }) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const showSuccess = useCallback((message: string) => {
    toast.success(message);
  }, []);

  const showError = useCallback((message: string) => {
    toast.error(message);
  }, []);

  const showPaymentSuccess = useCallback(
    (data: { orderId: number; amount: number; mpesaReceipt?: string }) => {
      const message = `Payment successful! Order #${data.orderId} - KES ${data.amount.toLocaleString()}`;
      toast.success(message, {
        duration: 6000,
        icon: "✅",
      });
    },
    [],
  );

  return (
    <NotificationContext.Provider
      value={{ showSuccess, showError, showPaymentSuccess }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};
