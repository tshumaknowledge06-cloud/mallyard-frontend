export default function DeliveryPendingPage() {

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50">

      <div className="bg-white p-10 rounded-xl shadow-md text-center max-w-md">

        <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
          Application Received
        </h2>

        <p className="text-gray-700 mb-4">
          Thank you for applying to become a delivery partner with
          <strong> The Mallyard</strong>.
        </p>

        <p className="text-gray-600 text-sm">
          Your application is currently under review. Our team will verify your
          information and contact you via phone call or message once your
          account is approved.
        </p>

        <p className="text-gray-600 text-sm mt-4">
          After activation, you will be able to start accepting delivery
          requests in your city.
        </p>

      </div>

    </div>
  );
}