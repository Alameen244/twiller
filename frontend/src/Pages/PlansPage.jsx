import { useCallback, useEffect, useState } from "react";
import { Box, Dialog, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getMySubscriptionApi, getPlansApi } from "../Apis/subscriptionApi";
import {
  startPlanCheckout,
  getCheckoutErrorMessage,
} from "../helper/razorpayCheckout";
import { useAuth } from "../Context/AuthContext";
import LoadingSpinner from "../Components/LoadingSpinner";
import { modalDialogStyles } from "../Components/Plans/plansConstants";
import PlansHeader from "../Components/Plans/PlansHeader";
import PaymentWindowNotice from "../Components/Plans/PaymentWindowNotice";
import CurrentPlanSummary from "../Components/Plans/CurrentPlanSummary";
import PlanCard from "../Components/Plans/PlanCard";

export default function PlansPage({ open = true, onClose }) {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [paymentWindow, setPaymentWindow] = useState(null);
  const [mySub, setMySub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payingPlan, setPayingPlan] = useState(null);
  const { user } = useAuth();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const loadAll = useCallback(async () => {
    try {
      const [plansData, subData] = await Promise.all([
        getPlansApi(),
        getMySubscriptionApi(),
      ]);
      setPlans(plansData.plans);
      setPaymentWindow(plansData.paymentWindow);
      setMySub(subData);
    } catch (err) {
      console.error(err);
      toast.error("Could not load plans. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Re-check every minute so the "payments open/closed" state does not go stale.
  useEffect(() => {
    const id = setInterval(() => {
      getPlansApi()
        .then((d) => setPaymentWindow(d.paymentWindow))
        .catch(() => {});
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const handleChoose = async (plan) => {
    if (payingPlan) return;
    setPayingPlan(plan.id);
    try {
      const result = await startPlanCheckout({
        planId: plan.id,
        prefill: { name: user?.displayName, email: user?.email },
        onPaymentFailed: (message) => toast.error(message),
      });

      if (result.status === "paid") {
        toast.success(
          result.data?.invoiceEmailSent
            ? `${plan.name} plan activated. Your invoice was sent to your email.`
            : `${plan.name} plan activated. We could not send the invoice email.`,
        );
        await loadAll();
      } else if (result.status === "cancelled") {
        toast.info("Payment cancelled. You were not charged.");
      } else if (result.status === "verify_failed") {
        toast.error(
          `Your payment (${result.paymentId}) was received but we could not confirm it yet. Please do not pay again. Refresh this page in a minute.`,
          { autoClose: false },
        );
        loadAll();
      }
    } catch (err) {
      toast.error(getCheckoutErrorMessage(err));
      loadAll();
    } finally {
      setPayingPlan(null);
    }
  };

  const isOpenNow = paymentWindow?.isOpenNow;

  return (
    <Dialog
      open={open}
      onClose={payingPlan ? undefined : handleClose}
      disableEnforceFocus
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: modalDialogStyles }}
      BackdropProps={{
        sx: {
          bgcolor: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(8px)",
        },
      }}
    >
      <PlansHeader onClose={handleClose} />

      {loading ? (
        <Box textAlign="center" py={8}>
          <LoadingSpinner />
          <Typography color="text.secondary" mt={2}>
            Loading plans...
          </Typography>
        </Box>
      ) : (
        <>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <PaymentWindowNotice
              isOpenNow={isOpenNow}
              label={paymentWindow?.label}
            />
            <CurrentPlanSummary mySub={mySub} />
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 2,
            }}
          >
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrent={mySub?.plan === plan.id}
                isOpenNow={isOpenNow}
                payingPlan={payingPlan}
                onChoose={handleChoose}
              />
            ))}
          </Box>

          <Typography
            fontSize={12}
            color="#71767b"
            textAlign="center"
            sx={{ mt: 3, lineHeight: 1.6 }}
          >
            Prices shown in INR. Subscriptions are billed per 30-day period
            during active payment windows ({paymentWindow?.label}).
          </Typography>
        </>
      )}
    </Dialog>
  );
}
