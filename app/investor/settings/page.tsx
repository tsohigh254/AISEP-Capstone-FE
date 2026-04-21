"use client";

import { useEffect, useRef, useState } from "react";
import { 
  User, Shield, Bell, LogOut, 
  CheckCircle2, AlertCircle, Loader2, 
  Eye, EyeOff, ShieldCheck, Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SupportModal } from "@/components/investor/support-modal";
import { GetInvestorProfile, UpdateInvestorAcceptingConnections } from "@/services/investor/investor.api";
import { GetInvestorKYCStatus } from "@/services/investor/investor-kyc";
import { ChangePassword } from "@/services/auth/auth.api";

/* ─── Sub-components ─────────────────────────────────────────── */

function SectionCard({ title, icon: Icon, description, children, id }: {
  title: string; 
  icon: React.ElementType; 
  description?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <div id={id} className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden scroll-mt-24">
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
            <Icon className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-[15px] font-bold text-slate-800">{title}</p>
        </div>
        {description && <p className="text-[12px] text-slate-400 ml-9">{description}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

const inputClass = (hasError = false) => cn(
  "w-full h-11 px-4 rounded-xl border text-[13px] text-slate-700 placeholder:text-slate-300 outline-none transition-all bg-white",
  "focus:border-[#eec54e] focus:ring-2 focus:ring-[#eec54e]/20",
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
  hasError ? "border-red-300 bg-red-50/40" : "border-slate-200"
);

/* ─── Toggle component ──────────────────────────────────────── */
function Toggle({
    checked, onChange, disabled = false,
}: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => !disabled && onChange(!checked)}
            className={cn(
                "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#eec54e]/20",
                checked ? "bg-[#eec54e]" : "bg-slate-200",
                disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
            )}
        >
            <span className={cn(
                "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform",
                checked ? "translate-x-[22px]" : "translate-x-[2px]"
            )} />
        </button>
    );
}

/* ─── Notification Config ─────────────────────────────────── */
type Prefs = {
    inApp: boolean;
    email: boolean;
};

const DEFAULT_PREFS: Prefs = {
    inApp: true,
    email: true,
};

const APPROVED_PROFILE_STATUS = "Approved";

const PROFILE_STATUS_LABELS: Record<string, string> = {
    Draft: "Bản nháp",
    Pending: "Chờ duyệt",
    Approved: "Đã duyệt",
    Rejected: "Bị từ chối",
    PendingKYC: "Chờ xác minh KYC",
};

const isSuccessResponse = <T,>(res?: IBackendRes<T> | null): res is IBackendRes<T> => {
    return Boolean(res && (res.success || res.isSuccess));
};

const getBackendErrorCode = (res?: IBackendRes<unknown> | null) => {
    return res?.error?.code ?? null;
};

const getHttpStatusCode = (error: unknown): number | null => {
    if (!error || typeof error !== "object") return null;
    const maybeError = error as { response?: { status?: unknown } };
    return typeof maybeError.response?.status === "number" ? maybeError.response.status : null;
};

const getAxiosErrorCode = (error: unknown): string | null => {
    if (!error || typeof error !== "object") return null;
    const maybeError = error as { response?: { data?: { error?: { code?: unknown } } } };
    const code = maybeError.response?.data?.error?.code;
    return typeof code === "string" ? code : null;
};

/* ─── Main Page ─────────────────────────────────────────────── */
export default function InvestorSettingsPage() {
    const [showSupportModal, setShowSupportModal] = useState(false);
    
    // Password Form
    const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
    const [pwShow, setPwShow] = useState({ current: false, next: false, confirm: false });
    const [pwError, setPwError] = useState("");
    const [isChangingPw, setIsChangingPw] = useState(false);

    // Notifications
    const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
    const originalPrefs = useRef<Prefs>(DEFAULT_PREFS);
    const [saving, setSaving] = useState(false);
    const [profileStatus, setProfileStatus] = useState<string | null>(null);
    const [kycWorkflowStatus, setKycWorkflowStatus] = useState<string | null>(null);
    const [acceptingConnections, setAcceptingConnections] = useState(false);
    const [isLoadingConnectionSetting, setIsLoadingConnectionSetting] = useState(true);
    const [isTogglingConnections, setIsTogglingConnections] = useState(false);
    const [connectionSettingError, setConnectionSettingError] = useState<string | null>(null);
    const [blockedByApprovalError, setBlockedByApprovalError] = useState(false);

    const isDirty = JSON.stringify(prefs) !== JSON.stringify(originalPrefs.current);
    const isKycVerified = kycWorkflowStatus === "VERIFIED" && !blockedByApprovalError;
    const profileStatusLabel = profileStatus
        ? (PROFILE_STATUS_LABELS[profileStatus] ?? profileStatus)
        : "Unknown";

    useEffect(() => {
        let isDisposed = false;

        const loadConnectionSetting = async () => {
            setIsLoadingConnectionSetting(true);
            setConnectionSettingError(null);
            setBlockedByApprovalError(false);

            try {
                const profileRes = await GetInvestorProfile();

                if (!isSuccessResponse(profileRes) || !profileRes.data) {
                    const errorCode = getBackendErrorCode(profileRes);

                    if (!isDisposed) {
                        if (errorCode === "INVESTOR_PROFILE_NOT_FOUND") {
                            setConnectionSettingError("Kh\u00f4ng t\u00ecm th\u1ea5y h\u1ed3 s\u01a1 investor.");
                        } else if (errorCode === "INVESTOR_ACCOUNT_INACTIVE") {
                            setBlockedByApprovalError(true);
                            setConnectionSettingError("T\u00e0i kho\u1ea3n \u0111ang b\u1ecb kh\u00f3a ho\u1eb7c ng\u01b0ng ho\u1ea1t \u0111\u1ed9ng.");
                        } else if (errorCode === "INVESTOR_PROFILE_NOT_APPROVED") {
                            setBlockedByApprovalError(true);
                            setConnectionSettingError("H\u1ed3 s\u01a1 ch\u01b0a \u0111\u01b0\u1ee3c duy\u1ec7t. Ch\u1ec9 h\u1ed3 s\u01a1 Approved m\u1edbi \u0111\u01b0\u1ee3c b\u1eadt/t\u1eaft c\u00e0i \u0111\u1eb7t n\u00e0y.");
                        } else if (errorCode === "INVESTOR_KYC_NOT_APPROVED") {
                            setBlockedByApprovalError(true);
                            setConnectionSettingError("KYC ch\u01b0a \u0111\u01b0\u1ee3c duy\u1ec7t ho\u1eb7c kh\u00f4ng c\u00f2n h\u1ee3p l\u1ec7.");
                        } else {
                            setConnectionSettingError(profileRes?.message || "Kh\u00f4ng t\u1ea3i \u0111\u01b0\u1ee3c c\u00e0i \u0111\u1eb7t nh\u1eadn k\u1ebft n\u1ed1i.");
                        }
                    }
                    return;
                }

                if (isDisposed) return;
                setProfileStatus(profileRes.data.profileStatus ?? null);
                setAcceptingConnections(Boolean(profileRes.data.acceptingConnections));

                // Proactive KYC status fetch
                try {
                    const kycRes = await GetInvestorKYCStatus();
                    if (!isDisposed && kycRes?.data?.workflowStatus) {
                        setKycWorkflowStatus(kycRes.data.workflowStatus);
                    }
                } catch {
                    // KYC fetch failure is non-critical; UI will show disabled state
                }
            } catch (error) {
                const status = getHttpStatusCode(error);
                if (isDisposed) return;

                if (status === 400) {
                    setConnectionSettingError("Y\u00eau c\u1ea7u kh\u00f4ng h\u1ee3p l\u1ec7 khi t\u1ea3i c\u00e0i \u0111\u1eb7t.");
                } else if (status === 401) {
                    setConnectionSettingError("Phi\u00ean \u0111\u0103ng nh\u1eadp \u0111\u00e3 h\u1ebft h\u1ea1n. Vui l\u00f2ng \u0111\u0103ng nh\u1eadp l\u1ea1i.");
                } else if (status === 403) {
                    setBlockedByApprovalError(true);
                    setConnectionSettingError("B\u1ea1n kh\u00f4ng c\u00f3 quy\u1ec1n c\u1eadp nh\u1eadt c\u00e0i \u0111\u1eb7t n\u00e0y.");
                } else if (status === 404) {
                    setConnectionSettingError("Kh\u00f4ng t\u00ecm th\u1ea5y h\u1ed3 s\u01a1 investor.");
                } else {
                    setConnectionSettingError("Kh\u00f4ng t\u1ea3i \u0111\u01b0\u1ee3c c\u00e0i \u0111\u1eb7t nh\u1eadn k\u1ebft n\u1ed1i. Vui l\u00f2ng th\u1eed l\u1ea1i.");
                }
            } finally {
                if (!isDisposed) {
                    setIsLoadingConnectionSetting(false);
                }
            }
        };

        void loadConnectionSetting();

        return () => {
            isDisposed = true;
        };
    }, []);

    const handleSavePrefs = () => {
        setSaving(true);
        setTimeout(() => {
            originalPrefs.current = prefs;
            setSaving(false);
            toast.success("Tùy chọn thông báo đã được lưu thành công.");
        }, 600);
    };

    const handlePwChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwError("");

        if (pwForm.next !== pwForm.confirm) {
            setPwError("Mật khẩu xác nhận không khớp.");
            return;
        }
        if (pwForm.next.length < 8) {
            setPwError("Mật khẩu mới phải có ít nhất 8 ký tự.");
            return;
        }

        setIsChangingPw(true);
        setTimeout(() => {
            toast.success("Đổi mật khẩu thành công");
            setPwForm({ current: "", next: "", confirm: "" });
            setIsChangingPw(false);
        }, 1200);
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwError("");

        if (!pwForm.current.trim()) {
            setPwError("Vui lòng nhập mật khẩu hiện tại.");
            return;
        }
        if (pwForm.next !== pwForm.confirm) {
            setPwError("Mật khẩu xác nhận không khớp.");
            return;
        }
        if (pwForm.next.length < 8) {
            setPwError("Mật khẩu mới phải có ít nhất 8 ký tự.");
            return;
        }
        if (pwForm.current === pwForm.next) {
            setPwError("Mật khẩu mới phải khác mật khẩu hiện tại.");
            return;
        }

        setIsChangingPw(true);
        try {
            const res = await ChangePassword(pwForm.current, pwForm.next, pwForm.confirm) as unknown as IBackendRes<null>;

            if (!(res.success || res.isSuccess)) {
                const fallbackMessage = res?.message || "Không cập nhật được mật khẩu. Vui lòng thử lại.";
                setPwError(fallbackMessage);
                toast.error(fallbackMessage);
                return;
            }

            toast.success("Đổi mật khẩu thành công");
            setPwForm({ current: "", next: "", confirm: "" });
        } catch (error) {
            const status = getHttpStatusCode(error);
            let message = "Không cập nhật được mật khẩu. Vui lòng thử lại.";

            if (status === 400) {
                message = "Mật khẩu hiện tại không đúng hoặc dữ liệu không hợp lệ.";
            } else if (status === 401) {
                message = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
            } else if (status === 403) {
                message = "Bạn không có quyền thực hiện thao tác này.";
            }

            setPwError(message);
            toast.error(message);
        } finally {
            setIsChangingPw(false);
        }
    };

    const handlePasswordSubmitV2 = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwError("");

        if (!pwForm.current.trim()) {
            setPwError("Vui lòng nhập mật khẩu hiện tại.");
            return;
        }
        if (pwForm.next !== pwForm.confirm) {
            setPwError("Mật khẩu xác nhận không khớp.");
            return;
        }
        if (pwForm.next.length < 8) {
            setPwError("Mật khẩu mới phải có ít nhất 8 ký tự.");
            return;
        }
        if (pwForm.current === pwForm.next) {
            setPwError("Mật khẩu mới phải khác mật khẩu hiện tại.");
            return;
        }

        setIsChangingPw(true);
        try {
            const res = await ChangePassword(pwForm.current, pwForm.next, pwForm.confirm);

            if (!(res.success || res.isSuccess)) {
                const backendMessage =
                    res.message ||
                    res.error?.message ||
                    res.error?.details?.[0]?.message ||
                    "";

                let message = backendMessage || "Không cập nhật được mật khẩu. Vui lòng thử lại.";

                if (res.statusCode === 400) {
                    if (backendMessage === "Current password is incorrect") {
                        message = "Mật khẩu hiện tại không đúng.";
                    } else if (backendMessage === "Passwords do not match") {
                        message = "Mật khẩu xác nhận không khớp.";
                    } else if (backendMessage === "New password must be different from current password") {
                        message = "Mật khẩu mới phải khác mật khẩu hiện tại.";
                    }
                } else if (res.statusCode === 401) {
                    message = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
                }

                setPwError(message);
                toast.error(message);

                if (res.statusCode === 401 && typeof window !== "undefined") {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("user");
                    window.location.href = "/auth/login";
                }
                return;
            }

            toast.success("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
            setPwForm({ current: "", next: "", confirm: "" });

            if (typeof window !== "undefined") {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("user");
                window.setTimeout(() => {
                    window.location.href = "/auth/login";
                }, 1200);
            }
        } catch {
            const message = "Không cập nhật được mật khẩu. Vui lòng thử lại.";
            setPwError(message);
            toast.error(message);
        } finally {
            setIsChangingPw(false);
        }
    };

    const handleToggleAcceptingConnections = async (nextValue: boolean) => {
        if (!isKycVerified || isTogglingConnections || isLoadingConnectionSetting) {
            return;
        }

        const previousValue = acceptingConnections;
        setAcceptingConnections(nextValue);
        setIsTogglingConnections(true);
        setConnectionSettingError(null);

        try {
            const updateRes = await UpdateInvestorAcceptingConnections(nextValue);

            if (!isSuccessResponse(updateRes) || !updateRes.data) {
                const errorCode = getBackendErrorCode(updateRes);

                setAcceptingConnections(previousValue);

                if (errorCode === "INVESTOR_ACCOUNT_INACTIVE") {
                    setBlockedByApprovalError(true);
                    const message = "Tài khoản đang bị khóa hoặc ngưng hoạt động — không thể cập nhật cài đặt này.";
                    setConnectionSettingError(message);
                    toast.error(message);
                    return;
                }

                if (errorCode === "INVESTOR_PROFILE_NOT_APPROVED") {
                    setBlockedByApprovalError(true);
                    const message = "Hồ sơ chưa được duyệt — không thể cập nhật cài đặt này.";
                    setConnectionSettingError(message);
                    toast.error(message);
                    return;
                }

                if (errorCode === "INVESTOR_KYC_NOT_APPROVED") {
                    const message = "KYC chưa được duyệt hoặc không còn hợp lệ — không thể bật tính năng này.";
                    setConnectionSettingError(message);
                    toast.error(message);
                    return;
                }

                if (errorCode === "INVESTOR_PROFILE_NOT_FOUND") {
                    const message = "Kh\u00f4ng t\u00ecm th\u1ea5y h\u1ed3 s\u01a1 investor.";
                    setConnectionSettingError(message);
                    toast.error(message);
                    return;
                }

                const fallbackMessage = updateRes?.message || "Kh\u00f4ng c\u1eadp nh\u1eadt \u0111\u01b0\u1ee3c c\u00e0i \u0111\u1eb7t nh\u1eadn k\u1ebft n\u1ed1i.";
                setConnectionSettingError(fallbackMessage);
                toast.error(fallbackMessage);
                return;
            }

            const serverValue = Boolean(updateRes.data.acceptingConnections);
            setAcceptingConnections(serverValue);
            toast.success(
                serverValue
                    ? "\u0110\u00e3 b\u1eadt nh\u1eadn y\u00eau c\u1ea7u k\u1ebft n\u1ed1i m\u1edbi."
                    : "\u0110\u00e3 t\u1eaft nh\u1eadn y\u00eau c\u1ea7u k\u1ebft n\u1ed1i m\u1edbi.",
            );
        } catch (error) {
            setAcceptingConnections(previousValue);

            const status = getHttpStatusCode(error);
            const errorCode = getAxiosErrorCode(error);
            let message = "Không cập nhật được cài đặt nhận kết nối. Vui lòng thử lại.";

            if (errorCode === "INVESTOR_ACCOUNT_INACTIVE") {
                message = "Tài khoản đang bị khóa hoặc ngưng hoạt động — không thể cập nhật cài đặt này.";
                setBlockedByApprovalError(true);
            } else if (errorCode === "INVESTOR_PROFILE_NOT_APPROVED") {
                message = "Hồ sơ chưa được duyệt — không thể cập nhật cài đặt này.";
                setBlockedByApprovalError(true);
            } else if (errorCode === "INVESTOR_KYC_NOT_APPROVED") {
                message = "KYC chưa được duyệt hoặc không còn hợp lệ — không thể bật tính năng này.";
            } else if (status === 400) {
                message = "Yêu cầu không hợp lệ. Vui lòng thử lại.";
            } else if (status === 401) {
                message = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
            } else if (status === 403) {
                message = "Bạn không có quyền cập nhật cài đặt này.";
                setBlockedByApprovalError(true);
            } else if (status === 404) {
                message = "Không tìm thấy hồ sơ investor.";
            }

            setConnectionSettingError(message);
            toast.error(message);
        } finally {
            setIsTogglingConnections(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-10 px-4 space-y-8 animate-in fade-in duration-500">
            
            {/* Page Header */}
            <div className="mb-2">
                <h1 className="text-[24px] font-bold text-slate-900 tracking-tight">Cài đặt tài khoản & Bảo mật</h1>
                <p className="text-[14px] text-slate-500 mt-1">Quản lý bảo mật, thông báo và các tùy chọn cá nhân.</p>
            </div>

            {/* Section A: Thông tin tài khoản */}
            <SectionCard 
                title="Thông tin tài khoản" 
                icon={User} 
                description="Trạng thái tài khoản và thông tin đăng nhập hệ thống."
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <p className="text-[12px] font-medium text-slate-400 uppercase tracking-wider">Địa chỉ Email</p>
                        <div className="flex items-center gap-2">
                            <p className="text-[14px] font-semibold text-slate-700">investor@aisep.vn</p>
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                Đã xác minh
                            </span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[12px] font-medium text-slate-400 uppercase tracking-wider">Vai trò tài khoản</p>
                        <p className="text-[14px] font-semibold text-slate-700 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-blue-500" />
                            Investor (Nhà đầu tư)
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[12px] font-medium text-slate-400 uppercase tracking-wider">Trạng thái</p>
                        <span className="inline-flex items-center px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                            Đang hoạt động (Active)
                        </span>
                    </div>
                </div>
            </SectionCard>

            <SectionCard
                id="connection-availability"
                title={"Nh\u1eadn y\u00eau c\u1ea7u k\u1ebft n\u1ed1i"}
                icon={Users}
                description={"B\u1eadt ho\u1eb7c t\u1eaft nh\u1eadn y\u00eau c\u1ea7u k\u1ebft n\u1ed1i m\u1edbi t\u1eeb startup."}
            >
                {isLoadingConnectionSetting ? (
                    <div className="flex items-center gap-2 text-[13px] text-slate-500">
                        <Loader2 className="h-4 w-4 animate-spin text-[#eec54e]" />
                        {"\u0110ang t\u1ea3i c\u00e0i \u0111\u1eb7t nh\u1eadn k\u1ebft n\u1ed1i..."}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <div>
                                <p className="text-[13px] font-semibold text-slate-800">
                                    {"Cho ph\u00e9p startup g\u1eedi y\u00eau c\u1ea7u k\u1ebft n\u1ed1i m\u1edbi"}
                                </p>
                                <p className="mt-1 text-[12px] text-slate-500">
                                    {acceptingConnections
                                        ? "Hi\u1ec7n \u0111ang nh\u1eadn y\u00eau c\u1ea7u m\u1edbi."
                                        : "Hi\u1ec7n \u0111ang t\u1ea1m d\u1eebng nh\u1eadn y\u00eau c\u1ea7u m\u1edbi."}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 pt-0.5">
                                {isTogglingConnections && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
                                <Toggle
                                    checked={acceptingConnections}
                                    onChange={handleToggleAcceptingConnections}
                                    disabled={!isKycVerified || isTogglingConnections}
                                />
                            </div>
                        </div>

                        {!isKycVerified && (
                            <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-[12px] text-amber-700">
                                {"Tính năng này chỉ khả dụng sau khi KYC được xác minh (VERIFIED). Vui lòng hoàn tất và chờ duyệt KYC."}
                            </div>
                        )}

                        {connectionSettingError && (
                            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[12px] text-red-600">
                                {connectionSettingError}
                            </div>
                        )}

                        <div className="rounded-xl border border-slate-200 px-4 py-3 text-[12px] text-slate-500">
                            {"Khi t\u1eaft, c\u00e1c k\u1ebft n\u1ed1i "}
                            <span className="font-semibold">Requested</span>
                            {" ho\u1eb7c "}
                            <span className="font-semibold">Accepted</span>
                            {" kh\u00f4ng b\u1ecb h\u1ee7y. Ch\u1ec9 c\u00e1c y\u00eau c\u1ea7u m\u1edbi b\u1ecb ch\u1eb7n."}
                        </div>
                    </div>
                )}
            </SectionCard>

            {/* Section B: Bảo mật & Đổi mật khẩu */}
            <SectionCard 
                title="Bảo mật & Mật khẩu" 
                icon={Shield} 
                description="Cập nhật mật khẩu định kỳ để đảm bảo an toàn cho tài khoản của bạn."
            >
                <form onSubmit={handlePasswordSubmitV2} className="space-y-5 max-w-md">
                    {[
                        { label: "Mật khẩu hiện tại", key: "current" as const, placeholder: "Nhập mật khẩu đang dùng" },
                        { label: "Mật khẩu mới", key: "next" as const, placeholder: "Tối thiểu 8 ký tự" },
                        { label: "Xác nhận mật khẩu mới", key: "confirm" as const, placeholder: "Nhập lại mật khẩu mới" },
                    ].map(({ label, key, placeholder }) => (
                        <div key={key}>
                            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">{label}</label>
                            <div className="relative">
                                <input 
                                    type={pwShow[key] ? "text" : "password"}
                                    value={pwForm[key]}
                                    onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                                    placeholder={placeholder}
                                    className={inputClass(!!pwError && key === "confirm")}
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setPwShow(p => ({ ...p, [key]: !p[key] }))}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                                >
                                    {pwShow[key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    ))}

                    {pwError && (
                        <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-100 rounded-xl">
                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                            <p className="text-[12px] text-red-600">{pwError}</p>
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={!pwForm.current || !pwForm.next || !pwForm.confirm || isChangingPw}
                        className="px-6 h-10 bg-[#0f172a] text-white text-[13px] font-bold rounded-xl hover:bg-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isChangingPw ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang cập nhật...</> : "Cập nhật mật khẩu"}
                    </button>
                </form>
            </SectionCard>

            {/* Section C: Phiên đăng nhập */}
            <SectionCard 
                title="Phiên đăng nhập" 
                icon={LogOut} 
                description="Quản lý các kết nối hiện tại đến tài khoản này."
            >
                <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                        onClick={() => {
                            if(confirm("Bạn có chắc chắn muốn đăng xuất khỏi phiên làm việc này?")) {
                                window.location.href = "/login";
                            }
                        }}
                        className="px-5 h-11 rounded-xl border border-red-100 text-red-600 bg-red-50/30 text-[13px] font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất phiên hiện tại
                    </button>
                    <button 
                        onClick={() => {
                            if(confirm("Hành động này sẽ ngắt kết nối trên TẤT CẢ các thiết bị khác. Click OK để tiếp tục.")) {
                                toast.success("Đã đăng xuất khỏi tất cả các thiết bị");
                            }
                        }}
                        className="px-5 h-11 rounded-xl border border-slate-200 text-slate-700 text-[13px] font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                        Đăng xuất khỏi tất cả thiết bị
                    </button>
                </div>
            </SectionCard>

            {/* Section D: Thông báo */}
            <SectionCard 
                title="Tùy chọn thông báo" 
                icon={Bell} 
                description="Cấu hình cách bạn muốn nhận cập nhật từ nền tảng."
            >
                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all">
                        <div>
                            <p className="text-[14px] font-bold text-slate-800">Thông báo trong ứng dụng</p>
                            <p className="text-[12px] text-slate-500">Hiển thị thông báo mới ở biểu tượng quả chuông trên Header.</p>
                        </div>
                        <button 
                            type="button"
                            onClick={() => {
                                setPrefs(p => ({ ...p, inApp: !p.inApp }));
                            }}
                            className={cn(
                                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#eec54e] focus:ring-offset-2",
                                prefs.inApp ? "bg-[#eec54e]" : "bg-slate-200"
                            )}
                        >
                            <span className={cn(
                                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                prefs.inApp ? "translate-x-5" : "translate-x-0"
                            )} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all">
                        <div>
                            <p className="text-[14px] font-bold text-slate-800">Thông báo qua Email</p>
                            <p className="text-[12px] text-slate-500">Gửi cập nhật quan trọng về các cơ hội đầu tư tới hòm thư của bạn.</p>
                        </div>
                        <button 
                            type="button"
                            onClick={() => {
                                setPrefs(p => ({ ...p, email: !p.email }));
                            }}
                            className={cn(
                                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#eec54e] focus:ring-offset-2",
                                prefs.email ? "bg-[#eec54e]" : "bg-slate-200"
                            )}
                        >
                            <span className={cn(
                                "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                prefs.email ? "translate-x-5" : "translate-x-0"
                            )} />
                        </button>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button 
                            onClick={handleSavePrefs}
                            disabled={!isDirty || saving}
                            className="px-8 h-10 bg-[#171611] text-white text-[13px] font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-30"
                        >
                            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...</> : "Lưu thay đổi"}
                        </button>
                    </div>
                </div>
            </SectionCard>

            {/* Footer Links */}
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-slate-400 border-t border-slate-100">
                <p>© 2026 AISEP Investor Platform. All rights reserved.</p>
                <div className="flex items-center gap-6">
                    <a href="#" className="hover:text-slate-600 transition-colors">Điều khoản</a>
                    <a href="#" className="hover:text-slate-600 transition-colors">Bảo mật</a>
                    <button 
                        onClick={() => setShowSupportModal(true)}
                        className="hover:text-slate-600 transition-colors cursor-pointer font-medium"
                    >
                        Trung tâm hỗ trợ
                    </button>
                </div>
            </div>

            <SupportModal 
                isOpen={showSupportModal}
                onClose={() => setShowSupportModal(false)}
            />
        </div>
    );
}
