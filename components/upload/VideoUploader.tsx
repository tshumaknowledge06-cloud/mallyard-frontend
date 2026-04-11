"use client";

import { useState, useRef } from "react";

interface Props {
  id?: string;
  endpoint: string;
  onUploaded?: (url: string) => void;
}

export default function VideoUploader({ id, endpoint, onUploaded }: Props) {

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  const MAX_SIZE_MB = 20;

  async function upload() {
    if (loading) return;
    if (!file) return;

    const token = localStorage.getItem("access_token");

    if (!token) {
      alert("Please log in first.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.detail || "Upload failed");
        setLoading(false);
        return;
      }

      onUploaded?.(data.video_url);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";

    } catch {
      alert("Upload error");
    }

    setLoading(false);
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept="video/*"
        onChange={(e) => {
          const selected = e.target.files?.[0];
          if (!selected) return;

          if (selected.size > MAX_SIZE_MB * 1024 * 1024) {
            alert(`Video too large (max ${MAX_SIZE_MB}MB)`);
            return;
          }

          setFile(selected);
        }}
        className="hidden"
      />

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