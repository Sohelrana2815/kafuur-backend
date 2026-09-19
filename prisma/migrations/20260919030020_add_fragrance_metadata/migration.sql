-- CreateEnum
CREATE TYPE "ScentProfile" AS ENUM ('FRESH', 'SWEET', 'WOODY', 'SPICY');

-- CreateEnum
CREATE TYPE "UsageOccasion" AS ENUM ('DAILY', 'OFFICE', 'PARTY', 'DATE', 'OUTDOOR');

-- CreateEnum
CREATE TYPE "ScentStrength" AS ENUM ('MILD', 'MEDIUM', 'STRONG');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "scentProfiles" "ScentProfile"[],
ADD COLUMN     "strength" "ScentStrength",
ADD COLUMN     "usages" "UsageOccasion"[];
