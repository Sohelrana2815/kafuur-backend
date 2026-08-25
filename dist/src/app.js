import express from "express";
// import { router } from "./app/routes/index.js";
import cors from "cors";
import notFound from "./app/middlewares/notFound.js";
import cookieParser from "cookie-parser";
import expressSession from "express-session";
import { router } from "./app/routes/index.js";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler.js";
import { envVars } from "./app/config/env.js";
import "./app/config/passport.js";
import passport from "passport";
import { PaymentRoutes } from "./app/modules/payment/payment.route.js";
const app = express();
app.use(cors({
    origin: [
        "http://localhost:3000",
        "https://kafuur.vercel.app",
        "https://kafuur.com",
    ],
    credentials: true,
}));
// ✅ 1. STRIPE WEBHOOK (Must come BEFORE express.json)
app.use("/api/payment", PaymentRoutes);
app.use(express.json());
app.use(expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());
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
