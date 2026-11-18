"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  description: string | null;
  unitName: string;
  pricePaise: number;
  quantityLimit: number | null;
  quantityReserved: number;
  quantitySponsored: number;
  sortOrder: number;
  isActive: boolean;
}

const emptyForm = { name: "", description: "", unitName: "item", priceRupees: "", quantityLimit: "", sortOrder: "0" };

export function CampaignProductsManager({ campaignId }: { campaignId: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}/products`, { cache: "no-store" });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success || !Array.isArray(data.products)) throw new Error(data?.error?.message || "Could not load campaign products.");
      setProducts(data.products);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load campaign products.");
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadProducts(), 0);
    return () => window.clearTimeout(timer);
  }, [loadProducts]);

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const pricePaise = Math.round(Number(form.priceRupees) * 100);
    const quantityLimit = form.quantityLimit.trim() ? Number(form.quantityLimit) : null;
    const sortOrder = Number(form.sortOrder);
    if (!Number.isSafeInteger(pricePaise) || pricePaise < 100) {
      setError("Product price must be at least ₹1.");
      return;
    }
    if (quantityLimit !== null && (!Number.isSafeInteger(quantityLimit) || quantityLimit < 1)) {
      setError("Quantity limit must be a whole number greater than zero.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(editingId ? `/api/admin/campaigns/${campaignId}/products/${editingId}` : `/api/admin/campaigns/${campaignId}/products`, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, description: form.description || null, unitName: form.unitName, pricePaise, quantityLimit, sortOrder }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) throw new Error(data?.error?.message || "Could not save product.");
      resetForm();
      await loadProducts();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save product.");
    } finally {
      setSaving(false);
    }
  };

  const edit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || "",
      unitName: product.unitName,
      priceRupees: (product.pricePaise / 100).toString(),
      quantityLimit: product.quantityLimit?.toString() || "",
      sortOrder: product.sortOrder.toString(),
    });
    setError(null);
  };

  const deactivate = async (product: Product) => {
    if (!confirm(`Remove “${product.name}” from future donations? Past donation records will remain.`)) return;
    setError(null);
    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}/products/${product.id}`, { method: "DELETE" });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) throw new Error(data?.error?.message || "Could not deactivate product.");
      await loadProducts();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not deactivate product.");
    }
  };

  const reactivate = async (product: Product) => {
    setError(null);
    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.success) throw new Error(data?.error?.message || "Could not reactivate product.");
      await loadProducts();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not reactivate product.");
    }
  };

  return (
    <section className="space-y-4 rounded-lg border border-border bg-surface p-6">
      <div>
        <h2 className="text-xl font-serif">Donation products</h2>
        <p className="mt-1 text-sm text-muted">These are the product options donors can sponsor. Removing one disables future donations and keeps its donation history.</p>
      </div>
      {error && <p role="alert" className="text-sm text-red">{error}</p>}
      <form onSubmit={submit} className="grid gap-3 rounded-lg border border-border bg-background p-4 sm:grid-cols-2">
        <label className="text-sm">Product name<input required minLength={2} maxLength={120} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2" /></label>
        <label className="text-sm">Unit label<input required maxLength={80} value={form.unitName} onChange={(e) => setForm({ ...form, unitName: e.target.value })} placeholder="blanket, meal, kit" className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2" /></label>
        <label className="text-sm">Price per unit (₹)<input required type="number" min="1" step="0.01" value={form.priceRupees} onChange={(e) => setForm({ ...form, priceRupees: e.target.value })} className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2" /></label>
        <label className="text-sm">Quantity limit (optional)<input type="number" min="1" step="1" value={form.quantityLimit} onChange={(e) => setForm({ ...form, quantityLimit: e.target.value })} className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2" /></label>
        <label className="text-sm sm:col-span-2">Description<textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2" /></label>
        <label className="text-sm">Display order<input type="number" min="0" step="1" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className="mt-1 block w-full rounded-lg border border-border bg-surface px-3 py-2" /></label>
        <div className="flex items-end gap-2">
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : editingId ? "Save product" : "Add product"}</Button>
          {editingId && <Button type="button" variant="outline" onClick={resetForm} disabled={saving}>Cancel</Button>}
        </div>
      </form>
      {loading ? <p className="text-sm text-muted">Loading products…</p> : products.length === 0 ? <p className="rounded-lg border border-dashed border-border p-5 text-center text-sm text-muted">No product options yet.</p> : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-cream"><tr><th className="p-3">Product</th><th className="p-3">Price</th><th className="p-3">Quantity</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th></tr></thead>
            <tbody>{products.map((product) => <tr key={product.id} className="border-t border-border">
              <td className="p-3"><span className="font-medium">{product.name}</span>{product.description && <span className="mt-1 block max-w-xs text-xs text-muted">{product.description}</span>}</td>
              <td className="p-3">₹{(product.pricePaise / 100).toLocaleString("en-IN")} / {product.unitName}</td>
              <td className="p-3">{product.quantitySponsored + product.quantityReserved}{product.quantityLimit ? ` / ${product.quantityLimit}` : " sponsored"}</td>
              <td className="p-3">{product.isActive ? "Active" : "Inactive"}</td>
              <td className="p-3 text-right"><div className="flex justify-end gap-3"><button type="button" className="text-primary hover:underline" onClick={() => edit(product)}>Edit</button>{product.isActive ? <button type="button" className="text-red hover:underline" onClick={() => deactivate(product)}>Remove</button> : <button type="button" className="text-primary hover:underline" onClick={() => reactivate(product)}>Reactivate</button>}</div></td>
            </tr>)}</tbody>
          </table>
        </div>
      )}
    </section>
  );
}
