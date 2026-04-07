import axios from "../interceptor";

export enum DocumentType {
    Pitch_Deck = 0,
    Bussiness_Plan = 1
}

interface IDocumentRequest{
    file : File
    documentType : DocumentType
    title : string
    version : string
}

interface IAddMetaDataRequest {
    title? : string
    documentType? : DocumentType
    isArchived? : boolean
}

export const UploadDocument = (data: IDocumentRequest) => {
    const formData = new FormData();
    formData.append("file", data.file);
    // FormData.append expects string/Blob; DocumentType is numeric enum.
    formData.append("documentType", data.documentType.toString());
    formData.append("title", data.title);
    formData.append("version", data.version);
    return axios.post<IBackendRes<string>>("/api/documents", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });
}

export const GetDocument = () => {
    return axios.get<IBackendRes<IDocument[]>>("/api/documents");
}
 
export const GetDocumentById = (documentId: number) => {
    return axios.get<IBackendRes<IDocument>>(`/api/documents/${documentId}`);
}


export const DeleteDocument = (documentId: string) => {
    return axios.delete<IBackendRes<string>>(`/api/documents/${documentId}`);
}

export const AddMetaData = (documentId : number, data: IAddMetaDataRequest                                                                                                                            ) => {
    return axios.put<IBackendRes<string>>(`/api/documents/${documentId}/metadata`, data);
}

// -------------------------- Blockchain --------------------------
export const HashDocument = (documentId: number) => {
    return axios.post<IBackendRes<string>>(`/api/documents/${documentId}/hash`);
}

export const SubmitDocumentToBlockchain = (documentId: number) => {
    return axios.post<IBackendRes<string>>(`/api/documents/${documentId}/submit-chain`);
}

export const VerifyDocumentOnchain = (documentId: number) => {
    return axios.get<IBackendRes<string>>(`/api/documents/${documentId}/verify-chain`);
}

export const CheckOnchainStatus = (documentId: number) => {
    return axios.get<IBackendRes<IBlockchainVerification>>(`/api/documents/${documentId}/chain/tx-status`);
}

// export const VerifyDocumentOnchainByStaff = (documentId: string) => {
//     return axios.post<IBackendRes<IBlockchainChecking>>(`/api/staff/documents/${documentId}/check-onchain-hash`);
// }


