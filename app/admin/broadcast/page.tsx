"use client";

import { useState } from "react";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import ErrorState from "@/components/ui/ErrorState";

import { fetchWithAuth } from "@/lib/api";

type Audience =
  | "all"
  | "merchants"
  | "delivery_partners"
  | "customers";

interface BroadcastResponse {
  message: string;
  audience: string;
  targeted: number;
  sent: number;
  failed: number;
}

const audienceOptions = [
  {
    value: "all",
    label: "All Mallyard Users",
    description: "Customers, merchants and delivery partners",
  },
  {
    value: "merchants",
    label: "Merchants",
    description: "All active merchant accounts",
  },
  {
    value: "delivery_partners",
    label: "Delivery Partners",
    description: "All active delivery partner accounts",
  },
  {
    value: "customers",
    label: "Customers",
    description: "All active customer accounts",
  },
] as const;

export default function AdminBroadcastPage() {
  const [audience, setAudience] =
    useState<Audience>("all");

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [result, setResult] =
    useState<BroadcastResponse | null>(null);

  async function handleSend() {
    setError("");
    setResult(null);

    if (!subject.trim()) {
      setError("Please enter a subject.");
      return;
    }

    if (!message.trim()) {
      setError("Please enter a message.");
      return;
    }

    setLoading(true);

    try {
      const response =
        await fetchWithAuth("/admin/broadcast", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            audience,
            subject: subject.trim(),
            message: message.trim(),
          }),
        });

      setResult(response);

      setSubject("");
      setMessage("");
    } catch (err: any) {
      setError(
        err?.message ||
          "Failed to send broadcast."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setSubject("");
    setMessage("");
    setAudience("all");
    setError("");
    setResult(null);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* PAGE HEADER */}

      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Mallyard Broadcasts
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Send a message directly to a selected
          group of Mallyard users.
        </p>
      </div>

      {/* SUCCESS */}

      {result && (
        <Card className="border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-start justify-between gap-4">

            <div>
              <p className="text-base font-semibold text-emerald-800">
                Broadcast sent successfully
              </p>

              <p className="mt-1 text-sm text-emerald-700">
                Your Mallyard message has been
                processed for the selected audience.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">

                <div className="rounded-lg bg-white p-3">
                  <p className="text-xs text-gray-500">
                    Targeted
                  </p>

                  <p className="mt-1 text-xl font-bold text-gray-900">
                    {result.targeted}
                  </p>
                </div>

                <div className="rounded-lg bg-white p-3">
                  <p className="text-xs text-gray-500">
                    Sent
                  </p>

                  <p className="mt-1 text-xl font-bold text-emerald-700">
                    {result.sent}
                  </p>
                </div>

                <div className="rounded-lg bg-white p-3">
                  <p className="text-xs text-gray-500">
                    Failed
                  </p>

                  <p className="mt-1 text-xl font-bold text-red-600">
                    {result.failed}
                  </p>
                </div>

              </div>
            </div>

            <button
              type="button"
              onClick={() => setResult(null)}
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-900"
            >
              Dismiss
            </button>

          </div>
        </Card>
      )}

      {/* ERROR */}

      {error && (
        <ErrorState message={error} />
      )}

      {/* COMPOSE CARD */}

      <Card className="p-6">

        <div className="mb-6">

          <h2 className="text-lg font-semibold text-gray-800">
            Send a Mallyard Message
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Choose your audience, write your message,
            and we'll deliver it using the Mallyard
            branded email experience.
          </p>

        </div>

        <div className="space-y-6">

          {/* AUDIENCE */}

          <div>
            <label
              htmlFor="audience"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Send Message To
            </label>

            <select
              id="audience"
              value={audience}
              onChange={(e) =>
                setAudience(
                  e.target.value as Audience
                )
              }
              disabled={loading}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            >
              {audienceOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label} —{" "}
                  {option.description}
                </option>
              ))}
            </select>
          </div>

          {/* SUBJECT */}

          <div>
            <label
              htmlFor="subject"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Subject
            </label>

            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) =>
                setSubject(e.target.value)
              }
              disabled={loading}
              maxLength={200}
              placeholder="e.g. A new chapter is beginning in The Yard"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />

            <p className="mt-1 text-xs text-gray-400">
              {subject.length}/200
            </p>
          </div>

          {/* MESSAGE */}

          <div>
            <label
              htmlFor="message"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Message
            </label>

            <textarea
              id="message"
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              disabled={loading}
              maxLength={10000}
              rows={12}
              placeholder="Write the message you'd like Mallyard users to receive..."
              className="w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm leading-7 text-gray-800 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            />

            <p className="mt-1 text-xs text-gray-400">
              {message.length}/10000
            </p>
          </div>

          {/* ACTIONS */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <Button
              variant="secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSend}
              disabled={loading}
            >
              {loading
                ? "Sending..."
                : "Send Broadcast"}
            </Button>

          </div>

        </div>
      </Card>

      {/* PREVIEW NOTE */}

      <Card className="p-5">

        <p className="text-sm font-semibold text-gray-700">
          Email experience
        </p>

        <p className="mt-1 text-sm leading-6 text-gray-500">
          Recipients will receive your message inside
          the Mallyard-branded email template. Your
          message content is inserted into the branded
          layout automatically.
        </p>

      </Card>

    </div>
  );
}