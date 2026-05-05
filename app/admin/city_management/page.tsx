"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";

interface CityRequest {
  id: number;
  name: string;
  request_count: number;
  created_at: string;
}

interface City {
  id: number;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  created_at: string;
}

export default function AdminCitiesPage() {
  const [requests, setRequests] = useState<CityRequest[]>([]);
  const [approvedCities, setApprovedCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approvingId, setApprovingId] = useState<number | null>(null);

  // Form state for approval
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CityRequest | null>(null);
  const [country, setCountry] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [requestsData, citiesData] = await Promise.all([
        fetchWithAuth("/admin/cities/requests"),
        fetchWithAuth("/admin/cities"),
      ]);
      setRequests(requestsData);
      setApprovedCities(citiesData);
    } catch {
      setError("Failed to load city management data");
    } finally {
      setLoading(false);
    }
  }

  function openApproveModal(request: CityRequest) {
    setSelectedRequest(request);
    setCountry("");
    setLatitude("");
    setLongitude("");
    setShowModal(true);
  }

  async function handleApprove() {
    if (!selectedRequest) return;

    if (!country.trim()) {
      alert("Please enter country");
      return;
    }
    if (!latitude.trim() || isNaN(Number(latitude))) {
      alert("Please enter valid latitude");
      return;
    }
    if (!longitude.trim() || isNaN(Number(longitude))) {
      alert("Please enter valid longitude");
      return;
    }

    try {
      setApprovingId(selectedRequest.id);

      await fetchWithAuth(`/admin/cities/approve/${selectedRequest.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: country.trim(),
          latitude: Number(latitude),
          longitude: Number(longitude),
        }),
      });

      setShowModal(false);
      setSelectedRequest(null);
      await loadData();
    } catch {
      alert("Failed to approve city");
    } finally {
      setApprovingId(null);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          🏙️ City Management
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage and approve city requests from users
        </p>
      </div>

      {/* PENDING REQUESTS SECTION */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-800">
              📋 Pending City Requests
            </h2>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
              {requests.length}
            </span>
          </div>
          {requests.length === 0 && (
            <span className="text-sm text-gray-400">All caught up</span>
          )}
        </div>

        {requests.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-100">
            <p className="text-gray-500">No pending city requests at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {requests.map((req) => (
              <div
                key={req.id}
                className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <span className="text-2xl">🌆</span>
                        {req.name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        Requested {req.request_count} time{req.request_count !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                      Pending
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Zimbabwe"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">
                        Latitude
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., -17.825"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-500 mb-1">
                        Longitude
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 31.033"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        onClick={() => openApproveModal(req)}
                        className="w-full px-3 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800 transition shadow-sm"
                      >
                        ✓ Approve
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* APPROVED CITIES SECTION */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">
            ✅ Approved Cities
          </h2>
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
            {approvedCities.length}
          </span>
        </div>

        {approvedCities.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-100">
            <p className="text-gray-500">No approved cities yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {approvedCities.map((city) => (
              <div
                key={city.id}
                className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏙️</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{city.name}</h3>
                      <p className="text-xs text-gray-500">{city.country}</p>
                    </div>
                  </div>
                  <span className="text-emerald-500 text-sm">✓</span>
                </div>
                <div className="mt-3 text-xs text-gray-400">
                  {/* ✅ FIXED: Added null check for latitude and longitude */}
                  <p>
                    📍 {city.latitude !== null && city.latitude !== undefined 
                      ? city.latitude.toFixed(4) 
                      : "—"},{" "}
                    {city.longitude !== null && city.longitude !== undefined 
                      ? city.longitude.toFixed(4) 
                      : "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* APPROVAL MODAL */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white w-[95%] md:w-[480px] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌆</span>
              <h2 className="text-lg font-semibold text-gray-900">
                Approve {selectedRequest.name}
              </h2>
            </div>

            <p className="text-sm text-gray-500">
              This city has been requested {selectedRequest.request_count} times.
              Enter the details below to activate it.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Country *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g., Zimbabwe"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Latitude *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="e.g., -17.825"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Longitude *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="e.g., 31.033"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                onClick={handleApprove}
                disabled={approvingId === selectedRequest.id}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {approvingId === selectedRequest.id ? "Approving..." : "Approve City"}
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedRequest(null);
                }}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}