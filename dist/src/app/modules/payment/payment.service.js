import prisma from "../../lib/prisma.js";
const handleCheckoutSessionCompleted = async (session) => {
    const orderId = session.metadata?.orderId;
    const userId = session.metadata?.userId;
    // This is the official transaction ID you want to save!
    const transactionId = session.payment_intent;
    if (!orderId)
        return;
    // 1. Update the order to PAID and CONFIRMED
    await prisma.order.update({
        where: { id: orderId },
        data: {
            paymentStatus: "PAID",
            status: "CONFIRMED",
            transactionId: transactionId,
        },
    });
    // 2. Clear out the User's Cart since they bought the items
    if (userId) {
        await prisma.cartItem.deleteMany({
            where: { userId: userId },
        });
    }
};
const handleCheckoutSessionExpired = async (session) => {
    const orderId = session.metadata?.orderId;
    if (!orderId)
        return;
    // Mark order as FAILED/CANCELLED to release any reserved logic
    await prisma.order.update({
        where: { id: orderId },
        data: {
            paymentStatus: "FAILED",
            status: "CANCELLED",
        },
    });
};
export const PaymentServices = {
    handleCheckoutSessionCompleted,
    handleCheckoutSessionExpired,
};
