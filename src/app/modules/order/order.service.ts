import Stripe from "stripe";
import AppError from "../../errorsHelpers/AppError.js";
import prisma from "../../lib/prisma.js";
import httpStatus from "http-status-codes";
import { CreateOrderPayload } from "./order.interface.js";

// Initialize Stripe with your Secret Key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-07-29.dahlia",
});


const createOrder = async (userId: string, payload: CreateOrderPayload) => {
  const { cartItemIds, paymentMethod } = payload;
  // 1. Validate Profile Completeness
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.phone || !user.address || !user.city || !user.thana) {
    throw new AppError(
      httpStatus.StatusCodes.BAD_REQUEST,
      "Please complete your profile (address, phone, city, thana) before proceeding to checkout.",
    );
  }

  // 2. Fetch Selected Cart Items and Verify Ownership
  const cartItems = await prisma.cartItem.findMany({
    where: {
      id: { in: cartItemIds },
      userId: userId,
    },
    include: { product: true },
  });

  if (cartItems.length === 0) {
    throw new AppError(
      httpStatus.StatusCodes.BAD_REQUEST,
      "No valid items found for checkout.",
    );
  }

  // 3. Calculate Totals Securely from DB Prices
  let subtotal = 0;
  const orderItemsData = cartItems.map((item) => {
    const itemPrice = Number(item.product.price);
    subtotal += itemPrice * item.quantity;

    return {
      productId: item.productId,
      quantity: item.quantity,
      price: itemPrice, // Snapshot the price
    };
  });

  const deliveryFee = 60.0;
  const totalAmount = subtotal + deliveryFee;

  // 4. Determine Expiration for Online Payments (2 Hours)
  const isOnline = paymentMethod === "ONLINE";
  const expiresAt = isOnline ? new Date(Date.now() + 1 * 60 * 60 * 1000) : null;

  // 5. Create the Order (Snapshotting Address details)
  let order = await prisma.order.create({
    data: {
      userId,
      customerName: user.name || "Customer",
      email: user.email,
      phone: user.phone,
      address: user.address, // Snapshot from User profile
      city: user.city,
      thana: user.thana,
      paymentMethod: paymentMethod || "COD",
      paymentStatus: "UNPAID",
      status: "PENDING",
      deliveryFee,
      totalAmount,
      expiresAt,
      orderItems: {
        create: orderItemsData,
      },
    },
  });

  // 6. Generate Stripe Checkout Session if ONLINE
  if (isOnline) {
    // Convert DB items to Stripe line items
    const stripeLineItems = cartItems.map((item) => ({
      price_data: {
        currency: "bdt", // Change to "bdt" if using Bangladeshi Taka
        product_data: {
          name: item.product.name,
          images:
            item.product.images.length > 0 ? [item.product.images[0]] : [],
        },
        unit_amount: Math.round(Number(item.product.price) * 100), // Stripe expects amounts in cents
      },
      quantity: item.quantity,
    }));

    // Add Delivery Fee as a separate line item in Stripe
    stripeLineItems.push({
      price_data: {
        currency: "bdt",
        product_data: { name: "Delivery Charge", images: [] },
        unit_amount: deliveryFee * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      // success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      success_url: `${process.env.FRONTEND_URL}/payment-success`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
      customer_email: user.email,
      client_reference_id: order.id,
      expires_at: Math.floor(Date.now() / 1000) + 1 * 60 * 60, // 2 hours in Unix Epoch
      line_items: stripeLineItems,
      metadata: {
        orderId: order.id,
        userId: userId,
      },
    });

    // Update order with the generated Session ID
    order = await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return { order, paymentUrl: session.url };
  }

  // 7. If COD, just return the order without a payment link
  return { order, paymentUrl: null };

};

const getAllOrders = async () => {
  return await prisma.order.findMany({
    include: {
      orderItems: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const OrderServices = {
  createOrder,
  getAllOrders,
};
