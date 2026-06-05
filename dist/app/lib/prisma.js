import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { envVars } from "../config/env.js";
const connectionString = envVars.DATABASE_URL;
const prismaClientSingleton = () => {
    // ১. PostgreSQL পুল তৈরি করা
    const pool = new pg.Pool({ connectionString });
    // ২. প্রিজমা অ্যাডাপ্টার সেটআপ করা
    const adapter = new PrismaPg(pool);
    // ৩. অ্যাডাপ্টারসহ ক্লায়েন্ট রিটার্ন করা
    return new PrismaClient({ adapter });
};
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();
export default prisma;
if (process.env.NODE_ENV !== "production")
    globalForPrisma.prisma = prisma;
