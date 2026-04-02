"use client";

interface OrderTimelineProps {
  status: string;
}

const steps = [
  { key: "accepted", label: "Accepted" },
  { key: "preparing", label: "Preparing" },
  { key: "packaged", label: "Packaged" },
  { key: "driver_assigned", label: "Driver Assigned" },
  { key: "in_transit", label: "In Transit" },
  { key: "delivered", label: "Delivered" },
  { key: "verified", label: "Verified" },
];

const statusProgressMap: Record<string, number> = {
  pending: -1,
  accepted: 0,
  preparing: 1,
  packaged: 2,
  delivery_requested: 2,
  driver_assigned: 3,
  in_transit: 4,
  delivered: 5,
  completed: 5,
  verified: 6,
};

export default function OrderTimeline({ status }: OrderTimelineProps) {
  const currentStep = statusProgressMap[status] ?? -1;

  return (
    <div className="mt-4 w-full overflow-x-auto scrollbar-hide">
      
      {/* WRAPPER */}
      <div className="flex items-start min-w-[640px] sm:min-w-0">

        {steps.map((step, index) => {
          const isCompleted = index <= currentStep;

          const isCurrent =
            (status === "delivery_requested" && step.key === "packaged") ||
            (status === "completed" && step.key === "delivered") ||
            step.key === status;

          return (
            <div
              key={step.key}
              className="flex items-start flex-1 min-w-[80px] sm:min-w-0"
            >

              {/* STEP */}
              <div className="flex flex-col items-center flex-1">

                {/* DOT */}
                <div
                  className={`
                    w-3.5 h-3.5 rounded-full border transition-all duration-300
                    ${isCompleted
                      ? "bg-emerald-600 border-emerald-600 shadow-[0_0_6px_rgba(5,150,105,0.5)]"
                      : "bg-white border-gray-300"}
                    ${isCurrent ? "scale-110" : ""}
                  `}
                />

                {/* LABEL */}
                <span
                  className={`
                    mt-1 text-[10px] sm:text-xs text-center leading-tight px-1
                    ${isCurrent
                      ? "text-emerald-700 font-semibold"
                      : isCompleted
                      ? "text-gray-900"
                      : "text-gray-400"}
                  `}
                >
                  {step.label}
                </span>

                {/* EXTRA STATUS */}
                {status === "delivery_requested" && step.key === "packaged" && (
                  <span className="mt-1 text-[9px] sm:text-[11px] text-yellow-600 font-medium text-center px-1">
                    Delivery Requested
                  </span>
                )}

                {status === "completed" && step.key === "delivered" && (
                  <span className="mt-1 text-[9px] sm:text-[11px] text-emerald-600 font-medium text-center px-1">
                    Awaiting Verification
                  </span>
                )}

              </div>

              {/* CONNECTOR */}
              {index < steps.length - 1 && (
                <div className="flex-1 flex items-center px-1 sm:px-2 pt-[7px]">
                  <div
                    className={`
                      h-[2px] w-full rounded-full transition-all duration-300
                      ${index < currentStep
                        ? "bg-emerald-600"
                        : "bg-gray-300"}
                    `}
                  />
                </div>
              )}

            </div>
          );
        })}

      </div>
    </div>
  );
}