/* ─── Types ──────────────────────────────────────────────────────────────── */

export type PermissionCategory =
  | "User Governance"
  | "Access Control"
  | "Configuration"
  | "Monitoring"
  | "Audit & Compliance"
  | "AI"
  | "Messaging"
  | "Document Access"
  | "Advisory"
  | "Workflow";

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: PermissionCategory;
  isCritical: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  isProtected: boolean;
  permissionIds: string[];
  assignedUserCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

/* ─── Permissions ────────────────────────────────────────────────────────── */

export const MOCK_PERMISSIONS: Permission[] = [
  // User Governance
  { id: "p-ug-01", name: "View all users",         description: "Xem danh sách và thông tin tài khoản người dùng",    category: "User Governance",   isCritical: false },
  { id: "p-ug-02", name: "Edit user info",          description: "Cập nhật thông tin cơ bản của tài khoản người dùng", category: "User Governance",   isCritical: false },
  { id: "p-ug-03", name: "Lock/unlock account",     description: "Khoá hoặc mở khoá tài khoản người dùng",            category: "User Governance",   isCritical: true  },
  { id: "p-ug-04", name: "Review reactivation",     description: "Xem xét và phê duyệt yêu cầu kích hoạt lại",        category: "User Governance",   isCritical: true  },
  { id: "p-ug-05", name: "Delete user account",     description: "Xoá vĩnh viễn tài khoản người dùng khỏi hệ thống",  category: "User Governance",   isCritical: true  },

  // Access Control
  { id: "p-ac-01", name: "Manage roles",            description: "Tạo, sửa, xoá vai trò trong hệ thống",              category: "Access Control",    isCritical: true  },
  { id: "p-ac-02", name: "Assign role to user",     description: "Gán vai trò cho tài khoản người dùng",              category: "Access Control",    isCritical: true  },
  { id: "p-ac-03", name: "View permissions matrix", description: "Xem ma trận quyền toàn hệ thống",                   category: "Access Control",    isCritical: false },
  { id: "p-ac-04", name: "Edit permission mapping", description: "Thay đổi mapping quyền của từng vai trò",           category: "Access Control",    isCritical: true  },

  // Configuration
  { id: "p-cf-01", name: "View system config",      description: "Xem cấu hình hệ thống và tham số vận hành",         category: "Configuration",     isCritical: false },
  { id: "p-cf-02", name: "Edit system config",      description: "Chỉnh sửa cấu hình vận hành của hệ thống",          category: "Configuration",     isCritical: true  },
  { id: "p-cf-03", name: "Manage AI config",        description: "Quản lý cấu hình và tham số AI",                    category: "Configuration",     isCritical: true  },
  { id: "p-cf-04", name: "Manage blockchain config",description: "Quản lý cấu hình blockchain và smart contract",     category: "Configuration",     isCritical: true  },

  // Monitoring
  { id: "p-mo-01", name: "View system health",      description: "Xem trạng thái sức khoẻ và hiệu suất hệ thống",     category: "Monitoring",        isCritical: false },
  { id: "p-mo-02", name: "View service status",     description: "Kiểm tra trạng thái từng service",                  category: "Monitoring",        isCritical: false },
  { id: "p-mo-03", name: "View error logs",         description: "Truy cập log lỗi và exception của hệ thống",        category: "Monitoring",        isCritical: false },

  // Audit & Compliance
  { id: "p-au-01", name: "View audit logs",         description: "Xem lịch sử audit toàn hệ thống",                   category: "Audit & Compliance",isCritical: false },
  { id: "p-au-02", name: "Export audit report",     description: "Xuất báo cáo audit dưới dạng file",                 category: "Audit & Compliance",isCritical: false },
  { id: "p-au-03", name: "View escalated reports",  description: "Xem các báo cáo leo thang cần xử lý",               category: "Audit & Compliance",isCritical: false },
  { id: "p-au-04", name: "Handle incident",         description: "Tiếp nhận và xử lý sự cố nghiêm trọng",             category: "Audit & Compliance",isCritical: true  },

  // AI
  { id: "p-ai-01", name: "View AI evaluations",     description: "Xem kết quả đánh giá AI của startup",               category: "AI",                isCritical: false },
  { id: "p-ai-02", name: "Override AI decision",    description: "Ghi đè kết quả quyết định của AI",                  category: "AI",                isCritical: true  },
  { id: "p-ai-03", name: "Request AI evaluation",   description: "Gửi yêu cầu đánh giá AI mới",                       category: "AI",                isCritical: false },

  // Messaging
  { id: "p-ms-01", name: "Send system message",     description: "Gửi thông báo hệ thống đến người dùng",             category: "Messaging",         isCritical: false },
  { id: "p-ms-02", name: "View all messages",       description: "Xem nội dung tất cả cuộc trò chuyện",               category: "Messaging",         isCritical: true  },

  // Document Access
  { id: "p-da-01", name: "View submitted documents",description: "Xem tài liệu startup đã nộp",                       category: "Document Access",   isCritical: false },
  { id: "p-da-02", name: "Review KYC documents",    description: "Duyệt tài liệu KYC của nhà đầu tư/cố vấn",          category: "Document Access",   isCritical: false },
  { id: "p-da-03", name: "Approve/reject documents",description: "Phê duyệt hoặc từ chối tài liệu đã nộp",            category: "Document Access",   isCritical: false },

  // Advisory
  { id: "p-ad-01", name: "View advisory sessions",  description: "Xem lịch và nội dung phiên tư vấn",                 category: "Advisory",          isCritical: false },
  { id: "p-ad-02", name: "Resolve advisory dispute",description: "Giải quyết tranh chấp trong phiên tư vấn",          category: "Advisory",          isCritical: true  },

  // Workflow
  { id: "p-wf-01", name: "View pending workflows",  description: "Xem danh sách workflow đang chờ xử lý",             category: "Workflow",          isCritical: false },
  { id: "p-wf-02", name: "Approve workflow step",   description: "Phê duyệt bước trong quy trình nghiệp vụ",          category: "Workflow",          isCritical: false },
  { id: "p-wf-03", name: "Reject workflow step",    description: "Từ chối bước trong quy trình nghiệp vụ",            category: "Workflow",          isCritical: false },
];

/* ─── Roles ──────────────────────────────────────────────────────────────── */

export const MOCK_ROLES: Role[] = [
  {
    id: "role-admin",
    name: "Admin",
    description: "Quyền quản trị toàn diện: quản lý user, role, cấu hình, audit và điều phối hệ thống.",
    isProtected: true,
    permissionIds: MOCK_PERMISSIONS.map(p => p.id), // all permissions
    assignedUserCount: 2,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-01T00:00:00Z",
    createdBy: "System",
    updatedBy: "System",
  },
  {
    id: "role-startup",
    name: "Startup",
    description: "Truy cập startup workspace, hồ sơ công ty, tài liệu, AI evaluation và kết nối nhà đầu tư.",
    isProtected: true,
    permissionIds: ["p-ai-03", "p-da-01", "p-ms-01", "p-ad-01"],
    assignedUserCount: 8,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2025-03-01T00:00:00Z",
    createdBy: "System",
    updatedBy: "Admin",
  },
  {
    id: "role-investor",
    name: "Investor",
    description: "Truy cập investor workspace, xem hồ sơ startup, kết nối và đề xuất đầu tư.",
    isProtected: true,
    permissionIds: ["p-da-01", "p-ms-01", "p-ai-01"],
    assignedUserCount: 5,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2025-02-15T00:00:00Z",
    createdBy: "System",
    updatedBy: "Admin",
  },
  {
    id: "role-advisor",
    name: "Advisor",
    description: "Truy cập advisor workspace, quản lý lịch tư vấn, mentoring và review hồ sơ startup.",
    isProtected: true,
    permissionIds: ["p-ad-01", "p-da-01", "p-da-02", "p-ms-01", "p-ai-01", "p-wf-01"],
    assignedUserCount: 3,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2025-01-20T00:00:00Z",
    createdBy: "System",
    updatedBy: "System",
  },
  {
    id: "role-staff",
    name: "Staff",
    description: "Quyền vận hành nội bộ: hỗ trợ review tài liệu, xử lý workflow và báo cáo sự cố.",
    isProtected: true,
    permissionIds: [
      "p-ug-01", "p-da-01", "p-da-02", "p-da-03",
      "p-wf-01", "p-wf-02", "p-wf-03",
      "p-au-01", "p-au-03",
      "p-mo-01", "p-mo-02",
    ],
    assignedUserCount: 4,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2025-03-10T00:00:00Z",
    createdBy: "System",
    updatedBy: "Admin",
  },
  {
    id: "role-reviewer",
    name: "Reviewer",
    description: "Vai trò tuỳ chỉnh cho nhóm review KYC và tài liệu, không có quyền quản trị hệ thống.",
    isProtected: false,
    permissionIds: ["p-ug-01", "p-da-01", "p-da-02", "p-da-03", "p-au-01", "p-wf-01", "p-wf-02"],
    assignedUserCount: 2,
    createdAt: "2025-01-10T00:00:00Z",
    updatedAt: "2025-02-20T00:00:00Z",
    createdBy: "Admin",
    updatedBy: "Admin",
  },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */

export const PERMISSION_CATEGORIES: PermissionCategory[] = [
  "User Governance",
  "Access Control",
  "Configuration",
  "Monitoring",
  "Audit & Compliance",
  "AI",
  "Messaging",
  "Document Access",
  "Advisory",
  "Workflow",
];

export function getPermissionsByCategory(category: PermissionCategory): Permission[] {
  return MOCK_PERMISSIONS.filter(p => p.category === category);
}
