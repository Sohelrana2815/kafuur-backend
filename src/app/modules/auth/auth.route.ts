import { Router } from "express";
import { AuthControllers } from "./auth.controller.js";
import auth from "../../middlewares/auth.js";
import { Role } from "@prisma/client";

const router = Router();

router.post("/login", AuthControllers.credentialsLogin);
router.post("/refresh-token", AuthControllers.getNewAccessToken);
router.post("/logout", AuthControllers.logout);
// router.post("reset-password", auth(...Object.values(Role)), AuthControllers.resetPassword);
export const AuthRoutes = router;
