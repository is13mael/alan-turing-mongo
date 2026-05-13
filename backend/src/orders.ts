import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI || "";

const client = new MongoClient(uri);

const getCollection = async () => {
  await client.connect();
  return client.db().collection("orders");
};

export interface OrderItem {
  coffeeType: string;
  quantity: number;
}

interface DbOrder {
  _id: ObjectId;
  items: OrderItem[];
  createdAt: Date;
}

const mapOrder = (doc: DbOrder) => ({
  id: String(doc._id),
  items: doc.items,
  createdAt: doc.createdAt,
});

export const getOrders = async () => {
  const collection = await getCollection();
  const orders = await collection
    .find<DbOrder>({})
    .sort({ createdAt: -1 })
    .toArray();
  return orders.map(mapOrder);
};

export const createOrder = async (items: OrderItem[]) => {
  const collection = await getCollection();
  const order = { items, createdAt: new Date() };
  const result = await collection.insertOne(order);
  return mapOrder({ _id: result.insertedId, ...order });
};
