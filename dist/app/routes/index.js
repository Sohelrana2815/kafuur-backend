import { Router } from "express";
import { AdminAuthRoutes } from "../modules/adminAuth/adminAuth.route.js";
import { ProductRoutes } from "../modules/product/product.route.js";
export const router = Router();
const moduleRoutes = [
    { path: "/admin-auth", route: AdminAuthRoutes },
    { path: "/products", route: ProductRoutes },
];
moduleRoutes.forEach((route) => {
    router.use(route.path, route.route);
});
