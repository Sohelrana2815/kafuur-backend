import { Request, Response } from "express";
import Stripe from "stripe";
import { envVars } from "../../config/env.js";
import { PaymentServices } from "./payment.service.js";

// Initialize with the exact version you used in your createOrder code
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-07-29.dahlia",
});

const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  
  // ⚠️ Make sure this uses STRIPE_WEBHOOK_SECRET, not STRIPE_SECRET_KEY!
  const webhookSecret = envVars.STRIPE_WEBHOOK_SECRET as string;

  let event: Stripe.Event;

  try {
    // req.body MUST be a Buffer here, not a parsed JSON object
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the specific events we checked in the dashboard
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": { // <--- Added {
        const completedSession = event.data.object as Stripe.Checkout.Session;
        await PaymentServices.handleCheckoutSessionCompleted(completedSession);
        break;
      } // <--- Added }

      case "checkout.session.expired": { // <--- Added {
        const expiredSession = event.data.object as Stripe.Checkout.Session;
        await PaymentServices.handleCheckoutSessionExpired(expiredSession);
        break;
      } // <--- Added }

      default:
        // console.log(`Unhandled event type: ${event.type}`);
    }

    // Acknowledge receipt to Stripe so they don't retry sending it
    res.status(200).json({ received: true });
  } catch (error) {
    console.error("❌ Error processing webhook event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const PaymentControllers = {
  stripeWebhook,
};