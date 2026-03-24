"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SkipOnboardingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function SkipOnboardingDialog({ isOpen, onOpenChange, onConfirm }: SkipOnboardingDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl bg-white">
        <div className="p-8 space-y-6">
          <div className="size-16 rounded-[24px] bg-amber-50 flex items-center justify-center border border-amber-100 mx-auto">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          
          <div className="text-center space-y-2">
            <DialogTitle className="text-[18px] font-bold text-slate-900">Thiết lập hồ sơ sau?</DialogTitle>
            <DialogDescription className="text-[13px] text-slate-500 leading-relaxed px-4">
              Bạn có thể bắt đầu khám phá Workspace ngay bây giờ. Đừng quên hoàn thiện hồ sơ sau để nhận được nhiều cơ hội kết nối hơn từ các Startup nhé!
              <span className="block font-bold mt-2 text-slate-900 text-[12px]">Lưu ý: Bạn có thể cập nhật trong phần Hoàn thiện hồ sơ sau này.</span>
            </DialogDescription>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button 
              onClick={() => onOpenChange(false)}
              className="py-3 rounded-xl font-bold text-[13px] bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all active:scale-95"
            >
              Tiếp tục làm
            </button>
            <button 
              onClick={onConfirm}
              className="py-3 rounded-xl font-bold text-[13px] bg-amber-500 text-white hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-200 transition-all active:scale-95"
            >
              Đồng ý, bỏ qua
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
