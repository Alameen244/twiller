import { axiosInstance } from "../helper/helper";
import { endpoints } from "./EndPoints/endpoints";

// Plan cards + whether the payment window is open right now (public).
export const getPlansApi = () =>
  axiosInstance.get(endpoints.subscriptionPlans).then((r) => r.data);

// The logged-in user's current plan and tweet usage.
export const getMySubscriptionApi = () =>
  axiosInstance.get(endpoints.subscriptionMe).then((r) => r.data);

// Creates a Razorpay order. Fails with code PAYMENT_WINDOW_CLOSED outside 10:00-11:00 AM IST.
export const createOrderApi = (plan) =>
  axiosInstance.post(endpoints.subscriptionOrder, { plan }).then((r) => r.data);

// Sends what Razorpay Checkout returned so the backend can verify the signature.
// payload: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
export const verifyPaymentApi = (payload) =>
  axiosInstance.post(endpoints.subscriptionVerify, payload).then((r) => r.data);
