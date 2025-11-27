
// Helper to check if Blob is configured
// We now have a hardcoded fallback token provided by the user
const HARDCODED_TOKEN = "vercel_blob_rw_37p6t7QisdCFUEZl_R54USMdjnktiz5iUADXDSj7vfiTE6q";

const isBlobConfigured = (): boolean => {
  // Always true now since we have a hardcoded token
  return true;
};

const getBlobToken = (): string => {
    try {
        // @ts-ignore
        const envToken = import.meta.env.VITE_BLOB_READ_WRITE_TOKEN || process.env.BLOB_READ_WRITE_TOKEN;
        if (envToken) return envToken;
    } catch(e) {}
    
    return HARDCODED_TOKEN;
};

export const uploadToBlob = async (file: File | Blob, filename: string): Promise<string> => {
  if (!isBlobConfigured()) {
    console.warn("Vercel Blob is not configured. Returning local object URL.");
    return URL.createObjectURL(file);
  }

  try {
    // Dynamic import to prevent Node.js dependencies from crashing the browser on initial load
    const { put } = await import('@vercel/blob');
    
    const token = getBlobToken();
    
    // Use 'put' with the token. 
    // Note: Client-side 'put' with a read-write token is risky for production but works for this workspace.
    const blob = await put(filename, file, {
      access: 'public',
      token: token,
      contentType: file.type
    });

    return blob.url;
  } catch (error) {
    console.error("Blob Upload Failed:", error);
    // Fallback to local URL if upload fails so the app keeps working
    return URL.createObjectURL(file);
  }
};

export const base64ToBlob = async (base64: string): Promise<Blob> => {
    const response = await fetch(base64);
    return await response.blob();
};
