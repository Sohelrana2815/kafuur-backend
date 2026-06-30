import { Router } from "express";
import auth from "../../middlewares/auth.js"; // Matches your precise auth cookie interception middleware
import { Role } from "@prisma/client";
import { UserControllers } from "./user.controller.js";

const router = Router();

router.get(
  "/",
  auth(Role.ADMIN),

  UserControllers.getAllUsers,
);

export const UserRoutes = router;
