"use client";

import { useState } from "react";

interface Props {
  endpoint: string;
  multiple?: boolean;
  onUploaded?: (urls: string[]) => void;
  id?: string;
}

export default function ImageUploader(props: Props) {

  const {
    id,
    endpoint,
    multiple = true,
    onUploaded
  } = props; 

  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const MAX_SIZE_MB = 5;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);

    // 🔥 FILE SIZE GUARD
    const validFiles = selectedFiles.filter(file => {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        alert(`${file.name} is too large (max ${MAX_SIZE_MB}MB)`);
        return false;
      }
      return true;
    });

    // 🔥 FILE DUPLICATION CONTROL
    setFiles((prev) => {
      const existingNames = new Set(prev.map(f => f.name));
      const newFiles = validFiles.filter(f => !existingNames.has(f.name));
      return [...prev, ...newFiles];
    });
  }

  async function upload() {
    // 🔥 PREVENT DUPLICATE UPLOAD CLICK
    if (loading) return;
    
    if (files.length === 0) return;

    // 🔥 TOKEN SAFETY
    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Please log in first.");
      return;
    }

    setLoading(true);

    const formData = new FormData();

    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      // 🔥 BETTER ERROR HANDLING
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.detail || "Upload failed");
        setLoading(false);
        return;
      }

      onUploaded?.(data.image_urls || data.images || []);

      // ✅ Clear after upload
      setFiles([]);

    } catch {
      alert("Upload error");
    }

    setLoading(false);
  }

  return (
    <div className="space-y-3">

      {/* FILE INPUT */}
      <input
        id={id}
        type="file"
        multiple={multiple}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden" 
      />

      {/* PREVIEW (🔥 PREMIUM TOUCH) */}
      {files.length > 0 && (
        <div className="flex gap-2 overflow-x-auto">
          {files.map((file, i) => {
            // 🔥 MEMORY LEAK FIX: Create and revoke URL
            const previewUrl = URL.createObjectURL(file);
            return (
              <img
                key={i}
                src={previewUrl}
                className="w-16 h-16 object-cover rounded border"
                alt="preview"
                onLoad={() => URL.revokeObjectURL(previewUrl)}
              />
            );
          })}
        </div>
      )}

      {/* UPLOAD BUTTON */}
      {files.length > 0 && (
        <button
          onClick={upload}
          disabled={loading}
          className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded"
        >
          {loading ? "Uploading..." : `Upload ${files.length} ${files.length === 1 ? "Image" : "Images"}`}
        </button>
      )}

    </div>
  );
}