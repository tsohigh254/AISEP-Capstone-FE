"use client";

import { useState } from "react";
import { StartupShell } from "@/components/startup/startup-shell";
import { Shield, Lock, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { ChangePasswordModal } from "@/components/startup/change-password-modal";

/* ─── SectionCard component (consistent with investor/advisor) ── */
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

/* ─── Main Page ─────────────────────────────────────────────── */
export default function StartupSettingsPage() {
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    return (
        <StartupShell>
            <div className="max-w-[760px] mx-auto space-y-5 pb-20">

                {/* ── Page header ── */}
                <div className="mb-6">
                    <h1 className="text-[22px] font-semibold text-slate-800 tracking-[-0.02em]">Cài đặt tài khoản</h1>
                    <p className="text-[13px] text-slate-500 mt-1">Quản lý mật khẩu và bảo mật tài khoản startup của bạn.</p>
                </div>

                {/* ── Security card ── */}
                <SectionCard title="Bảo mật" icon={Shield} description="Quản lý mật khẩu và bảo vệ tài khoản.">
                    <div className="flex items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                                <Lock className="w-4 h-4 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-[13px] font-medium text-slate-700">Mật khẩu đăng nhập</p>
                                <p className="text-[12px] text-slate-400 mt-0.5">Cập nhật mật khẩu định kỳ để tăng tính bảo mật cho tài khoản.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowPasswordModal(true)}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all whitespace-nowrap"
                        >
                            Đổi mật khẩu <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        </button>
                    </div>
                </SectionCard>

                {/* ── Footer ── */}
                <div className="pt-4 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
                    <span>AISEP Startup Platform</span>
                    <div className="flex items-center gap-4">
                        <a href="#" className="hover:text-slate-600 transition-colors">Điều khoản</a>
                        <a href="#" className="hover:text-slate-600 transition-colors">Chính sách bảo mật</a>
                        <a href="#" className="hover:text-slate-600 transition-colors">Hỗ trợ</a>
                    </div>
                </div>
            </div>

            {/* ── Change Password Modal ── */}
            <ChangePasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
                onSuccess={() => {
                    setShowPasswordModal(false);
                    toast.success("Mật khẩu đã được cập nhật thành công.");
                }}
            />

        </StartupShell>
    );
}
