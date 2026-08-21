"use client";

import { FormEvent, useState } from "react";

export default function DeleteAccountPage() {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Backend wiring will be added later.
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-[#F8F7F2] px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-2xl">

        {/* HEADER */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center">
            <div className="rounded-xl bg-[#046D56] px-5 py-3">
              <span className="text-lg font-bold tracking-wide text-[#D4AF37]">
                THE MALLYARD
              </span>
            </div>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">
            Delete Your Mallyard Account
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-600">
            You can use this page to request deletion of your Mallyard
            account and associated personal data.
          </p>
        </div>

        {/* MAIN CARD */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">

          {!submitted ? (
            <>
              <div className="space-y-6">

                {/* WHAT HAPPENS */}
                <section>
                  <h2 className="text-lg font-semibold text-[#1A1A1A]">
                    What happens when you request deletion?
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    We will review your request and verify that it was
                    submitted by the account owner. Once verified, we will
                    delete your Mallyard account and eligible associated
                    personal information.
                  </p>
                </section>

                {/* DATA DELETION */}
                <section>
                  <h2 className="text-lg font-semibold text-[#1A1A1A]">
                    Data that will be deleted
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Account information such as your name, email address,
                    phone number, profile information and other personal
                    account data will be deleted where applicable.
                  </p>
                </section>

                {/* RETENTION */}
                <section>
                  <h2 className="text-lg font-semibold text-[#1A1A1A]">
                    Information that may be retained
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Certain information may be retained where necessary for
                    legal, regulatory, security, fraud-prevention, dispute
                    resolution or legitimate transaction-record purposes.
                    Any retained information will only be kept for as long
                    as necessary for those purposes.
                  </p>
                </section>

                {/* FORM */}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5 border-t border-gray-200 pt-6"
                >
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Account email address
                    </label>

                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="you@example.com"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#046D56] focus:ring-2 focus:ring-[#046D56]/10"
                    />

                    <p className="mt-1 text-xs text-gray-500">
                      Enter the email address associated with your Mallyard
                      account.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="reason"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Reason for deletion{" "}
                      <span className="font-normal text-gray-400">
                        (optional)
                      </span>
                    </label>

                    <textarea
                      id="reason"
                      value={reason}
                      onChange={(event) =>
                        setReason(event.target.value)
                      }
                      rows={4}
                      placeholder="Tell us why you are leaving..."
                      className="w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-[#046D56] focus:ring-2 focus:ring-[#046D56]/10"
                    />
                  </div>

                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm leading-6 text-amber-900">
                      Account deletion is permanent and cannot be undone
                      once completed.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-[#046D56] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#035543] focus:outline-none focus:ring-2 focus:ring-[#046D56]/20"
                  >
                    Request Account Deletion
                  </button>
                </form>
              </div>
            </>
          ) : (
            /* SUCCESS STATE */
            <div className="py-8 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                <svg
                  className="h-7 w-7 text-[#046D56]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M5 12.5l4 4L19 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h2 className="mt-5 text-2xl font-bold text-[#1A1A1A]">
                Request Received
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600">
                Your account deletion request has been received. We will
                review the request and contact you using the information
                associated with your Mallyard account if verification is
                required.
              </p>

              <p className="mt-5 text-sm text-gray-500">
                Thank you for being part of The Yard.
              </p>

              <a
                href="https://themallyard.com"
                className="mt-6 inline-flex rounded-lg bg-[#046D56] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#035543]"
              >
                Return to Mallyard
              </a>

            </div>
          )}
        </div>

        {/* PRIVACY LINK */}
        <div className="mt-6 text-center">
          <a
            href="/privacy"
            className="text-sm font-medium text-[#046D56] hover:underline"
          >
            Read our Privacy Policy
          </a>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          © MALLYARD ENTERPRISES (PRIVATE) LIMITED
        </p>
      </div>
    </main>
  );
}