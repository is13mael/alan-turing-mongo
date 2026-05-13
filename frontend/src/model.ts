export interface OrderItem {
  coffeeType: string;
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  createdAt: string;
}

export interface CoffeeTypeInfo {
  id: string;
  name: string;
  description: string;
  /** % of glass height filled with coffee (from bottom) */
  coffeeLevel: number;
  /** % of glass height filled with milk (sits on top of coffee) */
  milkLevel: number;
}
