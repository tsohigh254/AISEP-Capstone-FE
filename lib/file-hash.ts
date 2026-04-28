/**
 * Compute SHA-256 of a File entirely in the browser using SubtleCrypto.
 * The file never leaves the user's machine — only the 64-char hex digest
 * is what we send to the server for blockchain lookup.
 *
 * onProgress(0..1) is called as we stream the file through the hasher,
 * so callers can show a progress bar for large PDFs.
 */
export async function sha256File(
    file: File,
    onProgress?: (ratio: number) => void
): Promise<string> {
    if (!crypto?.subtle) {
        throw new Error("SubtleCrypto is not available — verify requires HTTPS or localhost.");
    }

    // Small files: hash the whole buffer in one shot, no chunking overhead.
    const SMALL = 4 * 1024 * 1024; // 4MB
    if (file.size <= SMALL) {
        onProgress?.(0);
        const buf = await file.arrayBuffer();
        const digest = await crypto.subtle.digest("SHA-256", buf);
        onProgress?.(1);
        return toHex(digest);
    }

    // Large files: stream chunks. SubtleCrypto has no incremental API, so we
    // accumulate into a single ArrayBuffer — the only benefit is progress UI
    // (browsers can read 5MB chunks without freezing the tab).
    const reader = file.stream().getReader();
    const chunks: Uint8Array[] = [];
    let read = 0;
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        read += value.byteLength;
        onProgress?.(Math.min(0.99, read / file.size));
    }
    const merged = concat(chunks);
    const digest = await crypto.subtle.digest("SHA-256", merged as BufferSource);
    onProgress?.(1);
    return toHex(digest);
}

function concat(chunks: Uint8Array[]): Uint8Array {
    const total = chunks.reduce((n, c) => n + c.byteLength, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    for (const c of chunks) {
        out.set(c, offset);
        offset += c.byteLength;
    }
    return out;
}

function toHex(buf: ArrayBuffer): string {
    const bytes = new Uint8Array(buf);
    let s = "";
    for (let i = 0; i < bytes.length; i++) {
        s += bytes[i].toString(16).padStart(2, "0");
    }
    return s;
}
