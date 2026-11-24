import crypto from 'crypto';
import User from '../models/userModel.js';
import Tweet from '../models/tweetModel.js';
import Payment from '../models/paymentModel.js';
import Subscription from '../models/subscriptionModel.js';
import { PLANS, PAID_PLAN_IDS } from '../constants/plans.js';
import { TIME_WINDOWS } from '../constants/timeWindows.js';
import { isWithinTimeWindow } from '../utils/timeWindow.js';
import { getISTMinutesOfDay } from '../utils/istDate.js';
import { getSubscriptionSummary } from '../services/subscriptionService.js';
import { getRazorpay } from '../config/razorpay.js';
import { sendInvoiceEmail } from '../services/emailService.js';

const EMAIL_COLLATION = { locale: 'en', strength: 2 };
const getRequestingUser = (req) =>
    User.findOne({ email: req.firebaseUser.email }).collation(EMAIL_COLLATION);

const countUserTweets = (userId) => () => Tweet.countDocuments({ author: userId });

// Seconds left until the payment window closes (null if it is closed right now).
// The frontend uses it so the Razorpay popup closes at the end of the window.
const secondsLeftInPaymentWindow = () => {
    const now = new Date();
    if (!isWithinTimeWindow(TIME_WINDOWS.PAYMENT, now)) return null;
    const minutes = getISTMinutesOfDay(now);
    return Math.max((TIME_WINDOWS.PAYMENT.endHour * 60 - minutes) * 60 - now.getUTCSeconds(), 0);
};

// Razorpay signature = HMAC-SHA256 of "order_id|payment_id" with the key secret.
const isValidSignature = (orderId, paymentId, signature) => {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error('RAZORPAY_KEYS_MISSING');

    const expected = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

    const a = Buffer.from(expected);
    const b = Buffer.from(String(signature));
    return a.length === b.length && crypto.timingSafeEqual(a, b);
};

// Example: INV-20261121-3FA9C2 (date in IST + last 6 characters of the payment's id).
const makeInvoiceNumber = (paymentDocId, date) => {
    const day = date
        .toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) // 2026-11-21
        .replace(/-/g, '');
    return `INV-${day}-${paymentDocId.toString().slice(-6).toUpperCase()}`;
};

// GET /subscriptions/plans (public): plan cards + whether payment is open now.
export const getPlans = async (req, res) => {
    try {
        return res.status(200).json({
            plans: Object.values(PLANS).map((p) => ({
                id: p.id,
                name: p.name,
                priceInr: p.priceInr,
                tweetLimit: p.tweetLimit, // null = unlimited
                periodDays: p.periodDays,
            })),
            paymentWindow: {
                label: TIME_WINDOWS.PAYMENT.label,
                isOpenNow: isWithinTimeWindow(TIME_WINDOWS.PAYMENT),
            },
        });
    } catch (error) {
        return res.status(500).json({ message: 'Could not load plans' });
    }
};

// GET /subscriptions/me: the logged-in user's current plan and usage.
export const getMySubscription = async (req, res) => {
    try {
        const user = await getRequestingUser(req);
        if (!user) return res.status(401).json({ message: 'User not found' });

        const summary = await getSubscriptionSummary(user._id, countUserTweets(user._id));
        return res.status(200).json(summary);
    } catch (error) {
        return res.status(500).json({ message: 'Could not load subscription' });
    }
};

// POST /subscriptions/order  body: { plan: 'bronze' | 'silver' | 'gold' }
// Creates the Razorpay order. This is where the 10:00 to 11:00 AM IST rule is enforced.
export const createOrder = async (req, res) => {
    try {
        const { plan: planId } = req.body;

        if (!PAID_PLAN_IDS.includes(planId)) {
            return res.status(400).json({ message: 'Please choose a valid paid plan', code: 'INVALID_PLAN' });
        }

        const user = await getRequestingUser(req);
        if (!user) return res.status(401).json({ message: 'User not found' });

        // Time restriction: block any payment attempt outside the window.
        if (!isWithinTimeWindow(TIME_WINDOWS.PAYMENT)) {
            return res.status(403).json({
                message: `Payments are only allowed between ${TIME_WINDOWS.PAYMENT.label}. Please try again during that time.`,
                code: 'PAYMENT_WINDOW_CLOSED',
            });
        }

        const plan = PLANS[planId];

        // Razorpay needs the smallest currency unit (paise): the only place we convert.
        const order = await getRazorpay().orders.create({
            amount: plan.priceInr * 100,
            currency: 'INR',
            receipt: `${Date.now()}_${user._id.toString().slice(-8)}`, // max 40 characters
            notes: { userId: user._id.toString(), plan: plan.id },
        });

        await Payment.create({
            user: user._id,
            plan: plan.id,
            amountInr: plan.priceInr,
            orderId: order.id,
            status: 'created',
        });

        return res.status(201).json({
            orderId: order.id,
            amount: order.amount, // paise, exactly what Checkout needs
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            plan: plan.id,
            planName: plan.name,
            priceInr: plan.priceInr,
            secondsLeftInWindow: secondsLeftInPaymentWindow(),
        });
    } catch (error) {
        if (error.message === 'RAZORPAY_KEYS_MISSING') {
            return res.status(500).json({ message: 'Payment service is not configured', code: 'PAYMENT_NOT_CONFIGURED' });
        }
        console.error('createOrder failed:', error?.error?.description || error.message);
        return res.status(502).json({ message: 'Could not start the payment. Please try again.', code: 'ORDER_FAILED' });
    }
};

// POST /subscriptions/verify
// body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
// Deliberately NOT blocked by the time window: someone who started paying at 10:59
// must still get the plan they paid for. The window is enforced when the order is created.
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: 'Missing payment details', code: 'INVALID_PAYMENT_DATA' });
        }

        const user = await getRequestingUser(req);
        if (!user) return res.status(401).json({ message: 'User not found' });

        // The order must be one WE created for THIS user.
        const payment = await Payment.findOne({ orderId: razorpay_order_id, user: user._id });
        if (!payment) {
            return res.status(404).json({ message: 'Order not found', code: 'ORDER_NOT_FOUND' });
        }

        // Use the order id stored on our server, not the one sent by the browser.
        if (!isValidSignature(payment.orderId, razorpay_payment_id, razorpay_signature)) {
            return res.status(400).json({ message: 'Payment verification failed', code: 'INVALID_SIGNATURE' });
        }

        // Already processed (double click, retry): answer with the current state, change nothing.
        if (payment.status === 'paid') {
            const summary = await getSubscriptionSummary(user._id, countUserTweets(user._id));
            return res.status(200).json({
                message: 'Payment already verified',
                alreadyProcessed: true,
                invoiceNumber: payment.invoiceNumber,
                subscription: summary,
            });
        }

        // Atomic claim: only one request can move the payment from "created" to "paid",
        // so a plan can never be activated twice for the same order.
        const paidAt = new Date();
        const claimed = await Payment.findOneAndUpdate(
            { _id: payment._id, status: 'created' },
            {
                $set: {
                    status: 'paid',
                    paymentId: razorpay_payment_id,
                    signature: razorpay_signature,
                    paidAt,
                    invoiceNumber: makeInvoiceNumber(payment._id, paidAt),
                },
            },
            { new: true }
        );

        if (!claimed) {
            // Another request claimed it a moment ago.
            const summary = await getSubscriptionSummary(user._id, countUserTweets(user._id));
            return res.status(200).json({
                message: 'Payment already verified',
                alreadyProcessed: true,
                invoiceNumber: payment.invoiceNumber,
                subscription: summary,
            });
        }

        // Activate the plan: fresh 30-day period and a fresh tweet counter.
        const plan = PLANS[claimed.plan];
        const expiresAt = new Date(paidAt.getTime() + plan.periodDays * 24 * 60 * 60 * 1000);

        try {
            await Subscription.findOneAndUpdate(
                { user: user._id },
                { $set: { plan: plan.id, tweetsUsed: 0, startedAt: paidAt, expiresAt } },
                { upsert: true }
            );
        } catch (activationError) {
            // Activation failed: undo the claim so the user can safely retry verification.
            await Payment.updateOne(
                { _id: claimed._id },
                { $set: { status: 'created' }, $unset: { invoiceNumber: '' } }
            );
            throw activationError;
        }

        let invoiceEmailSent = false;
        try {
            await sendInvoiceEmail({
                to: user.email,
                name: user.displayName || user.username || 'there',
                invoiceNumber: claimed.invoiceNumber,
                planName: plan.name,
                amountInr: claimed.amountInr,
                tweetLimit: plan.tweetLimit,
                paymentId: claimed.paymentId,
                orderId: claimed.orderId,
                paidAt,
                expiresAt,
            });
            await Payment.updateOne({ _id: claimed._id }, { $set: { invoiceEmailSent: true } });
            invoiceEmailSent = true;
        } catch (emailError) {
            console.error('Invoice email failed:', emailError.message);
        }

        const summary = await getSubscriptionSummary(user._id, countUserTweets(user._id));
        return res.status(200).json({
            message: `${plan.name} plan activated`,
            alreadyProcessed: false,
            invoiceNumber: claimed.invoiceNumber,
            invoiceEmailSent,
            subscription: summary,
        });
    } catch (error) {
        if (error.message === 'RAZORPAY_KEYS_MISSING') {
            return res.status(500).json({ message: 'Payment service is not configured', code: 'PAYMENT_NOT_CONFIGURED' });
        }
        console.error('verifyPayment failed:', error.message);
        return res.status(500).json({ message: 'Could not verify the payment', code: 'VERIFY_FAILED' });
    }
};
