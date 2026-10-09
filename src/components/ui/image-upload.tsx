"use client";

import { useState, useRef, useId } from "react";
import { Button } from "./button";
import Image from "next/image";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  onUploadingChange?: (uploading: boolean) => void;
}

export function ImageUpload({ value, onChange, label = "Image", onUploadingChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size === 0 || file.size > 5 * 1024 * 1024) {
      setError("File is too large. Maximum size is 5MB.");
      e.target.value = "";
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setError("Use a JPEG, PNG, WebP, or GIF image.");
      e.target.value = "";
      return;
    }

    setUploading(true);
    onUploadingChange?.(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Failed to upload image");
      }

      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploading(false);
      onUploadingChange?.(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="block text-sm text-muted mb-1.5">{label}</label>
      
      <div className="flex items-start gap-4">
        {value ? (
          <div className="relative w-40 h-40 rounded-lg border border-border overflow-hidden bg-cream flex-shrink-0">
            <Image src={value} alt="Selected image preview" fill unoptimized className="object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-2 right-2 w-6 h-6 bg-black/50 hover:bg-black text-white rounded-full flex items-center justify-center text-xs"
              aria-label="Remove image"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="w-40 h-40 rounded-lg border border-dashed border-border bg-surface flex flex-col items-center justify-center text-muted flex-shrink-0 p-4 text-center">
            <span className="text-sm">No image selected</span>
          </div>
        )}
        
        <div className="flex-1 flex flex-col gap-2">
          <input
            type="file"
            ref={inputRef}
            onChange={handleFileChange}
            className="hidden"
            id={inputId}
            accept="image/jpeg,image/png,image/webp,image/gif"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? "Uploading..." : "Upload File"}
            </Button>
          </div>
          
          <div className="mt-2">
            <p className="text-xs text-muted mb-1">Or provide an external URL:</p>
            <input
              type="url"
              placeholder="https://..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-1.5 text-sm bg-surface"
            />
          </div>
          
          {error && <p className="text-sm text-red mt-1">{error}</p>}
        </div>
      </div>
    </div>
  );
}
