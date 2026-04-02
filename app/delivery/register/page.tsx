"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeliveryRegisterPage() {

  const router = useRouter();

  const [form, setForm] = useState({
    full_name: "",
    phone_number: "",
    email: "",
    password: "",
    vehicle_type: "",
    license_number: "",
    operating_city: ""
  });

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault();
    setLoading(true);

    try {

      const res = await fetch("http://localhost:8000/delivery/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Application failed");
        setLoading(false);
        return;
      }

      router.push("/delivery/pending");

    } catch (error) {

      alert("Network error");

    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg"
      >

        <h2 className="text-2xl font-semibold mb-6 text-emerald-800">
          Apply as Delivery Partner
        </h2>

        <input
          placeholder="Full Name"
          className="w-full border p-2 mb-4 rounded"
          onChange={(e)=>setForm({...form, full_name:e.target.value})}
        />

        <input
          placeholder="Phone Number"
          className="w-full border p-2 mb-4 rounded"
          onChange={(e)=>setForm({...form, phone_number:e.target.value})}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-4 rounded"
          onChange={(e)=>setForm({...form, email:e.target.value})}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-4 rounded"
          onChange={(e)=>setForm({...form, password:e.target.value})}
        />

        <input
          placeholder="Vehicle Type (Bike, Car, Van)"
          className="w-full border p-2 mb-4 rounded"
          onChange={(e)=>setForm({...form, vehicle_type:e.target.value})}
        />

        <input
          placeholder="License Number"
          className="w-full border p-2 mb-4 rounded"
          onChange={(e)=>setForm({...form, license_number:e.target.value})}
        />

        <input
          placeholder="Operating City"
          className="w-full border p-2 mb-6 rounded"
          onChange={(e)=>setForm({...form, operating_city:e.target.value})}
        />

        <button
          className="w-full bg-emerald-700 text-white py-2 rounded hover:bg-emerald-800"
        >
          {loading ? "Submitting..." : "Submit Application"}
        </button>

      </form>

    </div>
  );
}