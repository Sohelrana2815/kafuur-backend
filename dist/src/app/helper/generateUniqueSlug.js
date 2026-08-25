import prisma from "../lib/prisma.js";
export const generateUniqueSlug = async (name, currentProductId) => {
    // Convert to lowercase, replace spaces/special chars with hyphens, and clean up double hyphens
    const baseSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // removes punctuation
        .trim()
        .replace(/\s+/g, "-");
    let slug = baseSlug;
    let counter = 0;
    while (await prisma.product.findFirst({
        where: {
            slug,
            // If updating, ignore our own product record so it doesn't conflict with itself
            ...(currentProductId && { id: { not: currentProductId } }),
        },
    })) {
        slug = `${baseSlug}-${counter++}`;
    }
    return slug;
};
