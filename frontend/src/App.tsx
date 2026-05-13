import { useEffect, useState } from "react";
import { fetchOrders, placeOrder } from "./api";
import type { CoffeeTypeInfo, Order, OrderItem } from "./model";

const COFFEE_TYPES: CoffeeTypeInfo[] = [
  {
    id: "solo",
    name: "Solo",
    description: "Black — pure espresso",
    coffeeLevel: 85,
    milkLevel: 0,
  },
  {
    id: "largo",
    name: "Largo",
    description: "Extra strong — long black",
    coffeeLevel: 93,
    milkLevel: 0,
  },
  {
    id: "semilargo",
    name: "Semilargo",
    description: "Strong — between largo and mitad",
    coffeeLevel: 65,
    milkLevel: 0,
  },
  {
    id: "solo-corto",
    name: "Solo corto",
    description: "Espresso — short shot",
    coffeeLevel: 48,
    milkLevel: 0,
  },
  {
    id: "mitad",
    name: "Mitad",
    description: "Half and half — coffee and milk",
    coffeeLevel: 50,
    milkLevel: 50,
  },
  {
    id: "entrecorto",
    name: "Entrecorto",
    description: "Semi-short — coffee + splash milk",
    coffeeLevel: 30,
    milkLevel: 35,
  },
  {
    id: "corto",
    name: "Corto",
    description: "Short — mostly coffee, some milk",
    coffeeLevel: 38,
    milkLevel: 22,
  },
  {
    id: "sombra",
    name: "Sombra",
    description: "Shadow — mostly milk, hint coffee",
    coffeeLevel: 15,
    milkLevel: 65,
  },
  {
    id: "nube",
    name: "Nube",
    description: "Cloud — almost all milk",
    coffeeLevel: 7,
    milkLevel: 78,
  },
  {
    id: "no-me-lo-pongas",
    name: "No me lo pongas",
    description: "Don't bother — just milk",
    coffeeLevel: 0,
    milkLevel: 90,
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CoffeeGlass({
  coffeeLevel,
  milkLevel,
}: {
  coffeeLevel: number;
  milkLevel: number;
}) {
  return (
    <div className="relative w-7 h-10 rounded-b border border-white/30 overflow-hidden bg-slate-800">
      {milkLevel > 0 && (
        <div
          className="absolute left-0 right-0 bg-amber-50/90"
          style={{ bottom: `${coffeeLevel}%`, height: `${milkLevel}%` }}
        />
      )}
      {coffeeLevel > 0 && (
        <div
          className="absolute bottom-0 left-0 right-0 bg-amber-900/90"
          style={{ height: `${coffeeLevel}%` }}
        />
      )}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const total = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const date = new Date(order.createdAt).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-[#C9A84C]/40 transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-slate-500">{date}</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C9A84C]/20 text-[#C9A84C] border border-[#C9A84C]/30 font-medium">
          {total} café{total !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {order.items.map((item) => {
          const type = COFFEE_TYPES.find((t) => t.id === item.coffeeType);
          return (
            <div
              key={item.coffeeType}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10"
            >
              <CoffeeGlass
                coffeeLevel={type?.coffeeLevel ?? 50}
                milkLevel={type?.milkLevel ?? 0}
              />
              <span className="text-xs text-white">
                {type?.name ?? item.coffeeType}
              </span>
              {item.quantity > 1 && (
                <span className="text-[10px] font-bold text-[#0077B6]">
                  ×{item.quantity}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export default function App() {
  // selection: coffeeTypeId → quantity
  const [selection, setSelection] = useState<Record<string, number>>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    fetchOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoadingOrders(false));
  }, []);

  const addToSelection = (id: string) => {
    setSelection((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  };

  const removeFromSelection = (id: string) => {
    setSelection((prev) => {
      const next = { ...prev };
      if ((next[id] ?? 0) <= 1) {
        delete next[id];
      } else {
        next[id] -= 1;
      }
      return next;
    });
  };

  const totalSelected = Object.values(selection).reduce((s, q) => s + q, 0);

  const selectedItems: OrderItem[] = Object.entries(selection).map(
    ([coffeeType, quantity]) => ({
      coffeeType,
      quantity,
    }),
  );

  const handlePlaceOrder = async () => {
    if (selectedItems.length === 0) return;
    setPlacing(true);
    try {
      const order = await placeOrder(selectedItems);
      setOrders((prev) => [order, ...prev]);
      setSelection({});
    } catch (err) {
      console.error(err);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/10 backdrop-blur-md bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">☕</span>
            <div>
              <h1 className="text-base font-bold text-white leading-none">
                Málaga Coffee Dev
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Order your Málaga coffee
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Coffee type selector */}
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Select your coffees
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {COFFEE_TYPES.map((type) => {
              const qty = selection[type.id] ?? 0;
              const selected = qty > 0;
              return (
                <button
                  key={type.id}
                  onClick={() => addToSelection(type.id)}
                  className={[
                    "relative flex flex-col items-center gap-2 p-3 rounded-xl backdrop-blur-md border transition-all text-left w-full",
                    selected
                      ? "bg-[#0077B6]/15 border-[#0077B6]/60 shadow-[0_0_12px_rgba(0,119,182,0.2)]"
                      : "bg-white/5 border-white/10 hover:border-[#0077B6]/40 hover:bg-[#0077B6]/10",
                  ].join(" ")}
                >
                  {selected && (
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#0077B6] text-white text-[10px] font-bold flex items-center justify-center">
                      {qty}
                    </span>
                  )}
                  <CoffeeGlass
                    coffeeLevel={type.coffeeLevel}
                    milkLevel={type.milkLevel}
                  />
                  <span className="text-xs font-semibold text-white text-center">
                    {type.name}
                  </span>
                  <span className="text-[10px] text-slate-400 text-center leading-tight">
                    {type.description}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Order summary */}
        {totalSelected > 0 && (
          <section className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-[#0077B6]/30">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">
                  Your order
                </h2>
                <div className="flex flex-wrap gap-2">
                  {selectedItems.map((item) => {
                    const type = COFFEE_TYPES.find(
                      (t) => t.id === item.coffeeType,
                    );
                    return (
                      <div
                        key={item.coffeeType}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0077B6]/15 border border-[#0077B6]/30"
                      >
                        <span className="text-sm text-white font-medium">
                          {type?.name}
                        </span>
                        <div className="flex items-center gap-1 ml-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromSelection(item.coffeeType);
                            }}
                            className="w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 text-white text-[10px] flex items-center justify-center transition-all"
                          >
                            −
                          </button>
                          <span className="text-xs font-bold text-[#0077B6] w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToSelection(item.coffeeType);
                            }}
                            className="w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 text-white text-[10px] flex items-center justify-center transition-all"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="shrink-0 px-6 py-2.5 rounded-xl font-semibold text-sm bg-[#0077B6] hover:bg-[#006099] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-white"
              >
                {placing
                  ? "Placing..."
                  : `Pedir ${totalSelected} café${totalSelected !== 1 ? "s" : ""} ☕`}
              </button>
            </div>
          </section>
        )}

        {/* Past orders */}
        <section>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
            Past orders{" "}
            {!loadingOrders && (
              <span className="text-[#C9A84C] normal-case tracking-normal">
                ({orders.length})
              </span>
            )}
          </h2>
          {loadingOrders ? (
            <div className="flex items-center justify-center h-32 text-slate-500 text-sm">
              Loading orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 rounded-2xl border border-dashed border-white/10 text-slate-500">
              <span className="text-3xl mb-2">☕</span>
              <p className="text-sm">No orders yet. Place your first one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
