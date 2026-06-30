import express from "express";
// import { router } from "./app/routes/index.js";
import cors from "cors";
import notFound from "./app/middlewares/notFound.js";
import cookieParser from "cookie-parser";
import { router } from "./app/routes/index.js";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler.js";
const app = express();
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use(express.json());
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
