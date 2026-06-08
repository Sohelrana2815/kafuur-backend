/**
 * Safely processes a new customer order, calculating prices directly from the DB.
 */
import AppError from "../../errorsHelpers/AppError.js";
import prisma from "../../lib/prisma.js";
import httpStatus from "http-status-codes";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createOrder = async (payload) => {
    const { items, deliveryFee, ...customerDetails } = payload;
    // 1. Extract all product IDs from the incoming cart
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productIds = items.map((item) => item.productId);
    // 2. Fetch the REAL products from the database (exclude deleted ones)
    const products = await prisma.product.findMany({
        where: {
            id: { in: productIds },
            isDeleted: false,
        },
    });
    // 3. Verify all products exist and are active
    if (products.length !== productIds.length) {
        throw new AppError(httpStatus.StatusCodes.BAD_REQUEST, "One or more products in your cart are invalid, deleted, or unavailable.");
    }
    // 4. Calculate Subtotal
    let subtotal = 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderItemsData = items.map((item) => {
        const product = products.find((p) => p.id === item.productId);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const itemPrice = Number(product.price);
        subtotal += itemPrice * item.quantity;
        return {
            productId: item.productId,
            quantity: item.quantity,
            price: itemPrice, // Lock in the price at the time of purchase
        };
    });
    // 5. Determine Delivery Fee and Final Total
    // Defaults to 60 if the frontend doesn't send a specific fee
    const finalDeliveryFee = deliveryFee !== undefined ? deliveryFee : 60.0;
    const finalTotalAmount = subtotal + finalDeliveryFee;
    // 6. Execute Transaction
    const result = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
            data: {
                ...customerDetails,
                deliveryFee: finalDeliveryFee,
                totalAmount: finalTotalAmount,
                status: "PENDING", // Matches your OrderStatus enum
                orderItems: {
                    create: orderItemsData,
                },
            },
            include: {
                orderItems: {
                    include: {
                        product: { select: { name: true, images: true } },
                    },
                },
            },
        });
        return newOrder;
    });
    return result;
};
const getAllOrders = async () => {
    return await prisma.order.findMany({
        include: {
            orderItems: {
                include: { product: true }, // Fetches the product details for the admin to see
            },
        },
        orderBy: { createdAt: "desc" },
    });
};
export const OrderServices = {
    createOrder,
    getAllOrders,
};
