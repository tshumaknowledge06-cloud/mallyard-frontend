"use client";

import { useEffect, useState, useRef } from "react";
import { fetchWithAuth } from "@/lib/api";
import { getMediaUrl } from "@/lib/getMediaUrl";

import ImageUploader from "@/components/upload/ImageUploader";
import VideoUploader from "@/components/upload/VideoUploader";

// 🔥 Bulletproof video detection by file extension
const isVideo = (url: string) => {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov|avi|mkv)$/i.test(url);
};

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

  // 🔥 State for success notification
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [newListingId, setNewListingId] = useState<number | null>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const newListingRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadListings();
    loadSubcategories();
  }, []);

  // 🔥 Auto-scroll to new listing AFTER toast disappears
  useEffect(() => {
    if (shouldScroll && newListingId && newListingRef.current) {
      setTimeout(() => {
        newListingRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        // Reset scroll flag after scrolling
        setShouldScroll(false);
      }, 300);
    }
  }, [shouldScroll, newListingId, listings]);

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

  // 🔥 Handle create listing with sequential flow
  async function handleCreateListing() {
    if (!form.name || !form.subcategory_id) {
      alert("Please select subcategory");
      return;
    }

    try {
      const response = await fetchWithAuth("/listings/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      // ✅ Store the new listing ID
      if (response && response.id) {
        setNewListingId(response.id);
      }

      // ✅ Show toast first
      setSuccessMessage("✅ Listing Created! Now add images and a video to make it stand out. (Max 5MB per image)");
      setShowSuccess(true);
      
      // ✅ Wait 4 seconds for toast to be visible
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // ✅ Hide toast
      setShowSuccess(false);
      
      // ✅ Trigger scroll AFTER toast disappears
      setShouldScroll(true);
      
      // ✅ Load listings in background
      await loadListings();
      
      // ✅ Reset form
      setForm({
        name: "",
        description: "",
        price: 0,
        currency: "USD",
        listing_type: "product",
        stock_quantity: 0,
        service_duration_minutes: 0,
        subcategory_id: 0
      });
      
    } catch {
      alert("Failed to create listing");
    }
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-10 space-y-10">
      
      {/* 🔥 Golden Tip Bar */}
      <div className="bg-gradient-to-r from-yellow-50/80 via-yellow-100/50 to-yellow-50/80 backdrop-blur-sm border border-yellow-200/50 rounded-xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="text-yellow-500 text-xl mt-0.5">💡</span>
          <div>
            <p className="text-sm font-semibold text-yellow-700">
              Pro Tip:
            </p>
            <p className="text-sm text-yellow-700/90">
              Fill your product or service details clearly, then add high-quality images (max 5MB each) and one video per listing. Clear, transparent information builds trust and helps customers choose you.
            </p>
          </div>
        </div>
      </div>

      {/* 🔥 Success Notification */}
      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <span className="text-emerald-500 text-xl">✅</span>
            <p className="text-sm text-emerald-700">
              {successMessage}
            </p>
          </div>
        </div>
      )}

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
              onChange={e =>
                setForm((prev: any) => ({
                  ...prev,
                  currency: e.target.value
               }))
              }
            >
              <option value="USD">USD</option>
              <option value="ZAR">ZAR</option>
              <option value="ZWL">ZWL</option>
              <option value="NGN">NGN</option>
              <option value="KES">KES</option>
              <option value="INR">INR</option>
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
          onClick={handleCreateListing}
          className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition"
        >
          Create Listing
        </button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {listings.map((l, index) => {
          const media = [
            ...(l.image_urls || []),
            ...(l.video_url ? [l.video_url] : [])
          ];

          const indexMedia = mediaIndex[l.id] || 0;
          const current = media[indexMedia];
          
          // Check if this is the newly created listing
          const isNewListing = l.id === newListingId;

          return (
            <div
              key={l.id}
              ref={isNewListing ? newListingRef : null}
              className={`
                bg-white rounded-2xl shadow-sm p-3 md:p-4 flex flex-col justify-between h-[380px] md:h-[440px]
                transition-all duration-500
                ${isNewListing ? "ring-2 ring-yellow-400 shadow-lg shadow-yellow-200/50" : ""}
              `}
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
                {current && isVideo(current)
                  ? <video src={getMediaUrl(current)} className="w-full h-full object-cover" controls />
                  : <img src={getMediaUrl(current)} className="w-full h-full object-cover" />
                }

                {current && (
                  <button
                    onClick={() => isVideo(current)
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