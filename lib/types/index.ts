export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: "Admin" | "User";
  createdAt?: string;
}
export interface NewProduct {
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  desc: string;
  notes: ProductNotes;
  sex: "Male" | "Female" | "Unisex";
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  desc?: string;
  notes?: ProductNotes;
  sex?: "Male" | "Female" | "Unisex";
  createdAt?: string;
  updatedAt?: string;
}

// New type for notes
export interface ProductNotes {
  top_notes: string[];
  heart_notes: string[];
  base_notes: string[];
}

export interface CartItem {
  id: number;
  quantity: number;
  productId: number;
  product: Product;
  price?: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  user: User;
  total?: number;
}

export interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  productId: number;
  product: Product;
}

export interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  status: "pending" | "processing" | "completed" | "delivered" | "cancelled";
  paymentMethod: string;
  shippingMethod: string;
  contact: string;
  billing?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  shipping?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    streetAddress: string;
    city: string;
    apartment?: string;
    postalCode?: string;
  };
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId: number;
  userId: number;
  amount: number;
  status: "pending" | "completed" | "failed";
  phoneNumber: string;
  mpesaReceipt?: string;
  checkoutRequestID?: string;
  transactionDate?: string;
  createdAt: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: "Admin" | "User";
}

export interface LoginData {
  email: string;
  password: string;
}

export interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  country: string;
  zipCode: string;
  phone: string;
  apartment: string;
  deliveryInstructions: string;
  paymentMethod: "mpesa" | "card" | "cash";
  shippingMethod: "delivery" | "store";
}

export interface PaymentOrder {
  orderId: number;
  phoneNumber: string;
  amount: number;
}

export interface OrderData {
  contact: string;
  paymentMethod: string;
  shippingMethod: string;
  totalAmount: number;
  isPaid: boolean;
  billing?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  shipping?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    streetAddress: string;
    city: string;
    apartment?: string;
    postalCode?: string;
    deliveryInstructions?: string;
  };
}
