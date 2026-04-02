"use client";

interface Props {
  status: string;
}

export default function DeliveryProgressTracker({ status }: Props) {

  const steps = [
    "accepted",
    "picked_up",
    "in_transit",
    "delivered",
    "verified"
  ];

  const labels = {
    accepted: "Accepted",
    picked_up: "Picked Up",
    in_transit: "In Transit",
    delivered: "Delivered",
    verified: "Verified"
  };

  const currentIndex = steps.indexOf(status);

  return (

    <div className="mt-4 w-full">

      <div className="flex flex-wrap items-center gap-y-3 gap-x-2 md:gap-4">

        {steps.map((step, i) => (

          <div
            key={step}
            className="flex items-center gap-2"
          >

            {/* DOT */}
            <div
              className={`
                w-3 h-3 md:w-4 md:h-4 rounded-full flex-shrink-0
                ${i <= currentIndex
                  ? "bg-emerald-600"
                  : "bg-gray-300"
                }
              `}
            />

            {/* LABEL */}
            <span className="text-[10px] md:text-xs whitespace-nowrap">
              {labels[step as keyof typeof labels]}
            </span>

            {/* CONNECTOR */}
            {i !== steps.length - 1 && (
              <div className="w-6 md:w-8 h-[2px] bg-gray-300" />
            )}

          </div>

        ))}

      </div>

    </div>
  );
}