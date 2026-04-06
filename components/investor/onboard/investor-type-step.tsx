"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Building2, User, CheckCircle2, ArrowRight, ArrowLeft, AlertTriangle, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type InvestorType = "INSTITUTIONAL" | "INDIVIDUAL_ANGEL";

interface InvestorTypeStepProps {
  selected: InvestorType | null;
  onSelect: (type: InvestorType) => void;
  onNext: () => void;
  onBack: () => void;
}

const TYPE_META: Record<InvestorType, { label: string; desc: string; icon: React.ElementType }> = {
  INSTITUTIONAL: {
    label: "Institutional Investor",
    desc: "Quỹ đầu tư (VC), Doanh nghiệp (CVC), Vườn ươm hoặc Tổ chức tài chính có tư cách pháp nhân.",
    icon: Building2,
  },
  INDIVIDUAL_ANGEL: {
    label: "Individual / Angel",
    desc: "Nhà đầu tư thiên thần, cá nhân có chuyên môn hoặc nhân vật có tầm ảnh hưởng tham gia đầu tư độc lập.",
    icon: User,
  },
};

export function InvestorTypeStep({ selected, onSelect, onNext, onBack }: InvestorTypeStepProps) {
  const [pendingType, setPendingType] = useState<InvestorType | null>(null);

  const handleCardClick = (type: InvestorType) => {
    // Nếu đã chọn loại này rồi thì không cần confirm lại
    if (selected === type) return;
    setPendingType(type);
  };

  const handleConfirm = () => {
    if (pendingType) {
      onSelect(pendingType);
      setPendingType(null);
    }
  };

  const handleCancel = () => setPendingType(null);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Chào mừng Nhà đầu tư!</h1>
        <p className="text-[13px] text-slate-500 font-normal">Bạn tham gia AISEP với tư cách là cá nhân hay tổ chức?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[720px] mx-auto">
        {(Object.entries(TYPE_META) as [InvestorType, typeof TYPE_META[InvestorType]][]).map(([type, meta]) => {
          const Icon = meta.icon;
          const isSelected = selected === type;
          return (
            <button
              key={type}
              onClick={() => handleCardClick(type)}
              className={cn(
                "group relative p-6 rounded-2xl border transition-all duration-300 overflow-hidden text-left h-full flex flex-col",
                isSelected
                  ? "border-[#eec54e] bg-white ring-2 ring-[#eec54e]/10 shadow-[0_8px_24px_rgba(238,197,78,0.12)]"
                  : "border-slate-200/80 bg-white hover:border-slate-300 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-all duration-500",
                isSelected ? "bg-[#eec54e] text-slate-900 shadow-md" : "bg-slate-50 text-slate-400 group-hover:bg-[#eec54e]/20 group-hover:text-slate-900"
              )}>
                <Icon className="w-6 h-6" />
              </div>

              <h3 className="text-[15px] font-bold text-slate-900 mb-2">{meta.label}</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed font-normal flex-1">{meta.desc}</p>

              <div className={cn(
                "absolute top-5 right-5 transition-all duration-500",
                isSelected ? "opacity-100 scale-100" : "opacity-0 scale-75"
              )}>
                <div className="bg-[#eec54e] rounded-full p-0.5 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Warning note */}
      <div className="flex items-start gap-3 max-w-[720px] mx-auto px-1">
        <Lock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
        <p className="text-[12px] text-slate-400 leading-relaxed">
          Loại hình đầu tư <span className="font-semibold text-slate-500">không thể thay đổi</span> sau khi xác nhận. Hãy chắc chắn trước khi tiếp tục.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-8 border-t border-slate-100 mt-6">
        <button
          onClick={onBack}
          className="h-11 px-6 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl flex items-center justify-center gap-2 text-[13px] font-semibold hover:bg-slate-100 transition-all active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>

        <button
          onClick={onNext}
          disabled={!selected}
          className="h-11 px-10 bg-[#0f172a] text-white rounded-xl text-[13px] font-semibold flex items-center gap-2 hover:bg-[#1e293b] transition-all shadow-sm active:scale-[0.98] disabled:opacity-20 disabled:cursor-not-allowed group"
        >
          Tiếp tục thiết lập hồ sơ
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={!!pendingType} onOpenChange={open => !open && handleCancel()}>
        <DialogContent className="sm:max-w-[420px] rounded-[28px] p-0 overflow-hidden border-none shadow-2xl bg-white">
          <div className="p-7 space-y-5">
            <div className="size-14 rounded-[20px] bg-amber-50 flex items-center justify-center border border-amber-100 mx-auto">
              <AlertTriangle className="w-7 h-7 text-amber-500" />
            </div>

            <div className="text-center space-y-2">
              <DialogTitle className="text-[17px] font-bold text-slate-900">
                Xác nhận loại hình đầu tư
              </DialogTitle>
              <DialogDescription className="text-[13px] text-slate-500 leading-relaxed">
                Bạn đang chọn{" "}
                <span className="font-bold text-slate-800">
                  {pendingType ? TYPE_META[pendingType].label : ""}
                </span>
                .
              </DialogDescription>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
              <Lock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <p className="text-[12px] text-amber-800 leading-relaxed">
                <span className="font-bold block mb-0.5">Lưu ý quan trọng</span>
                Loại hình đầu tư <strong>không thể thay đổi</strong> sau khi hoàn tất đăng ký. Nếu cần điều chỉnh, bạn sẽ phải liên hệ bộ phận hỗ trợ.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleCancel}
                className="py-3 rounded-xl font-bold text-[13px] bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all active:scale-95"
              >
                Chọn lại
              </button>
              <button
                onClick={handleConfirm}
                className="py-3 rounded-xl font-bold text-[13px] bg-[#0f172a] text-white hover:bg-slate-800 transition-all active:scale-95"
              >
                Xác nhận chọn
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
