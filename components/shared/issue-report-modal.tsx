"use client";

import { useState, useRef, useEffect } from "react";
import { 
  X, 
  AlertCircle, 
  Upload, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  ShieldAlert,
  Info,
  Trash2,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogDescription,
  DialogPortal,
  DialogOverlay
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SubmitIssueReport, IssueCategory } from "@/services/issue-report.api";

interface IssueReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: {
    entityType: string;
    entityId: string;
    entityTitle: string;
    otherPartyName?: string;
  };
}

const CATEGORIES: { value: IssueCategory; label: string }[] = [
  { value: "PAYMENT_ISSUE", label: "Vấn đề Thanh toán" },
  { value: "CONSULTING_ISSUE", label: "Vấn đề Tư vấn" },
  { value: "MESSAGING_ISSUE", label: "Tin nhắn & Trao đổi" },
  { value: "OFFER_OR_CONNECTION_ISSUE", label: "Đề nghị & Kết nối" },
  { value: "VERIFICATION_ISSUE", label: "Xác thực hồ sơ" },
  { value: "DOCUMENT_ISSUE", label: "Tài liệu & Hồ sơ" },
  { value: "HARASSMENT_OR_MISCONDUCT", label: "Quấy rối / Vi phạm đạo đức" },
  { value: "TECHNICAL_PROBLEM", label: "Lỗi kỹ thuật hệ thống" },
  { value: "OTHER", label: "Vấn đề khác" },
];

export function IssueReportModal({ isOpen, onClose, context }: IssueReportModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [category, setCategory] = useState<IssueCategory | "">("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("form");
      setCategory("");
      setDescription("");
      setFiles([]);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleSubmit = async () => {
    if (!category || description.length < 20) return;

    setIsSubmitting(true);
    try {
      const res = await SubmitIssueReport({
        issueCategory: category as IssueCategory,
        description,
        attachments: files,
        relatedEntityType: context?.entityType,
        relatedEntityId: context?.entityId,
      });

      if (res.success) {
        setStep("success");
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Đã có lỗi xảy ra khi gửi báo cáo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = category !== "" && description.length >= 20;

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !isSubmitting && !val && onClose()}>
      <DialogPortal>
        <DialogOverlay className="bg-black/40 backdrop-blur-sm z-[100]" />
        <DialogContent 
          showCloseButton={false}
          className="max-w-[500px] w-full bg-white rounded-[24px] border-none shadow-2xl p-0 overflow-hidden z-[101] animate-in zoom-in-95 duration-200" 
          style={{ fontFamily: "var(--font-be-vietnam-pro), sans-serif" }}
        >
          
          {step === "form" ? (
            <div className="flex flex-col h-full max-h-[90vh]">
              {/* Header */}
              <div className="px-8 pt-8 pb-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-amber-50/50 flex items-center justify-center border border-amber-100/50 shadow-sm">
                      <ShieldAlert className="w-5 h-5 text-amber-500" />
                    </div>
                    <DialogTitle className="text-[20px] font-bold text-slate-900 tracking-tight">Báo cáo sự cố</DialogTitle>
                  </div>
                  <button 
                    onClick={onClose} 
                    disabled={isSubmitting} 
                    className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all active:scale-95"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <DialogDescription className="text-[13.5px] text-slate-500 font-medium leading-relaxed">
                  Mô tả vấn đề bạn gặp phải để đội ngũ hỗ trợ sớm xử lý.
                </DialogDescription>
              </div>

              {/* Scrollable Body */}
              <div className="px-8 py-2 overflow-y-auto space-y-6 custom-scrollbar pb-6">
                
                {/* Context Card */}
                {context && (
                  <div className="px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-start gap-3.5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="size-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                      <Info className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Đang báo cáo về</p>
                      <p className="text-[13.5px] font-bold text-slate-700 truncate">
                        {context.entityTitle} {context.otherPartyName ? `— ${context.otherPartyName}` : ""}
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">Mã: {context.entityId}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Danh mục sự cố <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value as IssueCategory)}
                      className="w-full px-4 h-12 rounded-2xl border border-slate-200 text-[14px] font-medium text-slate-700 bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 transition-all cursor-pointer appearance-none"
                    >
                      <option value="" disabled>Chọn danh mục...</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300 group-hover:text-slate-400 transition-colors">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end ml-1">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Mô tả chi tiết <span className="text-red-400">*</span></label>
                    <span className={cn(
                      "text-[10px] font-bold tracking-wider", 
                      description.length === 0 ? "text-slate-300" :
                      description.length >= 20 ? "text-slate-400" : "text-amber-500"
                    )}>
                      {description.length} / 2000
                    </span>
                  </div>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Vui lòng mô tả chuyện gì đã xảy ra, vào lúc nào..."
                    className="w-full p-4 rounded-2xl border border-slate-200 text-[14px] font-medium text-slate-700 bg-white focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 transition-all resize-none min-h-[140px] placeholder:text-slate-300 leading-relaxed"
                    maxLength={2000}
                  />
                  {description.length > 0 && description.length < 20 && (
                    <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1.5 mt-2 ml-1 animate-in fade-in slide-in-from-left-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Thêm ít nhất {20 - description.length} ký tự nữa
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Bằng chứng (Hình ảnh/Tài liệu)</label>
                  
                  {/* Dropzone */}
                  <div 
                    className={cn(
                      "border-2 border-dashed rounded-[20px] p-8 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer group",
                      dragActive ? "border-amber-400 bg-amber-50/30" : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50"
                    )}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      multiple 
                      onChange={handleFileChange}
                      accept="image/*,application/pdf"
                    />
                    <div className="size-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                      <Upload className="w-5 h-5 text-slate-400 group-hover:text-amber-500 transition-colors" />
                    </div>
                    <div className="text-center">
                      <p className="text-[13.5px] font-bold text-slate-600">Nhấn để tải lên hoặc kéo thả</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Hỗ trợ JPG, PNG, PDF tối đa 10MB</p>
                    </div>
                  </div>

                  {/* File List */}
                  {files.length > 0 && (
                    <div className="grid grid-cols-1 gap-2.5 mt-4">
                      {files.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm animate-in slide-in-from-left-2 duration-300">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="size-8 rounded-lg bg-slate-50 flex items-center justify-center">
                              <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="text-[12.5px] font-bold text-slate-700 truncate max-w-[240px]">{file.name}</span>
                              <span className="text-[10px] font-medium text-slate-400 uppercase">{(file.size / 1024).toFixed(0)} KB</span>
                            </div>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); removeFile(idx); }} className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-xl transition-all active:scale-95">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-8 pt-5 border-t border-slate-100 flex items-center justify-end gap-4 bg-white">
                <button 
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none px-8 h-12 rounded-2xl border border-slate-200 text-slate-600 text-[14px] font-bold hover:bg-slate-50 transition-all disabled:opacity-50 active:scale-95"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={!isValid || isSubmitting}
                  className={cn(
                    "flex-1 sm:flex-none px-12 h-12 rounded-2xl font-bold text-[14px] flex items-center justify-center gap-2 transition-all shadow-xl shadow-black/5 active:scale-95",
                    isValid 
                      ? "bg-[#0f172a] text-white hover:bg-slate-800" 
                      : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-100"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Gửi báo cáo"
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Success State */
            <div className="p-12 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="relative mb-8">
                <div className="size-20 rounded-full bg-emerald-50 flex items-center justify-center">
                  <div className="size-14 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200 animate-in zoom-in duration-500 delay-200">
                    <CheckCircle2 className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 size-5 rounded-full bg-[#f0f042] border-4 border-white animate-bounce" />
              </div>
              
              <h3 className="text-[24px] font-black text-slate-900 mb-2">Đã nhận báo cáo!</h3>
              <p className="text-[14px] text-slate-500 leading-relaxed mb-10 max-w-[320px]">
                Cảm ơn bạn đã phản hồi. Đội ngũ quản trị AISEP sẽ xem xét và phản hồi qua email hoặc trung tâm thông báo sớm nhất có thể.
              </p>

              <button 
                onClick={onClose}
                className="w-full h-12 rounded-xl bg-[#0f172a] text-white font-bold text-[14px] hover:bg-slate-800 transition-all shadow-lg shadow-black/10 active:scale-[0.98]"
              >
                Đóng lại
              </button>
            </div>
          )}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

// Add some CSS to hide scrollbar but keep functionality
const style = `
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #f1f5f9;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #e2e8f0;
}
`;

if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.innerHTML = style;
  document.head.appendChild(s);
}
