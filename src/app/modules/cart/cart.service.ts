import prisma from "../../lib/prisma.js";

// Order summary calculate

const getOrderSummary = async (userId:string ) => {
 const cartItems = await prisma.cartItem.findMany({
  where: {userId},
  include: {
    product: {
      select:{price:true} // WE NEED PRICE FOR CALCULATE SUBTOTAL AND TOTAL PRICE
    }
  }
 })

   // 2. Handle empty cart scenario safely
  if(cartItems.length ===0) {
    return {
      subtotal:0,
      shippingFee:0,
      total: 0
    }
  }
// 3. Calculate Subtotal using absolute source-of-truth database prices
  const subtotal = cartItems.reduce((acc,items)=>{
    // Prisma Decimals need to be converted to Numbers for JS math
       const itemPrice = Number(items.product.price);
       return  acc  + (itemPrice *  items.quantity);
  },0)



// 4. Determine Shipping Fee (Using your Order model's default of 60.00)
const deliveryCharge = 60.00
// 5. Calculate final total: $$Total = Subtotal + Shipping Fee$$
const total = subtotal + deliveryCharge
return {
  subtotal,
  deliveryCharge,
  total
}

};

// Add or update a single item (removes it if quantity is 0)
const updateCartItem = async (
  userId: string,
  productId: string,
  quantity: number,
) => {
  // If quantity is 0 or less, automatically drop it from the database
  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({
      where: { userId, productId },
    });
    return null;
  }

  // Upsert seamlessly creates the row if it doesn't exist, or updates the quantity if it does
  return await prisma.cartItem.upsert({
    where: {
      userId_productId: { userId, productId },
    },
    update: { quantity },
    create: { userId, productId, quantity },
  });
};

// Merge guest cart array from LocalStorage upon login
const syncCart = async (
  userId: string,
  items: { productId: string; quantity: number }[],
) => {
  // We use a Prisma transaction to execute all upserts/deletes concurrently and safely
  const operations = items.map((item) => {
    if (item.quantity <= 0) {
      return prisma.cartItem.deleteMany({
        where: { userId, productId: item.productId },
      });
    } else {
      return prisma.cartItem.upsert({
        where: { userId_productId: { userId, productId: item.productId } },
        update: { quantity: item.quantity }, // Alternatively, { increment: item.quantity } if you want to add to existing DB totals
        create: { userId, productId: item.productId, quantity: item.quantity },
      });
    }
  });

  await prisma.$transaction(operations);

  // Return the newly merged complete cart
  return await getCart(userId);
};

// Retrieve the active user's cart populated with product details
const getCart = async (userId: string) => {
  return await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: {
        select: { id: true, name: true, price: true, images: true },
      },
    },
  });
};

export const CartServices = {
  updateCartItem,
  syncCart,
  getCart,
  getOrderSummary
};
