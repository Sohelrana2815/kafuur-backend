import { Router } from "express";
import { AdminAuthRoutes } from "../modules/adminAuth/adminAuth.route.js";
import { ProductRoutes } from "../modules/product/product.route.js";
import { ArticleRoutes } from "../modules/article/article.route.js";
import { UserRoutes } from "../modules/user/user.route.js";
import { AuthRoutes } from "../modules/auth/auth.route.js";
import { CartRoutes } from "../modules/cart/cart.route.js";
import { OrderRoutes } from "../modules/order/order.route.js";

export const router = Router();

const moduleRoutes = [
  { path: "/users", route: UserRoutes },
  { path: "/auth", route: AuthRoutes },
  { path: "/admin-auth", route: AdminAuthRoutes },
  { path: "/products", route: ProductRoutes },
  { path: "/cart", route: CartRoutes },
  { path: "/orders", route: OrderRoutes },
  { path: "/articles", route: ArticleRoutes },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
