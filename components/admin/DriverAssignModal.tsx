"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import { fetchWithAuth } from "@/lib/api";

interface Driver {
  id: number;
  name: string;
}

interface Props {
  requestId: number;
  onClose: () => void;
  onAssigned: () => void;
}

export default function DriverAssignModal({
  requestId,
  onClose,
  onAssigned,
}: Props) {
  const [partners, setPartners] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function loadPartners() {
    setLoading(true);
    setError("");

    try {
      const data = await fetchWithAuth("/delivery-partners/");
      setPartners(data);
    } catch (err) {
      setError("Failed to load delivery partners.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPartners();
  }, []);

  async function assignDriver(driverId: number) {
    setAssigning(driverId);

    try {
      await fetchWithAuth(`/delivery-requests/${requestId}/assign`, {
        method: "POST",
        body: JSON.stringify({
          partner_id: driverId,
        }),
      });

      onAssigned();
      onClose();
    } catch (err) {
      alert("Failed to assign driver.");
    } finally {
      setAssigning(null);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <Card className="w-full max-w-md space-y-4">

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            Assign Delivery Partner
          </h2>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
        </div>

        {loading && <LoadingState />}

        {error && (
          <ErrorState
            message={error}
            action={<Button onClick={loadPartners}>Retry</Button>}
          />
        )}

        {!loading && !error && partners.length === 0 && (
          <p className="text-sm text-gray-500">
            No delivery partners available.
          </p>
        )}

        {!loading &&
          partners.map((driver) => (
            <div
              key={driver.id}
              className="flex items-center justify-between border p-3 rounded"
            >
              <span>{driver.name}</span>

              <Button
                size="sm"
                disabled={assigning === driver.id}
                onClick={() => assignDriver(driver.id)}
              >
                {assigning === driver.id
                  ? "Assigning..."
                  : "Assign"}
              </Button>
            </div>
          ))}

      </Card>
    </div>
  );
}