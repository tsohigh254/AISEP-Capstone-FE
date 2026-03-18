"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StartupShell } from "@/components/startup/startup-shell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ArrowLeft, Shield, Mail, Rocket } from "lucide-react";
import { ChangePasswordModal, SuccessModal } from "@/components/startup/change-password-modal";

export default function StartupSettingsPage() {
  const router = useRouter();
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [emailPrefs, setEmailPrefs] = useState({
    system: true,
    newsletter: false,
    advisor: true
  });

  const handlePasswordSuccess = () => {
    setIsChangeModalOpen(false);
    setIsSuccessModalOpen(true);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 5000);
  };

  const togglePref = (key: keyof typeof emailPrefs) => {
    setEmailPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <StartupShell>
      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[110] animate-in slide-in-from-top-4 duration-500">
          <div className="bg-white/90 backdrop-blur-md border border-neutral-100 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-[#10b981]/20 flex items-center justify-center">
              <Check className="w-4 h-4 text-[#10b981]" />
            </div>
            <p className="text-sm font-black text-[#171611]">Mật khẩu đã được cập nhật thành công.</p>
          </div>
        </div>
      )}

      <main className={cn(
        "flex-1 max-w-[800px] mx-auto w-full p-6 space-y-8 animate-in fade-in duration-500 pb-20",
        (isChangeModalOpen || isSuccessModalOpen) && "blur-[2px] pointer-events-none select-none"
      )}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-neutral-surface rounded-full transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6 text-neutral-muted" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-[#171611] tracking-tight">Cài đặt tài khoản & Bảo mật</h1>
            <p className="text-sm text-neutral-muted font-bold">Quản lý mật khẩu và các tùy chọn nhận thông báo của bạn.</p>
          </div>
        </div>

        {/* Security Section */}
        <section className="bg-white rounded-[32px] shadow-sm border border-neutral-surface overflow-hidden">
          <div className="p-6 border-b border-neutral-surface bg-[#e6cc4c]/5">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#e6cc4c]" />
              <h3 className="font-black text-lg text-[#171611]">Bảo mật</h3>
            </div>
          </div>
          <div className="p-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="font-black text-[15px] text-[#171611]">Mật khẩu đăng nhập</p>
                <p className="text-xs text-neutral-muted font-bold">Cập nhật mật khẩu thường xuyên để tăng tính bảo mật cho tài khoản.</p>
              </div>
              <Button
                onClick={() => setIsChangeModalOpen(true)}
                variant="outline"
                className="w-full sm:w-auto bg-[#f8f8f6] hover:bg-[#e6cc4c]/10 text-[#171611] border-neutral-200 px-6 h-11 rounded-2xl font-black transition-all active:scale-95"
              >
                Đổi mật khẩu
              </Button>
            </div>
          </div>
        </section>

        {/* Email Preferences Section */}
        <section className="bg-white rounded-[32px] shadow-sm border border-neutral-surface overflow-hidden">
          <div className="p-6 border-b border-neutral-surface bg-[#e6cc4c]/5">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#e6cc4c]" />
              <h3 className="font-black text-lg text-[#171611]">Tùy chọn Email</h3>
            </div>
          </div>
          <div className="p-8 space-y-8">
            <div className="flex items-start gap-4 group cursor-pointer" onClick={() => togglePref("system")}>
              <div className="pt-0.5">
                <div className={cn(
                  "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                  emailPrefs.system ? "bg-[#e6cc4c] border-[#e6cc4c] text-white" : "border-neutral-surface bg-white"
                )}>
                  {emailPrefs.system && <Check className="w-4 h-4" />}
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-black text-[15px] text-[#171611]">Thông báo hệ thống</p>
                <p className="text-xs text-neutral-muted font-bold leading-relaxed">Nhận email về các cập nhật bảo mật, hoạt động đăng nhập và thông báo quan trọng từ nền tảng.</p>
              </div>
            </div>

            <div className="h-px bg-neutral-surface mx-4"></div>

            <div className="flex items-start gap-4 group cursor-pointer" onClick={() => togglePref("newsletter")}>
              <div className="pt-0.5">
                <div className={cn(
                  "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                  emailPrefs.newsletter ? "bg-[#e6cc4c] border-[#e6cc4c] text-white" : "border-neutral-surface bg-white"
                )}>
                  {emailPrefs.newsletter && <Check className="w-4 h-4" />}
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-black text-[15px] text-[#171611]">Bản tin & Tin tức (Newsletter)</p>
                <p className="text-xs text-neutral-muted font-bold leading-relaxed">Cập nhật về các xu hướng Startup, sự kiện kết nối nhà đầu tư và các tính năng mới hàng tuần.</p>
              </div>
            </div>

            <div className="h-px bg-neutral-surface mx-4"></div>

            <div className="flex items-start gap-4 group cursor-pointer" onClick={() => togglePref("advisor")}>
              <div className="pt-0.5">
                <div className={cn(
                  "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                  emailPrefs.advisor ? "bg-[#e6cc4c] border-[#e6cc4c] text-white" : "border-neutral-surface bg-white"
                )}>
                  {emailPrefs.advisor && <Check className="w-4 h-4" />}
                </div>
              </div>
              <div className="space-y-1">
                <p className="font-black text-[15px] text-[#171611]">Tương tác từ Cố vấn & Nhà đầu tư</p>
                <p className="text-xs text-neutral-muted font-bold leading-relaxed">Thông báo khi có người xem hồ sơ, yêu cầu kết nối hoặc phản hồi tài liệu của bạn.</p>
              </div>
            </div>
          </div>
          <div className="p-6 bg-[#f8f8f6] border-t border-neutral-surface flex justify-end">
            <Button className="bg-[#e6cc4c] text-[#171611] font-black px-10 h-12 rounded-2xl hover:bg-[#d4ba3d] shadow-lg shadow-[#e6cc4c]/20 transition-all active:scale-95">
              Lưu thay đổi
            </Button>
          </div>
        </section>

        {/* Account Footer */}
        <footer className="pt-12 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-t border-neutral-surface pt-8">
            <div className="flex items-center gap-3">
              <div className="bg-[#e6cc4c]/20 p-2 rounded-xl">
                <Rocket className="w-6 h-6 text-[#e6cc4c]" />
              </div>
              <p className="text-sm font-black text-[#171611] opacity-80">AISEP Startup Platform © 2024</p>
            </div>
            <div className="flex gap-8 text-xs font-black text-neutral-muted uppercase tracking-widest">
              <a href="#" className="hover:text-[#e6cc4c] transition-colors">Điều khoản</a>
              <a href="#" className="hover:text-[#e6cc4c] transition-colors">Chính sách bảo mật</a>
              <a href="#" className="hover:text-[#e6cc4c] transition-colors">Trung tâm hỗ trợ</a>
            </div>
          </div>
        </footer>
      </main>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={isChangeModalOpen}
        onClose={() => setIsChangeModalOpen(false)}
        onSuccess={handlePasswordSuccess}
      />
      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />
    </StartupShell>
  );
}
