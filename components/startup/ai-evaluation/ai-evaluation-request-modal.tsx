"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, FileText, Layout, CircleDollarSign, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GetDocument } from "@/services/document/document.api";

interface AIEvaluationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (documentId: number) => void;
}

export function AIEvaluationRequestModal({ isOpen, onClose, onSubmit }: AIEvaluationRequestModalProps) {
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocId, setSelectedDocId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    async function fetchDocs() {
      setLoading(true);
      try {
        const res = await GetDocument(false);
        const data = (res as any)?.data ?? [];
        if (Array.isArray(data)) {
          // Filter to only Pitch Deck (0) and Business Plan (1)
          setDocuments(data.filter((d: IDocument) =>
            String(d.documentType) === "0" || String(d.documentType) === "1"
            || d.documentType === "Pitch_Deck" || d.documentType === "Bussiness_Plan"
          ));
        }
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    }
    fetchDocs();
  }, [isOpen]);

  const pitchDecks = documents.filter(d => String(d.documentType) === "0" || d.documentType === "Pitch_Deck");
  const businessPlans = documents.filter(d => String(d.documentType) === "1" || d.documentType === "Bussiness_Plan");

  const canSubmit = selectedDocId !== null;

  const handleSubmit = () => {
    if (canSubmit && selectedDocId !== null) {
      onSubmit(selectedDocId);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none rounded-[32px] bg-slate-50 dark:bg-slate-900">
        <DialogHeader className="p-8 pb-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="size-10 bg-[#eec54e]/10 rounded-xl flex items-center justify-center">
              <Layout className="size-6 text-[#eec54e]" />
            </div>
            Yêu cầu đánh giá AI
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium mt-2">
            Chọn tài liệu để gửi đánh giá. BE sẽ xử lý từng tài liệu riêng (1 lần gọi = 1 document).
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <>
              {/* Pitch Deck Selection */}
              {pitchDecks.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Pitch Deck</h3>
                  <div className="grid gap-3">
                    {pitchDecks.map((doc) => (
                      <button
                        key={doc.documentID}
                        onClick={() => setSelectedDocId(doc.documentID)}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group",
                          selectedDocId === doc.documentID
                            ? "bg-white border-[#eec54e] shadow-lg shadow-[#eec54e]/10 dark:bg-slate-800"
                            : "bg-white/50 border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
                        )}
                      >
                        <div className={cn(
                          "size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                          selectedDocId === doc.documentID ? "bg-[#eec54e] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                        )}>
                          <FileText className="size-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-[14px] font-bold truncate",
                            selectedDocId === doc.documentID ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"
                          )}>
                            {doc.title || doc.fileUrl}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium tracking-tight">Version: {doc.version}</p>
                        </div>
                        {selectedDocId === doc.documentID && (
                          <div className="size-6 rounded-full bg-[#eec54e] flex items-center justify-center text-white">
                            <Check className="size-4" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Business Plan Selection */}
              {businessPlans.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Business Plan</h3>
                  <div className="grid gap-3">
                    {businessPlans.map((doc) => (
                      <button
                        key={doc.documentID}
                        onClick={() => setSelectedDocId(doc.documentID)}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group",
                          selectedDocId === doc.documentID
                            ? "bg-white border-[#eec54e] shadow-lg shadow-[#eec54e]/10 dark:bg-slate-800"
                            : "bg-white/50 border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
                        )}
                      >
                        <div className={cn(
                          "size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                          selectedDocId === doc.documentID ? "bg-[#eec54e] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                        )}>
                          <CircleDollarSign className="size-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-[14px] font-bold truncate",
                            selectedDocId === doc.documentID ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"
                          )}>
                            {doc.title || doc.fileUrl}
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium tracking-tight">Version: {doc.version}</p>
                        </div>
                        {selectedDocId === doc.documentID && (
                          <div className="size-6 rounded-full bg-[#eec54e] flex items-center justify-center text-white">
                            <Check className="size-4" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {documents.length === 0 && (
                <p className="text-center text-[13px] text-slate-400 py-8">
                  Chưa có tài liệu Pitch Deck hoặc Business Plan. Vui lòng tải lên trước.
                </p>
              )}
            </>
          )}
        </div>

        <DialogFooter className="p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
          <Button
            variant="outline"
            onClick={onClose}
            className="h-12 px-6 rounded-2xl border-slate-200 font-bold"
          >
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="h-12 px-8 rounded-2xl bg-[#171611] hover:bg-black text-white font-black text-[14px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            Bắt đầu đánh giá ngay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
