
export type BlockchainStatus = "not_submitted" | "pending" | "recorded" | "matched" | "mismatch" | "failed";
export type Visibility = "private" | "investors" | "advisors" | "both";
export type DocType = "Pitch Deck" | "Tài chính" | "Pháp lý" | "Kỹ thuật" | "Khác";

export interface Doc {
    id: string;
    name: string;
    type: DocType;
    tags: string[];
    visibility: Visibility;
    version: string;
    updatedAt: string;
    blockchainStatus: BlockchainStatus;
    size: string;
    uploader: string;
    role?: string;
    description?: string;
    createdAt?: string;
    hash?: string;
    txHash?: string;
    recordedAt?: string;
    network?: string;
    txHashShort?: string;
    lastChecked?: string;
}

export interface VersionRow {
    version: string;
    isCurrent?: boolean;
    uploader: string;
    date: string;
    blockchainStatus: BlockchainStatus;
    size: string;
    hashShort: string;
}

export const MOCK_DOCS: Doc[] = [
    { 
        id: "1", 
        name: "Pitch_Deck_NextGen_v2.pdf", 
        type: "Pitch Deck", 
        tags: ["2026", "Series A"], 
        visibility: "investors", 
        version: "v2", 
        updatedAt: "12/02/2026", 
        createdAt: "12/01/2026",
        blockchainStatus: "recorded", 
        size: "2.4 MB", 
        uploader: "Nguyễn Văn A", 
        role: "Founder",
        description: "Kế hoạch kinh doanh chi tiết cho vòng gọi vốn Series A năm 2026.",
        hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
        txHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b",
        recordedAt: "12/02/2026 · 15:30",
        network: "Ethereum Sepolia",
        txHashShort: "0x1a2b...c3d4",
        lastChecked: "12/02 · 15:30"
    },
    { 
        id: "2", 
        name: "Financial_Report_Q4.xlsx", 
        type: "Tài chính", 
        tags: ["Q4", "2025"], 
        visibility: "private", 
        version: "v1", 
        updatedAt: "10/02/2026", 
        createdAt: "01/01/2026",
        blockchainStatus: "pending", 
        size: "1.1 MB", 
        uploader: "Trần Thị B", 
        role: "CFO",
        description: "Báo cáo tài chính quý 4 năm 2025.",
        hash: "f4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4g5",
        txHash: "0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f",
        recordedAt: "10/02/2026 · 09:15",
        network: "Ethereum Sepolia",
        txHashShort: "0x5e6f...7890",
        lastChecked: "10/02 · 09:15"
    },
    { 
        id: "3", 
        name: "Algorithm_Core_Specs.txt", 
        type: "Kỹ thuật", 
        tags: ["core", "algorithm"], 
        visibility: "private", 
        version: "v3", 
        updatedAt: "08/02/2026", 
        createdAt: "01/02/2026",
        blockchainStatus: "not_submitted", 
        size: "0.5 MB", 
        uploader: "Nguyễn Văn A",
        role: "CTO",
        description: "Thông số kỹ thuật cốt lõi của thuật toán AI.",
        hash: "—",
        txHash: "—",
        recordedAt: "—",
        network: "—",
    },
    { 
        id: "4", 
        name: "Trade_Secrets_V1.zip", 
        type: "Pháp lý", 
        tags: ["IP", "confidential"], 
        visibility: "private", 
        version: "v1", 
        updatedAt: "05/02/2026", 
        createdAt: "01/02/2026",
        blockchainStatus: "failed", 
        size: "15.8 MB", 
        uploader: "Lê Văn C",
        role: "Legal Lead",
        description: "Tài liệu bí mật kinh doanh và sở hữu trí tuệ.",
        hash: "—",
        txHash: "—",
        recordedAt: "—",
        network: "—",
    },
    { 
        id: "5", 
        name: "Product_Roadmap_2026.pptx", 
        type: "Pitch Deck", 
        tags: ["roadmap"], 
        visibility: "advisors", 
        version: "v2", 
        updatedAt: "01/02/2026", 
        createdAt: "15/01/2026",
        blockchainStatus: "matched", 
        size: "5.2 MB", 
        uploader: "Nguyễn Văn A",
        role: "Founder",
        description: "Lộ trình phát triển sản phẩm năm 2026.",
        hash: "0x7b8c...d9e0",
        txHash: "0x7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4g5h6i",
        recordedAt: "01/02/2026 · 14:45",
        network: "Ethereum Mainnet",
        txHashShort: "0x7b8c...d9e0",
        lastChecked: "01/02 · 14:45"
    },
    { 
        id: "6", 
        name: "Term_Sheet_Draft_v3.pdf", 
        type: "Pháp lý", 
        tags: ["legal", "terms"], 
        visibility: "investors", 
        version: "v3", 
        updatedAt: "28/01/2026", 
        createdAt: "20/01/2026",
        blockchainStatus: "mismatch", 
        size: "0.8 MB", 
        uploader: "Trần Thị B",
        role: "CFO",
        description: "Bản nháp Term Sheet cho vòng gọi vốn tiếp theo.",
        hash: "0xa1b2...c3d4",
        txHash: "0xa1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0",
        recordedAt: "28/01/2026 · 10:00",
        network: "Ethereum Sepolia",
        txHashShort: "0xa1b2...c3d4",
        lastChecked: "28/01 · 10:00"
    },
];

export const getDocVersions = (docId: string): VersionRow[] => {
    // For now, return generic versions or specific ones based on ID
    return [
        { version: "v4.0.0", isCurrent: true,  uploader: "Nguyễn Văn A", date: "14/02/2026", blockchainStatus: "matched",       size: "4.8 MB", hashShort: "e3b0c4...b855" },
        { version: "v3.2.1",                   uploader: "Trần Thị B",   date: "08/02/2026", blockchainStatus: "recorded",      size: "4.5 MB", hashShort: "f4c5d6...a1b2" },
        { version: "v2.1.0",                   uploader: "Nguyễn Văn A", date: "01/02/2026", blockchainStatus: "not_submitted", size: "4.2 MB", hashShort: "—" },
        { version: "v1.0.0",                   uploader: "Nguyễn Văn A", date: "12/01/2026", blockchainStatus: "recorded",      size: "3.8 MB", hashShort: "a1b2c3...9f8e" },
    ];
};
