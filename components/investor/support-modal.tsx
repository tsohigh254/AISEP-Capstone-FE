"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  HelpCircle, 
  MessageSquare, 
  Upload, 
  ShieldCheck, 
  Bug, 
  Lightbulb, 
  MoreHorizontal,
  X,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOPICS = [
  { id: "TECHNICAL", label: "Lỗ kỹ thuật (Technical Error)", icon: Bug },
  { id: "KYC", label: "Xác thực KYC (KYC Verification)", icon: ShieldCheck },
  { id: "FEEDBACK", label: "Góp ý tính năng (Feature Feedback)", icon: Lightbulb },
  { id: "OTHER", label: "Yêu cầu khác (Other)", icon: MoreHorizontal },
];

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = () => {
    if (!topic || !description.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }

    setIsSubmitting(true);
    // Mock API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Yêu cầu của bạn đã được gửi thành công. Chúng tôi sẽ phản hồi sớm nhất có thể.");
      onClose();
      // Reset form
      setTopic("");
      setDescription("");
      setFileName(null);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 rounded-[28px] border-none shadow-2xl overflow-hidden bg-white max-h-[95vh] flex flex-col">
        <div className="bg-[#fdfdfb] px-6 py-8 border-b border-slate-100 relative overflow-hidden flex-shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#e6cc4c]/10 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <DialogHeader className="relative z-10">
            <div className="w-12 h-12 rounded-xl bg-white border border-[#e6cc4c]/30 flex items-center justify-center shadow-sm mb-4">
              <HelpCircle className="w-6 h-6 text-[#C8A000]" />
            </div>
            <DialogTitle className="text-xl font-black text-[#171611] tracking-tight">Hỗ trợ & Góp ý</DialogTitle>
            <p className="text-[13px] text-[#878164] font-medium mt-1.5 leading-relaxed max-w-[360px]">
              Đội ngũ AISEP luôn sẵn sàng lắng nghe và hỗ trợ bạn.
            </p>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {/* Topic Selection */}
          <div className="space-y-2.5">
             <label className="text-[12px] font-bold text-[#171611] flex items-center gap-2 uppercase tracking-wider ml-1">
                Chủ đề hỗ trợ
                <span className="text-red-500 font-black">*</span>
             </label>
             <div className="grid grid-cols-2 gap-2.5">
                {TOPICS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTopic(t.id)}
                    className={cn(
                        "flex items-center gap-2.5 px-3 py-3 rounded-xl border text-[13px] font-bold transition-all text-left group",
                        topic === t.id 
                            ? "bg-[#e6cc4c]/10 border-[#e6cc4c] text-[#C8A000] shadow-sm shadow-[#e6cc4c]/10" 
                            : "bg-[#f8f8f6] border-transparent text-slate-500 hover:bg-white hover:border-slate-200"
                    )}
                  >
                    <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center transition-colors shrink-0",
                        topic === t.id ? "bg-[#e6cc4c] text-white" : "bg-white text-slate-400 group-hover:text-slate-600"
                    )}>
                        <t.icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{t.label.split(" (")[0]}</span>
                  </button>
                ))}
             </div>
          </div>

          {/* Description */}
          <div className="space-y-2.5">
            <label className="text-[12px] font-bold text-[#171611] flex items-center gap-2 uppercase tracking-wider ml-1">
                Chi tiết yêu cầu
                <span className="text-red-500 font-black">*</span>
            </label>
            <textarea
              className="w-full h-32 px-4 py-3 bg-[#f8f8f6] border border-transparent focus:bg-white focus:border-[#e6cc4c] focus:ring-4 focus:ring-[#e6cc4c]/10 rounded-xl outline-none transition-all text-[13px] font-medium resize-none placeholder:text-[#B0AD98]"
              placeholder="Vui lòng mô tả chi tiết vấn đề..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Attachment */}
          <div className="space-y-2.5">
            <label className="text-[12px] font-bold text-[#171611] flex items-center gap-2 uppercase tracking-wider ml-1">
                Tệp đính kèm (Tùy chọn)
            </label>
            <div className="relative group">
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="w-full px-4 py-4 bg-[#f8f8f6] border-2 border-dashed border-slate-200 group-hover:bg-white group-hover:border-[#e6cc4c]/50 rounded-xl transition-all flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover:text-[#e6cc4c] transition-colors">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-[#171611] truncate">{fileName || "Tải lên tệp đính kèm"}</p>
                    <p className="text-[10px] text-slate-400 font-medium">PNG, JPG, PDF (Max 5MB)</p>
                  </div>
                </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-3 flex flex-row gap-3 flex-shrink-0 border-t border-slate-50 bg-[#fdfdfb]/50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl text-[12px] font-bold hover:bg-slate-50 transition-all uppercase tracking-wider active:scale-95 whitespace-nowrap"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleSubmit}
            disabled={!topic || !description.trim() || isSubmitting}
            className={cn(
                "flex-[1.5] px-4 py-3 rounded-xl text-[12px] font-black uppercase tracking-wider transition-all duration-300 shadow-sm active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap border",
                (!topic || !description.trim() || isSubmitting)
                    ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed shadow-none"
                    : "bg-white text-[#171611] border-slate-200 hover:bg-[#e6cc4c] hover:border-[#e6cc4c] hover:-translate-y-0.5"
            )}
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <MessageSquare className="w-3.5 h-3.5" />
                Gửi yêu cầu
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
