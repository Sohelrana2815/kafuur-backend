import httpStatus from "http-status-codes";
import AppError from "../../errorsHelpers/AppError.js";
import prisma from "../../lib/prisma.js";
// Retrieve the active user's cart populated with product details
const getCart = async (userId, cartItemIds) => {
    // --- THE FIX STARTS HERE ---
    // Replaced 'any' with the strictly typed Prisma WhereInput
    const whereCondition = { userId };
    if (cartItemIds && cartItemIds.length > 0) {
        whereCondition.id = { in: cartItemIds };
    }
    // --- THE FIX ENDS HERE ---
    return await prisma.cartItem.findMany({
        where: whereCondition,
        include: {
            product: {
                select: { id: true, name: true, price: true, images: true },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });
};
// Order summary calculate
const getOrderSummary = async (userId, cartItemIds) => {
    const cartItems = await prisma.cartItem.findMany({
        where: {
            userId,
            id: {
                in: cartItemIds,
            },
        },
        include: {
            product: {
                select: {
                    price: true,
                },
            },
        },
    });
    if (cartItems.length === 0) {
        throw new AppError(httpStatus.StatusCodes.BAD_REQUEST, "At least one cart item ID is required");
    }
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, // product * quantity; example: A -> 2 + B -> 4 = 6 items
    0);
    const subtotal = cartItems.reduce((total, item) => {
        const price = Number(item.product.price);
        return total + price * item.quantity;
    }, 0);
    const shippingFee = 60;
    const total = subtotal + shippingFee;
    return {
        itemCount,
        subtotal,
        shippingFee,
        total,
    };
};
const addToCart = async (userId, productId) => {
    return await prisma.cartItem.upsert({
        where: {
            userId_productId: {
                userId,
                productId,
            },
        },
        update: {
            quantity: {
                increment: 1,
            },
        },
        create: {
            userId,
            productId,
            quantity: 1,
        },
    });
};
const incrementCartItem = async (userId, productId) => {
    return await prisma.cartItem.update({
        where: {
            userId_productId: {
                userId,
                productId,
            },
        },
        data: {
            quantity: {
                increment: 1,
            },
        },
    });
};
const decrementCartItem = async (userId, productId) => {
    const result = await prisma.cartItem.updateMany({
        where: {
            userId,
            productId,
            quantity: {
                gt: 1,
            },
        },
        data: {
            quantity: {
                decrement: 1,
            },
        },
    });
    if (result.count === 0) {
        throw new AppError(httpStatus.StatusCodes.BAD_REQUEST, "Quantity cannot be less than 1");
    }
    return result;
};
// Merge guest cart array from LocalStorage upon login
// const syncCart = async (
//   userId: string,
//   items: { productId: string; quantity: number }[],
// ) => {
//   // We use a Prisma transaction to execute all upserts/deletes concurrently and safely
//   const operations = items.map((item) => {
//     if (item.quantity <= 0) {
//       return prisma.cartItem.deleteMany({
//         where: { userId, productId: item.productId },
//       });
//     } else {
//       return prisma.cartItem.upsert({
//         where: { userId_productId: { userId, productId: item.productId } },
//         update: { quantity: item.quantity }, // Alternatively, { increment: item.quantity } if you want to add to existing DB totals
//         create: { userId, productId: item.productId, quantity: item.quantity },
//       });
//     }
//   });
//   await prisma.$transaction(operations);
//   // Return the newly merged complete cart
//   return await getCart(userId);
// };
// Unified Delete Service (Handles 1 or many items safely)
// const deleteCartItems = async (ids: string[], userId: string) => {
//   const result = await prisma.cartItem.deleteMany({
//     where: {
//       id: { in: ids },
//       userId: userId, // Guarantees users can only delete their own items
//     },
//   });
//   if (result.count === 0) {
//     throw new AppError(
//       httpStatus.StatusCodes.NOT_FOUND,
//       "No matching cart items were found to delete.",
//     );
//   }
//   return result;
// };
const deleteSingleCartItem = async (id, userId) => {
    // Performs an atomic hard delete checking both ID and ownership
    const result = await prisma.cartItem.deleteMany({
        where: {
            id: id,
            userId: userId,
        },
    });
    if (result.count === 0) {
        throw new AppError(httpStatus.StatusCodes.NOT_FOUND, "Cart item not found or you are not authorized to delete it.");
    }
    return result;
};
export const CartServices = {
    getCart,
    getOrderSummary,
    addToCart,
    incrementCartItem,
    decrementCartItem,
    deleteSingleCartItem,
    // updateCartItem,
    // syncCart,
    // deleteCartItems,
};
