"use client";

import { useState, useRef, useEffect } from "react";
import {
  X, AlertCircle, Upload, FileText, Loader2, CheckCircle2,
  ShieldAlert, Info, Trash2, RefreshCw, AlertTriangle,
  CreditCard, Users, MessageSquare, Handshake, ShieldCheck,
  Wrench, HelpCircle, AlertOctagon, ImageIcon,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { SubmitIssueReport, IssueCategory } from "@/services/issue-report.api";

/* ─── Types ──────────────────────────────────────────────────── */

export interface IssueReportContext {
  entityType: string;
  entityId: string;
  entityTitle: string;
  otherPartyName?: string;
}

interface IssueReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  context?: IssueReportContext;
}

interface AttachedFile {
  file: File;
  error?: string;
}

/* ─── Constants ──────────────────────────────────────────────── */

const CATEGORIES: {
  value: IssueCategory;
  label: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}[] = [
  { value: "PAYMENT_ISSUE",             label: "Thanh toán",        icon: CreditCard,     color: "text-emerald-600", bg: "bg-emerald-50" },
  { value: "CONSULTING_ISSUE",          label: "Tư vấn",            icon: Users,           color: "text-blue-600",    bg: "bg-blue-50"    },
  { value: "MESSAGING_ISSUE",           label: "Tin nhắn",          icon: MessageSquare,   color: "text-cyan-600",    bg: "bg-cyan-50"    },
  { value: "OFFER_OR_CONNECTION_ISSUE", label: "Kết nối & Đề nghị", icon: Handshake,       color: "text-violet-600",  bg: "bg-violet-50"  },
  { value: "VERIFICATION_ISSUE",        label: "Xác thực",          icon: ShieldCheck,     color: "text-indigo-600",  bg: "bg-indigo-50"  },
  { value: "DOCUMENT_ISSUE",            label: "Tài liệu & IP",     icon: FileText,        color: "text-amber-600",   bg: "bg-amber-50"   },
  { value: "HARASSMENT_OR_MISCONDUCT",  label: "Vi phạm đạo đức",  icon: AlertOctagon,    color: "text-red-600",     bg: "bg-red-50"     },
  { value: "TECHNICAL_PROBLEM",         label: "Lỗi kỹ thuật",     icon: Wrench,          color: "text-slate-600",   bg: "bg-slate-100"  },
  { value: "OTHER",                     label: "Khác",              icon: HelpCircle,      color: "text-slate-500",   bg: "bg-slate-50"   },
];

const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

/* ─── Main Component ─────────────────────────────────────────── */

export function IssueReportModal({ isOpen, onClose, context }: IssueReportModalProps) {
  const [step, setStep] = useState<"form" | "error" | "success">("form");
  const [category, setCategory] = useState<IssueCategory | "">("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isDirty = category !== "" || description !== "" || attachments.length > 0;
  const isValid = category !== "" && description.length >= 20;
  const validFiles = attachments.filter(a => !a.error);
  const descProgress = Math.min((description.length / 20) * 100, 100);

  useEffect(() => {
    if (isOpen) {
      setStep("form"); setCategory(""); setDescription("");
      setAttachments([]); setSubmitError(""); setShowDiscard(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (isSubmitting) return;
    if (isDirty && step === "form") setShowDiscard(true);
    else onClose();
  };

  const validateFile = (file: File): string | undefined => {
    if (!ACCEPTED_TYPES.includes(file.type)) return "Định dạng không hỗ trợ (chỉ JPG, PNG, WebP, PDF)";
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) return `Vượt quá ${MAX_FILE_SIZE_MB}MB`;
    return undefined;
  };

  const addFiles = (incoming: FileList | File[]) => {
    const items: AttachedFile[] = Array.from(incoming).map(file => ({ file, error: validateFile(file) }));
    setAttachments(prev => [...prev, ...items]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsSubmitting(true); setSubmitError("");
    try {
      const res = await SubmitIssueReport({
        issueCategory: category as IssueCategory,
        description,
        attachments: validFiles.map(a => a.file),
        relatedEntityType: context?.entityType,
        relatedEntityId: context?.entityId,
      });
      if (res.success) setStep("success");
      else { setSubmitError(res.message || "Gửi báo cáo thất bại."); setStep("error"); }
    } catch {
      setSubmitError("Lỗi kết nối. Vui lòng thử lại."); setStep("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCat = CATEGORIES.find(c => c.value === category);

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !val && handleClose()}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[calc(100%-2rem)] sm:max-w-[520px] bg-white rounded-[28px] border-none shadow-[0_32px_80px_rgba(0,0,0,0.18)] p-0 overflow-hidden animate-in zoom-in-95 duration-200"
          style={{ fontFamily: "var(--font-be-vietnam-pro), sans-serif" }}
        >

          {/* ══ SUCCESS ══ */}
          {step === "success" && (
            <div className="p-10 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-400">
              <div className="relative mb-7">
                <div className="size-24 rounded-full bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center">
                  <div className="size-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200 animate-in zoom-in duration-500 delay-150">
                    <CheckCircle2 className="w-9 h-9 text-white" />
                  </div>
                </div>
                <span className="absolute -top-1 -right-1 size-6 rounded-full bg-[#eec54e] border-[3px] border-white shadow-sm animate-bounce" />
              </div>
              <h3 className="text-[22px] font-black text-slate-900 mb-2 tracking-tight">Đã nhận báo cáo!</h3>
              <p className="text-[13.5px] text-slate-500 leading-relaxed mb-8 max-w-[300px]">
                Đội ngũ AISEP sẽ xem xét và phản hồi qua trung tâm thông báo sớm nhất.
              </p>
              <button
                onClick={onClose}
                className="w-full h-12 rounded-2xl bg-[#0f172a] text-white font-bold text-[14px] hover:bg-slate-800 transition-all active:scale-[0.98]"
              >
                Đóng lại
              </button>
            </div>
          )}

          {/* ══ ERROR ══ */}
          {step === "error" && (
            <div className="p-10 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="size-20 rounded-full bg-red-50 flex items-center justify-center mb-5">
                <div className="size-13 rounded-full bg-red-100 flex items-center justify-center p-3.5">
                  <AlertTriangle className="w-7 h-7 text-red-500" />
                </div>
              </div>
              <h3 className="text-[20px] font-bold text-slate-900 mb-2">Gửi thất bại</h3>
              <p className="text-[13px] text-slate-500 leading-relaxed mb-7 max-w-[280px]">{submitError}</p>
              <div className="flex gap-2.5 w-full">
                <button onClick={onClose} className="flex-1 h-11 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-semibold hover:bg-slate-50 transition-colors">
                  Đóng
                </button>
                <button onClick={() => { setStep("form"); setSubmitError(""); }} className="flex-1 h-11 rounded-xl bg-[#0f172a] text-white text-[13px] font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5" /> Thử lại
                </button>
              </div>
            </div>
          )}

          {/* ══ FORM ══ */}
          {step === "form" && (
            <div className="flex flex-col max-h-[92vh]">

              {/* Header with gradient stripe */}
              <div className="relative px-7 pt-7 pb-5 flex-shrink-0">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1.5">
                      <div className="size-9 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center shadow-sm">
                        <ShieldAlert className="w-4.5 h-4.5 text-amber-600" style={{ width: 18, height: 18 }} />
                      </div>
                      <DialogTitle className="text-[18px] font-bold text-slate-900 tracking-tight">
                        Báo cáo sự cố
                      </DialogTitle>
                    </div>
                    <DialogDescription className="text-[12.5px] text-slate-400 leading-relaxed pl-12">
                      Mô tả vấn đề để đội ngũ hỗ trợ xử lý nhanh nhất.
                    </DialogDescription>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all mt-0.5 flex-shrink-0"
                  >
                    <X className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                  </button>
                </div>
              </div>

              {/* Scrollable body */}
              <div className="px-7 pb-6 overflow-y-auto space-y-5 flex-1 [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">

                {/* Context card */}
                {context && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-slate-50 to-white border border-slate-200/80">
                    <div className="size-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                      <Info className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-0.5">Liên quan đến</p>
                      <p className="text-[13px] font-semibold text-slate-700 truncate">
                        {context.entityTitle}{context.otherPartyName ? ` · ${context.otherPartyName}` : ""}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-300 shrink-0">{context.entityId}</span>
                  </div>
                )}

                {/* Category — custom pill grid */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      Danh mục <span className="text-red-400">*</span>
                    </label>
                    {selectedCat && (
                      <span className={cn("inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md", selectedCat.bg, selectedCat.color)}>
                        <selectedCat.icon style={{ width: 10, height: 10 }} />
                        {selectedCat.label}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map(cat => {
                      const Icon = cat.icon;
                      const isSelected = category === cat.value;
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setCategory(cat.value)}
                          className={cn(
                            "flex flex-col items-center gap-1.5 px-2 py-3 rounded-2xl border text-center transition-all duration-150 group",
                            isSelected
                              ? "bg-[#0f172a] border-[#0f172a] shadow-md scale-[1.02]"
                              : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50"
                          )}
                        >
                          <div className={cn(
                            "size-8 rounded-xl flex items-center justify-center transition-colors",
                            isSelected ? "bg-white/15" : cat.bg
                          )}>
                            <Icon className={cn("w-4 h-4", isSelected ? "text-white" : cat.color)} />
                          </div>
                          <span className={cn(
                            "text-[10.5px] font-semibold leading-tight",
                            isSelected ? "text-white" : "text-slate-600"
                          )}>
                            {cat.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      Mô tả chi tiết <span className="text-red-400">*</span>
                    </label>
                    <span className={cn(
                      "text-[10px] font-semibold tabular-nums",
                      description.length === 0 ? "text-slate-300"
                        : description.length >= 20 ? "text-slate-400"
                        : "text-amber-500"
                    )}>
                      {description.length} / 2000
                    </span>
                  </div>
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Mô tả chuyện gì đã xảy ra, vào lúc nào, và tại sao bạn cho rằng cần xem xét..."
                      maxLength={2000}
                      className="w-full px-4 pt-3.5 pb-8 rounded-2xl border border-slate-200 text-[13.5px] text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#eec54e]/30 focus:border-[#eec54e] transition-all resize-none min-h-[120px] placeholder:text-slate-300 leading-relaxed"
                    />
                    {/* Progress bar inside textarea */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2">
                      <div className="flex-1 h-1 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            descProgress >= 100 ? "bg-emerald-400"
                              : descProgress > 50 ? "bg-amber-400"
                              : "bg-slate-300"
                          )}
                          style={{ width: `${descProgress}%` }}
                        />
                      </div>
                      {description.length > 0 && description.length < 20 && (
                        <span className="text-[10px] text-amber-500 font-semibold whitespace-nowrap">
                          còn {20 - description.length} ký tự
                        </span>
                      )}
                      {description.length >= 20 && (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Attachments */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Bằng chứng{" "}
                    <span className="text-slate-300 font-normal normal-case tracking-normal">— tuỳ chọn</span>
                  </label>

                  {attachments.length === 0 ? (
                    /* Drop zone */
                    <div
                      onDragEnter={handleDrag} onDragOver={handleDrag}
                      onDragLeave={handleDrag} onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "relative border-2 border-dashed rounded-2xl p-5 flex items-center gap-4 cursor-pointer transition-all group",
                        dragActive
                          ? "border-amber-400 bg-amber-50/40"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                      )}
                    >
                      <input ref={fileInputRef} type="file" className="hidden" multiple
                        onChange={(e) => e.target.files && addFiles(e.target.files)}
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                      />
                      <div className={cn(
                        "size-10 rounded-xl border flex items-center justify-center flex-shrink-0 transition-colors",
                        dragActive ? "bg-amber-50 border-amber-200" : "bg-white border-slate-200 group-hover:border-slate-300"
                      )}>
                        <Upload className={cn("w-4.5 h-4.5 transition-colors", dragActive ? "text-amber-500" : "text-slate-400 group-hover:text-slate-500")} style={{ width: 18, height: 18 }} />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-slate-600 group-hover:text-slate-700 transition-colors">
                          {dragActive ? "Thả file vào đây..." : "Nhấn hoặc kéo thả file"}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, WebP, PDF · Tối đa {MAX_FILE_SIZE_MB}MB</p>
                      </div>
                    </div>
                  ) : (
                    /* File list + add more */
                    <div className="space-y-2">
                      {attachments.map((item, idx) => (
                        <div key={idx} className={cn(
                          "flex items-center gap-3 px-3.5 py-2.5 rounded-xl border animate-in slide-in-from-top-1 duration-150",
                          item.error ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"
                        )}>
                          <div className={cn("size-8 rounded-lg flex items-center justify-center flex-shrink-0",
                            item.error ? "bg-red-100" : "bg-white border border-slate-200"
                          )}>
                            {item.error
                              ? <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                              : item.file.type.startsWith("image/")
                                ? <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                                : <FileText className="w-3.5 h-3.5 text-slate-400" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-slate-700 truncate">{item.file.name}</p>
                            <p className={cn("text-[10px] mt-0.5", item.error ? "text-red-500" : "text-slate-400")}>
                              {item.error ? item.error : `${(item.file.size / 1024).toFixed(0)} KB`}
                            </p>
                          </div>
                          <button onClick={() => setAttachments(p => p.filter((_, i) => i !== idx))}
                            className="p-1.5 rounded-lg hover:bg-red-100 text-slate-300 hover:text-red-400 transition-all flex-shrink-0">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2 rounded-xl border border-dashed border-slate-200 text-[12px] font-medium text-slate-400 hover:text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" /> Thêm file
                      </button>
                      <input ref={fileInputRef} type="file" className="hidden" multiple
                        onChange={(e) => e.target.files && addFiles(e.target.files)}
                        accept="image/jpeg,image/png,image/webp,application/pdf"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-7 py-4 border-t border-slate-100 flex items-center gap-3 flex-shrink-0 bg-white">
                <button onClick={handleClose} disabled={isSubmitting}
                  className="px-5 h-11 rounded-xl border border-slate-200 text-slate-500 text-[13px] font-semibold hover:bg-slate-50 transition-all disabled:opacity-50 flex-shrink-0">
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!isValid || isSubmitting}
                  className={cn(
                    "flex-1 h-11 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
                    isValid && !isSubmitting
                      ? "bg-[#0f172a] text-white hover:bg-slate-800 shadow-sm"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  )}
                >
                  {isSubmitting
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang gửi...</>
                    : <>
                        <ShieldAlert className="w-4 h-4" />
                        Gửi báo cáo
                        {selectedCat && <span className="opacity-60 font-normal">· {selectedCat.label}</span>}
                      </>
                  }
                </button>
              </div>
            </div>
          )}

          {/* ══ DISCARD OVERLAY ══ */}
          {showDiscard && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/25 backdrop-blur-[2px] rounded-[28px]">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl mx-6 px-6 py-5 w-full animate-in zoom-in-95 duration-150">
                <h3 className="text-[14px] font-semibold text-slate-900 mb-1">Bỏ báo cáo này?</h3>
                <p className="text-[13px] text-slate-500 mb-4 leading-relaxed">Nội dung bạn đã nhập sẽ không được lưu.</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowDiscard(false)}
                    className="flex-1 py-2 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                    Tiếp tục
                  </button>
                  <button onClick={onClose}
                    className="flex-1 py-2 rounded-xl bg-red-600 text-white text-[13px] font-medium hover:bg-red-700 transition-colors">
                    Bỏ thay đổi
                  </button>
                </div>
              </div>
            </div>
          )}

        </DialogContent>
    </Dialog>
  );
}
