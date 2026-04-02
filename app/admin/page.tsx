"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";

import { fetchWithAuth } from "@/lib/api";

interface Driver {
  id: number;
  full_name: string;
  phone_number: string;
  vehicle_type: string;
  operating_city: string;
  is_active: boolean;
}

interface Merchant {
  id: number;
  business_name: string;
  merchant_type: string;
  location: string;
  contact_phone: string;
  status: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
}

interface SubCategory {
  id: number;
  name: string;
  description: string;
  category_id: number;
}

export default function AdminDashboard() {
  const router = useRouter();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");

  const [subName, setSubName] = useState("");
  const [subDescription, setSubDescription] = useState("");

  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      router.replace("/login/admin");
      return;
    }

    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [
        driversData,
        merchantsData,
        categoriesData,
        subcategoriesData
      ] = await Promise.all([
        fetchWithAuth("/delivery/pending"),
        fetchWithAuth("/merchants/pending"),
        fetchWithAuth("/categories/"),
        fetchWithAuth("/subcategories/")
      ]);

      setDrivers(driversData);
      setMerchants(merchantsData);
      setCategories(categoriesData);
      setSubcategories(subcategoriesData);

    } catch (err: any) {
      setError(err?.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  async function createCategory() {
    try {
      await fetchWithAuth("/categories/", {
        method: "POST",
        body: JSON.stringify({
          name: categoryName,
          description: categoryDescription
        })
      });

      setShowCategoryModal(false);
      setCategoryName("");
      setCategoryDescription("");
      loadDashboard();

    } catch (err: any) {
      setError(err?.message || "Failed to create category.");
    }
  }

  async function createSubcategory() {
    try {
      await fetchWithAuth("/subcategories/", {
        method: "POST",
        body: JSON.stringify({
          name: subName,
          description: subDescription,
          category_id: selectedCategory
        })
      });

      setShowSubModal(false);
      setSubName("");
      setSubDescription("");
      loadDashboard();

    } catch (err: any) {
      setError(err?.message || "Failed to create subcategory.");
    }
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-12">

      {/* HEADER */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-emerald-900">
          Admin Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Manage approvals, monitor onboarding, and control your marketplace.
        </p>
      </div>

      {/* PENDING DRIVERS */}
      <Card className="p-4 sm:p-6 md:p-8 rounded-2xl backdrop-blur-xl bg-white/70 border border-gray-100 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">
            Pending Drivers
          </h2>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            {drivers.length}
          </span>
        </div>

        {drivers.length === 0 ? (
          <p className="text-xs sm:text-sm text-gray-500">No pending drivers.</p>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-xs sm:text-sm min-w-[500px]">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 sm:py-3 pr-2">ID</th>
                  <th className="py-2 sm:py-3 pr-2">Name</th>
                  <th className="py-2 sm:py-3 pr-2">Phone</th>
                  <th className="py-2 sm:py-3 pr-2">Vehicle</th>
                  <th className="py-2 sm:py-3">City</th>
                 </tr>
              </thead>
              <tbody>
                {drivers.map((d) => (
                  <tr key={d.id} className="border-b hover:bg-gray-50 transition">
                    <td className="py-2 sm:py-3 pr-2">#{d.id}</td>
                    <td className="py-2 sm:py-3 pr-2 font-medium">{d.full_name}</td>
                    <td className="py-2 sm:py-3 pr-2">{d.phone_number}</td>
                    <td className="py-2 sm:py-3 pr-2 capitalize">{d.vehicle_type}</td>
                    <td className="py-2 sm:py-3">{d.operating_city}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* PENDING MERCHANTS */}
      <Card className="p-4 sm:p-6 md:p-8 rounded-2xl backdrop-blur-xl bg-white/70 border border-gray-100 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">
            Pending Merchants
          </h2>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
            {merchants.length}
          </span>
        </div>

        {merchants.length === 0 ? (
          <p className="text-xs sm:text-sm text-gray-500">No pending merchants.</p>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-xs sm:text-sm min-w-[500px]">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 sm:py-3 pr-2">Business</th>
                  <th className="py-2 sm:py-3 pr-2">Type</th>
                  <th className="py-2 sm:py-3 pr-2">Location</th>
                  <th className="py-2 sm:py-3">Phone</th>
                </tr>
              </thead>
              <tbody>
                {merchants.map((m) => (
                  <tr key={m.id} className="border-b hover:bg-gray-50 transition">
                    <td className="py-2 sm:py-3 pr-2 font-medium">{m.business_name}</td>
                    <td className="py-2 sm:py-3 pr-2 capitalize">{m.merchant_type}</td>
                    <td className="py-2 sm:py-3 pr-2">{m.location}</td>
                    <td className="py-2 sm:py-3">{m.contact_phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* CATEGORIES */}
      <Card className="p-4 sm:p-6 md:p-8 rounded-2xl backdrop-blur-xl bg-white/70 border border-gray-100 shadow-md space-y-4 sm:space-y-6">

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 className="text-base sm:text-lg font-semibold text-gray-800">
            Categories
          </h2>
          <Button onClick={() => setShowCategoryModal(true)} className="w-full sm:w-auto text-sm">
            + Add Category
          </Button>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {categories.map((cat) => (
            <div key={cat.id} className="border rounded-xl p-4 sm:p-5 bg-white/80">

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                    {cat.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {cat.description}
                  </p>
                </div>

                <div className="flex gap-2 w-full sm:w-auto justify-end">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setShowSubModal(true);
                    }}
                    className="text-xs sm:text-sm"
                  >
                    + Sub
                  </Button>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      setExpandedCategory(
                        expandedCategory === cat.id ? null : cat.id
                      )
                    }
                    className="text-xs sm:text-sm"
                  >
                    {expandedCategory === cat.id ? "▲" : "▼"}
                  </Button>
                </div>

              </div>

              {expandedCategory === cat.id && (
                <div className="mt-3 sm:mt-4 pl-2 sm:pl-4 space-y-1.5 sm:space-y-2">
                  {subcategories
                    .filter(s => s.category_id === cat.id)
                    .map(s => (
                      <div key={s.id} className="text-xs sm:text-sm text-gray-700">
                        • {s.name}
                      </div>
                    ))}
                  {subcategories.filter(s => s.category_id === cat.id).length === 0 && (
                    <p className="text-xs text-gray-400 italic">No subcategories yet</p>
                  )}
                </div>
              )}

            </div>
          ))}
        </div>

      </Card>

      {/* CATEGORY MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-[90%] sm:max-w-md space-y-4 shadow-xl">
            <h2 className="font-semibold text-gray-800 text-base sm:text-lg">Add Category</h2>

            <input
              className="w-full border p-2 sm:p-3 rounded-lg text-sm"
              placeholder="Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />

            <input
              className="w-full border p-2 sm:p-3 rounded-lg text-sm"
              placeholder="Description"
              value={categoryDescription}
              onChange={(e) => setCategoryDescription(e.target.value)}
            />

            <Button onClick={createCategory} className="w-full">Create</Button>
          </div>
        </div>
      )}

      {/* SUBCATEGORY MODAL */}
      {showSubModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 w-full max-w-[90%] sm:max-w-md space-y-4 shadow-xl">
            <h2 className="font-semibold text-gray-800 text-base sm:text-lg">Add Subcategory</h2>

            <input
              className="w-full border p-2 sm:p-3 rounded-lg text-sm"
              placeholder="Name"
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
            />

            <input
              className="w-full border p-2 sm:p-3 rounded-lg text-sm"
              placeholder="Description"
              value={subDescription}
              onChange={(e) => setSubDescription(e.target.value)}
            />

            <Button onClick={createSubcategory} className="w-full">Create</Button>
          </div>
        </div>
      )}

    </div>
  );
}