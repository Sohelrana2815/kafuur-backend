import { verifyWebhook } from "@clerk/express/webhooks";
import express, { Router, Request, Response } from "express";
import prisma from "../../lib/prisma.js";

const router = Router();

router.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  async (req: Request, res: Response) => {
    // 💡 Explicit return type annotation removed above to resolve the "void union" linter error
    try {
      // Use Clerk's official helper to cryptographically sign off on the svix signatures
      const evt = await verifyWebhook(req);
      const eventType = evt.type;

      // 🚀 Type Narrowing: Checking the event type allows TypeScript to know exactly what evt.data contains
      if (eventType === "user.created") {
        const { id, email_addresses, username } = evt.data;
        const primaryEmail = email_addresses[0]?.email_address;

        console.log(`[Webhook] Event verified: ${eventType} | Clerk ID: ${id}`);

        if (!primaryEmail) {
          return res.status(400).json({
            success: false,
            message: "Missing primary email address from webhook payload.",
          });
        }

        // Sync user data down to your local PostgreSQL database
        // Prisma internally enforces 'Prisma.UserCreateInput' here automatically
        await prisma.user.create({
          data: {
            id: id,
            email: primaryEmail,
            username: username || null,
            role: "CUSTOMER", // Safely assigns the customer role enum
          },
        });

        console.log(`[Webhook] Sync complete. Saved customer: ${primaryEmail}`);
      }

      return res.status(200).json({
        success: true,
        message: "Webhook processed and local user initialized successfully.",
      });
    } catch (err: unknown) {
      // 🚀 Type-safe error tracking without using 'any'
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Unknown error occurring during webhook parsing";
      console.error("❌ [Webhook Error] Handshake failed:", errorMessage);

      return res.status(400).send("Webhook signature verification failed.");
    }
  },
);

export const ClerkWebhookRoutes = router;
