export interface CreateOrderPayload {
  cartItemIds: string[];
  paymentMethod: "COD" | "ONLINE";
}
