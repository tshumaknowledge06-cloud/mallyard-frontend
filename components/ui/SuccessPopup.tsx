"use client";

import Button from "@/components/ui/Button";

interface Props {
  title: string;
  message: string;
  note?: string;
  encouragement?: string;
  totalPrice?: number;
  deliveryPrice?: number;
  estimatedDays?: number;
  onClose: () => void;
}

export default function SuccessPopup({
  title,
  message,
  note,
  encouragement,
  totalPrice,
  deliveryPrice,
  estimatedDays,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-700 shadow-lg">
          <span className="text-5xl font-bold text-yellow-400">✓</span>
        </div>

        <h2 className="mt-6 text-2xl font-bold text-gray-900">
          {title}
        </h2>

        <p className="mt-3 text-base leading-relaxed text-gray-700">
          {message}
        </p>

        {/* 🔥 ORDER SUMMARY SECTION (NEW) */}
        {(totalPrice !== undefined || deliveryPrice !== undefined || estimatedDays !== undefined) && (
          <div className="mt-4 rounded-lg bg-gray-50 p-4 text-left">
            <h3 className="mb-2 text-sm font-semibold text-gray-700">Order Summary</h3>
            <div className="space-y-1 text-sm">
              {totalPrice !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-semibold text-emerald-700">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              )}
              {deliveryPrice !== undefined && deliveryPrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee:</span>
                  <span className="font-semibold text-emerald-700">
                    ${deliveryPrice.toFixed(2)}
                  </span>
                </div>
              )}
              {estimatedDays !== undefined && estimatedDays > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Est. Delivery:</span>
                  <span className="font-semibold text-gray-700">
                    {estimatedDays} day(s)
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {note && (
          <p className="mt-4 text-sm leading-relaxed text-gray-600">
            {note}
          </p>
        )}

        {encouragement && (
          <p className="mt-5 text-sm font-medium text-emerald-700">
            {encouragement}
          </p>
        )}

        <div className="mt-6">
          <Button onClick={onClose}
            className="w-full mt-2"
          >
            Continue Exploring
          </Button>
          
        </div>
      </div>
    </div>
  );
}