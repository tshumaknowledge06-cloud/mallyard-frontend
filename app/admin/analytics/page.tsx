"use client";

import { useEffect, useState } from "react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";

import { fetchWithAuth } from "@/lib/api";

interface OrdersPerWeekItem {
  week_start: string;
  orders: number;
}

interface AnalyticsResponse {
  active_customers: number;
  orders_per_week: OrdersPerWeekItem[];
  match_success_rate: number;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    setLoading(true);
    setError("");

    try {
      const response = await fetchWithAuth("/admin/analytics");
      setData(response);
    } catch {
      setError("Failed to load analytics.");
    } finally {
      setLoading(false);
    }
  }

  function formatWeek(dateString: string) {
    const d = new Date(dateString);

    return d.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  if (loading) return <LoadingState />;

  if (error) {
    return (
      <ErrorState
        message={error}
        action={<Button onClick={loadAnalytics}>Retry</Button>}
      />
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="No analytics available"
        message="Analytics data is not available right now."
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Analytics Overview
          </h1>

          <p className="text-sm text-gray-500">
            Track marketplace activity and basic delivery performance.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={loadAnalytics}
        >
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-sm text-gray-500">
            Active Customers
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {data.active_customers}
          </p>

          <p className="mt-2 text-xs text-gray-500">
            Customers who placed orders in the last 30 days
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-gray-500">
            Match Success Rate
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {data.match_success_rate}%
          </p>

          <p className="mt-2 text-xs text-gray-500">
            Delivery requests successfully matched to delivery partners
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-gray-500">
            Weeks Tracked
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {data.orders_per_week.length}
          </p>

          <p className="mt-2 text-xs text-gray-500">
            Weekly order periods currently included in analytics
          </p>
        </Card>
      </div>

      <Card className="p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Orders Per Week
          </h2>

          <p className="text-sm text-gray-500">
            Weekly order volume for the most recent tracked weeks.
          </p>
        </div>

        {data.orders_per_week.length === 0 ? (
          <EmptyState
            title="No weekly order data"
            message="Orders per week will appear here once orders are recorded."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-600">
                  <th className="py-3">Week Starting</th>
                  <th className="py-3 text-right">Orders</th>
                </tr>
              </thead>

              <tbody>
                {data.orders_per_week.map((item) => (
                  <tr
                    key={item.week_start}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-3 font-medium text-gray-800">
                      {formatWeek(item.week_start)}
                    </td>

                    <td className="py-3 text-right text-gray-700">
                      {item.orders}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}