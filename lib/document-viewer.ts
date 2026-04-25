import axios from "@/services/interceptor";

/**
 * Fetches a document via authenticated proxy (/api/documents/{id}/content)
 * and returns a blob URL safe to assign to <a href> / <iframe src> / window.open.
 *
 * Why proxy: the raw Cloudinary URL is no longer exposed by the backend, so
 * leaking a link outside the system gives no access. The browser must send
 * a valid JWT — only authenticated, authorized users can fetch the bytes.
 *
 * Caller is responsible for revoking the URL when done (see revokeBlobUrl).
 */
export async function fetchDocumentBlobUrl(documentId: number | string): Promise<string> {
  const response = await axios.get(`/api/documents/${documentId}/content`, {
    responseType: "blob",
  });
  // The response interceptor unwraps to response.data on success.
  // For blob requests, that data is the Blob itself.
  const blob = response as unknown as Blob;
  return URL.createObjectURL(blob);
}

/**
 * Opens a document in a new browser tab via authenticated fetch + blob URL.
 * Browsers preview PDFs/images natively; office files trigger download.
 */
export async function openDocumentInTab(documentId: number | string): Promise<void> {
  const blobUrl = await fetchDocumentBlobUrl(documentId);
  const w = window.open(blobUrl, "_blank", "noopener,noreferrer");
  // Revoke after the new tab has had a chance to load — 60s is generous.
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
  if (!w) {
    // Popup blocked — fall back to same-tab navigation.
    window.location.href = blobUrl;
  }
}

/**
 * Triggers a browser download for the document. Uses the /download endpoint
 * which sets Content-Disposition: attachment with the original filename.
 */
export async function downloadDocument(documentId: number | string, suggestedName?: string): Promise<void> {
  const response = await axios.get(`/api/documents/${documentId}/download`, {
    responseType: "blob",
  });
  const blob = response as unknown as Blob;
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  if (suggestedName) a.download = suggestedName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(blobUrl), 5_000);
}

export function revokeBlobUrl(url: string): void {
  if (url.startsWith("blob:")) URL.revokeObjectURL(url);
}
