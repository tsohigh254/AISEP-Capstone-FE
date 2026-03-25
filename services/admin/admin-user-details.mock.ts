export type UserDetailsAccountStatus =
  | "active"
  | "locked"
  | "pending_review"
  | "pending_reactivation"
  | "suspended"
  | "inactive";

export type UserDetailsRiskLevel =
  | "flagged"
  | "high_attention"
  | "sensitive"
  | null;

export interface UserAuditPreviewItem {
  id: string;
  createdAt: string;
  actor: string;
  action: string;
  result: string;
  note: string;
}

export interface UserReactivationRequest {
  requestDate: string;
  requestedBy: string;
  requestReason: string;
  relatedNote: string;
  priorLockReason: string;
  priorLockDate: string;
  activeFlags: string[];
}

export interface AdminUserDetailsMock {
  userId: number;
  fullName: string;
  displayName: string;
  email: string;
  phone: string;
  organization: string;
  actorType: string;
  primaryRole: string;
  roles: string[];
  accountStatus: UserDetailsAccountStatus;
  riskLevel: UserDetailsRiskLevel;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
  lastLoginAt: string;
  reviewState: string;
  lockState: string;
  reactivationState: string | null;
  source: string;
  statusReason: string;
  lockReason: string | null;
  flaggedReasons: string[];
  lastStatusChangedAt: string;
  lastStatusChangedBy: string;
  roleAssignedAt: string;
  roleAssignedBy: string;
  accessSensitive: boolean;
  permissionGroups: string[];
  activitySummary: {
    recentActivityCount: number;
    failedAccessCount: number;
    deviceSummary: string;
    locationSummary: string;
  };
  auditItems: UserAuditPreviewItem[];
  reactivationRequest?: UserReactivationRequest;
}

const MOCK_DETAILS: Record<number, AdminUserDetailsMock> = {
  1: {
    userId: 1,
    fullName: "Nguyễn Trần",
    displayName: "Nguyễn Trần",
    email: "nguyen.tran@techstartup.vn",
    phone: "+84 905 111 222",
    organization: "TechStartup Vietnam",
    actorType: "Startup",
    primaryRole: "Startup",
    roles: ["Startup"],
    accountStatus: "active",
    riskLevel: null,
    emailVerified: true,
    createdAt: "2025-01-15T09:30:00+07:00",
    updatedAt: "2026-03-21T15:40:00+07:00",
    lastActiveAt: "2026-03-24T10:05:00+07:00",
    lastLoginAt: "2026-03-24T09:58:00+07:00",
    reviewState: "Verified",
    lockState: "Unlocked",
    reactivationState: null,
    source: "Self-registration",
    statusReason: "Tài khoản đang hoạt động bình thường và không có cảnh báo mở.",
    lockReason: null,
    flaggedReasons: [],
    lastStatusChangedAt: "2026-01-12T10:15:00+07:00",
    lastStatusChangedBy: "Application Admin",
    roleAssignedAt: "2025-01-15T09:45:00+07:00",
    roleAssignedBy: "System",
    accessSensitive: false,
    permissionGroups: ["Startup Workspace", "Documents", "Messaging"],
    activitySummary: {
      recentActivityCount: 12,
      failedAccessCount: 0,
      deviceSummary: "Chrome on Windows 11",
      locationSummary: "TP. Hồ Chí Minh, Việt Nam",
    },
    auditItems: [
      {
        id: "audit-1-1",
        createdAt: "2026-03-21T15:40:00+07:00",
        actor: "Application Admin",
        action: "Profile updated",
        result: "Success",
        note: "Chuẩn hóa tên hiển thị và tổ chức.",
      },
      {
        id: "audit-1-2",
        createdAt: "2026-01-12T10:15:00+07:00",
        actor: "Application Admin",
        action: "Review completed",
        result: "Success",
        note: "Đưa tài khoản về trạng thái hoạt động sau review hồ sơ.",
      },
      {
        id: "audit-1-3",
        createdAt: "2025-01-15T09:30:00+07:00",
        actor: "System",
        action: "Account created",
        result: "Success",
        note: "Đăng ký mới từ form public.",
      },
    ],
  },
  4: {
    userId: 4,
    fullName: "Tài khoản khoá",
    displayName: "Locked Startup",
    email: "locked.user@mail.com",
    phone: "+84 902 333 444",
    organization: "Locked Ventures",
    actorType: "Startup",
    primaryRole: "Startup",
    roles: ["Startup"],
    accountStatus: "locked",
    riskLevel: "flagged",
    emailVerified: true,
    createdAt: "2025-03-01T11:10:00+07:00",
    updatedAt: "2026-02-10T13:20:00+07:00",
    lastActiveAt: "2026-02-10T11:45:00+07:00",
    lastLoginAt: "2026-02-10T11:45:00+07:00",
    reviewState: "Completed",
    lockState: "Locked",
    reactivationState: null,
    source: "Admin invited",
    statusReason: "Tài khoản đã bị khóa sau khi phát hiện thay đổi thông tin nhạy cảm bất thường.",
    lockReason: "Nhiều thay đổi email và thông tin pháp lý trong thời gian ngắn.",
    flaggedReasons: [
      "Thay đổi hồ sơ pháp lý 3 lần trong 24 giờ",
      "Yêu cầu chia sẻ tài liệu nhạy cảm từ IP lạ",
    ],
    lastStatusChangedAt: "2026-02-10T13:20:00+07:00",
    lastStatusChangedBy: "Application Admin",
    roleAssignedAt: "2025-03-01T11:15:00+07:00",
    roleAssignedBy: "Application Admin",
    accessSensitive: true,
    permissionGroups: ["Startup Workspace", "Documents", "Messaging"],
    activitySummary: {
      recentActivityCount: 4,
      failedAccessCount: 5,
      deviceSummary: "Chrome on macOS",
      locationSummary: "Đăng nhập gần nhất từ Hà Nội, Việt Nam",
    },
    auditItems: [
      {
        id: "audit-4-1",
        createdAt: "2026-02-10T13:20:00+07:00",
        actor: "Application Admin",
        action: "Account locked",
        result: "Success",
        note: "Khóa thủ công sau khi xem xét cảnh báo rủi ro.",
      },
      {
        id: "audit-4-2",
        createdAt: "2026-02-10T12:55:00+07:00",
        actor: "Risk Engine",
        action: "Suspicious change flagged",
        result: "Flagged",
        note: "Phát hiện cập nhật thông tin pháp lý bất thường.",
      },
      {
        id: "audit-4-3",
        createdAt: "2025-03-01T11:10:00+07:00",
        actor: "System",
        action: "Account created",
        result: "Success",
        note: "Admin tạo tài khoản cho startup.",
      },
    ],
  },
  6: {
    userId: 6,
    fullName: "Người dùng #6",
    displayName: "Pending Reactivation",
    email: "pending.reactivate@co.vn",
    phone: "+84 901 555 666",
    organization: "Reactivation Labs",
    actorType: "Startup",
    primaryRole: "Startup",
    roles: ["Startup"],
    accountStatus: "pending_reactivation",
    riskLevel: null,
    emailVerified: true,
    createdAt: "2025-04-01T08:00:00+07:00",
    updatedAt: "2026-03-18T10:30:00+07:00",
    lastActiveAt: "2025-12-20T16:10:00+07:00",
    lastLoginAt: "2025-12-20T16:10:00+07:00",
    reviewState: "Reactivation Requested",
    lockState: "Locked",
    reactivationState: "Pending Review",
    source: "Self-registration",
    statusReason: "Người dùng đã gửi yêu cầu kích hoạt lại và đang chờ admin xem xét.",
    lockReason: "Tài khoản bị khóa do không phản hồi yêu cầu xác minh bổ sung trong thời hạn.",
    flaggedReasons: [],
    lastStatusChangedAt: "2026-03-18T10:30:00+07:00",
    lastStatusChangedBy: "System",
    roleAssignedAt: "2025-04-01T08:03:00+07:00",
    roleAssignedBy: "System",
    accessSensitive: false,
    permissionGroups: ["Startup Workspace", "Documents", "Messaging"],
    activitySummary: {
      recentActivityCount: 2,
      failedAccessCount: 1,
      deviceSummary: "Safari on iPhone",
      locationSummary: "Yêu cầu mở lại từ Đà Nẵng, Việt Nam",
    },
    auditItems: [
      {
        id: "audit-6-1",
        createdAt: "2026-03-18T10:30:00+07:00",
        actor: "User",
        action: "Reactivation requested",
        result: "Pending",
        note: "Người dùng yêu cầu mở lại tài khoản từ form hỗ trợ.",
      },
      {
        id: "audit-6-2",
        createdAt: "2026-01-05T14:20:00+07:00",
        actor: "System",
        action: "Account locked",
        result: "Success",
        note: "Tự động khóa sau khi quá hạn bổ sung hồ sơ xác minh.",
      },
      {
        id: "audit-6-3",
        createdAt: "2025-04-01T08:00:00+07:00",
        actor: "System",
        action: "Account created",
        result: "Success",
        note: "Tài khoản được tạo từ flow startup onboarding.",
      },
    ],
    reactivationRequest: {
      requestDate: "2026-03-18T10:30:00+07:00",
      requestedBy: "pending.reactivate@co.vn",
      requestReason: "Đã hoàn tất bổ sung hồ sơ KYC và cần mở lại tài khoản để tiếp tục cập nhật profile.",
      relatedNote: "Người dùng cam kết sẽ cập nhật hồ sơ trong vòng 24 giờ sau khi được mở lại.",
      priorLockReason: "Không phản hồi yêu cầu xác minh bổ sung trong thời hạn.",
      priorLockDate: "2026-01-05T14:20:00+07:00",
      activeFlags: [],
    },
  },
  10: {
    userId: 10,
    fullName: "Startup mới",
    displayName: "Seed Startup",
    email: "new.startup@company.vn",
    phone: "+84 903 777 888",
    organization: "Seed Company VN",
    actorType: "Startup",
    primaryRole: "Startup",
    roles: ["Startup"],
    accountStatus: "pending_review",
    riskLevel: null,
    emailVerified: false,
    createdAt: "2026-03-20T09:10:00+07:00",
    updatedAt: "2026-03-22T18:05:00+07:00",
    lastActiveAt: "2026-03-22T18:05:00+07:00",
    lastLoginAt: "2026-03-20T09:10:00+07:00",
    reviewState: "Pending Initial Review",
    lockState: "Unlocked",
    reactivationState: null,
    source: "Self-registration",
    statusReason: "Tài khoản đang chờ admin review thông tin doanh nghiệp và xác thực email.",
    lockReason: null,
    flaggedReasons: [],
    lastStatusChangedAt: "2026-03-20T09:10:00+07:00",
    lastStatusChangedBy: "System",
    roleAssignedAt: "2026-03-20T09:10:00+07:00",
    roleAssignedBy: "System",
    accessSensitive: false,
    permissionGroups: ["Startup Workspace (limited)", "Documents (draft)"],
    activitySummary: {
      recentActivityCount: 3,
      failedAccessCount: 0,
      deviceSummary: "Chrome on Windows 11",
      locationSummary: "TP. Hồ Chí Minh, Việt Nam",
    },
    auditItems: [
      {
        id: "audit-10-1",
        createdAt: "2026-03-22T18:05:00+07:00",
        actor: "User",
        action: "Profile info updated",
        result: "Success",
        note: "Bổ sung ngành hoạt động và mô tả startup.",
      },
      {
        id: "audit-10-2",
        createdAt: "2026-03-20T09:10:00+07:00",
        actor: "System",
        action: "Account created",
        result: "Pending",
        note: "Tài khoản cần review trước khi mở toàn bộ quyền truy cập.",
      },
    ],
  },
  12: {
    userId: 12,
    fullName: "Người dùng #12",
    displayName: "VIP Investor",
    email: "sensitive.vip@fund.com",
    phone: "+84 909 444 999",
    organization: "Sensitive Capital Partners",
    actorType: "Investor",
    primaryRole: "Investor",
    roles: ["Investor"],
    accountStatus: "active",
    riskLevel: "sensitive",
    emailVerified: true,
    createdAt: "2025-06-15T10:20:00+07:00",
    updatedAt: "2026-03-17T19:10:00+07:00",
    lastActiveAt: "2026-03-18T08:45:00+07:00",
    lastLoginAt: "2026-03-18T08:45:00+07:00",
    reviewState: "Verified",
    lockState: "Unlocked",
    reactivationState: null,
    source: "Admin invited",
    statusReason: "Tài khoản đang hoạt động nhưng được gắn nhãn sensitive do thuộc nhóm đối tác chiến lược.",
    lockReason: null,
    flaggedReasons: [
      "Tài khoản thuộc nhóm đối tác chiến lược cần xác nhận thủ công trước các thay đổi quyền truy cập",
    ],
    lastStatusChangedAt: "2026-02-14T16:00:00+07:00",
    lastStatusChangedBy: "Application Admin",
    roleAssignedAt: "2025-06-15T10:30:00+07:00",
    roleAssignedBy: "Application Admin",
    accessSensitive: true,
    permissionGroups: ["Investor Workspace", "Connections", "Recommendations"],
    activitySummary: {
      recentActivityCount: 9,
      failedAccessCount: 0,
      deviceSummary: "Edge on Windows 11",
      locationSummary: "Singapore / Hồ Chí Minh",
    },
    auditItems: [
      {
        id: "audit-12-1",
        createdAt: "2026-02-14T16:00:00+07:00",
        actor: "Application Admin",
        action: "Sensitive label applied",
        result: "Success",
        note: "Gắn nhãn account chiến lược, yêu cầu xác nhận thủ công cho action nhạy cảm.",
      },
      {
        id: "audit-12-2",
        createdAt: "2025-11-20T09:15:00+07:00",
        actor: "Application Admin",
        action: "Role updated",
        result: "Success",
        note: "Giữ nguyên vai trò Investor, cập nhật nhóm quyền internal watch.",
      },
      {
        id: "audit-12-3",
        createdAt: "2025-06-15T10:20:00+07:00",
        actor: "Application Admin",
        action: "Account created",
        result: "Success",
        note: "Tạo tài khoản đối tác chiến lược.",
      },
    ],
  },
  18: {
    userId: 18,
    fullName: "Advisor mới",
    displayName: "New Mentor",
    email: "new.advisor3@mentor.vn",
    phone: "+84 908 456 234",
    organization: "Mentor Network Vietnam",
    actorType: "Advisor",
    primaryRole: "Advisor",
    roles: ["Advisor"],
    accountStatus: "pending_review",
    riskLevel: "high_attention",
    emailVerified: false,
    createdAt: "2026-03-23T07:40:00+07:00",
    updatedAt: "2026-03-23T19:55:00+07:00",
    lastActiveAt: "2026-03-23T19:55:00+07:00",
    lastLoginAt: "2026-03-23T19:55:00+07:00",
    reviewState: "Pending Manual Review",
    lockState: "Unlocked",
    reactivationState: null,
    source: "Self-registration",
    statusReason: "Tài khoản advisor mới cần kiểm tra lại chứng chỉ chuyên môn trước khi kích hoạt.",
    lockReason: null,
    flaggedReasons: [
      "Tài liệu chứng chỉ tải lên có chất lượng thấp",
      "Email chưa xác minh",
    ],
    lastStatusChangedAt: "2026-03-23T19:55:00+07:00",
    lastStatusChangedBy: "System",
    roleAssignedAt: "2026-03-23T07:40:00+07:00",
    roleAssignedBy: "System",
    accessSensitive: false,
    permissionGroups: ["Advisor Workspace (limited)", "KYC Review"],
    activitySummary: {
      recentActivityCount: 3,
      failedAccessCount: 1,
      deviceSummary: "Chrome on Android",
      locationSummary: "Huế, Việt Nam",
    },
    auditItems: [
      {
        id: "audit-18-1",
        createdAt: "2026-03-23T19:55:00+07:00",
        actor: "Risk Engine",
        action: "Needs review flagged",
        result: "Flagged",
        note: "Tài liệu hỗ trợ không đủ rõ để auto-approve.",
      },
      {
        id: "audit-18-2",
        createdAt: "2026-03-23T07:40:00+07:00",
        actor: "System",
        action: "Account created",
        result: "Pending",
        note: "Đăng ký advisor mới chờ review thủ công.",
      },
    ],
  },
};

export function getMockAdminUserDetails(
  userId: number,
): AdminUserDetailsMock | null {
  const detail = MOCK_DETAILS[userId];
  if (!detail) return null;
  return JSON.parse(JSON.stringify(detail)) as AdminUserDetailsMock;
}
