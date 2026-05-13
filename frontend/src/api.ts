import type { Order, OrderItem } from "./model";

export const fetchOrders = async (): Promise<Order[]> => {
  const res = await fetch("/api/orders");
  if (!res.ok) {
    throw new Error("Failed to fetch orders");
  }
  return res.json() as Promise<Order[]>;
};

export const placeOrder = async (items: OrderItem[]): Promise<Order> => {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) {
    throw new Error("Failed to place order");
  }
  return res.json() as Promise<Order>;
};
