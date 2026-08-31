/**
 * Safely processes a new customer order, calculating prices directly from the DB.
 */
import { OrderStatus, PaymentStatus } from "@prisma/client";
import httpStatus from "http-status-codes";
import Stripe from "stripe";
import { envVars } from "../../config/env.js";
import AppError from "../../errorsHelpers/AppError.js";
import prisma from "../../lib/prisma.js";
import { QueryBuilder } from "../../utils/QueryBuilder.js";
import { orderSearchableFields } from "./order.constant.js";
// Initialize Stripe with your Secret Key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2026-07-29.dahlia",
});
const createOrder = async (userId, payload) => {
    const { cartItemIds, paymentMethod } = payload;
    console.log(payload, "From service");
    // 1. Validate Profile Completeness
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.phone || !user.address || !user.city || !user.thana) {
        throw new AppError(httpStatus.StatusCodes.BAD_REQUEST, "Please complete your profile (address, phone, city, thana) before proceeding to checkout.");
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
        throw new AppError(httpStatus.StatusCodes.BAD_REQUEST, "No valid items found for checkout.");
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
    const deliveryFee = Number(envVars.DELIVERY_FEE);
    const totalAmount = subtotal + deliveryFee;
    // 4. Determine Expiration for Online Payments (2 Hours)
    const isOnline = paymentMethod === "ONLINE";
    const expiresAt = isOnline ? new Date(Date.now() + 1 * 60 * 60 * 1000) : null;
    // 5. Create the Order (Snapshotting Address details)
    let order = await prisma.$transaction(async (tx) => {
        // A. Create the order
        const newOrder = await tx.order.create({
            data: {
                userId,
                customerName: user.name || "Customer",
                email: user.email,
                phone: user.phone,
                address: user.address,
                city: user.city,
                thana: user.thana,
                paymentMethod: paymentMethod || "COD",
                paymentStatus: PaymentStatus.UNPAID,
                status: OrderStatus.PENDING,
                deliveryFee,
                totalAmount,
                expiresAt,
                orderItems: {
                    create: orderItemsData,
                },
            },
        });
        // B. Delete the specific cart items that were just purchased
        await tx.cartItem.deleteMany({
            where: {
                id: { in: cartItemIds },
                userId: userId, // Ensure we only delete this specific user's items
            },
        });
        return newOrder;
    });
    // 6. Generate Stripe Checkout Session if ONLINE
    if (isOnline) {
        // Convert DB items to Stripe line items
        const stripeLineItems = cartItems.map((item) => ({
            price_data: {
                currency: "bdt", // Change to "bdt" if using Bangladeshi Taka
                product_data: {
                    name: item.product.name,
                    images: item.product.images.length > 0 ? [item.product.images[0]] : [],
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
            success_url: `${process.env.FRONTEND_URL}/payment-success?orderId=${order.id}`,
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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getAllOrders = async (query) => {
    const queryBuilder = new QueryBuilder(prisma.order, {
        ...query,
    });
    const ordersQuery = queryBuilder
        .search(orderSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate();
    // Concurrently fetch catalog payload data and total counter metadata
    const [data, meta] = await Promise.all([
        // Pass the relations to your builder so the dashboard receives the full order details
        ordersQuery.build({
            include: {
                user: true,
                orderItems: {
                    include: { product: true },
                },
            },
        }),
        queryBuilder.getMeta(),
    ]);
    return {
        data,
        meta,
    };
};
// Get My Orders
const getMyOrders = async (userId) => {
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
        meta: {
            total,
        },
    };
};
const getOrderById = async (orderId, user) => {
    const order = await prisma.order.findUnique({
        where: {
            id: orderId,
        },
        include: {
            orderItems: {
                include: {
                    product: true, // Necessary to display product details on the success receipt
                },
            },
        },
    });
    if (!order) {
        throw new AppError(httpStatus.StatusCodes.NOT_FOUND, "Order not found.");
    }
    // Security Authorization: If the user is a CUSTOMER, they can only view their own orders.
    if (user.role === "CUSTOMER" && order.userId !== user.userId) {
        throw new AppError(httpStatus.StatusCodes.FORBIDDEN, "You do not have permission to view this order.");
    }
    return order;
};
export const OrderServices = {
    createOrder,
    getAllOrders,
    getMyOrders,
    getOrderById,
};
