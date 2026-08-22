declare global {
  interface Window {
    Razorpay?: any;
  }
}

/**
 * Loads the Razorpay Checkout.js script dynamically if not already present on window.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.getElementById("razorpay-checkout-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-checkout-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay Checkout.js script");
      resolve(false);
    };

    document.body.appendChild(script);
  });
}

export interface RazorpayCheckoutParams {
  keyId: string;
  orderId?: string;
  amountPaise: number;
  productName: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onSuccess: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  onDismiss: () => void;
}

/**
 * Opens Razorpay Checkout modal with official test parameters.
 * Note: Path A does NOT call the backend /pay endpoint.
 * The payment status is updated asynchronously by the Razorpay webhook arriving at the backend.
 */
export async function openRazorpayCheckout(params: RazorpayCheckoutParams): Promise<void> {
  if (!params.keyId) {
    throw new Error(
      "Razorpay Key ID is not configured. Set NEXT_PUBLIC_RAZORPAY_KEY_ID in environment or ensure create-order response includes key_id."
    );
  }

  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    throw new Error("Unable to initialize Razorpay Checkout.js. Please check your network connection.");
  }

  const options: Record<string, any> = {
    key: params.keyId,
    amount: params.amountPaise,
    currency: "INR",
    name: "AURA DROPS",
    description: `Purchase: ${params.productName}`,
    prefill: {
      name: params.customerName || "Alex Rivera",
      email: params.customerEmail || "shopper@aura-demo.com",
      contact: params.customerPhone || "+919876543210",
    },
    notes: {
      source: "aura-demo-storefront",
      product_name: params.productName,
    },
    theme: {
      color: "#F91814",
    },
    handler: function (response: any) {
      params.onSuccess(response);
    },
    modal: {
      ondismiss: function () {
        params.onDismiss();
      },
      confirm_close: true,
      animation: true,
    },
  };

  if (params.orderId) {
    options.order_id = params.orderId;
  }

  const razorpayInstance = new window.Razorpay(options);

  razorpayInstance.on("payment.failed", function (response: any) {
    console.warn("Razorpay client reported payment decline:", response.error);
  });

  razorpayInstance.open();
}
