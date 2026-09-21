"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPaise } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface CampaignSummary {
  id: string;
  title: string;
  slug: string;
  minimumAmountPaise: number;
  allowCustomAmount: boolean;
}

function CheckoutContent() {
  const { items, addItem, removeItem, clear, totalPaise } = useCart();
  const params = useSearchParams();
  const router = useRouter();

  const campaignSlug = params.get("campaign");
  const wantsCustom = params.get("custom") === "1";

  const [campaign, setCampaign] = useState<CampaignSummary | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", anonymous: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (campaignSlug) {
      fetch(`/api/campaigns/${campaignSlug}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success) setCampaign(d.campaign);
        });
    }
  }, [campaignSlug]);

  const addCustomAmount = () => {
    const paise = Math.round(parseFloat(customAmount || "0") * 100);
    if (!paise || paise <= 0) return;
    addItem({
      campaignId: campaign?.id,
      campaignSlug: campaign?.slug,
      campaignTitle: campaign?.title,
      name: campaign ? `Contribution to ${campaign.title}` : "General Donation",
      unitPricePaise: paise,
      quantity: 1,
    });
    setCustomAmount("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const productItems = items.filter((i) => i.productId);
    const customItems = items.filter((i) => !i.productId);
    const customAmountPaise = customItems.reduce((s, i) => s + i.unitPricePaise * i.quantity, 0) || undefined;

    const res = await fetch("/api/donations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        campaignId: items[0]?.campaignId,
        items: productItems.map((i) => ({
          productId: i.productId,
          productName: i.name,
          unitPricePaise: i.unitPricePaise,
          quantity: i.quantity,
        })),
        customAmountPaise,
        donorName: form.name,
        donorEmail: form.email,
        donorPhone: form.phone || undefined,
        isAnonymous: form.anonymous,
      }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!data.success) {
      setError(data.error?.message ?? "Something went wrong. Please try again.");
      return;
    }

    clear();
    router.push(`/thank-you?receipt=${data.receipt.receiptNumber}&amount=${data.donation.totalPaise}`);
  };

  if (items.length === 0 && !(wantsCustom && campaignSlug)) {
    return (
      <div className="container-app py-20 text-center">
        <h1 className="text-2xl">Your cart is empty</h1>
        <p className="text-muted mt-2">Choose a campaign to support, or make a general donation.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/campaigns" className="text-primary hover:text-secondary">
            Explore campaigns
          </Link>
          <Link href="/donate" className="text-primary hover:text-secondary">
            General donation
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-app py-14 grid lg:grid-cols-[1fr_380px] gap-10">
      <div>
        <h1 className="text-3xl">Checkout</h1>

        {wantsCustom && campaign && (
          <div className="mt-6 p-5 rounded-lg border border-border bg-cream">
            <p className="text-sm text-muted">Custom amount for</p>
            <p className="font-semibold text-maroon">{campaign.title}</p>
            <div className="mt-3 flex gap-2">
              <input
                type="number"
                min={campaign.minimumAmountPaise / 100}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder={`Min ${formatPaise(campaign.minimumAmountPaise)}`}
                className="flex-1 rounded-lg border border-border px-4 py-2.5 bg-surface"
              />
              <Button type="button" onClick={addCustomAmount}>
                Add
              </Button>
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-6 space-y-3">
            {items.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border bg-surface">
                <div>
                  <p className="font-medium text-maroon">{item.name}</p>
                  <p className="text-sm text-muted">
                    {item.quantity} × {formatPaise(item.unitPricePaise)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{formatPaise(item.unitPricePaise * item.quantity)}</span>
                  <button
                    aria-label={`Remove ${item.name}`}
                    onClick={() => removeItem(i)}
                    className="text-muted hover:text-red"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-10 space-y-4 max-w-md">
          <h2 className="text-xl">Donor Details</h2>
          <div>
            <label className="text-sm text-muted" htmlFor="name">Full Name</label>
            <input
              id="name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
            />
          </div>
          <div>
            <label className="text-sm text-muted" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
            />
          </div>
          <div>
            <label className="text-sm text-muted" htmlFor="phone">Phone (optional)</label>
            <input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-border px-4 py-2.5 bg-surface"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={form.anonymous}
              onChange={(e) => setForm({ ...form, anonymous: e.target.checked })}
            />
            Donate anonymously
          </label>

          {error && <p className="text-sm text-red">{error}</p>}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={submitting || items.length === 0}
          >
            {submitting ? "Processing…" : `Pay ${formatPaise(totalPaise)}`}
          </Button>
          <p className="text-xs text-muted">
            This demo settles payment immediately via a mock gateway. In production this step
            opens Razorpay checkout, and the donation is only marked successful after
            server-side signature verification (Section 8.5 of the spec).
          </p>
        </form>
      </div>

      <aside className="p-6 rounded-lg border border-border bg-cream h-fit sticky top-24">
        <h3 className="font-semibold text-maroon">Order Summary</h3>
        <div className="mt-4 flex justify-between text-sm text-muted">
          <span>Items</span>
          <span>{items.length}</span>
        </div>
        <div className="mt-2 flex justify-between font-semibold text-maroon text-lg border-t border-border pt-3">
          <span>Total</span>
          <span>{formatPaise(totalPaise)}</span>
        </div>
      </aside>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  );
}
