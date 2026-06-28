import express from "express";
// import { router } from "./app/routes/index.js";
import cors from "cors";
import notFound from "./app/middlewares/notFound.js";
import cookieParser from "cookie-parser";
import { clerkMiddleware } from "@clerk/express";
import { router } from "./app/routes/index.js";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler.js";
import { envVars } from "./app/config/env.js";
const app = express();
app.use(cors());
app.use(express.json());
app.use(clerkMiddleware({
    publishableKey: envVars.PUBLIC_CLERK_PUBLISHABLE_KEY,
    secretKey: envVars.CLERK_SECRET_KEY,
}));
app.use(cookieParser());
app.use("/api/v1", router);
app.get("/", (req, res) => {
    res.send({
        message: "Kafuur Backend Running!!!",
    });
});
app.get("/kafuur", (req, res) => {
    res.json("Be Positive and We care about you.!");
});
app.use(globalErrorHandler);
app.use(notFound);
export default app;
// app.ts start
//    ↓
// import passport config file
//    ↓
// passport.use() runs
//    ↓
// routes use passport.authenticate()
//    ↓
// everything works ✅
