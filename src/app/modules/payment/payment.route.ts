import { Router } from "express";
import express from "express";
import { PaymentControllers } from "./payment.controller.js";

const router = Router();

// ⚠️ CRITICAL: Use express.raw() here so Stripe can verify the signature
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  PaymentControllers.stripeWebhook
);

export const PaymentRoutes = router;