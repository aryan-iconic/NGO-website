"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, Check } from "lucide-react";
import { CampaignProduct, formatPaise } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";

export function ProductCard({
  product,
  campaignId,
  campaignSlug,
  campaignTitle,
}: {
  product: CampaignProduct;
  campaignId: string;
  campaignSlug: string;
  campaignTitle: string;
}) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  if (!product.available) {
    return (
      <div className="p-5 rounded-lg border border-border bg-cream/60">
        <h4 className="font-semibold text-maroon">{product.name}</h4>
        <p className="text-sm text-muted mt-1">{product.description}</p>
        <p className="mt-3 text-sm font-medium text-muted">Currently fully sponsored</p>
      </div>
    );
  }

  const handleAdd = () => {
    addItem({
      campaignId,
      campaignSlug,
      campaignTitle,
      productId: product.id,
      name: product.name,
      unitPricePaise: product.pricePaise,
      quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="p-5 rounded-lg border border-border bg-surface">
      <h4 className="font-semibold text-maroon">{product.name}</h4>
      {product.description && <p className="text-sm text-muted mt-1">{product.description}</p>}
      <p className="mt-3 text-sm font-medium text-primary">
        {formatPaise(product.pricePaise)} / {product.unitName}
      </p>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3 border border-border rounded-full px-1">
          <button
            aria-label={`Decrease quantity of ${product.name}`}
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="w-8 h-8 flex items-center justify-center text-maroon hover:bg-cream rounded-full"
          >
            <Minus size={14} />
          </button>
          <span className="w-5 text-center text-sm">{qty}</span>
          <button
            aria-label={`Increase quantity of ${product.name}`}
            onClick={() => setQty((q) => q + 1)}
            className="w-8 h-8 flex items-center justify-center text-maroon hover:bg-cream rounded-full"
          >
            <Plus size={14} />
          </button>
        </div>
        <Button
          size="sm"
          onClick={handleAdd}
          aria-label={`Sponsor ${qty} ${product.unitName}${qty > 1 ? "s" : ""} of ${product.name}`}
        >
          {added ? (
            <>
              <Check size={14} /> Added
            </>
          ) : (
            "Sponsor"
          )}
        </Button>
      </div>
      {added && (
        <button
          onClick={() => router.push("/donate/checkout")}
          className="mt-3 w-full text-center text-xs text-primary hover:text-secondary"
        >
          Go to checkout →
        </button>
      )}
    </div>
  );
}
