"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";

import { fetchWithAuth } from "@/lib/api";

interface DeliveryRequest {
  id: number;
  listing_id: number;
  pickup_address: string;
  dropoff_address: string;
  status: string;
}

interface DeliveryPartner {
  id: number;
  full_name: string;
  phone_number: string;
  vehicle_type: string;
  operating_city: string;
  is_active: boolean;
  trust_score: number;
  completed_deliveries: number;
  created_at: string;
}

export default function DeliveriesAdminPage() {
  const [requests, setRequests] = useState<DeliveryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState<number | null>(null);

  const [assigningRequest, setAssigningRequest] = useState<DeliveryRequest | null>(null);
  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [assigningPartnerId, setAssigningPartnerId] = useState<number | null>(null);

  async function loadRequests() {
    setLoading(true);
    setError("");

    try {
      const data = await fetchWithAuth("/delivery-requests/");
      setRequests(data);
    } catch {
      setError("Failed to load delivery requests.");
    } finally {
      setLoading(false);
    }
  }

  async function loadDeliveryPartners() {
    setLoadingPartners(true);

    try {
      const data = await fetchWithAuth("/delivery/");
      setDeliveryPartners(Array.isArray(data) ? data : []);
    } catch {
      alert("Failed to load delivery partners.");
      setDeliveryPartners([]);
    } finally {
      setLoadingPartners(false);
    }
  }

  async function openAssignModal(request: DeliveryRequest) {
    setAssigningRequest(request);
    await loadDeliveryPartners();
  }

  function closeAssignModal() {
    setAssigningRequest(null);
    setDeliveryPartners([]);
    setLoadingPartners(false);
    setAssigningPartnerId(null);
  }

  async function assignDeliveryPartner(deliveryPartnerId: number) {
    if (!assigningRequest) return;

    setAssigningPartnerId(deliveryPartnerId);

    try {
      await fetchWithAuth("/delivery-matches/assign", {
        method: "POST",
        body: JSON.stringify({
          delivery_request_id: assigningRequest.id,
          delivery_partner_id: deliveryPartnerId,
        }),
      });

      closeAssignModal();
      await loadRequests();
    } catch {
      alert("Failed to assign delivery partner.");
    } finally {
      setAssigningPartnerId(null);
    }
  }

  async function verifyDelivery(id: number) {
    setVerifying(id);

    try {
      await fetchWithAuth(`/delivery-requests/${id}/complete`, {
        method: "PUT",
      });

      await loadRequests();
    } catch {
      alert("Failed to verify delivery.");
    } finally {
      setVerifying(null);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <ErrorState
        message={error}
        action={<Button onClick={loadRequests}>Retry</Button>}
      />
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Delivery Tracking
            </h1>

            <p className="text-sm text-gray-500">
              Monitor delivery progress, assign delivery partners, and verify completed deliveries.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={loadRequests}
          >
            Refresh
          </Button>
        </div>

        {requests.length === 0 ? (
          <EmptyState
            title="No delivery requests"
            message="There are currently no deliveries in the system."
          />
        ) : (
          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="py-3">Request</th>
                  <th>Listing</th>
                  <th>Pickup</th>
                  <th>Dropoff</th>
                  <th>Status</th>
                  <th className="text-right">Admin</th>
                </tr>
              </thead>

              <tbody>
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-3 font-medium">
                      #{req.id}
                    </td>

                    <td>
                      {req.listing_id}
                    </td>

                    <td className="max-w-xs truncate">
                      {req.pickup_address}
                    </td>

                    <td className="max-w-xs truncate">
                      {req.dropoff_address}
                    </td>

                    <td>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        {req.status}
                      </span>
                    </td>

                    <td className="text-right">
                      {req.status === "ready_for_dispatch" && (
                        <Button
                          size="sm"
                          onClick={() => openAssignModal(req)}
                        >
                          Assign DP
                        </Button>
                      )}

                      {req.status === "delivered" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={verifying === req.id}
                          onClick={() => verifyDelivery(req.id)}
                        >
                          {verifying === req.id ? "Verifying..." : "Verify"}
                        </Button>
                      )}

                      {req.status === "verified" && (
                        <span className="text-green-600 text-xs font-medium">
                          Verified
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      {assigningRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl">
            <div className="border-b px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Assign Delivery Partner
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Select a delivery partner for request #{assigningRequest.id}
                </p>
              </div>

              <button
                onClick={closeAssignModal}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
              {loadingPartners ? (
                <p className="text-sm text-gray-500">
                  Loading delivery partners...
                </p>
              ) : deliveryPartners.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No delivery partners available.
                </p>
              ) : (
                <div className="space-y-3">
                  {deliveryPartners.map((dp) => (
                    <div
                      key={dp.id}
                      className="border rounded-xl p-4 flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
                          {dp.full_name}
                        </p>

                        <p className="text-sm text-gray-600 mt-1">
                          City: {dp.operating_city}
                        </p>

                        <p className="text-sm text-gray-600">
                          Vehicle: {dp.vehicle_type}
                        </p>

                        <p className="text-sm text-gray-600">
                          Completed Deliveries: {dp.completed_deliveries}
                        </p>

                        <p className="text-sm mt-1">
                          Status:{" "}
                          <span
                            className={`font-medium ${
                              dp.is_active
                                ? "text-emerald-600"
                                : "text-red-500"
                            }`}
                          >
                            {dp.is_active ? "Active" : "Inactive"}
                          </span>
                        </p>
                      </div>

                      <Button
                        size="sm"
                        disabled={assigningPartnerId === dp.id || !dp.is_active}
                        onClick={() => assignDeliveryPartner(dp.id)}
                      >
                        {assigningPartnerId === dp.id ? "Assigning..." : "Assign"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t px-6 py-4 flex justify-end">
              <Button
                variant="secondary"
                onClick={closeAssignModal}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}