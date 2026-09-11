import prisma from "../src/app/lib/prisma.js"; // Match your exact path
import { mockProducts } from "./products.js";

async function main() {
  // Check if products already exist to give you full control
  const existingCount = await prisma.product.count();

  if (existingCount > 0) {
    console.log(`⚠️ Products already exist (${existingCount} found). Skipping seed.`);
    return;
  }

  console.log(`🚀 Starting to seed ${mockProducts.length} products...`);

  const result = await prisma.product.createMany({
    data: mockProducts,
    skipDuplicates: true,
  });

  console.log(
    `✅ Successfully inserted ${result.count} products into the database.`,
  );
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });