"use client";

import { useState, useRef } from "react";
import { 
  User, Shield, Bell, LogOut, 
  CheckCircle2, AlertCircle, Loader2, 
  Eye, EyeOff, ShieldCheck, Mail,
  ChevronRight, Lock, AlertTriangle, Users, Brain, Newspaper
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SupportModal } from "@/components/investor/support-modal";

/* ─── Sub-components ─────────────────────────────────────────── */

function SectionCard({ title, icon: Icon, description, children }: {
  title: string; 
  icon: React.ElementType; 
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
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

    const isDirty = JSON.stringify(prefs) !== JSON.stringify(originalPrefs.current);

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

            {/* Section B: Bảo mật & Đổi mật khẩu */}
            <SectionCard 
                title="Bảo mật & Mật khẩu" 
                icon={Shield} 
                description="Cập nhật mật khẩu định kỳ để đảm bảo an toàn cho tài khoản của bạn."
            >
                <form onSubmit={handlePwChange} className="space-y-5 max-w-md">
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
