import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { cors } from "hono/cors";
import fs from "node:fs";
import path from "node:path";
import { type OrderItem, createOrder, getOrders } from "./orders";

export const app = new Hono();

app.use("/api/*", cors());

app.get("/api/orders", async (c) => {
  const orders = await getOrders();
  return c.json(orders);
});

app.post("/api/orders", async (c) => {
  const body = await c.req.json<{ items: OrderItem[] }>();
  const order = await createOrder(body.items);
  return c.json(order, 201);
});

const STATIC_FILES_PATH = process.env.STATIC_FILES_PATH || "";

app.use("/*", serveStatic({ root: STATIC_FILES_PATH }));

app.get("*", (c) => {
  const html = fs.readFileSync(
    path.resolve(STATIC_FILES_PATH, "index.html"),
    "utf-8",
  );
  return c.html(html);
});
