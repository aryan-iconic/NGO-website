"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { formatPaise } from "@/lib/types";

interface DonationRecord {
  id: string;
  donationNumber: string;
  donorName: string;
  donorEmail: string;
  donorPhone?: string | null;
  campaignId?: string | null;
  campaign?: { title: string } | null;
  totalPaise: number;
  status: string;
  isAnonymous: boolean;
  createdAt: string;
  receipt?: { receiptNumber: string } | null;
  items: { productNameSnapshot: string }[];
}

type OtherStatusFilter = "ALL" | "PENDING" | "FAILED" | "CANCELLED" | "EXPIRED" | "REFUNDED" | "PARTIALLY_REFUNDED";

const statusFilters: { value: OtherStatusFilter; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "FAILED", label: "Failed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "EXPIRED", label: "Expired" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "PARTIALLY_REFUNDED", label: "Partially refunded" },
];

const pendingStatuses = new Set(["CREATED", "PENDING_PAYMENT"]);

function matchesStatus(status: string, filter: OtherStatusFilter) {
  if (filter === "ALL") return status !== "SUCCESS";
  if (filter === "PENDING") return pendingStatuses.has(status);
  return status === filter;
}

function matchesSearch(donation: DonationRecord, query: string) {
  if (!query) return true;
  const normalized = query.trim().toLocaleLowerCase();
  const amountValues = [
    formatPaise(donation.totalPaise),
    String(donation.totalPaise),
    String(donation.totalPaise / 100),
  ];
  const searchable = [
    donation.id,
    donation.donationNumber,
    donation.receipt?.receiptNumber,
    donation.donorName,
    donation.isAnonymous ? "anonymous" : undefined,
    donation.donorEmail,
    donation.donorPhone,
    donation.campaign?.title,
    ...donation.items.map((item) => item.productNameSnapshot),
    donation.status,
    new Date(donation.createdAt).toLocaleDateString("en-IN"),
    ...amountValues,
  ].filter(Boolean).join(" ").toLocaleLowerCase();

  return searchable.includes(normalized);
}

function statusStyle(status: string) {
  if (status === "SUCCESS") return "bg-success/10 text-success";
  if (status === "FAILED") return "bg-red/10 text-red";
  if (pendingStatuses.has(status)) return "bg-primary/10 text-primary";
  return "bg-cream text-muted";
}

function DonationTable({ donations, emptyMessage }: { donations: DonationRecord[]; emptyMessage: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] text-sm">
        <thead className="bg-cream">
          <tr className="text-left">
            <th className="p-3 font-semibold">Donation / Receipt #</th>
            <th className="p-3 font-semibold">Donor</th>
            <th className="p-3 font-semibold">Campaign / Item</th>
            <th className="p-3 font-semibold">Amount</th>
            <th className="p-3 font-semibold">Status</th>
            <th className="p-3 font-semibold">Date</th>
          </tr>
        </thead>
        <tbody>
          {donations.map((donation) => (
            <tr key={donation.id} className="border-t border-border align-top">
              <td className="p-3">
                <p className="font-mono text-xs">{donation.donationNumber}</p>
                {donation.receipt?.receiptNumber && (
                  <p className="mt-1 font-mono text-xs text-muted">{donation.receipt.receiptNumber}</p>
                )}
              </td>
              <td className="p-3">
                <p className="font-medium text-text">
                  {donation.isAnonymous ? <span className="italic text-muted">Anonymous</span> : donation.donorName}
                </p>
                <p className="mt-1 text-xs text-muted">{donation.donorEmail}</p>
                {donation.donorPhone && <p className="text-xs text-muted">{donation.donorPhone}</p>}
              </td>
              <td className="p-3 text-muted">
                <p>{donation.campaign?.title ?? "General Fund"}</p>
                {donation.items.map((item, index) => (
                  <p key={`${item.productNameSnapshot}-${index}`} className="mt-1 text-xs">{item.productNameSnapshot}</p>
                ))}
              </td>
              <td className="p-3 whitespace-nowrap font-semibold text-text">{formatPaise(donation.totalPaise)}</td>
              <td className="p-3">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusStyle(donation.status)}`}>
                  {donation.status.replace(/_/g, " ")}
                </span>
              </td>
              <td className="p-3 whitespace-nowrap text-muted">
                {new Date(donation.createdAt).toLocaleDateString("en-IN")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {donations.length === 0 && <p className="p-8 text-center text-muted">{emptyMessage}</p>}
    </div>
  );
}

export function DonationsManager({ donations }: { donations: DonationRecord[] }) {
  const [search, setSearch] = useState("");
  const [otherStatus, setOtherStatus] = useState<OtherStatusFilter>("ALL");

  const completedDonations = useMemo(
    () => donations.filter((donation) => donation.status === "SUCCESS" && matchesSearch(donation, search)),
    [donations, search],
  );
  const otherDonations = useMemo(
    () => donations.filter((donation) => matchesStatus(donation.status, otherStatus) && matchesSearch(donation, search)),
    [donations, otherStatus, search],
  );

  return (
    <div>
      <h1 className="text-2xl font-serif text-maroon">Donations</h1>
      <p className="mt-1 text-sm text-muted">
        {donations.length} records · {donations.filter((donation) => donation.status === "SUCCESS").length} completed
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label className="relative block flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search donor, email, phone, amount, campaign, donation or receipt #"
            aria-label="Search donations"
            className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-3 text-sm"
          />
        </label>
        <select
          value={otherStatus}
          onChange={(event) => setOtherStatus(event.target.value as OtherStatusFilter)}
          aria-label="Filter pending and other donation statuses"
          className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm"
        >
          {statusFilters.map((filter) => <option key={filter.value} value={filter.value}>{filter.label}</option>)}
        </select>
      </div>

      <section className="mt-8 overflow-hidden rounded-lg border border-border bg-surface">
        <div className="border-b border-border p-4">
          <h2 className="text-lg font-semibold text-maroon">Completed Donations</h2>
          <p className="mt-1 text-sm text-muted">Only successful payments are included here.</p>
        </div>
        <DonationTable donations={completedDonations} emptyMessage="No completed donations match your search." />
      </section>

      <section className="mt-8 overflow-hidden rounded-lg border border-border bg-surface">
        <div className="border-b border-border p-4">
          <h2 className="text-lg font-semibold text-maroon">Pending / Failed Donations</h2>
          <p className="mt-1 text-sm text-muted">Pending, failed, cancelled, expired, and refunded records. These are excluded from completed totals.</p>
        </div>
        <DonationTable donations={otherDonations} emptyMessage="No donations match this status and search." />
      </section>
    </div>
  );
}
