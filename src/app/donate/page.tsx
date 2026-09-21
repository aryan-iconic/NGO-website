"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatPaise } from "@/lib/types";
import { useCart } from "@/lib/cart-context";

const presets = [10100, 50100, 100100, 250100];

export default function DonatePage() {
  const [amount, setAmount] = useState(presets[1]);
  const [custom, setCustom] = useState("");
  const { addItem } = useCart();
  const router = useRouter();

  const selected = custom ? Math.round(parseFloat(custom || "0") * 100) : amount;

  const handleContinue = () => {
    if (!selected || selected <= 0) return;
    addItem({
      name: "General Donation",
      unitPricePaise: selected,
      quantity: 1,
    });
    router.push("/donate/checkout");
  };

  return (
    <div className="container-app py-16 max-w-lg">
      <h1 className="text-3xl">General Donation</h1>
      <p className="text-muted mt-2 leading-relaxed">
        Your contribution can support initiatives aligned with the Trust&apos;s objectives across education, healthcare, humanitarian assistance, community welfare, environmental conservation, cultural activities and other areas of seva.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => {
              setAmount(p);
              setCustom("");
            }}
            className={`py-3 rounded-lg border text-sm font-medium ${
              !custom && amount === p
                ? "bg-primary text-white border-primary"
                : "border-border text-text hover:border-primary/50"
            }`}
          >
            {formatPaise(p)}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <label className="text-sm text-muted" htmlFor="custom-amount">
          Or enter a custom amount (₹)
        </label>
        <input
          id="custom-amount"
          type="number"
          min={101}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="e.g. 750"
          className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
        />
      </div>

      <div className="mt-8 p-4 rounded-lg bg-cream flex items-center justify-between">
        <span className="text-sm text-muted">Your contribution</span>
        <span className="font-semibold text-maroon text-lg">{formatPaise(selected || 0)}</span>
      </div>

      <Button size="lg" className="w-full mt-6" disabled={!selected} onClick={handleContinue}>
        Continue to Donor Details
      </Button>
    </div>
  );
}
