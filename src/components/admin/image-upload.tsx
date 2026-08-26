"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, Loader2, AlertCircle } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  defaultValue?: string;
  name?: string;
}

export function ImageUpload({
  defaultValue = "",
  name = "imageUrl",
}: ImageUploadProps) {
  const [url, setUrl] = useState<string>(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Upload file to the public 'product' bucket
      const { data, error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("products").getPublicUrl(filePath);

      setUrl(publicUrl);
    } catch (err: any) {
      console.error("Upload failed:", err);
      setError(
        err.message ||
          'Failed to upload image. Make sure the "product" bucket is created and public in Supabase.',
      );
    } finally {
      setUploading(false);
    }
  }

  function handleRemove() {
    setUrl("");
    setError("");
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        Product Image
      </label>

      {/* Hidden input to hold the value for form submission */}
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div className="relative w-40 h-40 rounded-xl overflow-hidden border border-gray-200 group">
          <Image
            src={url}
            alt="Product Preview"
            fill
            sizes="160px"
            className="object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex justify-center items-center w-full">
          <label className="flex flex-col justify-center items-center w-full h-32 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-100 hover:border-[#D4AF37] transition-all">
            <div className="flex flex-col justify-center items-center pt-5 pb-6">
              {uploading ? (
                <>
                  <Loader2 className="h-8 w-8 text-[#D4AF37] animate-spin mb-2" />
                  <p className="text-sm text-gray-500">
                    Uploading to Supabase Storage...
                  </p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">Click to upload</span>{" "}
                    product photo
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG, WEBP up to 5MB
                  </p>
                </>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 mt-1 bg-red-50 p-2.5 rounded-lg border border-red-100">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
