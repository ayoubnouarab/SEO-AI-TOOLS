import { put } from '@vercel/blob';

// Helper to check if Blob is configured
const isBlobConfigured = (): boolean => {
  try {
    // @ts-ignore
    if (import.meta.env.VITE_BLOB_READ_WRITE_TOKEN) return true;
    // @ts-ignore
    if (process.env.BLOB_READ_WRITE_TOKEN) return true;
    return false;
  } catch (e) {
    return false;
  }
};

const getBlobToken = (): string => {
    try {
        // @ts-ignore
        return import.meta.env.VITE_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN || '';
    } catch(e) { return ''; }
};

export const uploadToBlob = async (file: File | Blob, filename: string): Promise<string> => {
  if (!isBlobConfigured()) {
    console.warn("Vercel Blob is not configured (Missing VITE_BLOB_READ_WRITE_TOKEN). Returning local object URL.");
    return URL.createObjectURL(file);
  }

  try {
    // Client-side upload using the token directly (Note: In production enterprise apps, use a server-side route for token security)
    // For this workspace, we use the direct token method for simplicity.
    const token = getBlobToken();
    
    const blob = await put(filename, file, {
      access: 'public',
      token: token
    });

    return blob.url;
  } catch (error) {
    console.error("Blob Upload Failed:", error);
    // Fallback to local URL if upload fails
    return URL.createObjectURL(file);
  }
};

export const base64ToBlob = async (base64: string): Promise<Blob> => {
    const response = await fetch(base64);
    return await response.blob();
};
