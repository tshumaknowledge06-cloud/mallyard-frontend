"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api";
import { getMediaUrl } from "@/lib/getMediaUrl";

import ImageUploader from "@/components/upload/ImageUploader";
import VideoUploader from "@/components/upload/VideoUploader";

export default function ListingsPage() {
  const [form, setForm] = useState<any>({
    name: "",
    description: "",
    price: 0,
    currency: "USD",
    listing_type: "product",
    stock_quantity: 0,
    service_duration_minutes: 0,
    subcategory_id: 0
  });

  const [listings, setListings] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [reviewsMap, setReviewsMap] = useState<Record<number, any[]>>({});
  const [openReviews, setOpenReviews] = useState<number | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const [mediaIndex, setMediaIndex] = useState<Record<number, number>>({});

  useEffect(() => {
    loadListings();
    loadSubcategories();
  }, []);

  async function loadListings() {
    try {
      const data = await fetchWithAuth("/listings/mine");
      const list = Array.isArray(data) ? data : data?.listings || [];
      setListings(list);
      list.forEach((l: any) => loadReviews(l.id));
    } catch {
      setListings([]);
    }
    setLoading(false);
  }

  async function loadSubcategories() {
    try {
      const data = await fetchWithAuth("/subcategories/");
      if (Array.isArray(data)) setSubcategories(data);
    } catch {}
  }

  async function loadReviews(id: number) {
    try {
      const res = await fetchWithAuth(`/reviews/${id}`);
      setReviewsMap(prev => ({ ...prev, [id]: res || [] }));
    } catch {}
  }

  async function deleteImage(listingId: number, img: string) {
    await fetchWithAuth(`/listings/${listingId}/images?image_url=${encodeURIComponent(img)}`, {
      method: "DELETE"
    });
    loadListings();
  }

  async function deleteVideo(listingId: number) {
    await fetchWithAuth(`/listings/${listingId}/video`, {
      method: "DELETE"
    });
    loadListings();
  }

  async function deleteListing(id: number) {
    if (!confirm("Delete this listing?")) return;

    await fetchWithAuth(`/listings/${id}`, {
      method: "DELETE"
    });

    loadListings();
  }

  function nextMedia(id: number, total: number) {
    setMediaIndex(prev => ({
      ...prev,
      [id]: ((prev[id] || 0) + 1) % total
    }));
  }

  function prevMedia(id: number, total: number) {
    setMediaIndex(prev => ({
      ...prev,
      [id]: ((prev[id] || 0) - 1 + total) % total
    }));
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-10 space-y-10">
      {/* CREATE */}
      <div className="bg-white/80 backdrop-blur border rounded-2xl shadow-md p-6 space-y-4">
        <h2 className="text-lg font-semibold text-emerald-900">
          Create Listing
        </h2>

        <input
          placeholder="Listing Name"
          className="border p-2 w-full rounded-lg"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />

        <textarea
          placeholder="Description"
          className="border p-2 w-full rounded-lg"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-3">
          {/* PRICE */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500">Price</p>
            <input
              type="number"
              className="border p-2 w-full rounded-lg"
              value={form.price}
              onChange={e => setForm({ ...form, price: Number(e.target.value) })}
            />
          </div>

          {/* CURRENCY */}
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500">Currency</p>
            <select
              className="border p-2 w-full rounded-lg"
              value={form.currency}
              onChange={e => setForm({ ...form, currency: e.target.value })}
            >
              <option value="USD">USD</option>
              <option value="ZAR">ZAR</option>
              <option value="ZWL">ZWL</option>
              <option value="NGN">NGN</option>
              <option value="KES">KES</option>
              <option value="KES">INR</option>
            </select>
          </div>
        </div>

        <select
          className="border p-2 w-full rounded-lg"
          value={form.listing_type}
          onChange={e => setForm({ ...form, listing_type: e.target.value })}
        >
          <option value="product">Product</option>
          <option value="service">Service</option>
        </select>

        {form.listing_type === "product" && (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500">Stock Quantity</p>
            <input
              type="number"
              className="border p-2 w-full rounded-lg"
              value={form.stock_quantity}
              onChange={e => setForm({ ...form, stock_quantity: Number(e.target.value) })}
            />
          </div>
        )}

        {form.listing_type === "service" && (
          <input
            type="number"
            placeholder="Service Duration"
            className="border p-2 w-full rounded-lg"
            value={form.service_duration_minutes}
            onChange={e => setForm({ ...form, service_duration_minutes: Number(e.target.value) })}
          />
        )}

        <select
          className="border p-2 w-full rounded-lg"
          value={form.subcategory_id}
          onChange={e => setForm({ ...form, subcategory_id: Number(e.target.value) })}
        >
          <option value={0}>Select Subcategory</option>
          {subcategories.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <button
          onClick={async () => {
            if (!form.name || !form.subcategory_id) {
              alert("Please select subcategory");
              return;
            }

            await fetchWithAuth("/listings/", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(form)
            });

            loadListings();
          }}
          className="w-full bg-emerald-600 text-white py-2 rounded-lg"
        >
          Create Listing
        </button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {listings.map(l => {
          const media = [
            ...(l.image_urls || []),
            ...(l.video_url ? [l.video_url] : [])
          ];

          const index = mediaIndex[l.id] || 0;
          const current = media[index];

          return (
            <div
              key={l.id}
              className="bg-white rounded-2xl shadow-sm p-3 md:p-4 flex flex-col justify-between h-[380px] md:h-[440px]"
            >
              {/* MEDIA */}
              <div
                className="relative w-full h-28 md:h-40 rounded-lg overflow-hidden bg-gray-100 touch-pan-y"
                onTouchStart={(e: any) => {
                  const startX = e.touches[0].clientX;

                  const handleEnd = (end: any) => {
                    const diff = end.changedTouches[0].clientX - startX;
                    if (diff > 50) prevMedia(l.id, media.length);
                    if (diff < -50) nextMedia(l.id, media.length);
                  };

                  e.target.addEventListener("touchend", handleEnd, { once: true });
                }}
              >
                {current && current.includes("video")
                  ? <video src={getMediaUrl(current)} className="w-full h-full object-cover" controls />
                  : <img src={getMediaUrl(current)} className="w-full h-full object-cover" />
                }

                {current && (
                  <button
                    onClick={() => current.includes("video")
                      ? deleteVideo(l.id)
                      : deleteImage(l.id, current)
                    }
                    className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded"
                  >
                    ✕
                  </button>
                )}

                {media.length > 1 && (
                  <>
                    <button
                      onClick={() => prevMedia(l.id, media.length)}
                      className="hidden md:block absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 px-2 rounded"
                    >
                      ◀
                    </button>

                    <button
                      onClick={() => nextMedia(l.id, media.length)}
                      className="hidden md:block absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 px-2 rounded"
                    >
                      ▶
                    </button>
                  </>
                )}
              </div>

              {/* DETAILS */}
              <div className="mt-3 space-y-1">
                <p className="font-semibold text-sm md:text-base line-clamp-2">
                  {l.name}
                </p>
                <p className="text-xs md:text-sm text-gray-500 line-clamp-2">
                  {l.description}
                </p>
                <p className="text-emerald-700 font-semibold text-sm md:text-base">
                  {l.currency} {l.price}
                </p>
              </div>

              <div className="h-[1px] bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 my-2 opacity-70" />

              {/* ACTIONS */}
              <div className="space-y-2">
                {/* MEDIA BUTTONS */}
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 mb-1">
                    Media
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    {/* IMAGE BUTTON */}
                    <button
                      onClick={() =>
                        document.getElementById(`img-upload-${l.id}`)?.click()
                      }
                      className="
                        text-[11px]
                        py-2
                        rounded-xl
                        border border-yellow-400/30
                        text-yellow-600
                        bg-white
                        hover:border-yellow-500
                        hover:text-yellow-700
                        hover:shadow-[0_0_10px_rgba(234,179,8,0.35)]
                        transition
                      "
                    >
                      + Images
                    </button>

                    {/* VIDEO BUTTON */}
                    <button
                      onClick={() =>
                        document.getElementById(`vid-upload-${l.id}`)?.click()
                      }
                      className="
                        text-[11px]
                        py-2
                        rounded-xl
                        border border-yellow-400/30
                        text-yellow-600
                        bg-white
                        hover:border-yellow-500
                        hover:text-yellow-700
                        hover:shadow-[0_0_10px_rgba(234,179,8,0.35)]
                        transition
                      "
                    >
                      + Video
                    </button>
                  </div>

                  {/* ✅ KEEP UPLOADERS MOUNTED (NOT HIDDEN) */}
                  <div className="mt-2 space-y-2">
                    <ImageUploader
                      id={`img-upload-${l.id}`}
                      endpoint={`/listings/${l.id}/upload-images`}
                      onUploaded={loadListings}
                    />

                    <VideoUploader
                      id={`vid-upload-${l.id}`}
                      endpoint={`/listings/${l.id}/upload-video`}
                      onUploaded={loadListings}
                    />
                  </div>
                </div>

                {/* ACTION ROW */}
                <div className="flex justify-between">
                  <button
                    onClick={() => { setEditingId(l.id); setEditForm(l); }}
                    className="text-xs text-emerald-700"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteListing(l.id)}
                    className="text-red-500"
                  >
                    🗑
                  </button>
                </div>

                {/* REVIEWS */}
                <button
                  onClick={() => setOpenReviews(openReviews === l.id ? null : l.id)}
                  className="text-xs text-blue-600"
                >
                  {openReviews === l.id ? "Hide Reviews" : "See Reviews →"}
                </button>

                {openReviews === l.id && (
                  <div className="bg-gray-50 p-2 rounded text-xs">
                    {reviewsMap[l.id]?.map(r => (
                      <div key={r.id}>
                        <p>{r.content}</p>
                        <p className="text-gray-400">— {r.user_name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* EDIT MODAL */}
              {editingId && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
                  <div className="bg-white p-6 rounded-2xl w-[95%] md:w-[520px] space-y-3">
                    <input
                      value={editForm.name || ""}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      className="border p-2 w-full rounded"
                    />

                    <textarea
                      value={editForm.description || ""}
                      onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                      className="border p-2 w-full rounded"
                    />

                    <input
                      type="number"
                      placeholder="Price"
                      value={editForm.price || 0}
                      onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })}
                      className="border p-2 w-full rounded"
                    />

                    {/* STOCK QUANTITY (ONLY FOR PRODUCTS) */}
                    {editForm.listing_type === "product" && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-gray-500">Stock Quantity</p>
                        <input
                          type="number"
                          value={editForm.stock_quantity || 0}
                          onChange={e => setEditForm({ ...editForm, stock_quantity: Number(e.target.value) })}
                          className="border p-2 w-full rounded"
                        />
                      </div>
                    )}

                    <select
                      value={editForm.subcategory_id || ""}
                      onChange={e => setEditForm({ ...editForm, subcategory_id: Number(e.target.value) })}
                      className="border p-2 w-full rounded"
                    >
                      <option value="">Select Subcategory</option>
                      {subcategories.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>

                    <button
                      onClick={async () => {
                        await fetchWithAuth(`/listings/${editingId}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            ...editForm,
                            subcategory_id: editForm.subcategory_id || undefined
                          })
                        });

                        setEditingId(null);
                        loadListings();
                      }}
                      className="bg-emerald-600 text-white w-full py-2 rounded"
                    >
                      Save
                    </button>

                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditForm({});
                      }}
                      className="w-full py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}