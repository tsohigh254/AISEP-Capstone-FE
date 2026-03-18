"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, FileText, Layout, CircleDollarSign, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Document {
  id: string;
  name: string;
  type: "PITCH_DECK" | "BUSINESS_PLAN";
  updatedAt: string;
}

const mockDocuments: Document[] = [
  { id: "doc_1", name: "TechAlpha_PitchDeck_V2.pdf", type: "PITCH_DECK", updatedAt: "2024-03-10" },
  { id: "doc_2", name: "TechAlpha_PitchDeck_Final.pdf", type: "PITCH_DECK", updatedAt: "2024-03-15" },
  { id: "doc_3", name: "TechAlpha_BusinessPlan_2024.pdf", type: "BUSINESS_PLAN", updatedAt: "2024-02-28" },
];

interface AIEvaluationRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (selectedDocs: { pitchDeckId: string; businessPlanId: string }) => void;
}

export function AIEvaluationRequestModal({ isOpen, onClose, onSubmit }: AIEvaluationRequestModalProps) {
  const [selectedPitchDeck, setSelectedPitchDeck] = useState<string>("");
  const [selectedBusinessPlan, setSelectedBusinessPlan] = useState<string>("");

  const pitchDecks = mockDocuments.filter(d => d.type === "PITCH_DECK");
  const businessPlans = mockDocuments.filter(d => d.type === "BUSINESS_PLAN");

  const canSubmit = selectedPitchDeck && selectedBusinessPlan;

  const handleSubmit = () => {
    if (canSubmit) {
      onSubmit({
        pitchDeckId: selectedPitchDeck,
        businessPlanId: selectedBusinessPlan
      });
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
            Vui lòng chọn các tài liệu mới nhất để AISEP có thể thực hiện phân tích và chấm điểm chính xác nhất.
          </DialogDescription>
        </DialogHeader>

        <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
          {/* Pitch Deck Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">1. Chọn Pitch Deck</h3>
              <span className="text-[10px] font-black text-red-500 uppercase bg-red-50 px-2 py-0.5 rounded">Bắt buộc</span>
            </div>
            <div className="grid gap-3">
              {pitchDecks.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedPitchDeck(doc.id)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group",
                    selectedPitchDeck === doc.id 
                      ? "bg-white border-[#eec54e] shadow-lg shadow-[#eec54e]/10 dark:bg-slate-800" 
                      : "bg-white/50 border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
                  )}
                >
                  <div className={cn(
                    "size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                    selectedPitchDeck === doc.id ? "bg-[#eec54e] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  )}>
                    <FileText className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-[14px] font-bold truncate",
                      selectedPitchDeck === doc.id ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"
                    )}>
                      {doc.name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium tracking-tight">Cập nhật: {doc.updatedAt}</p>
                  </div>
                  {selectedPitchDeck === doc.id && (
                    <div className="size-6 rounded-full bg-[#eec54e] flex items-center justify-center text-white">
                      <Check className="size-4" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Business Plan Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">2. Chọn Business Plan</h3>
              <span className="text-[10px] font-black text-red-500 uppercase bg-red-50 px-2 py-0.5 rounded">Bắt buộc</span>
            </div>
            <div className="grid gap-3">
              {businessPlans.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedBusinessPlan(doc.id)}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group",
                    selectedBusinessPlan === doc.id 
                      ? "bg-white border-[#eec54e] shadow-lg shadow-[#eec54e]/10 dark:bg-slate-800" 
                      : "bg-white/50 border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
                  )}
                >
                  <div className={cn(
                    "size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                    selectedBusinessPlan === doc.id ? "bg-[#eec54e] text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  )}>
                    <CircleDollarSign className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-[14px] font-bold truncate",
                      selectedBusinessPlan === doc.id ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"
                    )}>
                      {doc.name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium tracking-tight">Cập nhật: {doc.updatedAt}</p>
                  </div>
                  {selectedBusinessPlan === doc.id && (
                    <div className="size-6 rounded-full bg-[#eec54e] flex items-center justify-center text-white">
                      <Check className="size-4" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
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
