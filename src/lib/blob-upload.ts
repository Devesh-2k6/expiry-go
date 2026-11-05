import { put } from "@vercel/blob";

const BLOB_TOKEN =
  process.env.BLOB_READ_WRITE_TOKEN ||
  "vercel_blob_rw_ntKd7vsAVWrEywtx_ibzEnUJNAegcuyfZhRLRYBHJ4jPyfb";

export async function uploadFileToBlobOrBase64(
  file: File,
  folder = "uploads"
): Promise<{ url: string; filename: string }> {
  const ext = (file.name || "upload").split(".").pop() || "bin";
  const uniqueName = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 9)}.${ext}`;

  try {
    const blob = await put(uniqueName, file, {
      access: "public",
      token: BLOB_TOKEN,
    });
    if (blob && blob.url) {
      return { url: blob.url, filename: file.name };
    }
  } catch (err) {
    console.warn("[BLOB UPLOAD] Vercel Blob upload failed, falling back to data URL:", err);
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString("base64");
  const mime = file.type || "application/octet-stream";
  return {
    url: `data:${mime};base64,${base64}`,
    filename: file.name,
  };
}

