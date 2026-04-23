"use client";

import React from "react";
import { 
  X, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Target, 
  Scale, 
  FileText,
  UserCheck,
  Building2,
  Users,
  ChevronRight,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StaffHelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StaffHelpDrawer({ isOpen, onClose }: StaffHelpDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] animate-in fade-in duration-300 shadow-2xl" 
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={cn(
          "fixed top-0 right-0 w-full sm:w-[500px] md:w-[600px] h-full bg-white z-[70] shadow-2xl transition-transform duration-500 ease-in-out flex flex-col font-plus-jakarta-sans",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#eec54e]/10 flex items-center justify-center text-[#eec54e]">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-[18px] font-black text-[#171611] tracking-tight">Hướng dẫn phê duyệt KYC</h2>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Quy trình & Nguyên tắc review</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
          
          {/* Section: Mục tiêu */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Target className="w-5 h-5 text-[#eec54e]" />
              <h3 className="text-[15px] font-black text-slate-900 border-b-2 border-[#eec54e]/20 pb-1">Mục tiêu quy trình</h3>
            </div>
            <div className="bg-[#eec54e]/5 rounded-2xl p-5 border border-[#eec54e]/20">
              <p className="text-[14px] text-slate-700 leading-relaxed font-semibold">
                Quy trình KYC của AISEP là <span className="text-[#171611] font-black underline decoration-[#eec54e] underline-offset-4">light verification</span>.
              </p>
              <ul className="mt-4 space-y-3">
                {[
                  "Xác nhận hồ sơ có tồn tại ở mức cơ bản",
                  "Không phải tài khoản giả mạo",
                  "Dấu hiệu liên hệ hợp lý giữa người nộp và tổ chức",
                  "Đủ cơ sở để gán nhãn xác thực (label) tương ứng"
                ].map((text, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-[13px] text-slate-600 font-medium leading-normal">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section: Nguyên tắc review */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Scale className="w-5 h-5 text-[#eec54e]" />
              <h3 className="text-[15px] font-black text-slate-900 border-b-2 border-[#eec54e]/20 pb-1">Nguyên tắc review chung</h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[
                { title: "Bằng chứng có sẵn", desc: "Chỉ đánh giá dựa trên thông tin nộp, link công khai và file chứng minh.", icon: FileText },
                { title: "Không vượt quá scope", desc: "Không yêu cầu kiểm toán doanh nghiệp hay chứng minh tài chính chuyên sâu.", icon: Target },
                { title: "Ưu tiên bổ sung thông tin", desc: "Nếu chưa rõ, hãy dùng 'Pending More Info' thay vì reject ngay.", icon: Info },
              ].map((item, idx) => (
                <div key={idx} className="bg-white border border-slate-100 rounded-xl p-4 flex gap-4 hover:border-[#eec54e]/30 transition-all group">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-[#eec54e] group-hover:bg-[#eec54e]/5 transition-all">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-black text-slate-900">{item.title}</h4>
                    <p className="text-[12px] text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Quy trình 5 bước */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-[#eec54e]" />
              <h3 className="text-[15px] font-black text-slate-900 border-b-2 border-[#eec54e]/20 pb-1">Quy trình 5 bước đề xuất</h3>
            </div>
            <div className="space-y-3 ml-2 border-l-2 border-slate-100 pl-6 py-2">
              {[
                { step: "Bước 1", title: "Kiểm tra loại hồ sơ", desc: "Xác định đúng nhóm (Startup, Investor, Advisor)." },
                { step: "Bước 2", title: "Review từng trường", desc: "Chọn mức đánh giá (Match, Partial, Mismatch...)." },
                { step: "Bước 3", title: "Kiểm tra Hard Fail", desc: "Phát hiện các dấu hiệu giả mạo hoặc lỗi nghiêm trọng." },
                { step: "Bước 4", title: "Xem điểm & Label", desc: "Đối chiếu ngưỡng điểm và điều kiện gán nhãn xác thực." },
                { step: "Bước 5", title: "Ra quyết định", desc: "Approve, Pending More Info, hoặc Reject." },
              ].map((item, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-white border-2 border-[#eec54e] group-hover:scale-125 transition-all shadow-[0_0_8px_rgba(238,197,78,0.3)]" />
                  <span className="text-[10px] font-black text-[#eec54e] uppercase tracking-widest">{item.step}</span>
                  <h4 className="text-[13px] font-black text-slate-900 mt-0.5 tracking-tight">{item.title}</h4>
                  <p className="text-[12px] text-slate-500 leading-snug">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Hướng dẫn theo loại hồ sơ */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-[#eec54e]" />
              <h3 className="text-[15px] font-black text-slate-900 border-b-2 border-[#eec54e]/20 pb-1">Chi tiết theo loại hồ sơ</h3>
            </div>
            <div className="space-y-4">
              {/* Card - Startup */}
              <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 hover:border-slate-200 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-black text-[12px]">ST</div>
                  <h4 className="text-[14px] font-black text-slate-900">Hồ sơ Startup</h4>
                </div>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mb-1">Cần ưu tiên</p>
                    <p className="text-[12px] text-slate-600 font-medium">Mã số doanh nghiệp, GPKD (nếu có), Product Link/Website, Role của Founder.</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-[11px] font-black text-red-500 uppercase tracking-widest mb-1">Hard Fail</p>
                    <p className="text-[12px] text-slate-600 font-medium">Mã số thuế không tồn tại, file GPKD giả mạo, link không liên quan.</p>
                  </div>
                </div>
              </div>

              {/* Card - Investor */}
              <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 hover:border-slate-200 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-[12px]">IN</div>
                  <h4 className="text-[14px] font-black text-slate-900">Nhà đầu tư (Investor)</h4>
                </div>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mb-1">Cần ưu tiên</p>
                    <p className="text-[12px] text-slate-600 font-medium">Danh tính tổ chức, professional online profile (LinkedIn), bằng chứng hoạt động đầu tư.</p>
                  </div>
                </div>
              </div>

              {/* Card - Advisor */}
              <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 hover:border-slate-200 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-black text-[12px]">AD</div>
                  <h4 className="text-[14px] font-black text-slate-900">Cố vấn (Advisor)</h4>
                </div>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                    <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest mb-1">Cần ưu tiên</p>
                    <p className="text-[12px] text-slate-600 font-medium">Lĩnh vực chuyên môn, LinkedIn/CV, tính nhất quán với tổ chức hiện tại.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Pending vs Reject */}
          <section className="bg-slate-900 rounded-3xl p-6 text-white space-y-6 shadow-xl shadow-slate-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-[#eec54e]" />
              <h3 className="text-[16px] font-black tracking-tight">Quyết định quan trọng</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <p className="text-[13px] font-black text-amber-400 uppercase tracking-widest">Pending More Info</p>
                </div>
                <p className="text-[12px] text-slate-300 font-medium leading-relaxed">
                  Dùng khi hồ sơ không có hard fail nhưng bằng chứng còn yếu, chưa đủ rõ để approve. Cần người dùng nộp bổ sung.
                </p>
              </div>

              <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <p className="text-[13px] font-black text-rose-500 uppercase tracking-widest">Reject / Failed</p>
                </div>
                <p className="text-[12px] text-slate-300 font-medium leading-relaxed">
                  Chỉ reject khi có Hard Fail, dấu hiệu giả mạo rõ ràng hoặc thông tin mâu thuẫn nghiêm trọng.
                </p>
              </div>
            </div>
          </section>

          {/* Footer Note */}
          <div className="pt-6 border-t border-slate-100 pb-4">
            <div className="flex items-center justify-center gap-2 text-slate-400 text-[11px] font-bold uppercase tracking-widest">
              <CheckCircle2 className="w-4 h-4" />
              AISEP Compliance Team 2026
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
