/**
 * Safely processes a new customer order, calculating prices directly from the DB.
 */

import Stripe from "stripe";
import AppError from "../../errorsHelpers/AppError.js";
import prisma from "../../lib/prisma.js";
import httpStatus from "http-status-codes";
import { CreateOrderPayload } from "./order.interface.js";

// Initialize Stripe with your Secret Key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-07-29.dahlia",
});
// const createOrder = async (payload: any) => {
//   const { items, deliveryFee, ...customerDetails } = payload;

//   // 1. Extract all product IDs from the incoming cart
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const productIds = items.map((item: any) => item.productId);

//   // 2. Fetch the REAL products from the database (exclude deleted ones)
//   const products = await prisma.product.findMany({
//     where: {
//       id: { in: productIds },
//       isDeleted: false,
//     },
//   });

//   // 3. Verify all products exist and are active
//   if (products.length !== productIds.length) {
//     throw new AppError(
//       httpStatus.StatusCodes.BAD_REQUEST,
//       "One or more products in your cart are invalid, deleted, or unavailable.",
//     );
//   }

//   // 4. Calculate Subtotal
//   let subtotal = 0;
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   const orderItemsData = items.map((item: any) => {
//     const product = products.find((p) => p.id === item.productId);

//     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//     const itemPrice = Number(product!.price);
//     subtotal += itemPrice * item.quantity;

//     return {
//       productId: item.productId,
//       quantity: item.quantity,
//       price: itemPrice, // Lock in the price at the time of purchase
//     };
//   });

//   // 5. Determine Delivery Fee and Final Total
//   // Defaults to 60 if the frontend doesn't send a specific fee
//   const finalDeliveryFee = deliveryFee !== undefined ? deliveryFee : 60.0;
//   const finalTotalAmount = subtotal + finalDeliveryFee;

//   // 6. Execute Transaction
//   const result = await prisma.$transaction(async (tx) => {
//     const newOrder = await tx.order.create({
//       data: {
//         ...customerDetails,
//         deliveryFee: finalDeliveryFee,
//         totalAmount: finalTotalAmount,
//         status: "PENDING", // Matches your OrderStatus enum
//         orderItems: {
//           create: orderItemsData,
//         },
//       },
//       include: {
//         orderItems: {
//           include: {
//             product: { select: { name: true, images: true } },
//           },
//         },
//       },
//     });

//     return newOrder;
//   });

//   return result;
// };

// const getAllOrders = async () => {
//   return await prisma.order.findMany({
//     include: {
//       orderItems: {
//         include: { product: true }, // Fetches the product details for the admin to see
//       },
//     },
//     orderBy: { createdAt: "desc" },
//   });
// };

const createOrder = async (userId: string, payload: CreateOrderPayload) => {
  const { cartItemIds, paymentMethod } = payload;
  console.log(payload, "From service");
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
        currency: "usd", // Change to "bdt" if using Bangladeshi Taka
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
        currency: "usd",
        product_data: { name: "Delivery Charge", images: [] },
        unit_amount: deliveryFee * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      // success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      success_url: `${process.env.FRONTEND_URL_PROD}/payment-success`,
      cancel_url: `${process.env.FRONTEND_URL_PROD}/checkout/cancel`,
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

// Get My Orders

const getMyOrders = async (userId: string) => {
  const [data, total] = await prisma.$transaction([
    prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.order.count({
      where: { userId },
    }),
  ]);

  return {
    data,
    meta : {
      total
    }
  };
};

export const OrderServices = {
  createOrder,
  getAllOrders,
  getMyOrders,
};
