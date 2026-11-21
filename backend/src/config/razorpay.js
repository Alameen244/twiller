import 'dotenv/config';
import Razorpay from 'razorpay';

let instance = null;

// Created on first use, so a missing key gives a clear error when a payment is
// attempted instead of stopping the whole server from starting.
export const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error('RAZORPAY_KEYS_MISSING');
  }
  if (!instance) {
    instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return instance;
};
