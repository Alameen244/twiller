import { createOrderApi, verifyPaymentApi } from "../Apis/subscriptionApi";

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
let scriptPromise = null;

// Loads Razorpay's checkout.js once, only when a payment is started.
const loadCheckoutScript = () => {
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CHECKOUT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null; // allow a retry
      script.remove();
      reject(new Error("CHECKOUT_SCRIPT_FAILED"));
    };
    document.body.appendChild(script);
  });
  return scriptPromise;
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// The user has already paid at this point, so a network hiccup or a sleeping
// Render server must not lose the activation. Retry on network/5xx errors only.
// This is safe: the backend verify endpoint is idempotent.
const verifyWithRetry = async (payload) => {
  const maxAttempts = 3;
  for (let attempt = 1; ; attempt++) {
    try {
      return await verifyPaymentApi(payload);
    } catch (err) {
      const status = err.response?.status;
      const retryable = !status || status >= 500;
      if (!retryable || attempt >= maxAttempts) throw err;
      await wait(2000 * attempt);
    }
  }
};

/**
 * Runs the whole payment flow for one plan.
 *
 * Resolves with one of:
 *   { status: "paid", data }                 -> plan activated (data = backend response)
 *   { status: "cancelled" }                  -> user closed the popup
 *   { status: "verify_failed", paymentId }   -> money was taken but confirmation failed
 * Rejects (use getCheckoutErrorMessage) when the order could not be created,
 * e.g. outside 10:00 AM - 11:00 AM IST.
 *
 * onPaymentFailed(message) is called when a payment attempt fails inside the
 * popup; the user can retry there, so the promise stays open.
 */
export const startPlanCheckout = async ({ planId, prefill = {}, onPaymentFailed }) => {
  await loadCheckoutScript();
  const order = await createOrderApi(planId); // the 10-11 AM IST rule is enforced here

  return new Promise((resolve, reject) => {
    let settled = false;
    let paymentInProgress = false;
    const done = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    const options = {
      key: order.keyId,
      amount: order.amount, // paise, from the backend
      currency: order.currency,
      name: "Twiller",
      description: `${order.planName} plan - 30 days`,
      order_id: order.orderId,
      prefill: { name: prefill.name, email: prefill.email },
      theme: { color: "#1d9bf0" },
      handler: async (response) => {
        paymentInProgress = true;
        try {
          const data = await verifyWithRetry({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          done({ status: "paid", data });
        } catch (err) {
          done({
            status: "verify_failed",
            paymentId: response.razorpay_payment_id,
            error: err,
          });
        }
      },
      modal: {
        ondismiss: () => {
          if (!paymentInProgress) done({ status: "cancelled" });
        },
      },
    };

    // Close the popup when the payment window ends (only when the backend sends a time).
    if (typeof order.secondsLeftInWindow === "number" && order.secondsLeftInWindow > 0) {
      options.timeout = order.secondsLeftInWindow;
    }

    try {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => {
        onPaymentFailed?.(resp?.error?.description || "Payment failed. Please try again.");
      });
      rzp.open();
    } catch (err) {
      if (!settled) {
        settled = true;
        reject(err);
      }
    }
  });
};

// Turns a rejected startPlanCheckout error into a message for a toast.
export const getCheckoutErrorMessage = (err) => {
  if (err?.message === "CHECKOUT_SCRIPT_FAILED") {
    return "Could not load the payment window. Check your connection or ad blocker and try again.";
  }
  if (!err?.response) {
    return "Could not reach the server. It may be waking up, so please wait a few seconds and try again.";
  }
  return err.response.data?.message || "Something went wrong. Please try again.";
};
