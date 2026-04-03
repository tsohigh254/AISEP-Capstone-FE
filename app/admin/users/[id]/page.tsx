"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, Suspense, type ElementType, type ReactNode } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  getMockAdminUserDetails,
  type AdminUserDetailsMock,
  type UserAuditPreviewItem,
  type UserDetailsAccountStatus,
  type UserDetailsRiskLevel,
} from "@/services/admin/admin-user-details.mock";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Flag,
  History,
  Info,
  Lock,
  Mail,
  Pencil,
  RefreshCw,
  Shield,
  ShieldAlert,
  UserCog,
  Users,
  XCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ActionType =
  | "lock"
  | "unlock"
  | "approve_reactivation"
  | "reject_reactivation"
  | "review_account";

type MockPageState =
  | "ready"
  | "loading"
  | "unauthorized"
  | "fatal"
  | "partial-error";

interface EditDraft {
  fullName: string;
  displayName: string;
  email: string;
  phone: string;
  organization: string;
}

const STATUS_CFG: Record<UserDetailsAccountStatus, { label: string; dot: string; badge: string }> = {
  active: { label: "Đang hoạt động", dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80" },
  locked: { label: "Đã khóa", dot: "bg-red-400", badge: "bg-red-50 text-red-600 border-red-200/80" },
  pending_review: { label: "Chờ duyệt", dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-200/80" },
  pending_reactivation: { label: "Chờ kích hoạt lại", dot: "bg-blue-400", badge: "bg-blue-50 text-blue-700 border-blue-200/80" },
  suspended: { label: "Tạm ngưng", dot: "bg-orange-400", badge: "bg-orange-50 text-orange-600 border-orange-200/80" },
  inactive: { label: "Không hoạt động", dot: "bg-slate-300", badge: "bg-slate-50 text-slate-500 border-slate-200/80" },
};

const RISK_CFG: Record<Exclude<UserDetailsRiskLevel, null>, { label: string; badge: string }> = {
  flagged: { label: "Đã gắn cờ", badge: "bg-red-50 text-red-600 border-red-200/80" },
  high_attention: { label: "Cần chú ý cao", badge: "bg-orange-50 text-orange-600 border-orange-200/80" },
  sensitive: { label: "Nhạy cảm", badge: "bg-violet-50 text-violet-600 border-violet-200/80" },
};

const ROLE_IMPACT_NOTE: Record<string, string> = {
  Startup: "Truy cập startup workspace, hồ sơ và tài liệu startup.",
  Investor: "Truy cập investor workspace, kết nối và đề xuất đầu tư.",
  Advisor: "Truy cập advisor workspace và các flow mentoring/review.",
  Staff: "Quyền vận hành nội bộ, hỗ trợ review và xử lý nghiệp vụ admin.",
  Admin: "Quyền quản trị nhạy cảm, audit và điều phối toàn hệ thống.",
};

const AVATAR_COLORS = [
  "from-violet-500 to-violet-600",
  "from-blue-500 to-blue-600",
  "from-emerald-500 to-emerald-600",
  "from-rose-500 to-rose-600",
  "from-amber-500 to-amber-600",
  "from-cyan-500 to-cyan-600",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function relativeTime(value: string, nowMs: number): string {
  const diff = nowMs - new Date(value).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days} ngày trước`;
  const hours = Math.floor(diff / 3600000);
  if (hours > 0) return `${hours} giờ trước`;
  const minutes = Math.floor(diff / 60000);
  if (minutes > 0) return `${minutes} phút trước`;
  return "Vừa xong";
}

function getMockPageState(value: string | null): MockPageState {
  if (value === "loading" || value === "unauthorized" || value === "fatal" || value === "partial-error") {
    return value;
  }
  return "ready";
}

function StateShell({
  icon: Icon,
  title,
  description,
}: {
  icon: ElementType;
  title: string;
  description: string;
}) {
  return (
    <AdminShell>
      <div className="px-8 py-10">
        <div className="max-w-[720px] mx-auto bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-8 py-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <Icon className="w-7 h-7 text-slate-400" />
          </div>
          <h1 className="text-[20px] font-bold text-slate-900">{title}</h1>
          <p className="text-[13px] text-slate-500 mt-2">{description}</p>
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-[13px] font-medium hover:bg-slate-50 transition-colors mt-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại User Management
          </Link>
        </div>
      </div>
    </AdminShell>
  );
}

function LoadingState() {
  return (
    <AdminShell>
      <div className="px-8 py-7 space-y-5 pb-16 animate-pulse">
        <div className="h-4 w-52 rounded-full bg-slate-200" />
        <div className="bg-white rounded-2xl border border-slate-200/80 px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-5 w-56 rounded-full bg-slate-200" />
              <div className="h-4 w-80 rounded-full bg-slate-100" />
              <div className="h-3 w-64 rounded-full bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

function SectionCard({
  title,
  icon: Icon,
  action,
  children,
  id,
}: {
  title: string;
  icon: ElementType;
  action?: ReactNode;
  children: ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-[13px] font-semibold text-slate-900 flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-400" />
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function StatusBadge({ status }: { status: UserDetailsAccountStatus }) {
  const cfg = STATUS_CFG[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-semibold border", cfg.badge)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

function RiskBadge({ risk }: { risk: UserDetailsRiskLevel }) {
  if (!risk) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border bg-slate-50 text-slate-500 border-slate-200/80">
        Bình thường
      </span>
    );
  }

  const cfg = RISK_CFG[risk];
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border", cfg.badge)}>
      <Flag className="w-2.5 h-2.5" />
      {cfg.label}
    </span>
  );
}

function OverviewTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "warning" | "success" | "info";
}) {
  const toneClass =
    tone === "warning"
      ? "bg-amber-50 border-amber-200"
      : tone === "success"
        ? "bg-emerald-50 border-emerald-200"
        : tone === "info"
          ? "bg-blue-50 border-blue-200"
          : "bg-slate-50 border-slate-200";

  return (
    <div className={cn("rounded-xl border px-4 py-3", toneClass)}>
      <p className="text-[11px] text-slate-400 uppercase tracking-wide font-medium mb-1">{label}</p>
      <p className="text-[13px] font-semibold text-slate-700">{value}</p>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-[13px] text-slate-700 leading-relaxed">{value || "—"}</p>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  tone = "secondary",
  onClick,
}: {
  icon: ElementType;
  label: string;
  tone?: "primary" | "secondary" | "danger" | "success";
  onClick: () => void;
}) {
  const toneClass =
    tone === "primary"
      ? "bg-[#0f172a] text-white hover:bg-[#1e293b] shadow-sm"
      : tone === "danger"
        ? "border border-red-200 text-red-600 hover:bg-red-50"
        : tone === "success"
          ? "border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          : "border border-slate-200 text-slate-700 hover:bg-slate-50";

  return (
    <button onClick={onClick} className={cn("inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-medium transition-colors", toneClass)}>
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function AuditItem({
  item,
  isLatest,
  nowMs,
}: {
  item: UserAuditPreviewItem;
  isLatest: boolean;
  nowMs: number;
}) {
  return (
    <div className="flex gap-3 pb-4 last:pb-0">
      <div className="flex flex-col items-center">
        <div className={cn("w-2.5 h-2.5 rounded-full mt-1 shrink-0", isLatest ? "bg-[#eec54e]" : "bg-slate-300")} />
        {!isLatest && <div className="w-px flex-1 bg-slate-200 mt-1" />}
      </div>
      <div className="min-w-0 pb-1">
        <p className="text-[13px] text-slate-700 font-medium leading-tight">{item.action}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {item.actor} · {relativeTime(item.createdAt, nowMs)}
        </p>
        <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">{item.note}</p>
        <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 text-[10px] font-semibold border border-slate-200/80">
          {item.result}
        </span>
      </div>
    </div>
  );
}

function AdminUserDetailsPageInner() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [nowMs] = useState(() => Date.now());

  const mockState = getMockPageState(searchParams.get("mockState"));
  const userId = Number(params?.id);
  const initialUser = Number.isFinite(userId) ? getMockAdminUserDetails(userId) : null;

  const [user, setUser] = useState<AdminUserDetailsMock | null>(initialUser);
  const [editOpen, setEditOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [roleConfirmStep, setRoleConfirmStep] = useState(false);
  const [actionOpen, setActionOpen] = useState(false);
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [roleDraft, setRoleDraft] = useState(initialUser?.primaryRole ?? "");
  const [editDraft, setEditDraft] = useState<EditDraft>({
    fullName: initialUser?.fullName ?? "",
    displayName: initialUser?.displayName ?? "",
    email: initialUser?.email ?? "",
    phone: initialUser?.phone ?? "",
    organization: initialUser?.organization ?? "",
  });
  const [editErrors, setEditErrors] = useState<Partial<EditDraft>>({});

  const avatarGradient = useMemo(() => getAvatarColor(user?.fullName ?? "AISEP User"), [user?.fullName]);

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/admin/users");
  };

  const openAuditLogs = () => {
    toast.info("Mock flow: Audit Logs đầy đủ chưa được implement ở bản UI này.");
  };

  if (mockState === "loading") return <LoadingState />;
  if (mockState === "unauthorized") {
    return <StateShell icon={ShieldAlert} title="Không có quyền truy cập" description="Màn này chỉ dành cho Application Admin. Đây là mock unauthorized state để review UX." />;
  }
  if (mockState === "fatal") {
    return <StateShell icon={XCircle} title="Không thể tải User Details" description="Đây là mock fatal error state để kiểm tra trải nghiệm khi trang không thể tải dữ liệu quan trọng." />;
  }
  if (!user) {
    return <StateShell icon={Users} title="User không tồn tại" description="Không tìm thấy tài khoản tương ứng với user ID này." />;
  }

  const openEditModal = () => {
    setEditDraft({
      fullName: user.fullName,
      displayName: user.displayName,
      email: user.email,
      phone: user.phone,
      organization: user.organization,
    });
    setEditErrors({});
    setEditOpen(true);
  };

  const openRoleModal = () => {
    setRoleDraft(user.primaryRole);
    setRoleConfirmStep(false);
    setRoleOpen(true);
  };

  const appendAuditItem = (action: string, result: string, note: string) => {
    const nextItem: UserAuditPreviewItem = {
      id: `audit-local-${Date.now()}`,
      createdAt: new Date().toISOString(),
      actor: "Application Admin",
      action,
      result,
      note,
    };

    setUser((current) =>
      current
        ? {
            ...current,
            auditItems: [nextItem, ...current.auditItems].slice(0, 8),
          }
        : current,
    );
  };

  const saveUserInfo = () => {
    const nextErrors: Partial<EditDraft> = {};
    if (!editDraft.fullName.trim()) nextErrors.fullName = "Vui lòng nhập họ tên.";
    if (!editDraft.displayName.trim()) nextErrors.displayName = "Vui lòng nhập tên hiển thị.";
    if (!editDraft.email.trim()) nextErrors.email = "Vui lòng nhập email.";
    if (editDraft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editDraft.email)) nextErrors.email = "Email không hợp lệ.";

    setEditErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setUser((current) =>
      current
        ? {
            ...current,
            fullName: editDraft.fullName.trim(),
            displayName: editDraft.displayName.trim(),
            email: editDraft.email.trim(),
            phone: editDraft.phone.trim(),
            organization: editDraft.organization.trim(),
            updatedAt: new Date().toISOString(),
          }
        : current,
    );

    appendAuditItem("Profile updated", "Success", "Admin cập nhật thông tin cơ bản của tài khoản.");
    setEditOpen(false);
    toast.success("Đã cập nhật thông tin người dùng.");
  };

  const saveRoleChange = () => {
    if (!roleDraft) return;
    if (!roleConfirmStep) {
      setRoleConfirmStep(true);
      return;
    }

    setUser((current) =>
      current
        ? {
            ...current,
            primaryRole: roleDraft,
            roles: [roleDraft],
            roleAssignedAt: new Date().toISOString(),
            roleAssignedBy: "Application Admin",
          }
        : current,
    );

    appendAuditItem("Role updated", "Success", `Chuyển vai trò chính sang ${roleDraft}.`);
    setRoleOpen(false);
    setRoleConfirmStep(false);
    toast.success("Đã cập nhật vai trò người dùng.");
  };

  const confirmAction = () => {
    if (!actionType) return;
    if ((actionType === "lock" || actionType === "reject_reactivation") && !actionNote.trim()) {
      toast.error("Vui lòng nhập lý do trước khi xác nhận.");
      return;
    }

    const nowIso = new Date().toISOString();
    setUser((current) => {
      if (!current) return current;

      if (actionType === "lock") {
        return {
          ...current,
          accountStatus: "locked",
          lockState: "Locked",
          lockReason: actionNote.trim(),
          statusReason: `Tài khoản đã bị khóa bởi admin. Lý do: ${actionNote.trim()}`,
          lastStatusChangedAt: nowIso,
          lastStatusChangedBy: "Application Admin",
        };
      }

      if (actionType === "unlock") {
        return {
          ...current,
          accountStatus: "active",
          lockState: "Unlocked",
          lockReason: null,
          reactivationState: null,
          statusReason: "Tài khoản đã được mở khóa thủ công và quay về trạng thái hoạt động.",
          lastStatusChangedAt: nowIso,
          lastStatusChangedBy: "Application Admin",
        };
      }

      if (actionType === "approve_reactivation") {
        return {
          ...current,
          accountStatus: "active",
          lockState: "Unlocked",
          lockReason: null,
          reactivationState: "Approved",
          statusReason: "Yêu cầu kích hoạt lại đã được phê duyệt.",
          lastStatusChangedAt: nowIso,
          lastStatusChangedBy: "Application Admin",
          reactivationRequest: undefined,
        };
      }

      if (actionType === "reject_reactivation") {
        return {
          ...current,
          accountStatus: "locked",
          lockState: "Locked",
          reactivationState: "Rejected",
          statusReason: `Yêu cầu kích hoạt lại bị từ chối. Lý do: ${actionNote.trim()}`,
          lastStatusChangedAt: nowIso,
          lastStatusChangedBy: "Application Admin",
          reactivationRequest: undefined,
        };
      }

      return {
        ...current,
        accountStatus: "active",
        reviewState: "Reviewed",
        statusReason: actionNote.trim() || "Tài khoản đã được admin review và chuyển sang trạng thái hoạt động.",
        lastStatusChangedAt: nowIso,
        lastStatusChangedBy: "Application Admin",
      };
    });

    if (actionType === "lock") appendAuditItem("Account locked", "Success", actionNote.trim());
    if (actionType === "unlock") appendAuditItem("Account unlocked", "Success", actionNote.trim() || "Admin mở khóa tài khoản.");
    if (actionType === "approve_reactivation") appendAuditItem("Reactivation approved", "Success", actionNote.trim() || "Admin phê duyệt yêu cầu kích hoạt lại.");
    if (actionType === "reject_reactivation") appendAuditItem("Reactivation rejected", "Rejected", actionNote.trim());
    if (actionType === "review_account") appendAuditItem("Account reviewed", "Success", actionNote.trim() || "Admin đã hoàn tất review tài khoản.");

    setActionOpen(false);
    setActionType(null);
    setActionNote("");
    toast.success("UI đã được cập nhật theo trạng thái mới.");
  };

  const actionConfig =
    actionType === "lock"
      ? {
          title: "Khóa tài khoản này?",
          description: "Tài khoản sẽ bị khóa và người dùng không thể đăng nhập cho đến khi được mở lại.",
          confirmLabel: "Khóa tài khoản",
          confirmClass: "bg-red-500 hover:bg-red-600 text-white",
          requireReason: true,
          noteLabel: "Lý do khóa",
          warning: "Hành động này sẽ ngắt phiên đăng nhập hiện tại và tạo audit entry mới.",
        }
      : actionType === "unlock"
        ? {
            title: "Mở khóa tài khoản này?",
            description: "Tài khoản sẽ được mở lại và có thể truy cập hệ thống ngay sau khi xác nhận.",
            confirmLabel: "Mở khóa tài khoản",
            confirmClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
            requireReason: false,
            noteLabel: "Ghi chú mở khóa",
            warning: "Hành động này sẽ được ghi nhận trong audit preview của người dùng.",
          }
        : actionType === "approve_reactivation"
          ? {
              title: "Phê duyệt yêu cầu kích hoạt lại?",
              description: "Người dùng sẽ được kích hoạt lại và truy cập hệ thống trở lại ngay sau khi phê duyệt.",
              confirmLabel: "Phê duyệt kích hoạt lại",
              confirmClass: "bg-[#0f172a] hover:bg-[#1e293b] text-white",
              requireReason: false,
              noteLabel: "Ghi chú phê duyệt",
              warning: "Đây là hành động nhạy cảm và sẽ được audit log ghi lại.",
            }
          : actionType === "reject_reactivation"
            ? {
                title: "Từ chối yêu cầu kích hoạt lại?",
                description: "Yêu cầu kích hoạt lại sẽ bị từ chối và tài khoản tiếp tục ở trạng thái khóa.",
                confirmLabel: "Từ chối kích hoạt lại",
                confirmClass: "bg-red-500 hover:bg-red-600 text-white",
                requireReason: true,
                noteLabel: "Lý do từ chối",
                warning: "Nên ghi rõ lý do để admin khác có thể hiểu ngữ cảnh ở lần review sau.",
              }
            : {
                title: "Hoàn tất review tài khoản?",
                description: "Bạn đang xác nhận tài khoản này đã đủ điều kiện để chuyển sang trạng thái hoạt động.",
                confirmLabel: "Hoàn tất review",
                confirmClass: "bg-[#0f172a] hover:bg-[#1e293b] text-white",
                requireReason: false,
                noteLabel: "Ghi chú review",
                warning: "Sau khi xác nhận, badge trạng thái và action bar sẽ thay đổi ngay trên UI.",
              };

  const actions = (() => {
    const auditAction = <ActionButton key="audit" icon={FileText} label="Xem audit logs" onClick={openAuditLogs} />;

    if (user.accountStatus === "active") {
      return [
        <ActionButton key="edit" icon={Pencil} label="Chỉnh sửa user" tone="primary" onClick={openEditModal} />,
        <ActionButton key="role" icon={UserCog} label="Đổi vai trò" onClick={openRoleModal} />,
        auditAction,
        <ActionButton key="lock" icon={Lock} label="Khóa tài khoản" tone="danger" onClick={() => { setActionType("lock"); setActionNote(""); setActionOpen(true); }} />,
      ];
    }

    if (user.accountStatus === "locked") {
      return [
        <ActionButton key="reason" icon={Info} label="Xem lý do khóa" onClick={() => document.getElementById("status-risk-section")?.scrollIntoView({ behavior: "smooth", block: "start" })} />,
        <ActionButton key="unlock" icon={RefreshCw} label="Mở khóa tài khoản" tone="success" onClick={() => { setActionType("unlock"); setActionNote(""); setActionOpen(true); }} />,
        auditAction,
        user.reactivationRequest ? <ActionButton key="review-reactivation" icon={ShieldAlert} label="Review reactivation" onClick={() => document.getElementById("reactivation-section")?.scrollIntoView({ behavior: "smooth", block: "start" })} /> : null,
      ];
    }

    if (user.accountStatus === "pending_review") {
      return [
        <ActionButton key="review" icon={CheckCircle2} label="Review tài khoản" tone="primary" onClick={() => { setActionType("review_account"); setActionNote(""); setActionOpen(true); }} />,
        <ActionButton key="edit" icon={Pencil} label="Chỉnh sửa user" onClick={openEditModal} />,
        auditAction,
      ];
    }

    if (user.accountStatus === "pending_reactivation") {
      return [
        <ActionButton key="approve" icon={CheckCircle2} label="Phê duyệt kích hoạt lại" tone="primary" onClick={() => { setActionType("approve_reactivation"); setActionNote(""); setActionOpen(true); }} />,
        <ActionButton key="reject" icon={XCircle} label="Từ chối kích hoạt lại" tone="danger" onClick={() => { setActionType("reject_reactivation"); setActionNote(""); setActionOpen(true); }} />,
        <ActionButton key="history" icon={History} label="Xem lịch sử khóa" onClick={() => document.getElementById("status-risk-section")?.scrollIntoView({ behavior: "smooth", block: "start" })} />,
        auditAction,
      ];
    }

    return [
      auditAction,
      <ActionButton key="restore" icon={RefreshCw} label="Khôi phục truy cập" tone="success" onClick={() => { setActionType("unlock"); setActionNote(""); setActionOpen(true); }} />,
    ];
  })().filter(Boolean);

  const roleImpactNote = ROLE_IMPACT_NOTE[roleDraft] ?? "Vai trò này sẽ thay đổi phạm vi truy cập và các flow có thể thao tác.";
  const showPartialError = mockState === "partial-error";

  return (
    <AdminShell>
      <div className="px-8 py-7 space-y-5 pb-16 animate-in fade-in duration-400">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <nav className="flex items-center gap-1.5 text-[12px]">
              <Link href="/admin/dashboard" className="text-slate-400 hover:text-slate-600 transition-colors">Admin Workspace</Link>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <Link href="/admin/users" className="text-slate-400 hover:text-slate-600 transition-colors">User Management</Link>
              <ChevronRight className="w-3 h-3 text-slate-300" />
              <span className="text-slate-600 font-medium">Chi tiết người dùng</span>
            </nav>

            <button onClick={handleBack} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-700 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Quay lại User Management
            </button>
          </div>

          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 text-[11px] font-semibold w-fit">
            #{user.userId}
          </span>
        </div>

        {showPartialError && (
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/40 p-4">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <span className="flex items-center gap-1.5 text-[13px] font-semibold text-amber-700">
                <AlertTriangle className="w-4 h-4" />
                Một phần dữ liệu chưa tải được
              </span>
              <span className="text-[12px] text-amber-600">Đây là mock partial-error state. Thông tin chính vẫn hiển thị nhưng audit/activity có thể bị thiếu.</span>
            </div>
          </div>
        )}

        {user.riskLevel && (
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/40 p-4">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <span className="flex items-center gap-1.5 text-[13px] font-semibold text-amber-700">
                <AlertTriangle className="w-4 h-4" />
                Tài khoản này đang ở nhóm cần chú ý
              </span>
              <span className="text-[12px] text-amber-600">Xác nhận kỹ trước các thay đổi nhạy cảm như khóa tài khoản hoặc đổi vai trò.</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex items-start gap-4 min-w-0">
              <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-[18px] font-bold shrink-0 shadow-sm", avatarGradient)}>
                {getInitials(user.fullName)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-[20px] font-bold text-slate-900 leading-tight">{user.fullName}</h1>
                  <StatusBadge status={user.accountStatus} />
                  <RiskBadge risk={user.riskLevel} />
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200/80">
                    {user.primaryRole}
                  </span>
                </div>
                <p className="text-[13px] text-slate-500 mt-1 truncate">{user.email}</p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Hoạt động {relativeTime(user.lastActiveAt, nowMs)}
                  </span>
                  <span className="text-[11px] text-slate-400">Tạo ngày {formatDate(user.createdAt)}</span>
                  <span className="text-[11px] text-slate-400 font-mono">#{user.userId}</span>
                  <span className="text-[11px] text-slate-400">{user.actorType}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">{actions}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 space-y-5">
            <SectionCard title="Tổng quan tài khoản" icon={Info}>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                <OverviewTile label="Trạng thái account" value={STATUS_CFG[user.accountStatus].label} tone={user.accountStatus === "active" ? "success" : user.accountStatus === "pending_reactivation" ? "info" : "warning"} />
                <OverviewTile label="Vai trò hiện tại" value={user.primaryRole} />
                <OverviewTile label="Review state" value={user.reviewState} />
                <OverviewTile label="Last activity" value={relativeTime(user.lastActiveAt, nowMs)} />
                <OverviewTile label="Lock state" value={user.lockState} />
                <OverviewTile label="Reactivation state" value={user.reactivationState ?? "Không có"} tone={user.reactivationState ? "info" : "default"} />
              </div>
            </SectionCard>

            <SectionCard title="Thông tin người dùng" icon={Mail} action={<button onClick={openEditModal} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-[12px] font-medium hover:bg-slate-50 transition-colors"><Pencil className="w-3.5 h-3.5" />Chỉnh sửa user</button>}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InfoField label="Họ tên" value={user.fullName} />
                <InfoField label="Tên hiển thị" value={user.displayName} />
                <InfoField label="Email" value={user.email} />
                <InfoField label="Số điện thoại" value={user.phone} />
                <InfoField label="Tổ chức / công ty" value={user.organization} />
                <InfoField label="Actor type" value={user.actorType} />
                <InfoField label="Ngày tạo" value={formatDateTime(user.createdAt)} />
                <InfoField label="Cập nhật lần cuối" value={formatDateTime(user.updatedAt)} />
              </div>
            </SectionCard>

            <SectionCard title="Tóm tắt vai trò & truy cập" icon={Shield} action={<div className="flex items-center gap-2"><button onClick={openRoleModal} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-[12px] font-medium hover:bg-slate-50 transition-colors"><UserCog className="w-3.5 h-3.5" />Đổi vai trò</button><button onClick={() => toast.info("Mock flow: Roles & Permissions page chưa được implement ở bản này.")} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-[12px] font-medium hover:bg-slate-50 transition-colors">Open Roles & Permissions<ArrowRight className="w-3 h-3" /></button></div>}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InfoField label="Vai trò chính" value={user.primaryRole} />
                <InfoField label="Assigned by" value={user.roleAssignedBy} />
                <InfoField label="Assigned at" value={formatDateTime(user.roleAssignedAt)} />
                <InfoField label="Độ nhạy truy cập" value={user.accessSensitive ? "Sensitive access" : "Standard access"} />
                <div className="md:col-span-2">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-2">Nhóm quyền</p>
                  <div className="flex flex-wrap gap-2">
                    {user.permissionGroups.map((group) => (
                      <span key={group} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold">{group}</span>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Trạng thái & rủi ro" icon={ShieldAlert} id="status-risk-section">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InfoField label="Trạng thái hiện tại" value={STATUS_CFG[user.accountStatus].label} />
                  <InfoField label="Risk level hiện tại" value={user.riskLevel ? RISK_CFG[user.riskLevel].label : "Bình thường"} />
                  <InfoField label="Status reason" value={user.statusReason} />
                  <InfoField label="Cập nhật trạng thái gần nhất" value={`${formatDateTime(user.lastStatusChangedAt)} bởi ${user.lastStatusChangedBy}`} />
                  <InfoField label="Lý do khóa" value={user.lockReason ?? "Không có lý do khóa đang áp dụng"} />
                  <InfoField label="Nguồn tạo tài khoản" value={user.source} />
                </div>
                {user.flaggedReasons.length > 0 ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/50 px-4 py-4">
                    <div className="flex items-center gap-2 text-[13px] font-semibold text-amber-700 mb-3">
                      <AlertTriangle className="w-4 h-4" />
                      Các lý do rủi ro cần xem xét
                    </div>
                    <div className="space-y-2">
                      {user.flaggedReasons.map((reason) => (
                        <div key={reason} className="flex gap-2 text-[12px] text-amber-700">
                          <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-[12px] text-slate-500">
                    Không có risk flag hiện tại.
                  </div>
                )}
              </div>
            </SectionCard>

            {user.reactivationRequest && (
              <SectionCard id="reactivation-section" title="Review kích hoạt lại" icon={RefreshCw} action={<div className="flex items-center gap-2"><button onClick={() => { setActionType("approve_reactivation"); setActionNote(""); setActionOpen(true); }} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0f172a] text-white text-[12px] font-medium hover:bg-[#1e293b] transition-colors"><CheckCircle2 className="w-3.5 h-3.5" />Phê duyệt</button><button onClick={() => { setActionType("reject_reactivation"); setActionNote(""); setActionOpen(true); }} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-red-200 text-red-600 text-[12px] font-medium hover:bg-red-50 transition-colors"><XCircle className="w-3.5 h-3.5" />Từ chối</button></div>}>
                <div className="rounded-2xl border border-blue-200 bg-blue-50/40 px-4 py-4 mb-4">
                  <p className="text-[12px] font-semibold text-blue-700">Yêu cầu được gửi bởi {user.reactivationRequest.requestedBy}</p>
                  <p className="text-[12px] text-blue-700 mt-1">Gửi lúc {formatDateTime(user.reactivationRequest.requestDate)}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InfoField label="Lý do yêu cầu" value={user.reactivationRequest.requestReason} />
                  <InfoField label="Ghi chú liên quan" value={user.reactivationRequest.relatedNote} />
                  <InfoField label="Lý do khóa trước đó" value={user.reactivationRequest.priorLockReason} />
                  <InfoField label="Ngày khóa trước đó" value={formatDateTime(user.reactivationRequest.priorLockDate)} />
                </div>
                <div className="mt-4">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-2">Active flags</p>
                  <div className="flex flex-wrap gap-2">
                    {((user.reactivationRequest?.activeFlags?.length ?? 0) > 0 ? user.reactivationRequest!.activeFlags : ["Không còn flag hoạt động"]).map((flag) => (
                      <span key={flag} className={cn("inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold border", (user.reactivationRequest?.activeFlags?.length ?? 0) ? "bg-red-50 text-red-600 border-red-200/80" : "bg-slate-50 text-slate-500 border-slate-200/80")}>
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              </SectionCard>
            )}
          </div>

          <div className="space-y-5">
            <SectionCard title="Tóm tắt hoạt động" icon={History} action={<button onClick={() => toast.info("Mock flow: full activity screen chưa được implement ở bản UI này.")} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-[12px] font-medium hover:bg-slate-50 transition-colors"><Eye className="w-3.5 h-3.5" />Xem activity đầy đủ</button>}>
              <div className="space-y-3">
                <OverviewTile label="Lần active gần nhất" value={relativeTime(user.lastActiveAt, nowMs)} />
                <OverviewTile label="Lần đăng nhập gần nhất" value={formatDateTime(user.lastLoginAt)} />
                <OverviewTile label="Recent activity count" value={`${user.activitySummary.recentActivityCount} actions`} />
                <OverviewTile label="Failed access attempts" value={`${user.activitySummary.failedAccessCount} attempts`} tone={user.activitySummary.failedAccessCount > 0 ? "warning" : "success"} />
                <OverviewTile label="Thiết bị gần đây" value={user.activitySummary.deviceSummary} />
                <OverviewTile label="Location summary" value={user.activitySummary.locationSummary} />
              </div>
            </SectionCard>

            <SectionCard title="Tóm tắt audit" icon={FileText} action={<button onClick={openAuditLogs} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-[12px] font-medium hover:bg-slate-50 transition-colors"><Eye className="w-3.5 h-3.5" />View full audit logs</button>}>
              {showPartialError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50/50 px-4 py-4">
                  <p className="text-[13px] font-semibold text-red-600">Không tải được audit preview</p>
                  <p className="text-[12px] text-red-600 mt-1">Các section khác vẫn khả dụng. Đây là mock section error state cho bản UI review.</p>
                </div>
              ) : user.auditItems.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <p className="text-[13px] font-semibold text-slate-700">Chưa có audit activity gần đây</p>
                  <p className="text-[12px] text-slate-500 mt-1">Bạn vẫn có thể mở full audit logs khi flow này được implement.</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {user.auditItems.map((item, index) => (
                    <AuditItem key={item.id} item={item} isLatest={index === 0} nowMs={nowMs} />
                  ))}
                </div>
              )}
            </SectionCard>

            {(user.riskLevel || user.accountStatus !== "active") && (
              <SectionCard title="Vùng cần chú ý" icon={AlertTriangle}>
                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 px-4 py-4">
                  <p className="text-[13px] font-semibold text-amber-700">Admin guidance</p>
                  <p className="text-[12px] text-amber-700 mt-2 leading-relaxed">Review status reason, latest audit events và risk note trước khi thực hiện action nhạy cảm.</p>
                  <button onClick={() => { if (user.reactivationRequest) { document.getElementById("reactivation-section")?.scrollIntoView({ behavior: "smooth", block: "start" }); return; } document.getElementById("status-risk-section")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg border border-amber-200 text-amber-700 text-[12px] font-medium hover:bg-amber-100/70 transition-colors">
                    Review critical section
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </SectionCard>
            )}
          </div>
        </div>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-[640px] rounded-2xl border-slate-200 p-0 overflow-hidden">
            <DialogHeader className="px-6 pt-6">
              <DialogTitle className="text-[20px] font-bold text-slate-900">Chỉnh sửa thông tin người dùng</DialogTitle>
              <DialogDescription className="text-[13px] text-slate-500">Cập nhật thông tin cơ bản để preview luồng chỉnh sửa trên UI trước khi nối API.</DialogDescription>
            </DialogHeader>
            <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: "fullName", label: "Họ tên", value: editDraft.fullName, type: "text" },
                { key: "displayName", label: "Tên hiển thị", value: editDraft.displayName, type: "text" },
                { key: "email", label: "Email", value: editDraft.email, type: "email" },
                { key: "phone", label: "Số điện thoại", value: editDraft.phone, type: "text" },
                { key: "organization", label: "Tổ chức / công ty", value: editDraft.organization, type: "text", full: true },
              ].map((field) => (
                <div key={field.key} className={cn("space-y-1.5", field.full && "md:col-span-2")}>
                  <label className="text-[12px] font-medium text-slate-700">{field.label}</label>
                  <input
                    type={field.type}
                    value={field.value}
                    onChange={(event) => setEditDraft((current) => ({ ...current, [field.key]: event.target.value }))}
                    className="w-full h-11 rounded-xl border bg-white px-3 text-[13px] text-slate-700 outline-none transition-colors border-slate-200 focus:border-[#eec54e] focus:ring-4 focus:ring-[#eec54e]/20"
                  />
                  {editErrors[field.key as keyof EditDraft] && <p className="text-[11px] text-red-500">{editErrors[field.key as keyof EditDraft]}</p>}
                </div>
              ))}
            </div>
            <div className="px-6 pb-6 flex items-center justify-end gap-3">
              <button onClick={() => setEditOpen(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-medium hover:bg-slate-50 transition-colors">Hủy</button>
              <button onClick={saveUserInfo} className="px-4 py-2.5 rounded-xl bg-[#0f172a] text-white text-[13px] font-semibold hover:bg-[#1e293b] transition-colors">Lưu thay đổi</button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={roleOpen} onOpenChange={(open) => { setRoleOpen(open); if (!open) setRoleConfirmStep(false); }}>
          <DialogContent className="sm:max-w-[560px] rounded-2xl border-slate-200 p-0 overflow-hidden">
            <DialogHeader className="px-6 pt-6">
              <DialogTitle className="text-[20px] font-bold text-slate-900">Đổi vai trò</DialogTitle>
              <DialogDescription className="text-[13px] text-slate-500">Flow này có current role, new role, impact note và confirm step để sát spec hơn.</DialogDescription>
            </DialogHeader>
            <div className="px-6 py-5 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoField label="Current role" value={user.primaryRole} />
                <InfoField label="New role" value={roleDraft} />
              </div>
              <div className="space-y-3">
                {["Startup", "Investor", "Advisor", "Staff", "Admin"].map((role) => (
                  <button key={role} onClick={() => { setRoleDraft(role); setRoleConfirmStep(false); }} className={cn("w-full text-left rounded-2xl border px-4 py-3 transition-colors", roleDraft === role ? "border-[#eec54e]/60 bg-[#fdf8e6]" : "border-slate-200 hover:bg-slate-50")}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-semibold text-slate-800">{role}</p>
                        <p className="text-[12px] text-slate-500 mt-1">{ROLE_IMPACT_NOTE[role]}</p>
                      </div>
                      {roleDraft === role && <CheckCircle2 className="w-4 h-4 text-[#b8902e]" />}
                    </div>
                  </button>
                ))}
              </div>
              <div className="rounded-2xl border border-blue-200 bg-blue-50/50 px-4 py-4">
                <p className="text-[11px] text-blue-600 uppercase tracking-wide font-medium mb-1">Impact note</p>
                <p className="text-[13px] text-blue-700">{roleImpactNote}</p>
              </div>
              {roleConfirmStep && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 px-4 py-4">
                  <p className="text-[13px] font-semibold text-amber-700">Confirm step</p>
                  <p className="text-[12px] text-amber-700 mt-1">Bạn sắp đổi vai trò từ <span className="font-semibold">{user.primaryRole}</span> sang <span className="font-semibold">{roleDraft}</span>. Hành động này sẽ cập nhật badge vai trò và audit preview ngay trên UI.</p>
                </div>
              )}
            </div>
            <div className="px-6 pb-6 flex items-center justify-end gap-3">
              <button onClick={() => { setRoleOpen(false); setRoleConfirmStep(false); }} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-medium hover:bg-slate-50 transition-colors">Hủy</button>
              <button onClick={saveRoleChange} className="px-4 py-2.5 rounded-xl bg-[#0f172a] text-white text-[13px] font-semibold hover:bg-[#1e293b] transition-colors">{roleConfirmStep ? "Xác nhận đổi vai trò" : "Tiếp tục"}</button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={actionOpen} onOpenChange={(open) => { setActionOpen(open); if (!open) { setActionType(null); setActionNote(""); } }}>
          <DialogContent className="sm:max-w-[560px] rounded-2xl border-slate-200 p-0 overflow-hidden">
            <DialogHeader className="px-6 pt-6">
              <DialogTitle className="text-[20px] font-bold text-slate-900">{actionConfig.title}</DialogTitle>
              <DialogDescription className="text-[13px] text-slate-500">{actionConfig.description}</DialogDescription>
            </DialogHeader>
            <div className="px-6 py-5 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[11px] uppercase tracking-wide text-slate-400">User</span>
                  <span className="text-[12px] font-semibold text-slate-700">{user.fullName}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[11px] uppercase tracking-wide text-slate-400">Email</span>
                  <span className="text-[12px] text-slate-600">{user.email}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[11px] uppercase tracking-wide text-slate-400">Current status</span>
                  <StatusBadge status={user.accountStatus} />
                </div>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 px-4 py-3 flex gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[12px] text-amber-700 leading-relaxed">{actionConfig.warning}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[12px] font-medium text-slate-700">{actionConfig.noteLabel}</label>
                <textarea value={actionNote} onChange={(event) => setActionNote(event.target.value)} placeholder={actionConfig.requireReason ? "Nhập lý do để tiếp tục..." : "Thêm ghi chú nội bộ nếu cần"} className="w-full min-h-[120px] rounded-2xl border bg-white px-3 py-3 text-[13px] text-slate-700 outline-none resize-none transition-colors border-slate-200 focus:border-[#eec54e] focus:ring-4 focus:ring-[#eec54e]/20" />
                {actionConfig.requireReason && <p className="text-[11px] text-slate-400">Trường này là bắt buộc cho hành động hiện tại.</p>}
              </div>
            </div>
            <div className="px-6 pb-6 flex items-center justify-end gap-3">
              <button onClick={() => { setActionOpen(false); setActionType(null); setActionNote(""); }} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-medium hover:bg-slate-50 transition-colors">Hủy</button>
              <button onClick={confirmAction} className={cn("px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-colors", actionConfig.confirmClass)}>{actionConfig.confirmLabel}</button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminShell>
  );
}

export default function AdminUserDetailsPage() {
  return (
    <Suspense>
      <AdminUserDetailsPageInner />
    </Suspense>
  );
}
