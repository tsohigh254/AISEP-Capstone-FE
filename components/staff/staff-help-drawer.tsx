"use client";

import React from "react";
import { 
  X, 
  BookOpen, 
  Info, 
  Target, 
  Scale, 
  FileText,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StaffHelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StaffHelpDrawer({ isOpen, onClose }: StaffHelpDrawerProps) {
  const reviewPrinciples = [
    {
      title: "Bằng chứng có sẵn",
      desc: "Chỉ đánh giá dựa trên thông tin nộp, link công khai và file chứng minh.",
      icon: FileText,
    },
    {
      title: "Không vượt quá scope",
      desc: "Không yêu cầu kiểm toán doanh nghiệp hay chứng minh tài chính chuyên sâu.",
      icon: Target,
    },
    {
      title: "Ưu tiên bổ sung thông tin",
      desc: "Nếu chưa rõ, hãy dùng 'Pending More Info' thay vì reject ngay.",
      icon: Info,
    },
  ];

  const reviewSteps = [
    { step: "BƯỚC 1", title: "Kiểm tra loại hồ sơ", desc: "Xác định đúng nhóm (Startup, Investor, Advisor)." },
    { step: "BƯỚC 2", title: "Review từng trường", desc: "Chọn mức đánh giá (Match, Partial, Mismatch...)." },
    { step: "BƯỚC 3", title: "Kiểm tra Hard Fail", desc: "Phát hiện các dấu hiệu giả mạo hoặc lỗi nghiêm trọng." },
    { step: "BƯỚC 4", title: "Xem điểm & Label", desc: "Đối chiếu ngưỡng điểm và điều kiện gán nhãn xác thực." },
    { step: "BƯỚC 5", title: "Ra quyết định", desc: "Approve, Pending More Info, hoặc Reject." },
  ];

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
              <HelpCircle className="w-5 h-5" />
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
        <div className="flex-1 overflow-y-auto p-6 space-y-9 custom-scrollbar">

          {/* Section: Nguyên tắc review */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Scale className="w-5 h-5 text-[#eec54e]" />
              <h3 className="text-[15px] font-black text-slate-900 border-b-2 border-[#eec54e]/20 pb-1">
                Nguyên tắc review chung
              </h3>
            </div>
            <div className="space-y-3">
              {reviewPrinciples.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:border-[#eec54e]/35 hover:bg-[#fffdf4] group"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-400 ring-1 ring-slate-100 transition-all group-hover:text-[#b99028] group-hover:ring-[#eec54e]/40">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[14px] font-black tracking-tight text-slate-900">{item.title}</h4>
                      <p className="mt-1 text-[13px] leading-relaxed text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Quy trình 5 bước */}
          <section className="space-y-4">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-[#eec54e]" />
              <h3 className="text-[15px] font-black text-slate-900 border-b-2 border-[#eec54e]/20 pb-1">
                Quy trình 5 bước đề xuất
              </h3>
            </div>
            <div className="relative ml-1 space-y-4 border-l-2 border-[#f2e4ae] pl-6 py-1">
              {reviewSteps.map((item, idx) => (
                <div
                  key={idx}
                  className="relative rounded-xl border border-transparent px-2 py-1.5 transition-colors hover:border-[#f3e8b9] hover:bg-[#fffdf5]"
                >
                  <div className="absolute -left-[33px] top-[15px] h-3.5 w-3.5 rounded-full border-2 border-[#eec54e] bg-white shadow-[0_0_0_3px_#fff]" />
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#d7ac32]">{item.step}</p>
                  <h4 className="mt-0.5 text-[14px] font-black tracking-tight text-slate-900">{item.title}</h4>
                  <p className="text-[13px] leading-relaxed text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
