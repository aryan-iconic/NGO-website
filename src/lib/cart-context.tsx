"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface CartItem {
  campaignId?: string;
  campaignSlug?: string;
  campaignTitle?: string;
  productId?: string;
  name: string;
  unitPricePaise: number;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (index: number) => void;
  clear: () => void;
  totalPaise: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "snt_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      // Only one campaign per checkout (matches spec 8.1 "cart may contain
      // items from one campaign"). Adding a different campaign's item, or a
      // general donation, starts a fresh cart.
      if (prev.length > 0 && prev[0].campaignId !== item.campaignId) {
        return [item];
      }
      const existingIndex = prev.findIndex((i) => i.productId && i.productId === item.productId);
      if (existingIndex >= 0) {
        const next = [...prev];
        next[existingIndex] = { ...next[existingIndex], quantity: next[existingIndex].quantity + item.quantity };
        return next;
      }
      return [...prev, item];
    });
  };

  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));
  const clear = () => setItems([]);
  const totalPaise = items.reduce((sum, i) => sum + i.unitPricePaise * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clear, totalPaise }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
