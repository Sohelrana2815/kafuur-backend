export interface CreateOrderPayload {
  cartItemIds: string[];
  paymentMethod: "COD" | "ONLINE";
}

export interface IJwtPayload {
  userId: string;
  role: string;
}
