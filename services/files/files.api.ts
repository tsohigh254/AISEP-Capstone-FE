import instance from "@/services/interceptor";

/**
 * Upload a generic file as a chat attachment.
 * Supports all roles.
 */
export const UploadChatAttachment = async (file: File): Promise<IBackendRes<string>> => {
    const formData = new FormData();
    formData.append("file", file);
    
    return instance.post("/api/files/upload-attachment", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    }) as any;
};
