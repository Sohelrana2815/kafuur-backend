import { OrderStatus, PaymentStatus, Role } from "@prisma/client";
import prisma from "../../lib/prisma.js";
const getAdminDashboard = async () => {
    // Execute all aggregations concurrently for high performance
    const [totalRevenueAgg, totalOrders, totalCustomers, totalProducts, recentOrders, orderStatusDistribution,] = await Promise.all([
        // 1. Total Revenue (Only PAID orders)
        prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: { paymentStatus: PaymentStatus.PAID },
        }),
        // 2. Total Orders Count
        prisma.order.count(),
        // 3. Total Customers Count
        prisma.user.count({ where: { role: Role.CUSTOMER } }),
        // 4. Total Active Products Count
        prisma.product.count({ where: { isDeleted: false } }),
        // 5. Recent 5 Orders for the table
        prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                customerName: true,
                totalAmount: true,
                status: true,
                createdAt: true,
            },
        }),
        // 6. Orders by Status (for Donut Chart)
        prisma.order.groupBy({
            by: ["status"],
            _count: { id: true },
        }),
    ]);
    return {
        summary: {
            totalRevenue: Number(totalRevenueAgg._sum.totalAmount || 0),
            totalOrders,
            totalCustomers,
            totalProducts,
        },
        charts: {
            orderStatusDistribution: orderStatusDistribution.map((item) => ({
                status: item.status,
                count: item._count.id,
            })),
        },
        recentOrders,
    };
};
const getCustomerDashboard = async (userId) => {
    // Execute all aggregations for a specific user concurrently
    const [totalSpentAgg, totalOrders, activeOrders, cartItemsCount, recentOrders,] = await Promise.all([
        // 1. Total Lifetime Spent
        prisma.order.aggregate({
            _sum: { totalAmount: true },
            where: { userId, paymentStatus: PaymentStatus.PAID },
        }),
        // 2. Total Orders Placed
        prisma.order.count({ where: { userId } }),
        // 3. In-Flight/Active Orders (Not Delivered or Cancelled)
        prisma.order.count({
            where: {
                userId,
                status: {
                    in: [
                        OrderStatus.PENDING,
                        OrderStatus.CONFIRMED,
                        OrderStatus.PROCESSING,
                        OrderStatus.SHIPPED,
                    ],
                },
            },
        }),
        // 4. Current Items in Cart
        prisma.cartItem.aggregate({
            _sum: { quantity: true },
            where: { userId },
        }),
        // 5. Recent Purchase History
        prisma.order.findMany({
            where: { userId },
            take: 5,
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                totalAmount: true,
                status: true,
                paymentStatus: true,
                createdAt: true,
            },
        }),
    ]);
    return {
        summary: {
            totalSpent: Number(totalSpentAgg._sum.totalAmount || 0),
            totalOrders,
            activeOrders,
            itemsInCart: Number(cartItemsCount._sum.quantity || 0),
        },
        recentOrders,
    };
};
export const DashboardServices = {
    getAdminDashboard,
    getCustomerDashboard,
};
