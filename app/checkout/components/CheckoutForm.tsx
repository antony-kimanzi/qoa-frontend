"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useOrderStore } from "@/store/orderStore";
import { CheckoutFormData } from "@/lib/types";
import { PaymentModal } from "@/components/checkout/PaymentModal";
import { OrderSummary } from "./OrderSummary";

type PaymentDetails = Record<string, unknown> | null;

export default function CheckoutForm() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { items, clearCart } = useCartStore();
  const { createOrder, initiatePayment, checkPaymentStatus } = useOrderStore();

  const [formData, setFormData] = useState<CheckoutFormData>({
    email: user?.email || "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    country: "Kenya",
    zipCode: "",
    phone: "",
    apartment: "",
    deliveryInstructions: "",
    paymentMethod: "mpesa",
    shippingMethod: "store",
  });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success" | "error" | "pending"
  >("idle");
  const [checkoutRequestID, setCheckoutRequestID] = useState("");
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  const [paymentError, setPaymentError] = useState("");
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );

  const total = subtotal + shippingCost;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePaymentMethodChange = (method: "mpesa" | "cash") => {
    setFormData({ ...formData, paymentMethod: method });
  };

  const handleShippingMethodChange = (method: "delivery" | "store") => {
    setFormData({ ...formData, shippingMethod: method });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderData = {
        billing: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phone,
        },
        shipping: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phone,
          streetAddress: formData.address,
          city: formData.city,
          apartment: formData.apartment,
          postalCode: formData.zipCode,
          deliveryInstructions: formData.deliveryInstructions,
        },
        paymentMethod: formData.paymentMethod,
        shippingMethod: formData.shippingMethod,
        contact: formData.email,
        totalAmount: total,
        isPaid: false,
      };

      const response = await createOrder(orderData);

      if (!response.success) {
        throw new Error(response.message || "Failed to create order");
      }

      const orderId = response.orderId;
      if (orderId === undefined || orderId === null) {
        throw new Error("Order ID is missing from response");
      }
      setCreatedOrderId(orderId);

      // If M-Pesa, initiate payment
      if (formData.paymentMethod === "mpesa") {
        setShowPaymentModal(true);
        setPaymentStatus("processing");

        let paymentResult: any;

        const initiatingPayment = async () => {
          paymentResult = await initiatePayment({
            orderId,
            phoneNumber: formData.phone,
            amount: Math.round(total),
          });
        };

        setTimeout(initiatingPayment, 10000);

        if (paymentResult?.success) {
          const checkoutRequestID = paymentResult?.checkoutRequestID;
          if (!checkoutRequestID) {
            setPaymentStatus("error");
            setPaymentError("Missing checkout request ID");
            return;
          }
          setCheckoutRequestID(checkoutRequestID);
          // Start polling for payment status
          pollPaymentStatus(orderId, checkoutRequestID);
        } else {
          setPaymentStatus("error");
          setPaymentError(paymentResult?.message || "Payment failed");
        }
      } else {
        // Non-M-Pesa payment
        await clearCart();
        router.push(`/order/confirmation/${orderId}`);
      }
    } catch (error: unknown) {
      console.error("Checkout error:", error);
      setPaymentStatus("error");
      const message = error instanceof Error ? error.message : String(error);
      setPaymentError(message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pollPaymentStatus = async (
    orderId: number,
    checkoutRequestID: string,
  ) => {
    let attempts = 0;
    const maxAttempts = 12;

    const checkStatus = async () => {
      attempts++;
      try {
        const data = await checkPaymentStatus(checkoutRequestID);

        if (data.isPaid) {
          setPaymentStatus("success");
          setPaymentDetails(data);
          clearCart();
          setTimeout(() => {
            router.push(`/order/confirmation/${orderId}`);
          }, 3000);
          return;
        }

        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000);
        } else {
          setPaymentStatus("error");
          setPaymentError("Payment timed out. Please check your M-Pesa.");
        }
      } catch (error: unknown) {
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000);
        } else {
          setPaymentStatus("error");
          const message =
            error instanceof Error ? error.message : String(error);
          setPaymentError(message || "Failed to verify payment status");
        }
      }
    };

    setTimeout(checkStatus, 10000);
  };

  const handleRetryPayment = async () => {
    if (!createdOrderId) return;
    setPaymentStatus("processing");
    setPaymentError("");

    try {
      const result = await initiatePayment({
        orderId: createdOrderId,
        phoneNumber: formData.phone,
        amount: Math.round(total),
      });

      if (result.success) {
        const requestID = result.checkoutRequestID || "";
        setCheckoutRequestID(requestID);
        pollPaymentStatus(createdOrderId, requestID);
      } else {
        setPaymentStatus("error");
        setPaymentError(result.message || "Payment failed");
      }
    } catch (error: unknown) {
      setPaymentStatus("error");
      const message = error instanceof Error ? error.message : String(error);
      setPaymentError(message || "Something went wrong");
    }
  };

  return (
    <>
      <PaymentModal
        isOpen={showPaymentModal}
        paymentStatus={paymentStatus}
        checkoutRequestID={checkoutRequestID}
        orderId={createdOrderId}
        errorMessage={paymentError}
        paymentDetails={paymentDetails ?? undefined}
        calculatedTotal={total}
        onClose={() => {
          setShowPaymentModal(false);
          if (paymentStatus === "success") {
            router.push(`/order/confirmation/${createdOrderId}`);
          }
        }}
        onRetry={handleRetryPayment}
      />

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-lg font-semibold mb-4">Contact</h2>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email *"
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-lg font-semibold mb-4">
                  How would you like to get your perfume?
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault();
                      handleShippingMethodChange("delivery");
                      setShippingCost(100);
                    }}
                    className={`p-4 border rounded-lg text-center transition ${
                      formData.shippingMethod === "delivery"
                        ? "border-black bg-gray-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex flex-row justify-center text-2xl mb-1">
                      <svg
                        id="Delivery--Streamline-Carbon"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        height="24"
                        width="24"
                      >
                        <desc>
                          Delivery Streamline Icon: https://streamlinehq.com
                        </desc>
                        <defs></defs>
                        <path
                          d="M3 12h9v1.5H3Z"
                          fill="#000000"
                          strokeWidth="0.75"
                        ></path>
                        <path
                          d="M1.5 8.25h7.5v1.5H1.5Z"
                          fill="#000000"
                          strokeWidth="0.75"
                        ></path>
                        <path
                          d="m22.439175 12.4548 -2.25 -5.25A0.7488750000000001 0.7488750000000001 0 0 0 19.5 6.75h-2.25V5.25a0.75 0.75 0 0 0 -0.75 -0.75H4.5v1.5h11.25v9.41715A2.9943 2.9943 0 0 0 14.356575 17.25h-4.713150000000001a3 3 0 1 0 0 1.5h4.713150000000001a2.98545 2.98545 0 0 0 5.786849999999999 0H21.75a0.75 0.75 0 0 0 0.75 -0.75v-5.25a0.747375 0.747375 0 0 0 -0.060825000000000004 -0.2952ZM6.75 19.5a1.5 1.5 0 1 1 1.5 -1.5 1.501725 1.501725 0 0 1 -1.5 1.5Zm10.5 -11.25h1.7556000000000003l1.607325 3.75H17.25Zm0 11.25a1.5 1.5 0 1 1 1.5 -1.5 1.501725 1.501725 0 0 1 -1.5 1.5Zm3.75 -2.25h-0.8565749999999999A2.99655 2.99655 0 0 0 17.25 15v-1.5h3.75Z"
                          fill="#000000"
                          strokeWidth="0.75"
                        ></path>
                        <path
                          id="_Transparent_Rectangle_"
                          d="M0 0h24v24H0Z"
                          fill="none"
                          strokeWidth="0.75"
                        ></path>
                      </svg>
                    </div>
                    <div className="text-sm font-medium">Delivery services</div>
                  </button>

                  <button
                    type="button"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault();
                      handleShippingMethodChange("store");
                      setShippingCost(0);
                    }}
                    className={`p-4 border rounded-lg text-center transition ${
                      formData.shippingMethod === "store"
                        ? "border-black bg-gray-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex flex-row justify-center text-2xl mb-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        height="24"
                        width="24"
                      >
                        <g id="home">
                          <path
                            id="Union"
                            fill="#000000"
                            d="m12.6074 3.2041 10.5 8 -1.2129 1.5918 -1.8935 -1.4434V21H13v-6h-2v6H4.00098v-9.6475l-1.89356 1.4434 -1.212889 -1.5918 10.499969 -8 0.6065 -0.46094zm-6.60642 6.625V19H9v-6h6v6h3.001V9.8291l-6 -4.57129z"
                            strokeWidth="1"
                          ></path>
                        </g>
                      </svg>
                    </div>
                    <div className="text-sm font-medium">In store</div>
                  </button>
                </div>
                {formData.shippingMethod === "delivery" && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      Enter your shipping address below. You will receive a
                      phone call before the courier starts the delivery to
                      confirm your location.
                    </p>
                  </div>
                )}
              </div>

              {formData.shippingMethod === "delivery" && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h2 className="text-lg font-semibold mb-4">
                    Shipping Address
                  </h2>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street Address *"
                    required
                    className="w-full mb-4 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City *"
                      required
                      className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      placeholder="Country"
                      required
                      className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      disabled
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      placeholder="ZIP Code (Optional)"
                      required
                      className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <input
                      type="text"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleChange}
                      placeholder="Apartment (Optional)"
                      required
                      className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  <textarea
                    name="deliveryInstructions"
                    value={formData.deliveryInstructions}
                    onChange={handleChange}
                    placeholder="Delivery Instructions (Optional)"
                    rows={3}
                    className="w-full mt-4 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  />
                </div>
              )}

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handlePaymentMethodChange("mpesa")}
                    className={`p-4 border rounded-lg text-center transition ${
                      formData.paymentMethod === "mpesa"
                        ? "border-black bg-gray-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex flex-row justify-center text-2xl mb-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        height="24"
                        width="24"
                      >
                        <g id="Mobile-Payment-Coin-Fill">
                          <path
                            id="Vector"
                            fill="#000000"
                            d="M17.5 12c0.7607 0 1.4754 0.1449 2.1445 0.4336 0.6692 0.2887 1.2521 0.6798 1.7471 1.1748s0.8861 1.0779 1.1748 1.7471c0.2887 0.6691 0.4336 1.3838 0.4336 2.1445s-0.1449 1.4754 -0.4336 2.1445c-0.2887 0.6692 -0.6798 1.2521 -1.1748 1.7471s-1.0779 0.8861 -1.7471 1.1748C18.9754 22.8551 18.2607 23 17.5 23s-1.4754 -0.1449 -2.1445 -0.4336c-0.6692 -0.2887 -1.2521 -0.6798 -1.7471 -1.1748s-0.8861 -1.0779 -1.1748 -1.7471C12.1449 18.9754 12 18.2607 12 17.5s0.1449 -1.4754 0.4336 -2.1445c0.2887 -0.6692 0.6798 -1.2521 1.1748 -1.7471s1.0779 -0.8861 1.7471 -1.1748C16.0246 12.1449 16.7393 12 17.5 12m-0.4678 2.3379c-0.4581 0.1008 -0.8156 0.3021 -1.0722 0.6045 -0.2567 0.3025 -0.3848 0.6417 -0.3848 1.0176 0 0.4308 0.1259 0.7791 0.3779 1.0449 0.2521 0.2658 0.6486 0.495 1.1895 0.6875 0.5773 0.2108 0.9785 0.3985 1.2031 0.5635 0.2245 0.1649 0.3369 0.3807 0.3369 0.6464 0 0.3025 -0.1078 0.525 -0.3232 0.667 -0.2154 0.1421 -0.4749 0.2129 -0.7774 0.2129 -0.3022 -0.0001 -0.5701 -0.0936 -0.8037 -0.2812 -0.2337 -0.1879 -0.4056 -0.47 -0.5156 -0.8457l-0.9072 0.3574c0.1283 0.4399 0.3273 0.7951 0.5976 1.0654 0.2704 0.2704 0.621 0.4558 1.0518 0.5567v0.7148h0.9629v-0.6875c0.4582 -0.0825 0.8527 -0.2612 1.1826 -0.5361 0.3297 -0.275 0.4941 -0.683 0.4941 -1.2237 0 -0.3848 -0.1092 -0.7378 -0.3291 -1.0585 -0.22 -0.3209 -0.6603 -0.6006 -1.3203 -0.8389 -0.55 -0.1834 -0.9308 -0.344 -1.1416 -0.4815 -0.2106 -0.1374 -0.3164 -0.3252 -0.3164 -0.5634 0 -0.2383 0.0853 -0.426 0.2549 -0.5635 0.1695 -0.1375 0.4146 -0.206 0.7353 -0.2061 0.2934 0 0.5225 0.0708 0.6875 0.2129s0.2841 0.3185 0.3575 0.5293l0.8798 -0.3574c-0.1008 -0.3208 -0.2862 -0.6005 -0.5566 -0.8389 -0.2704 -0.2383 -0.5705 -0.3709 -0.9004 -0.3984v-0.6875h-0.9629zM15 1c0.5523 0 1 0.44772 1 1v8.1494c-0.7082 0.1438 -1.3796 0.3888 -2 0.7168V6.5H5v9h5.2715c-0.1758 0.6369 -0.2715 1.3072 -0.2715 2 0 1.2643 0.3137 2.455 0.8662 3.5H4c-0.55228 0 -1 -0.4477 -1 -1V2c0 -0.55228 0.44772 -1 1 -1z"
                            strokeWidth="1"
                          ></path>
                        </g>
                      </svg>
                    </div>
                    <div className="text-sm font-medium">M-Pesa</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePaymentMethodChange("cash")}
                    className={`p-4 border rounded-lg text-center transition ${
                      formData.paymentMethod === "cash"
                        ? "border-black bg-gray-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex flex-row justify-center text-2xl mb-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        id="Dollar-Coin--Streamline-Plump-Remix"
                        height="24"
                        width="24"
                      >
                        <desc>
                          Dollar Coin Streamline Icon: https://streamlinehq.com
                        </desc>
                        <g id="dollar-coin--accounting-billing-payment-cash-coin-currency-money-finance">
                          <path
                            id="Union"
                            fill="#000000"
                            fillRule="evenodd"
                            d="M12.00015 2.25C6.6153 2.25 2.25 6.6153 2.25 12.00015c0 5.38485 4.3653 9.75015 9.75015 9.75015 5.38485 0 9.75015 -4.3653 9.75015 -9.75015C21.7503 6.6153 17.385 2.25 12.00015 2.25ZM0.25 12.00015C0.25 5.5107 5.5107 0.25 12.00015 0.25s11.75015 5.2607 11.75015 11.75015 -5.2607 11.75015 -11.75015 11.75015S0.25 18.4896 0.25 12.00015ZM12.0002 4.487155c4.14925 0 7.5129 3.363645 7.5129 7.512895s-3.36365 7.5129 -7.5129 7.5129S4.487305 16.1493 4.487305 12.00005 7.85095 4.487155 12.0002 4.487155ZM13 7.5c0 -0.5523 -0.4477 -1 -1 -1s-1 0.4477 -1 1v0.4172c-0.4004 0.10675 -0.77985 0.2762 -1.10935 0.5003 -0.58955 0.40105 -1.14065 1.0742 -1.14065 1.9748 0 0.4598 0.1158 0.88565 0.3586 1.25375 0.23715 0.3595 0.55515 0.6031 0.8665 0.77255 0.55605 0.3026 1.2464 0.443 1.7583 0.5471l0.06665 0.01355c0.6076 0.124 1.0056 0.2145 1.2688 0.35775 0.11055 0.06015 0.1441 0.1035 0.15305 0.1171l0.00035 0.0005c0.00435 0.0065 0.02775 0.0412 0.02775 0.152 0 0.01775 -0.0114 0.1482 -0.2656 0.3211 -0.24705 0.1681 -0.6114 0.28605 -0.9844 0.28605 -1.1254 0 -1.50155 -0.35365 -1.53415 -0.38705 -0.38565 -0.39535 -1.01875 -0.40325 -1.4141 -0.0176 -0.39535 0.38565 -0.40325 1.01875 -0.0176 1.4141 0.35815 0.3672 0.9843 0.75325 1.96585 0.91365v0.3637c0 0.5523 0.4477 1 1 1s1 -0.4477 1 -1v-0.41885c0.4004 -0.1068 0.77985 -0.2762 1.10935 -0.50035 0.58955 -0.40105 1.14065 -1.07415 1.14065 -1.97475 0 -0.4598 -0.1158 -0.88565 -0.3586 -1.25375 -0.23715 -0.35955 -0.55515 -0.60315 -0.8665 -0.7726 -0.55605 -0.3026 -1.2464 -0.44295 -1.7583 -0.54705l-0.06665 -0.01355c-0.6076 -0.124 -1.0056 -0.2145 -1.2688 -0.35775 -0.11055 -0.06015 -0.1441 -0.10355 -0.15305 -0.1171l-0.00035 -0.0005c-0.00435 -0.0065 -0.02775 -0.0412 -0.02775 -0.152 0 -0.01775 0.0114 -0.1482 0.2656 -0.32115 0.24115 -0.164 0.594 -0.2803 0.9575 -0.2858 0.00895 0.00025 0.0179 0.00035 0.0269 0.00035 0.00975 0 0.01945 -0.00015 0.0291 -0.0004 0.49215 0.00485 0.9066 0.1315 1.20145 0.26045 0.1493 0.0653 0.2634 0.12925 0.3356 0.1734 0.0359 0.022 0.0608 0.03875 0.0739 0.0478l0.00955 0.0067c0.43825 0.3291 1.06075 0.24415 1.39455 -0.19195 0.33565 -0.4386 0.2522 -1.06625 -0.1864 -1.4019l-0.58985 0.77075c0.58985 -0.77075 0.5893 -0.7712 0.5893 -0.7712l-0.0006 -0.00045 -0.00125 -0.00095 -0.0028 -0.0021 -0.0066 -0.00495 -0.01735 -0.01285c-0.01345 -0.00975 -0.0306 -0.022 -0.0513 -0.0363 -0.0414 -0.0286 -0.0973 -0.0657 -0.16685 -0.1083 -0.1388 -0.08495 -0.33405 -0.1932 -0.5785 -0.3001 -0.2785 -0.1218 -0.6267 -0.24435 -1.03195 -0.32695V7.5Z"
                            clipRule="evenodd"
                            strokeWidth="0.5"
                          ></path>
                        </g>
                      </svg>
                    </div>
                    <div className="text-sm font-medium">Cash</div>
                  </button>
                </div>
                {formData.paymentMethod === "mpesa" && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      Enter your biiling information below. You will receive an
                      M-Pesa payment request on your phone. Please enter your
                      M-Pesa PIN to complete the payment.
                    </p>
                  </div>
                )}
              </div>
              {formData.paymentMethod === "mpesa" && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <h2 className="text-lg font-semibold mb-4">
                    Billing Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First Name"
                      required
                      className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last Name"
                      required
                      className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    required
                    className="w-full mt-4 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <OrderSummary
                items={items}
                subtotal={subtotal}
                shipping={shippingCost}
                total={total}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </form>
      ) : (
        <div className="flex flex-col justify-center items-center gap-4">
          <span className="text-base md:text-lg text-black text-center">
            Sign in for better order placement and tracking.
          </span>
          <Link
            href="/signin"
            className="w-[200px] border border-black bg-black text-white text-base text-center font-semibold rounded-lg py-2 px-4 hover:bg-white hover:border-black hover:text-black transition delay-150 duration-300 ease-in-out"
          >
            Sign In
          </Link>
        </div>
      )}
    </>
  );
}
