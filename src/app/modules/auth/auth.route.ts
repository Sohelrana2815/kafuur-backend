import { NextFunction, Request, Response, Router } from "express";
import { AuthControllers } from "./auth.controller.js";
import passport from "passport";
import { envVars } from "../../config/env.js";
import auth from "../../middlewares/auth.js";
import { Role } from "@prisma/client";

const router = Router();

router.post("/login", AuthControllers.credentialsLogin);
router.post("/refresh-token", AuthControllers.getNewAccessToken);
router.post("/logout", AuthControllers.logout);
router.post("/change-password", auth(...Object.values(Role)), AuthControllers.changePassword);

// 1. Pass the 'redirect' query parameter into Google's 'state' option
router.get("/google", (req: Request, res: Response, next: NextFunction) => {
  const redirect = req.query.redirect || "/";

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: redirect as string,
  })(req, res, next);
});
// 2. Add the passport middleware BEFORE your controller to process the Google login
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: `${envVars.FRONTEND_URL}/login` }),
  AuthControllers.googleCallbackController
);


export const AuthRoutes = router;
