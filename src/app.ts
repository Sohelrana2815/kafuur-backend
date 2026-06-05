import express, { Application, Request, Response } from "express";
// import { router } from "./app/routes/index.js";

import cors from "cors";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler.js";
import notFound from "./app/middlewares/notFound.js";
const app: Application = express();
app.use(cors());
app.use(express.json());
// app.use("/api/v1", router);
// app.use(
//   expressSession({
//     secret: process.env.EXPRESS_SESSION_SECRET as string,
//     resave: false,
//     saveUninitialized: false,
//   }),
// );
// app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
    res.send({
        message: "Kafuur Backend Running!!!",
    });
});


app.get("/health", (req: Request, res: Response) => {
    res.json("I can do this all day💪 My Blog website");
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