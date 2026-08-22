export interface Product {
  id: string;
  name: string;
  tagline: string;
  price: number; // in INR e.g. 2499
  pricePaise: number; // in paise e.g. 249900
  image: string;
  rating: number;
  reviewsCount: number;
  badge?: string;
  badgeColor?: "red" | "mustard" | "maroon" | "green";
  features: string[];
  specs?: { label: string; value: string }[];
}

export interface CreateOrderResponse {
  order_id: string;
  payment_attempt_id: string;
  key_id?: string;
}

export interface PaySimulationResponse {
  status: string;
  message?: string;
  payment_attempt_id?: string;
  failure_mode?: string;
}

export type FailureType = "timeout" | "db_unavailable";

export type CheckoutStatus =
  | "idle"
  | "creating_order"
  | "waiting_for_payment"
  | "simulating_failure"
  | "success"
  | "failed"
  | "dismissed";

export interface CheckoutResult {
  status: "success" | "failed" | "dismissed";
  productName: string;
  amount: number;
  orderId: string;
  paymentAttemptId: string;
  razorpayPaymentId?: string;
  timestamp: string;
  isSimulated: boolean;
  simulationType?: FailureType;
  errorMessage?: string;
}
