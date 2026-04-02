export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12 text-sm text-gray-700 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Privacy Policy
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Effective Date: 28/03/2026 • Version 1.0
        </p>
      </div>

      <p>
        The Mallyard respects your privacy. This Policy outlines how we collect,
        use, and safeguard your information as part of delivering a structured,
        trust-first marketplace experience.
      </p>

      {/* 1 */}
      <section>
        <h2 className="mt-6 mb-2 font-semibold text-gray-900">
          1. Information We Collect
        </h2>
        <p className="mb-3">
          To operate effectively, we may collect limited and relevant user data,
          including:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Name, email address, and phone number</li>
          <li>Account credentials and authentication data</li>
          <li>City-level location information</li>
          <li>Platform usage and analytics data</li>
          <li>Interactions with Sandy, our AI assistant</li>
        </ul>
      </section>

      {/* 2 */}
      <section>
        <h2 className="mt-6 mb-2 font-semibold text-gray-900">
          2. How We Use Information
        </h2>
        <p className="mb-3">
          Your information is used intentionally and responsibly to:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Operate and improve the platform experience</li>
          <li>Facilitate connections between users</li>
          <li>Provide support and communication</li>
          <li>Maintain safety, trust, and system integrity</li>
        </ul>
      </section>

      {/* 3 */}
      <section>
        <h2 className="mt-6 mb-2 font-semibold text-gray-900">
          3. AI Assistant (Sandy)
        </h2>
        <p className="mb-3">
          Sandy is an assistive AI tool designed to guide users through the
          platform experience.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Sandy does not make binding or final decisions</li>
          <li>
            Conversations may be reviewed in a controlled manner to improve
            safety, accuracy, and performance
          </li>
        </ul>
      </section>

      {/* 4 */}
      <section>
        <h2 className="mt-6 mb-2 font-semibold text-gray-900">
          4. Data Sharing
        </h2>
        <p className="mb-3">
          We do not sell personal data. Information is only shared where
          necessary to operate the platform responsibly:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>With service providers (e.g., hosting and analytics)</li>
          <li>Where required by applicable law or legal process</li>
        </ul>

        <p className="mt-3">
          To facilitate deliveries, limited information — such as seller contact
          details and delivery addresses — may be shared with a manually
          assigned delivery partner once a delivery match has been confirmed by
          the Founder or an authorized administrator.
        </p>

        <p className="mt-2">
          This sharing is strictly limited to what is necessary to complete the
          delivery and constitutes user consent under this Policy.
        </p>
      </section>

      {/* 5 */}
      <section>
        <h2 className="mt-6 mb-2 font-semibold text-gray-900">
          5. Data Security
        </h2>
        <p>
          We apply reasonable technical and organizational safeguards to protect
          your information. While no system is absolute, we are intentional in
          maintaining a secure and controlled environment.
        </p>
      </section>

      {/* 6 */}
      <section>
        <h2 className="mt-6 mb-2 font-semibold text-gray-900">
          6. Data Retention
        </h2>
        <p>
          We retain data only for as long as necessary to support platform
          operations, user experience, and legal obligations.
        </p>
      </section>

      {/* 7 */}
      <section>
        <h2 className="mt-6 mb-2 font-semibold text-gray-900">
          7. Your Rights
        </h2>
        <p className="mb-3">
          Depending on your jurisdiction, you may:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Request access to your personal data</li>
          <li>Request correction or deletion</li>
          <li>Withdraw consent where applicable</li>
        </ul>
      </section>

      {/* 8 */}
      <section>
        <h2 className="mt-6 mb-2 font-semibold text-gray-900">
          8. International Users
        </h2>
        <p>
          We aim to align with globally recognized data protection principles,
          including POPIA (South Africa) and GDPR standards, where applicable.
        </p>
      </section>

      {/* 9 */}
      <section>
        <h2 className="mt-6 mb-2 font-semibold text-gray-900">
          9. Contact
        </h2>
        <p>
          For privacy-related inquiries, please contact:
        </p>
        <p className="mt-1 font-medium">
          privacy@themallyard.com
        </p>
      </section>

      {/* DISCLAIMER */}
      <section className="pt-10 border-t border-gray-200 space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Platform Disclaimer & Risk Disclosure
        </h2>

        <p>
          The Mallyard operates as a facilitation platform designed to connect
          users within a structured marketplace environment.
        </p>

        <ul className="list-disc pl-5 space-y-1">
          <li>
            We do not guarantee the accuracy of listings beyond basic
            verification processes
          </li>
          <li>
            We do not guarantee outcomes, pricing, or service quality
          </li>
          <li>
            All engagements occur at the user’s discretion and responsibility
          </li>
        </ul>

        <p>
          Users are responsible for conducting appropriate due diligence,
          verifying counterparties, and agreeing on payment and delivery terms
          independently.
        </p>

        <p className="font-medium text-gray-800">
          By using The Mallyard, you acknowledge and accept these conditions.
        </p>

        <p className="text-gray-600">
          If you are not comfortable engaging directly with third parties, you
          should not use the platform.
        </p>
      </section>

    </main>
  );
}