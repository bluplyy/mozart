import { getSupabaseClient } from "./supabaseClient";

export interface UploadResult {
  url: string;
  path: string;
}

const STORAGE_BUCKET = "product-images";

/**
 * Upload an image file directly to Supabase Storage (product-images bucket).
 * If Supabase is unavailable, converts the file to base64 data URL so offline mode continues seamlessly.
 */
export async function uploadProductImage(file: File): Promise<UploadResult> {
  const supabase = getSupabaseClient();

  // Sanitize filename and create unique timestamped key
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const cleanName = file.name
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-");
  const filePath = `uploads/${Date.now()}-${cleanName}.${ext}`;

  if (supabase) {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type || undefined,
        });

      if (error) {
        console.warn("Supabase storage upload failed, using local DataURL fallback:", error.message);
      } else if (data) {
        const { data: publicData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(data.path);

        return {
          url: publicData.publicUrl,
          path: data.path,
        };
      }
    } catch (err) {
      console.warn("Storage upload exception, fallback to base64:", err);
    }
  }

  // Fallback: convert to base64 DataURL for offline/local resilience
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        url: reader.result as string,
        path: filePath,
      });
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
