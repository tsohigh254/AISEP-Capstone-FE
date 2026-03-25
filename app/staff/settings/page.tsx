"use client";

import { useState, useRef } from "react";
import { 
  User, Shield, Bell, LogOut, 
  CheckCircle2, AlertCircle, Loader2, 
  Eye, EyeOff, ShieldCheck, Mail,
  ChevronRight, Lock, AlertTriangle, Users, Brain, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ─── Sub-components ─────────────────────────────────────────── */

function SectionCard({ title, icon: Icon, description, children }: {
  title: string; 
  icon: React.ElementType; 
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden transition-all hover:shadow-md hover:shadow-slate-200/50 group">
      <div className="px-6 py-5 border-b border-slate-100/60">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 group-hover:bg-[#eec54e]/10 group-hover:border-[#eec54e]/20 group-hover:text-[#eec54e] transition-all">
            <Icon className="w-4 h-4 text-slate-400 group-hover:text-[#eec54e]" />
          </div>
          <p className="text-[15px] font-bold text-slate-800 uppercase tracking-tight">{title}</p>
        </div>
        {description && <p className="text-[12px] text-slate-400 ml-9 font-medium">{description}</p>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

const inputClass = (hasError = false) => cn(
  "w-full h-11 px-4 rounded-xl border text-[13px] text-slate-700 placeholder:text-slate-300 outline-none transition-all bg-white",
  "focus:border-[#eec54e] focus:ring-2 focus:ring-[#eec54e]/20",
  hasError ? "border-rose-300 bg-rose-50/20" : "border-slate-200"
);

/* ─── Notification Config ─────────────────────────────────── */
type Prefs = {
    inApp: boolean;
    email: boolean;
    systemAlerts: boolean;
};

const DEFAULT_PREFS: Prefs = {
    inApp: true,
    email: false,
    systemAlerts: true,
};

export default function StaffSettingsPage() {
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
            toast.success("Cấu hình thông báo đã được lưu.");
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
        <div className="max-w-3xl mx-auto py-8 space-y-8 animate-in fade-in duration-500">
            
            {/* Page Header */}
            <div>
                <h1 className="text-[26px] font-black text-slate-900 tracking-tight">Cài đặt vận hành & Bảo mật</h1>
                <p className="text-[14px] text-slate-500 mt-1 font-medium">Quản lý quyền hạn, bảo mật và tùy chọn hệ thống của bạn.</p>
            </div>

            {/* Section: Thông tin tài khoản nhân viên */}
            <SectionCard 
                title="Thông tin nhân sự" 
                icon={User} 
                description="Trạng thái tài khoản và thông tin phòng ban."
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-1.5">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Địa chỉ Email</p>
                        <div className="flex items-center gap-2">
                            <p className="text-[14px] font-bold text-slate-900">staff.admin@aisep.vn</p>
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                Đã xác minh
                            </span>
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Vai trò & Phòng ban</p>
                        <p className="text-[14px] font-bold text-slate-900 flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-blue-500" />
                            STAFF_ADMIN · Vận hành
                        </p>
                    </div>
                    <div className="space-y-1.5">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">ID Nhân sự</p>
                        <p className="text-[14px] font-bold text-slate-900 font-mono tracking-tighter">ST-2024-001</p>
                    </div>
                    <div className="space-y-1.5">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Trạng thái làm việc</p>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-black uppercase tracking-wider border border-emerald-100">
                            Đang trực tuyến
                        </span>
                    </div>
                </div>
            </SectionCard>

            {/* Section: Bảo mật & Đổi mật khẩu */}
            <SectionCard 
                title="Bảo mật & Mật khẩu" 
                icon={Lock} 
                description="Cập nhật mật khẩu định kỳ 30 ngày một lần để đảm bảo an toàn."
            >
                <form onSubmit={handlePwChange} className="space-y-5 max-w-md">
                    {[
                        { label: "Mật khẩu hiện tại", key: "current" as const, placeholder: "Nhập mật khẩu đang dùng" },
                        { label: "Mật khẩu mới", key: "next" as const, placeholder: "Tối thiểu 8 ký tự" },
                        { label: "Xác nhận mật khẩu mới", key: "confirm" as const, placeholder: "Nhập lại mật khẩu mới" },
                    ].map(({ label, key, placeholder }) => (
                        <div key={key}>
                            <label className="block text-[13px] font-bold text-slate-700 mb-2 uppercase tracking-wide">{label}</label>
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
                        <div className="flex items-start gap-2 px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl">
                            <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
                            <p className="text-[12px] text-rose-600 font-bold">{pwError}</p>
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={!pwForm.current || !pwForm.next || !pwForm.confirm || isChangingPw}
                        className="px-8 h-11 bg-[#171611] text-white text-[13px] font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-30 shadow-md shadow-slate-200 cursor-pointer"
                    >
                        {isChangingPw ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang cập nhật...</> : "Cập nhật mật khẩu"}
                    </button>
                </form>
            </SectionCard>

            {/* Section: Tùy chọn thông báo */}
            <SectionCard 
                title="Thông báo vận hành" 
                icon={Bell} 
                description="Cấu hình cách bạn muốn nhận thông tin về các tác vụ hệ thống."
            >
                <div className="space-y-4">
                    {[
                        { key: "inApp" as const, label: "Thông báo trang web", desc: "Hiện quả chuông và thông báo đẩy khi có yêu cầu mới." },
                        { key: "email" as const, label: "Thông báo qua Email", desc: "Gửi báo cáo tổng kết ngày về hòm thư công việc." },
                        { key: "systemAlerts" as const, label: "Cảnh báo bảo mật quan trọng", desc: "Thông báo ngay lập tức các sự cố ưu tiên cao." },
                    ].map((pref) => (
                        <div key={pref.key} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-sm transition-all group/item">
                            <div>
                                <p className="text-[14px] font-bold text-slate-800 tracking-tight">{pref.label}</p>
                                <p className="text-[12px] text-slate-500 font-medium">{pref.desc}</p>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setPrefs(p => ({ ...p, [pref.key]: !p[pref.key] }))}
                                className={cn(
                                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#eec54e] focus:ring-offset-2",
                                    prefs[pref.key] ? "bg-[#eec54e]" : "bg-slate-200"
                                )}
                            >
                                <span className={cn(
                                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                    prefs[pref.key] ? "translate-x-5" : "translate-x-0"
                                )} />
                            </button>
                        </div>
                    ))}

                    <div className="flex justify-end pt-2">
                        <button 
                            onClick={handleSavePrefs}
                            disabled={!isDirty || saving}
                            className={cn(
                                "px-8 h-10 text-[13px] font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer",
                                isDirty ? "bg-[#eec54e] text-[#171611] shadow-md shadow-[#eec54e]/20" : "bg-slate-100 text-slate-400 disabled:opacity-50"
                            )}
                        >
                            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...</> : "Lưu thay đổi"}
                        </button>
                    </div>
                </div>
            </SectionCard>
        </div>
    );
}
