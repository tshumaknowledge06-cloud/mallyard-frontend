"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";

import { fetchWithAuth } from "@/lib/api";

interface Merchant {
  id: number;
  business_name: string;
  description: string;
  merchant_type: string;
  location: string;
  contact_phone: string;
  status: string;
  created_at: string;
}

export default function MerchantsAdminPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  async function loadMerchants() {
    setLoading(true);
    setError("");

    try {
      const data = await fetchWithAuth("/merchants/pending");
      setMerchants(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load merchants.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMerchants();
  }, []);

  // ✅ APPROVE
  async function approveMerchant(id: number) {
    try {
      setActionLoadingId(id);

      await fetchWithAuth(`/merchants/${id}/approve`, {
        method: "PUT"
      });

      // remove from UI instantly (better UX)
      setMerchants(prev => prev.filter(m => m.id !== id));

    } catch (err: any) {
      setError(err?.message || "Failed to approve merchant.");
    } finally {
      setActionLoadingId(null);
    }
  }

  // ❌ REJECT
  async function rejectMerchant(id: number) {
    try {
      setActionLoadingId(id);

      await fetchWithAuth(`/merchants/${id}/reject`, {
        method: "PUT"
      });

      // remove from UI instantly
      setMerchants(prev => prev.filter(m => m.id !== id));

    } catch (err: any) {
      setError(err?.message || "Failed to reject merchant.");
    } finally {
      setActionLoadingId(null);
    }
  }

  if (loading) return <LoadingState />;

  if (error)
    return (
      <ErrorState
        message={error}
        action={<Button onClick={loadMerchants}>Retry</Button>}
      />
    );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4 sm:space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
            Merchant Approvals
          </h1>

          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Review and manage pending merchant applications
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={loadMerchants} className="w-full sm:w-auto">
          Refresh
        </Button>
      </div>

      {/* EMPTY */}
      {merchants.length === 0 ? (
        <EmptyState
          title="No pending merchants"
          message="All merchant applications have been processed."
        />
      ) : (
        <Card className="overflow-x-auto p-0">
          {/* TABLE - Horizontal scroll on mobile */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm min-w-[700px] md:min-w-full">
              <thead>
                <tr className="border-b text-left text-gray-500 bg-gray-50/50">
                  <th className="py-3 px-3 sm:px-4 font-semibold">ID</th>
                  <th className="py-3 px-3 sm:px-4 font-semibold">Business</th>
                  <th className="py-3 px-3 sm:px-4 font-semibold">Type</th>
                  <th className="py-3 px-3 sm:px-4 font-semibold">Location</th>
                  <th className="py-3 px-3 sm:px-4 font-semibold">Phone</th>
                  <th className="py-3 px-3 sm:px-4 font-semibold hidden md:table-cell">Submitted</th>
                  <th className="py-3 px-3 sm:px-4 font-semibold text-right">Actions</th>
                 </tr>
              </thead>

              <tbody>
                {merchants.map((m) => (
                  <tr key={m.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-3 sm:px-4 font-medium text-gray-600">
                      #{m.id}
                    </td>

                    <td className="py-3 px-3 sm:px-4">
                      <div className="font-medium text-gray-800 text-xs sm:text-sm">
                        {m.business_name}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-400 line-clamp-2 max-w-[200px] sm:max-w-[250px]">
                        {m.description}
                      </div>
                    </td>

                    <td className="py-3 px-3 sm:px-4">
                      <span className="capitalize text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                        {m.merchant_type}
                      </span>
                    </td>

                    <td className="py-3 px-3 sm:px-4 text-gray-600">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {m.location}
                      </span>
                    </td>

                    <td className="py-3 px-3 sm:px-4 text-gray-600">
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {m.contact_phone}
                      </span>
                    </td>

                    <td className="py-3 px-3 sm:px-4 hidden md:table-cell text-gray-500 text-[10px] sm:text-xs">
                      {new Date(m.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-3 px-3 sm:px-4 text-right">
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 justify-end">
                        <Button
                          size="sm"
                          disabled={actionLoadingId === m.id}
                          onClick={() => approveMerchant(m.id)}
                          className="w-full sm:w-auto text-[10px] sm:text-xs px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700"
                        >
                          {actionLoadingId === m.id ? "..." : "Approve"}
                        </Button>

                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={actionLoadingId === m.id}
                          onClick={() => rejectMerchant(m.id)}
                          className="w-full sm:w-auto text-[10px] sm:text-xs px-3 sm:px-4 py-1.5 sm:py-2 border-red-200 text-red-600 hover:bg-red-50"
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}