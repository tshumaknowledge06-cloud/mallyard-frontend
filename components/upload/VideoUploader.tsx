"use client";

import { useState, useRef } from "react";
import { fetchWithAuth } from "@/lib/api";

interface Props {
  id?: string;
  endpoint: string;
  onUploaded?: (url: string) => void;
}

export default function VideoUploader({ id, endpoint, onUploaded }: Props) {

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const MAX_SIZE_MB = 20;

  async function upload() {
    // 🔥 PREVENT DOUBLE UPLOAD
    if (loading) return;
    
    if (!file) return;

    // 🔥 TOKEN SAFETY
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Please log in first.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // 🔥 FIX: Use fetchWithAuth (no manual Content-Type header for FormData)
      const data = await fetchWithAuth(endpoint, {
        method: "POST",
        body: formData,
      });

      onUploaded?.(data.video_url);

      setFile(null);
      
      // 🔥 CLEAR INPUT PROPERLY
      if (inputRef.current) inputRef.current.value = "";

    } catch (err: any) {
      console.error("Video upload error:", err);
      alert(err?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">

      {/* ✅ FIXED INPUT */}
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="video/*"
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (!selected) return;

          // 🔥 FILE SIZE GUARD
          if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
            alert(`Video too large (max ${MAX_SIZE_MB}MB)`);
            return;
          }

          setFile(selected);
        }}
        className="hidden"
      />

      {/* 🔥 UX IMPROVEMENT: SHOW SELECTED FILE NAME */}
      {file && (
        <p className="text-xs text-gray-500 truncate">
          {file.name}
        </p>
      )}

      {file && (
        <button
          onClick={upload}
          disabled={loading}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded transition disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Upload Video"}
        </button>
      )}

    </div>
  );
}