"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";

interface RouteRequest {
  id: number;
  origin_city_id: number;
  destination_city_id: number;
  request_count: number;
  created_at: string;
}

interface Route {
  id: number;
  origin_city_id: number;
  destination_city_id: number;
  estimated_days_min: number;
  estimated_days_max: number;
  is_active: boolean;
  origin_city?: { name: string };
  destination_city?: { name: string };
  pricings?: RoutePricing[];
}

interface RoutePricing {
  id: number;
  package_type: string;
  base_price: number;
}

interface City {
  id: number;
  name: string;
  country: string;
}

interface Insight {
  origin: string;
  destination: string;
  demand: number;
  distance_km: number;
  suggested_prices: {
    small: number;
    medium: number;
    large: number;
  };
}

export default function AdminRouteManagement() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routeRequests, setRouteRequests] = useState<RouteRequest[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state for new route
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [originCityId, setOriginCityId] = useState("");
  const [destinationCityId, setDestinationCityId] = useState("");
  const [etaMin, setEtaMin] = useState("");
  const [etaMax, setEtaMax] = useState("");
  const [creating, setCreating] = useState(false);

  // Pricing modal state
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [smallPrice, setSmallPrice] = useState("");
  const [mediumPrice, setMediumPrice] = useState("");
  const [largePrice, setLargePrice] = useState("");
  const [addingPricing, setAddingPricing] = useState(false);

  // Toggle loading state
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [routesData, requestsData, insightsData, citiesData] = await Promise.all([
        fetchWithAuth("/admin/routes"),
        fetchWithAuth("/admin/route-requests"),
        fetchWithAuth("/admin/route-insights"),
        fetchWithAuth("/admin/cities"),
      ]);

      setRoutes(routesData);
      setRouteRequests(requestsData);
      setInsights(insightsData);
      setCities(citiesData);
    } catch {
      setError("Failed to load route management data");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateRoute() {
    if (!originCityId || !destinationCityId || !etaMin || !etaMax) {
      alert("Please fill all fields");
      return;
    }

    if (parseInt(etaMin) > parseInt(etaMax)) {
      alert("ETA min cannot be greater than ETA max");
      return;
    }

    try {
      setCreating(true);
      await fetchWithAuth("/admin/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin_city_id: parseInt(originCityId),
          destination_city_id: parseInt(destinationCityId),
          eta_min: parseInt(etaMin),
          eta_max: parseInt(etaMax),
        }),
      });

      setShowCreateModal(false);
      resetCreateForm();
      await loadData();
    } catch {
      alert("Failed to create route");
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleRoute(routeId: number, currentStatus: boolean) {
    try {
      setTogglingId(routeId);
      await fetchWithAuth(`/admin/routes/${routeId}/toggle`, {
        method: "PATCH",
      });
      await loadData();
    } catch {
      alert("Failed to toggle route status");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleAddPricing() {
    if (!selectedRoute) return;

    if (!smallPrice && !mediumPrice && !largePrice) {
      alert("Enter at least one price");
      return;
    }

    try {
      setAddingPricing(true);

      const pricingPromises = [];
      if (smallPrice) {
        pricingPromises.push(
          fetchWithAuth(`/admin/routes/${selectedRoute.id}/pricing`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ package_type: "small", base_price: parseFloat(smallPrice) }),
          })
        );
      }
      if (mediumPrice) {
        pricingPromises.push(
          fetchWithAuth(`/admin/routes/${selectedRoute.id}/pricing`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ package_type: "medium", base_price: parseFloat(mediumPrice) }),
          })
        );
      }
      if (largePrice) {
        pricingPromises.push(
          fetchWithAuth(`/admin/routes/${selectedRoute.id}/pricing`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ package_type: "large", base_price: parseFloat(largePrice) }),
          })
        );
      }

      await Promise.all(pricingPromises);

      setShowPricingModal(false);
      resetPricingForm();
      await loadData();
    } catch {
      alert("Failed to add pricing");
    } finally {
      setAddingPricing(false);
    }
  }

  function resetCreateForm() {
    setOriginCityId("");
    setDestinationCityId("");
    setEtaMin("");
    setEtaMax("");
  }

  function resetPricingForm() {
    setSmallPrice("");
    setMediumPrice("");
    setLargePrice("");
    setSelectedRoute(null);
  }

  function openPricingModal(route: Route) {
    setSelectedRoute(route);
    const pricingMap: Record<string, number> = {};
    route.pricings?.forEach((p) => {
      pricingMap[p.package_type] = p.base_price;
    });
    setSmallPrice(pricingMap["small"]?.toString() || "");
    setMediumPrice(pricingMap["medium"]?.toString() || "");
    setLargePrice(pricingMap["large"]?.toString() || "");
    setShowPricingModal(true);
  }

  function getCityName(cityId: number): string {
    const city = cities.find((c) => c.id === cityId);
    return city?.name || `City #${cityId}`;
  }

  function getPricingForRoute(route: Route, type: string): number | null {
    const pricing = route.pricings?.find((p) => p.package_type === type);
    return pricing?.base_price || null;
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="h-32 bg-gray-200 rounded-xl"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            🚚 Route & Delivery Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage inter-city delivery routes, pricing, and view demand insights
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition shadow-sm"
        >
          + Create New Route
        </button>
      </div>

      {/* INSIGHTS PANEL */}
      {insights.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-800">📊 Route Demand Insights</h2>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
              Top {insights.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📍</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {insight.origin} → {insight.destination}
                      </h3>
                      <p className="text-xs text-gray-500">{insight.distance_km.toFixed(1)} km</p>
                    </div>
                  </div>
                  <div className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
                    Demand: {insight.demand}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Suggested Prices:</span>
                    <div className="flex gap-3">
                      <span className="text-green-600">S: ${insight.suggested_prices.small}</span>
                      <span className="text-yellow-600">M: ${insight.suggested_prices.medium}</span>
                      <span className="text-orange-600">L: ${insight.suggested_prices.large}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* EXISTING ROUTES SECTION */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-800">🗺️ Existing Routes</h2>
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
            {routes.length}
          </span>
        </div>

        {routes.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center border border-gray-100">
            <p className="text-gray-500">No routes created yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {routes.map((route) => (
              <div
                key={route.id}
                className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🚚</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {getCityName(route.origin_city_id)} → {getCityName(route.destination_city_id)}
                      </h3>
                      <p className="text-xs text-gray-500">
                        ETA: {route.estimated_days_min}-{route.estimated_days_max} days
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          route.is_active ? "bg-emerald-500" : "bg-gray-400"
                        }`}
                      />
                      <span className="text-xs text-gray-600">
                        {route.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <button
                      onClick={() => handleToggleRoute(route.id, route.is_active)}
                      disabled={togglingId === route.id}
                      className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                        route.is_active
                          ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      }`}
                    >
                      {togglingId === route.id ? "..." : route.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => openPricingModal(route)}
                      className="px-3 py-1 text-xs font-medium rounded-lg bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition"
                    >
                      Edit Pricing
                    </button>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                        Small: ${getPricingForRoute(route, "small")?.toFixed(2) || "—"}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-yellow-50 text-yellow-700 text-xs font-medium">
                        Medium: ${getPricingForRoute(route, "medium")?.toFixed(2) || "—"}
                      </span>
                      <span className="px-2 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-medium">
                        Large: ${getPricingForRoute(route, "large")?.toFixed(2) || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CREATE ROUTE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Create New Route</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Origin City *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  value={originCityId}
                  onChange={(e) => setOriginCityId(e.target.value)}
                >
                  <option value="">Select origin city</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Destination City *
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  value={destinationCityId}
                  onChange={(e) => setDestinationCityId(e.target.value)}
                >
                  <option value="">Select destination city</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    ETA Min (days) *
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    value={etaMin}
                    onChange={(e) => setEtaMin(e.target.value)}
                    placeholder="e.g., 2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    ETA Max (days) *
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    value={etaMax}
                    onChange={(e) => setEtaMax(e.target.value)}
                    placeholder="e.g., 3"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                onClick={handleCreateRoute}
                disabled={creating}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Route"}
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRICING MODAL */}
      {showPricingModal && selectedRoute && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Set Pricing for {getCityName(selectedRoute.origin_city_id)} → {getCityName(selectedRoute.destination_city_id)}
              </h2>
              <button
                onClick={() => setShowPricingModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-gray-500">
              Enter prices for different package sizes. Leave empty to skip.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Small Package Price (0-5kg) $
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  value={smallPrice}
                  onChange={(e) => setSmallPrice(e.target.value)}
                  placeholder="e.g., 12.00"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Medium Package Price (5-15kg) $
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  value={mediumPrice}
                  onChange={(e) => setMediumPrice(e.target.value)}
                  placeholder="e.g., 18.00"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Large Package Price (15kg+) $
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  value={largePrice}
                  onChange={(e) => setLargePrice(e.target.value)}
                  placeholder="e.g., 25.00"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                onClick={handleAddPricing}
                disabled={addingPricing}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {addingPricing ? "Saving..." : "Save Pricing"}
              </button>
              <button
                onClick={() => setShowPricingModal(false)}
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