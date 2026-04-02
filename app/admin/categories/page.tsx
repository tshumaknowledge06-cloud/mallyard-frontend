"use client";

import { useEffect, useState } from "react";

import Button from "@/components/ui/Button";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import { fetchWithAuth } from "@/lib/api";

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

export default function AdminCategoriesPage() {

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");

  const [subName, setSubName] = useState("");
  const [subDescription, setSubDescription] = useState("");

  const [expandedCategory, setExpandedCategory] = useState<number | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {

    try {

      const data = await fetchWithAuth("/categories/");
      setCategories(data);

      setCategories(data);

    } catch {

      setError(true);

    }

    finally {
      setLoading(false);
    }

  };

  const loadSubcategories = async () => {

    try {

      const data = await fetchWithAuth("/subcategories/");
      setSubcategories(data);

      setSubcategories(data);

    } catch {

      alert("Failed to load subcategories");

    }

  };

  const createCategory = async () => {

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

      loadCategories();

    } catch {

      alert("Failed to create category");

    }

  };

  const createSubcategory = async () => {

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

      loadSubcategories();

    } catch {

      alert("Failed to create subcategory");

    }

  };

  const toggleDropdown = async (categoryId: number) => {

    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
      return;
    }

    await loadSubcategories();
    setExpandedCategory(categoryId);

  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message="Failed to load categories" />;

  return (

    <div className="max-w-5xl mx-auto space-y-6">

      <div className="flex justify-between items-center">

        <h1 className="text-2xl font-bold">
          Manage Categories
        </h1>

        <Button onClick={() => setShowCategoryModal(true)}>
          + Add Category
        </Button>

      </div>

      {categories.map((category) => (

        <div
          key={category.id}
          className="border rounded-lg p-4"
        >

          <div className="flex justify-between items-center">

            <div>

              <h2 className="font-semibold">
                {category.name}
              </h2>

              <p className="text-sm text-gray-500">
                {category.description}
              </p>

            </div>

            <div className="flex gap-2">

              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedCategory(category.id);
                  setShowSubModal(true);
                }}
              >
                +
              </Button>

              <Button
                variant="secondary"
                onClick={() => toggleDropdown(category.id)}
              >
                ▼
              </Button>

            </div>

          </div>

          {expandedCategory === category.id && (

            <div className="mt-4 pl-4 space-y-2">

              {subcategories
                .filter(
                  (sub) => sub.category_id === category.id
                )
                .map((sub) => (

                  <div
                    key={sub.id}
                    className="text-sm text-gray-700"
                  >
                    • {sub.name}
                  </div>

                ))}

            </div>

          )}

        </div>

      ))}

      {showCategoryModal && (

        <div className="fixed inset-0 flex items-center justify-center bg-black/40">

          <div className="bg-white p-6 rounded-lg space-y-4 w-96">

            <h2 className="font-semibold">
              Add Category
            </h2>

            <input
              className="w-full border p-2"
              placeholder="Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />

            <input
              className="w-full border p-2"
              placeholder="Description"
              value={categoryDescription}
              onChange={(e) => setCategoryDescription(e.target.value)}
            />

            <Button onClick={createCategory}>
              Create
            </Button>

          </div>

        </div>

      )}

      {showSubModal && (

        <div className="fixed inset-0 flex items-center justify-center bg-black/40">

          <div className="bg-white p-6 rounded-lg space-y-4 w-96">

            <h2 className="font-semibold">
              Add Subcategory
            </h2>

            <input
              className="w-full border p-2"
              placeholder="Name"
              value={subName}
              onChange={(e) => setSubName(e.target.value)}
            />

            <input
              className="w-full border p-2"
              placeholder="Description"
              value={subDescription}
              onChange={(e) => setSubDescription(e.target.value)}
            />

            <Button onClick={createSubcategory}>
              Create
            </Button>

          </div>

        </div>

      )}

    </div>

  );
}