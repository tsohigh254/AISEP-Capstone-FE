"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useStartupProfile } from "@/context/startup-profile-context";
import { DisableVisibility, EnableVisibility } from "@/services/startup/startup.api";
import { cn } from "@/lib/utils";

type Status = "Visible" | "Hidden" | "PendingApproval";

const TEXT = {
  currentStatus: "Tr\u1ea1ng th\u00e1i hi\u1ec7n t\u1ea1i",
  visibleLabel: "Hi\u1ec3n th\u1ecb v\u1edbi nh\u00e0 \u0111\u1ea7u t\u01b0 & c\u1ed1 v\u1ea5n",
  visibleDesc:
    "H\u1ed3 s\u01a1 c\u1ee7a b\u1ea1n xu\u1ea5t hi\u1ec7n trong k\u1ebft qu\u1ea3 t\u00ecm ki\u1ebfm. Nh\u00e0 \u0111\u1ea7u t\u01b0 v\u00e0 c\u1ed1 v\u1ea5n c\u00f3 th\u1ec3 xem th\u00f4ng tin c\u01a1 b\u1ea3n v\u00e0 g\u1eedi y\u00eau c\u1ea7u k\u1ebft n\u1ed1i.",
  hiddenLabel: "\u1ea8n kh\u1ecfi nh\u00e0 \u0111\u1ea7u t\u01b0 & c\u1ed1 v\u1ea5n",
  hiddenDesc:
    "H\u1ed3 s\u01a1 kh\u00f4ng hi\u1ec3n th\u1ecb trong t\u00ecm ki\u1ebfm. Nh\u00e0 \u0111\u1ea7u t\u01b0 v\u00e0 c\u1ed1 v\u1ea5n s\u1ebd kh\u00f4ng t\u00ecm th\u1ea5y ho\u1eb7c g\u1eedi k\u1ebft n\u1ed1i \u0111\u1ebfn b\u1ea1n.",
  pendingLabel: "\u0110ang ch\u1edd duy\u1ec7t",
  pendingDesc:
    "H\u1ed3 s\u01a1 \u0111ang ch\u1edd ph\u00ea duy\u1ec7t t\u1eeb h\u1ec7 th\u1ed1ng. Sau khi \u0111\u01b0\u1ee3c duy\u1ec7t, b\u1ea1n c\u00f3 th\u1ec3 b\u1eadt hi\u1ec3n th\u1ecb cho nh\u00e0 \u0111\u1ea7u t\u01b0 v\u00e0 c\u1ed1 v\u1ea5n.",
  needKycTitle: "C\u1ea7n ho\u00e0n t\u1ea5t KYC tr\u01b0\u1edbc",
  needKycDesc: "H\u1ed3 s\u01a1 c\u1ee7a b\u1ea1n ph\u1ea3i \u0111\u01b0\u1ee3c duy\u1ec7t KYC tr\u01b0\u1edbc khi c\u00f3 th\u1ec3 hi\u1ec3n th\u1ecb.",
  statusAlreadySelected: "Tr\u1ea1ng th\u00e1i n\u00e0y \u0111ang \u0111\u01b0\u1ee3c ch\u1ecdn r\u1ed3i!",
  updateFailed: "C\u1eadp nh\u1eadt tr\u1ea1ng th\u00e1i th\u1ea5t b\u1ea1i.",
  unknown: "Kh\u00f4ng x\u00e1c \u0111\u1ecbnh",
  visibleSuccess: "H\u1ed3 s\u01a1 \u0111\u00e3 \u0111\u01b0\u1ee3c hi\u1ec3n th\u1ecb.",
  visibleSuccessDesc: "Nh\u00e0 \u0111\u1ea7u t\u01b0 v\u00e0 c\u1ed1 v\u1ea5n c\u00f3 th\u1ec3 t\u00ecm th\u1ea5y v\u00e0 xem h\u1ed3 s\u01a1 c\u1ee7a b\u1ea1n.",
  hiddenSuccess: "H\u1ed3 s\u01a1 \u0111\u00e3 \u0111\u01b0\u1ee3c \u1ea9n.",
  hiddenSuccessDesc:
    "Nh\u00e0 \u0111\u1ea7u t\u01b0 v\u00e0 c\u1ed1 v\u1ea5n s\u1ebd kh\u00f4ng t\u00ecm th\u1ea5y h\u1ed3 s\u01a1 trong k\u1ebft qu\u1ea3 t\u00ecm ki\u1ebfm.",
  approvalInfo: "Th\u00f4ng tin duy\u1ec7t h\u1ed3 s\u01a1",
  approvedDate: "Ng\u00e0y duy\u1ec7t",
  approvedBy: "Duy\u1ec7t b\u1edfi (ID)",
  profileApprovalStatus: "Tr\u1ea1ng th\u00e1i h\u1ed3 s\u01a1",
  changeVisibility: "Thay \u0111\u1ed5i hi\u1ec3n th\u1ecb",
  changeVisibilityDesc: "Ki\u1ec3m so\u00e1t vi\u1ec7c nh\u00e0 \u0111\u1ea7u t\u01b0 c\u00f3 th\u1ec3 t\u00ecm th\u1ea5y h\u1ed3 s\u01a1 c\u1ee7a b\u1ea1n.",
  showProfile: "Hi\u1ec3n th\u1ecb h\u1ed3 s\u01a1",
  showProfileDesc: "Nh\u00e0 \u0111\u1ea7u t\u01b0 v\u00e0 c\u1ed1 v\u1ea5n c\u00f3 th\u1ec3 t\u00ecm th\u1ea5y v\u00e0 xem h\u1ed3 s\u01a1 c\u1ee7a b\u1ea1n.",
  hideProfile: "\u1ea8n h\u1ed3 s\u01a1",
  hideProfileDesc: "H\u1ed3 s\u01a1 s\u1ebd kh\u00f4ng xu\u1ea5t hi\u1ec7n trong t\u00ecm ki\u1ebfm.",
  awaitingProfileApprovalTitle: "Ch\u01b0a th\u1ec3 b\u1eadt hi\u1ec3n th\u1ecb",
  awaitingProfileApprovalDesc:
    "H\u1ed3 s\u01a1 c\u1ee7a b\u1ea1n c\u1ea7n \u0111\u01b0\u1ee3c duy\u1ec7t tr\u01b0\u1edbc khi c\u00f3 th\u1ec3 hi\u1ec3n th\u1ecb v\u1edbi nh\u00e0 \u0111\u1ea7u t\u01b0 v\u00e0 c\u1ed1 v\u1ea5n. Vui l\u00f2ng ho\u00e0n t\u1ea5t x\u00e1c th\u1ef1c KYC v\u00e0 ch\u1edd ph\u00ea duy\u1ec7t.",
  profileStatusApproved: "\u0110\u00e3 duy\u1ec7t",
  profileStatusDraft: "B\u1ea3n nh\u00e1p",
  profileStatusPending: "Ch\u1edd duy\u1ec7t",
  profileStatusPendingKyc: "Ch\u1edd x\u00e1c th\u1ef1c KYC",
  profileStatusRejected: "B\u1ecb t\u1eeb ch\u1ed1i",
  profileStatusUnknown: "Ch\u01b0a x\u00e1c \u0111\u1ecbnh",
  privacyProtected: "Quy\u1ec1n ri\u00eang t\u01b0 \u0111\u01b0\u1ee3c b\u1ea3o v\u1ec7",
  privacyProtectedDesc:
    "Khi h\u1ed3 s\u01a1 \u1edf tr\u1ea1ng th\u00e1i \"Hi\u1ec3n th\u1ecb\", nh\u00e0 \u0111\u1ea7u t\u01b0 ch\u1ec9 xem \u0111\u01b0\u1ee3c th\u00f4ng tin c\u01a1 b\u1ea3n. T\u00e0i li\u1ec7u t\u00e0i ch\u00ednh v\u00e0 th\u00f4ng tin KYC ch\u1ec9 chia s\u1ebb qua k\u1ebft n\u1ed1i \u0111\u01b0\u1ee3c ph\u00ea duy\u1ec7t.",
} as const;

const normalizeStatus = (raw: any): Status => {
  if (raw === true || raw === "Visible" || raw === "visible" || raw === "Public") return "Visible";
  if (raw === "PendingApproval" || raw === "Pending") return "PendingApproval";
  return "Hidden";
};

const STATUS_MAP = {
  Visible: {
    label: TEXT.visibleLabel,
    desc: TEXT.visibleDesc,
    icon: Eye,
    dot: "bg-emerald-500",
  },
  Hidden: {
    label: TEXT.hiddenLabel,
    desc: TEXT.hiddenDesc,
    icon: EyeOff,
    dot: "bg-slate-400",
  },
  PendingApproval: {
    label: TEXT.pendingLabel,
    desc: TEXT.pendingDesc,
    icon: Clock,
    dot: "bg-amber-400",
  },
} satisfies Record<Status, { label: string; desc: string; icon: typeof Eye; dot: string }>;

const PROFILE_STATUS_LABELS: Record<string, string> = {
  APPROVED: TEXT.profileStatusApproved,
  DRAFT: TEXT.profileStatusDraft,
  PENDING: TEXT.profileStatusPending,
  PENDINGKYC: TEXT.profileStatusPendingKyc,
  REJECTED: TEXT.profileStatusRejected,
};

const getErrorCode = (source: any): string | undefined => {
  return (
    source?.errorCode ??
    source?.code ??
    source?.error?.code ??
    source?.error?.errorCode ??
    source?.data?.errorCode ??
    source?.data?.code ??
    source?.data?.error?.code ??
    source?.data?.error?.errorCode ??
    source?.response?.data?.errorCode ??
    source?.response?.data?.code ??
    source?.response?.data?.error?.code ??
    source?.response?.data?.error?.errorCode
  );
};

const getErrorMessage = (source: any): string | undefined => {
  return (
    source?.message ??
    source?.error?.message ??
    source?.data?.message ??
    source?.response?.data?.message
  );
};

const isVisibilityNotAllowed = (source: any): boolean => {
  const code = getErrorCode(source);
  const message = getErrorMessage(source) ?? "";
  return (
    code === "STARTUP_VISIBILITY_NOT_ALLOWED" ||
    /kyc-approved/i.test(message) ||
    /before it can be made visible/i.test(message)
  );
};

export default function StartupVisibilityPage() {
  const { profile, fetchProfile, loading } = useStartupProfile();
  const [status, setStatus] = useState<Status>(() =>
    normalizeStatus(profile?.visibilityStatus ?? profile?.isVisible),
  );
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const raw = profile.visibilityStatus ?? profile.isVisible;
    setStatus(normalizeStatus(raw));
  }, [profile]);

  const cfg = STATUS_MAP[status];
  const Icon = cfg.icon;
  const isPending = status === "PendingApproval";
  const normalizedProfileStatus = String(profile?.profileStatus ?? "")
    .trim()
    .toUpperCase();
  const isProfileApproved = normalizedProfileStatus === "APPROVED";
  const profileStatusLabel = PROFILE_STATUS_LABELS[normalizedProfileStatus] ?? profile?.profileStatus ?? TEXT.profileStatusUnknown;

  const showVisibilityNotAllowedToast = () => {
    toast.error(TEXT.needKycTitle, {
      description: TEXT.needKycDesc,
    });
  };

  const handleSetStatus = async (newStatus: Status) => {
    if (newStatus === status) {
      toast.info(TEXT.statusAlreadySelected);
      return;
    }

    setIsUpdating(true);
    try {
      const res = newStatus === "Visible" ? await EnableVisibility() : await DisableVisibility();

      if (!res?.isSuccess && !res?.success) {
        if (isVisibilityNotAllowed(res)) {
          showVisibilityNotAllowedToast();
        } else {
          toast.error(TEXT.updateFailed, {
            description: getErrorMessage(res) || TEXT.unknown,
          });
        }
        return;
      }

      if (newStatus === "Visible") {
        toast.success(TEXT.visibleSuccess, {
          description: TEXT.visibleSuccessDesc,
        });
      } else {
        toast.success(TEXT.hiddenSuccess, {
          description: TEXT.hiddenSuccessDesc,
        });
      }

      await fetchProfile();
    } catch (error: any) {
      if (isVisibilityNotAllowed(error)) {
        showVisibilityNotAllowedToast();
      } else {
        toast.error(TEXT.updateFailed, {
          description: getErrorMessage(error) || TEXT.unknown,
        });
      }
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <p className="mb-3 text-[10px] font-medium uppercase tracking-widest text-slate-400">{TEXT.currentStatus}</p>
        <div className="flex items-center gap-3">
          <div className={cn("h-2.5 w-2.5 shrink-0 rounded-full", cfg.dot)} />
          <Icon className="h-4 w-4 text-slate-500" />
          <div>
            <p className="text-[14px] font-semibold text-[#0f172a]">{cfg.label}</p>
            <p className="mt-0.5 text-[12px] text-slate-400">{cfg.desc}</p>
          </div>
        </div>
      </div>

      {(profile?.approvedAt || profile?.approvedBy) && (
        <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">{TEXT.approvalInfo}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {profile?.approvedAt && (
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                  <CalendarCheck className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-400">{TEXT.approvedDate}</p>
                  <p className="mt-0.5 text-[13px] font-semibold text-[#0f172a]">
                    {new Date(profile.approvedAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            )}
            {profile?.approvedBy && (
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <UserCheck className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-[11px] font-medium text-slate-400">{TEXT.approvedBy}</p>
                  <p className="mt-0.5 text-[13px] font-semibold text-[#0f172a]">{profile.approvedBy}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!isPending && (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="text-[13px] font-semibold text-slate-700">{TEXT.changeVisibility}</h3>
            <p className="mt-0.5 text-[12px] text-slate-400">{TEXT.changeVisibilityDesc}</p>
          </div>
          {!isProfileApproved && (
            <div className="mx-4 mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div>
                  <p className="text-[12px] font-semibold text-amber-800">{TEXT.awaitingProfileApprovalTitle}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-amber-700">{TEXT.awaitingProfileApprovalDesc}</p>
                </div>
              </div>
            </div>
          )}
          <div className="relative space-y-2 p-4">
            {isUpdating && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/50 backdrop-blur-[1px]">
                <Loader2 className="h-6 w-6 animate-spin text-slate-900" />
              </div>
            )}
            {(["Visible", "Hidden"] as Status[]).map((itemStatus) => {
              const itemCfg = STATUS_MAP[itemStatus];
              const ItemIcon = itemCfg.icon;
              const active = status === itemStatus;

              return (
                <button
                  key={itemStatus}
                  type="button"
                  onClick={() => void handleSetStatus(itemStatus)}
                  disabled={active || isUpdating || (itemStatus === "Visible" && !isProfileApproved)}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all",
                    active
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                      active ? "bg-white/10" : "bg-slate-100",
                    )}
                  >
                    <ItemIcon className={cn("h-4 w-4", active ? "text-white" : "text-slate-500")} />
                  </div>
                  <div className="flex-1">
                    <p className={cn("text-[13px] font-medium", active ? "text-white" : "text-slate-700")}>
                      {itemStatus === "Visible" ? TEXT.showProfile : TEXT.hideProfile}
                    </p>
                    <p className={cn("mt-0.5 text-[11px]", active ? "text-white/60" : "text-slate-400")}>
                      {itemStatus === "Visible" ? TEXT.showProfileDesc : TEXT.hideProfileDesc}
                    </p>
                  </div>
                  {active && <CheckCircle2 className="h-4 w-4 shrink-0 text-white/80" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-start gap-3 rounded-xl border border-slate-200/60 bg-white px-5 py-4">
        <div className={cn("mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full", isProfileApproved ? "bg-emerald-500" : "bg-amber-400")} />
        <div>
          <p className="text-[12px] font-medium text-slate-600">{TEXT.profileApprovalStatus}</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{profileStatusLabel}</p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-slate-200/60 bg-slate-50 px-5 py-4">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <div>
          <p className="text-[12px] font-medium text-slate-600">{TEXT.privacyProtected}</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400">{TEXT.privacyProtectedDesc}</p>
        </div>
      </div>
    </div>
  );
}
