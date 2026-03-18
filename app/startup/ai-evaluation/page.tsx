"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StartupShell } from "@/components/startup/startup-shell";
import { AIEvaluationHeader, AIEvaluationDisclaimer } from "@/components/startup/ai-evaluation/ai-evaluation-header";
import { AIEvaluationStatusBanner } from "@/components/startup/ai-evaluation/ai-evaluation-status-banner";
import { AIEvaluationSummary } from "@/components/startup/ai-evaluation/ai-evaluation-summary";
import { AIEvaluationBreakdown } from "@/components/startup/ai-evaluation/ai-evaluation-breakdown";
import { AIEvaluationDetailedReport } from "@/components/startup/ai-evaluation/ai-evaluation-detailed-report";
import { AIEvaluationRecommendations } from "@/components/startup/ai-evaluation/ai-evaluation-recommendations";
import { AIEvaluationHistoryList } from "@/components/startup/ai-evaluation/ai-evaluation-history";
import { AIEvaluationEmpty, AIEvaluationAccessRestricted, AIEvaluationLoader } from "@/components/startup/ai-evaluation/ai-evaluation-states";
import { AIEvaluationRequestModal } from "@/components/startup/ai-evaluation/ai-evaluation-request-modal";
import { CustomToast } from "@/components/ui/custom-toast";
import { mockReports } from "./mock-data";
import { AIEvaluationStatus, UserRole, AIEvaluationReport } from "./types";
import { AlertCircle, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function StartupAIEvaluationPage() {
  const [currentReport, setCurrentReport] = useState<AIEvaluationReport | null>(null);
  const [status, setStatus] = useState<AIEvaluationStatus>("NOT_REQUESTED");
  const [userRole, setUserRole] = useState<UserRole>("STARTUP_OWNER");
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  // Simulation logic for evaluation process
  const startEvaluation = async (selectedDocs?: { pitchDeckId: string; businessPlanId: string }) => {
    setIsLoading(true);
    setStatus("VALIDATING");
    
    // If we have selected docs, we skip the random failure for simulation
    const hasDocuments = selectedDocs ? true : Math.random() > 0.2; 
    
    await new Promise(r => setTimeout(r, 2000));
    
    if (!hasDocuments) {
      setStatus("INSUFFICIENT_DATA");
      setIsLoading(false);
      return;
    }

    const states: AIEvaluationStatus[] = ["QUEUED", "ANALYZING", "SCORING", "GENERATING_REPORT", "COMPLETED"];
    
    for (const s of states) {
      await new Promise(r => setTimeout(r, 1500));
      setStatus(s);
      if (s === "COMPLETED") {
        setCurrentReport(mockReports[0]);
        setIsLoading(false);
      }
    }
  };

  const handleSelectHistory = (id: string) => {
    const report = mockReports.find(r => r.evaluationId === id);
    if (report) {
      setCurrentReport(report);
      setStatus("COMPLETED");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    // Simulate generation time
    await new Promise(r => setTimeout(r, 2000));
    setIsExporting(false);
    
    // Simulate random failure (30% chance)
    if (Math.random() < 0.3) {
      setToastType("error");
      setToastMessage("Xuất bản báo cáo thất bại. Vui lòng kiểm tra lại kết nối và thử lại!");
    } else {
      setToastType("success");
      setToastMessage("Báo cáo đánh giá AI đã được xuất thành văn bản PDF thành công!");
    }
    setShowToast(true);
  };

  const renderContent = () => {
    if (status === "ACCESS_RESTRICTED") return <AIEvaluationAccessRestricted />;
    if (status === "NOT_REQUESTED") return <AIEvaluationEmpty onRequest={() => setIsModalOpen(true)} />;
    if (isLoading && status === "VALIDATING") return <AIEvaluationLoader />;

    return (
      <div className="animate-in fade-in duration-700">
        <AIEvaluationStatusBanner status={status} />
        
        {currentReport && status === "COMPLETED" && (
          <>
            <AIEvaluationSummary report={currentReport} />
            
            {/* Warning Messages */}
            {currentReport.warningMessages.length > 0 && (
              <div className="mb-10 p-6 bg-amber-50/50 rounded-[32px] border border-amber-100 flex gap-4">
                <AlertCircle className="size-6 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[14px] font-black text-amber-900 uppercase tracking-tight">Cảnh báo từ hệ thống</p>
                  <ul className="list-disc ml-4 text-[13px] text-amber-700 font-medium space-y-1">
                    {currentReport.warningMessages.map((msg, i) => <li key={i}>{msg}</li>)}
                  </ul>
                </div>
              </div>
            )}

            <AIEvaluationBreakdown report={currentReport} />
            <AIEvaluationDetailedReport report={currentReport} />
            <AIEvaluationRecommendations recommendations={currentReport.recommendations} />
          </>
        )}
      </div>
    );
  };

  return (
    <StartupShell>
      <div className="max-w-[1280px] mx-auto pb-20 px-6 md:px-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[13px] font-medium text-slate-400 pt-8 mb-6">
          <Link href="/startup" className="hover:text-slate-600 transition-colors">Workspace</Link>
          <ChevronRight className="size-4 text-slate-300" />
          <span className="text-slate-600 font-semibold">Đánh giá AI</span>
        </nav>

        <AIEvaluationHeader 
          report={currentReport || undefined} 
          userRole={userRole} 
          onRequest={() => setIsModalOpen(true)}
          onExport={handleExport}
          onHistory={() => router.push("/startup/ai-evaluation/history")}
          hasHistory={false} // Cập nhật thành true khi có dữ liệu từ API
          isProcessing={isLoading}
          isExporting={isExporting}
        />
        
        <AIEvaluationRequestModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={startEvaluation}
        />
        
        {renderContent()}

        <AIEvaluationDisclaimer />
        
        <CustomToast 
          isVisible={showToast} 
          message={toastMessage} 
          type={toastType}
          onClose={() => setShowToast(false)} 
        />
      </div>
    </StartupShell>
  );
}
