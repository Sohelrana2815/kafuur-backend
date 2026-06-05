/* eslint-disable no-console */
import "dotenv/config"; // Top-level
import app from "./app.js";
import prisma from "./app/lib/prisma.js";
import { Server } from "http";
import { envVars } from "./app/config/env.js";
import { seedAdmin } from "./app/utils/seedAdmin.js";

let server: Server;

const startServer = async () => {
    try {
        await prisma.$connect();
        console.log("🐘 Database connected successfully with Prisma 7!");

        // 3. Run the admin seeding logic

        await seedAdmin();

        server = app.listen(envVars.PORT, () => {
            console.log("🚀 Server running on port 5000");
        });
    } catch (error) {
        console.error("❌ DB Connection Error:", error);
        process.exit(1);
    }
};



(async () => {
    try {
        await startServer();
    } catch (error) {
        console.error("❌ Startup failed:", error);
        process.exit(1);
    }
})();

process.on("uncaughtException", (err) => {
    console.log("Uncaught Exception error, Shutting down the server...", err);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }

    process.exit(1);
});

process.on("unhandledRejection", (err) => {
    console.log("Unhandled Rejection Detected Server Shutting down...", err);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});

process.on("SIGTERM", () => {
    console.log("SIGTERM signal received. Server shutting down...");
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});

/**
 * uncaught (Synchronous) error
 * unhandled (Asynchronous) error error if we don't handle using try/catch
 * sigterm Not actual error but not force to kill the server
 */