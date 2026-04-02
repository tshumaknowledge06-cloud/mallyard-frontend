"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { fetchPublic } from "@/lib/api";

export default function RegisterPage() {

  const params = useParams();
  const rawRole = Array.isArray(params.role) ? params.role[0] : params.role;
  const [userId, setUserId] = useState<number | null>(null);

  const role =
    rawRole === "merchant" ? "seller" :
    rawRole === "delivery-partner" ? "delivery_partner" :
    rawRole;

  const router = useRouter();

  const [step, setStep] = useState<"account" | "merchant" | "delivery">("account");
  const [loading, setLoading] = useState(false);

  // ✅ POPUP
  const [showDeliveryPopup, setShowDeliveryPopup] = useState(false);
  const [showMerchantPopup, setShowMerchantPopup] = useState(false);

  // ACCOUNT
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // DELIVERY
  const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [operatingCity, setOperatingCity] = useState("");

  // MERCHANT
const [businessName, setBusinessName] = useState("");
const [description, setDescription] = useState("");
const [merchantType, setMerchantType] = useState("seller");
const [location, setLocation] = useState("");
const [contactPhone, setContactPhone] = useState("");

  // ✅ AUTO DIRECT DELIVERY USERS
  useEffect(() => {
    if (role === "delivery_partner") {
      setStep("delivery");
    }
  }, [role]);

  // ACCOUNT REGISTER (ONLY CUSTOMER / SELLER)
  async function handleAccountRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await fetchPublic("/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          role
        })
      }, false);

      if (!data) {
        alert("Registration failed");
        setLoading(false);
        return;
      }

      if (role === "customer") {
        router.push(`/login/customer`);
        return;
      }

      if (role === "seller") {
        setUserId(data.id);
        setStep("merchant");
        setLoading(false);
        return;
      }

    } catch (err: any) {
      alert(err?.message || "Network error");
    }

    setLoading(false);
  }

  // ✅ DELIVERY REGISTER (ONE STEP)
  async function handleDeliverySubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await fetchPublic("/delivery/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          full_name: fullName,
          phone_number: phone,
          email,
          password,
          vehicle_type: vehicleType,
          license_number: licenseNumber,
          operating_city: operatingCity
        })
      }, false);

      if (!data) {
        alert("Submission failed");
        setLoading(false);
        return;
      }

      // ✅ SHOW PREMIUM POPUP
      setShowDeliveryPopup(true);

    } catch (err: any) {
      alert(err?.message || "Network error");
    }

    setLoading(false);
  }

  async function handleMerchantSubmit(e: React.FormEvent) {
  e.preventDefault();

  if (!userId) {
    alert("User not found. Please try again.");
    return;
  }

  setLoading(true);

  try {
    const data = await fetchPublic(`/merchants/register?user_id=${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        business_name: businessName,
        description,
        merchant_type: merchantType,
        location,
        contact_phone: contactPhone,
        payment_methods: [],
      }),
    }, false);

    if (!data) {
      alert("Merchant registration failed");
      setLoading(false);
      return;
    }

    // ✅ SUCCESS FLOW
    setShowMerchantPopup(true);

  } catch (err: any) {
    alert(err?.message || "Network error");
  }

  setLoading(false);
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50">

      {/* ACCOUNT (NOT FOR DELIVERY) */}
      {step === "account" && role !== "delivery_partner" && (
        <form onSubmit={handleAccountRegister} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">

          <h2 className="text-2xl font-semibold mb-6 text-emerald-800">
            Register as {rawRole}
          </h2>

          <input
            type="text"
            placeholder="Full Name"
            className="w-full mb-4 px-4 py-2 border rounded"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full mb-4 px-4 py-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full mb-6 px-4 py-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full bg-emerald-700 text-white py-2 rounded">
            {loading ? "Registering..." : "Continue"}
          </button>

        </form>
      )}

      {/* ✅ MERCHANT FORM (FIXED MISSING STEP) */}
{step === "merchant" && (
  <form
    onSubmit={handleMerchantSubmit}
    className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
  >
    <h2 className="text-xl font-semibold mb-4 text-emerald-800">
      Complete Your Business Profile 🏪
    </h2>

    <input
      placeholder="Business Name"
      className="w-full mb-3 p-2 border"
      value={businessName}
      onChange={(e) => setBusinessName(e.target.value)}
    />

    <input
      placeholder="Location"
      className="w-full mb-3 p-2 border"
      value={location}
      onChange={(e) => setLocation(e.target.value)}
    />

    <input
      placeholder="Contact Phone"
      className="w-full mb-3 p-2 border"
      value={contactPhone}
      onChange={(e) => setContactPhone(e.target.value)}
    />

    <textarea
      placeholder="Business Description"
      className="w-full mb-4 p-2 border"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
    />

    <button className="w-full bg-emerald-700 text-white py-2 rounded">
      {loading ? "Submitting..." : "Complete Registration"}
    </button>
  </form>
)}

      {/* ✅ DELIVERY (ONE STEP FULL FORM) */}
      {step === "delivery" && (
        <form onSubmit={handleDeliverySubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">

          <h2 className="text-xl font-semibold mb-4 text-emerald-800">
            Join The Mallyard Delivery Network 🚚
          </h2>

          <input placeholder="Full Name" className="w-full mb-3 p-2 border" onChange={e => setFullName(e.target.value)} />
          <input placeholder="Email" type="email" className="w-full mb-3 p-2 border" onChange={e => setEmail(e.target.value)} />
          <input placeholder="Password" type="password" className="w-full mb-3 p-2 border" onChange={e => setPassword(e.target.value)} />

          <input placeholder="Phone Number" className="w-full mb-3 p-2 border" onChange={e => setPhone(e.target.value)} />
          <input placeholder="Vehicle Type (Bike, Car, Van...)" className="w-full mb-3 p-2 border" onChange={e => setVehicleType(e.target.value)} />
          <input placeholder="License Number (optional)" className="w-full mb-3 p-2 border" onChange={e => setLicenseNumber(e.target.value)} />
          <input placeholder="Operating City" className="w-full mb-4 p-2 border" onChange={e => setOperatingCity(e.target.value)} />

          <button className="w-full bg-emerald-700 text-white py-2 rounded">
            {loading ? "Submitting..." : "Submit Application"}
          </button>

        </form>
      )}

      {/* ✅ PREMIUM DELIVERY POPUP */}
      {showDeliveryPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">

          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl text-center">

            <h3 className="text-xl font-semibold text-emerald-800 mb-3">
              🚚 Welcome to The Mallyard
            </h3>

            <p className="text-gray-700 mb-6">
              Your delivery partner application has been successfully submitted.
              <br /><br />
              Our team is currently reviewing your request.
              <br /><br />
              You will be notified once your account is activated so you can start delivering and earning.
            </p>

            <button
              onClick={() => router.push(`/login/delivery_partner`)}
              className="w-full bg-emerald-700 text-white py-2 rounded hover:bg-emerald-800"
            >
              Continue to Login
            </button>

          </div>

        </div>
      )}

      {/* ✅ PREMIUM MERCHANT POPUP */}
{showMerchantPopup && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">

    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl text-center">

      <h3 className="text-xl font-semibold text-emerald-800 mb-3">
        🏪 Welcome to The Mallyard Network
      </h3>

      <p className="text-gray-700 mb-6">
        Your merchant application has been successfully submitted.
        <br /><br />
        Your business is now on the path to reaching a wider, trusted marketplace.
        <br /><br />
        Once approved, you will be notified via your registered contact details, and you’ll gain full access to your merchant dashboard to start selling, growing, and scaling your business.
      </p>

      <button
        onClick={() => router.push(`/login/seller`)}
        className="w-full bg-emerald-700 text-white py-2 rounded hover:bg-emerald-800"
      >
        Continue to Login
      </button>

    </div>

  </div>
)}

    </div>
  );
}