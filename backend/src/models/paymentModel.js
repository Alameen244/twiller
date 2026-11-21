import mongoose from 'mongoose';
import { PLAN_IDS } from '../constants/plans.js';

const PaymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: String, enum: Object.values(PLAN_IDS), required: true },
    amountInr: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    // Razorpay order id; unique so one order can only activate a plan once.
    orderId: { type: String, required: true, unique: true },
    paymentId: { type: String, default: null },
    signature: { type: String, default: null },
    status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
    // Set after a verified payment.
    invoiceNumber: { type: String, unique: true, sparse: true },
    invoiceEmailSent: { type: Boolean, default: false },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model('Payment', PaymentSchema);
