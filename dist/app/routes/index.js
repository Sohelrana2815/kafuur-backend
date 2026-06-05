import { Router } from "express";
import { AdminAuthRoutes } from "../modules/adminAuth/adminAuth.route.js";
export const router = Router();
const moduleRoutes = [
    { path: "/admin-auth", route: AdminAuthRoutes },
];
moduleRoutes.forEach((route) => {
    router.use(route.path, route.route);
});
