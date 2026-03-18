"use client";

import { StartupShell } from "@/components/startup/startup-shell";
import { AIEvaluationHistoryList } from "@/components/startup/ai-evaluation/ai-evaluation-history";
import { mockReports } from "../mock-data";
import { useRouter } from "next/navigation";
import { ChevronRight, Sparkles, ChevronLeft, History } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AIEvaluationHistoryPage() {
  const router = useRouter();

  const handleSelect = (id: string) => {
    // In a real app, we'd navigate back with the ID or set it in a shared state/URL param
    // For now, let's just go back to the main eval page
    router.push("/startup/ai-evaluation");
  };

  return (
    <StartupShell>
      <div className="max-w-[1280px] mx-auto pb-20 px-6 md:px-8 space-y-8 animate-in fade-in duration-500">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[13px] font-medium text-slate-400 pt-8">
          <Link href="/startup" className="hover:text-slate-600 transition-colors">Workspace</Link>
          <ChevronRight className="size-4 text-slate-300" />
          <Link href="/startup/ai-evaluation" className="hover:text-slate-600 transition-colors">Đánh giá AI</Link>
          <ChevronRight className="size-4 text-slate-300" />
          <span className="text-slate-600 font-semibold">Lịch sử</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-[#eec54e]/10 rounded-xl flex items-center justify-center">
                <Sparkles className="size-6 text-[#eec54e]" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Lịch sử đánh giá</h1>
            </div>
            <p className="text-slate-500 text-[15px] font-medium leading-relaxed">
              Quản lý và xem lại tất cả các phiên bản báo cáo AI đã thực hiện cho Startup của bạn.
            </p>
          </div>
          
          <Button 
            onClick={() => router.push("/startup/ai-evaluation")}
            variant="outline"
            className="h-11 px-6 rounded-xl border-slate-200 dark:border-slate-800 font-bold text-sm gap-2 transition-all active:scale-95"
          >
            <ChevronLeft className="size-4" />
            Quay lại báo cáo
          </Button>
        </div>

        <div className="bg-white dark:bg-slate-900/50 rounded-[40px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm min-h-[400px] flex flex-col items-center justify-center">
          {mockReports.length > 0 ? (
            <AIEvaluationHistoryList 
              reports={mockReports} 
              currentId="" 
              onSelect={handleSelect} 
            />
          ) : (
            <div className="text-center space-y-4">
              <div className="size-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto">
                <History className="size-8 text-slate-300" />
              </div>
              <p className="text-slate-400 font-medium italic">Chưa có lịch sử đánh giá nào được ghi lại.</p>
            </div>
          )}
        </div>

        <footer className="pt-12 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
            Hệ thống lưu trữ lịch sử đánh giá AISEP • 2026
          </p>
        </footer>
      </div>
    </StartupShell>
  );
}
