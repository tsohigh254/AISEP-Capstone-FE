"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StartupShell } from "@/components/startup/startup-shell";
import {
  Sparkles, ArrowLeft, History, Search, ArrowUpDown,
  CheckCircle2, XCircle, ChevronRight, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GetScoreHistory } from "@/services/ai/ai.api";
import type { AIScoreLatestResponse } from "../types";

/* ─── Page ─────────────────────────────────────────────────── */

export default function AIEvaluationHistoryPage() {
  const router = useRouter();
  const [scores, setScores] = useState<AIScoreLatestResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await GetScoreHistory();
        const data = (res as any)?.data ?? null;
        if (data?.scores && Array.isArray(data.scores)) {
          setScores(data.scores);
        }
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  // Filter & sort
  const filtered = scores
    .filter(s => {
      if (!search) return true;
      const q = search.toLowerCase();
      return String(s.scoreId).includes(q) || String(s.overallScore).includes(q);
    })
    .sort((a, b) => {
      return sortOrder === "newest"
        ? new Date(b.calculatedAt).getTime() - new Date(a.calculatedAt).getTime()
        : new Date(a.calculatedAt).getTime() - new Date(b.calculatedAt).getTime();
    });

  if (loading) {
    return (
      <StartupShell>
        <div className="max-w-[1100px] mx-auto pb-20 pt-10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      </StartupShell>
    );
  }

  return (
    <StartupShell>
      <div className="max-w-[1100px] mx-auto pb-20 animate-in fade-in duration-500">

        {/* Back */}
        <button
          onClick={() => router.push("/startup/ai-evaluation")}
          className="flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-slate-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Đánh giá AI
        </button>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#eec54e]/10 flex items-center justify-center">
                <History className="w-5 h-5 text-[#eec54e]" />
              </div>
              <h1 className="text-[22px] font-bold text-slate-900">Lịch sử đánh giá</h1>
            </div>
            <p className="text-[13px] text-slate-400">
              Xem lại tất cả các lượt đánh giá AI đã thực hiện cho startup của bạn.
            </p>
          </div>
          <button
            onClick={() => router.push("/startup/ai-evaluation/request")}
            className="flex items-center gap-2 h-10 px-5 rounded-xl bg-[#0f172a] text-white text-[13px] font-semibold hover:bg-slate-700 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Đánh giá mới
          </button>
        </div>

        {/* Search & Sort */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 mb-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input
                type="text"
                placeholder="Tìm theo ID hoặc điểm..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-[13px] text-slate-700 border border-slate-200 rounded-xl outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all placeholder:text-slate-300"
              />
            </div>

            {/* Sort */}
            <button
              onClick={() => setSortOrder(prev => prev === "newest" ? "oldest" : "newest")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-500 text-[12px] font-semibold hover:bg-slate-100 transition-all"
            >
              <ArrowUpDown className="w-3 h-3" />
              {sortOrder === "newest" ? "Mới nhất" : "Cũ nhất"}
            </button>
          </div>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
              <History className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-[14px] font-bold text-slate-400 mb-1">
              {scores.length === 0 ? "Chưa có lịch sử đánh giá" : "Không tìm thấy kết quả"}
            </p>
            <p className="text-[12px] text-slate-300">
              {scores.length === 0 ? "Yêu cầu đánh giá AI để bắt đầu." : "Thử thay đổi từ khóa."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item, idx) => {
              const isFirst = idx === 0 && sortOrder === "newest";
              return (
                <div
                  key={item.scoreId}
                  onClick={() => router.push("/startup/ai-evaluation/score")}
                  className={cn(
                    "group bg-white rounded-2xl border shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 transition-all cursor-pointer",
                    "border-slate-200/80 hover:border-amber-200 hover:shadow-[0_2px_8px_rgba(238,197,78,0.12)]",
                    isFirst && "ring-2 ring-[#eec54e]/30"
                  )}
                >
                  <div className="flex items-center gap-4">
                    {/* Score circle */}
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0",
                      item.overallScore >= 75 ? "bg-emerald-50" : item.overallScore >= 50 ? "bg-amber-50" : "bg-red-50"
                    )}>
                      <span className={cn("text-[18px] font-black leading-none",
                        item.overallScore >= 75 ? "text-emerald-600" : item.overallScore >= 50 ? "text-amber-600" : "text-red-500"
                      )}>{item.overallScore}</span>
                      <span className="text-[9px] text-slate-400 font-semibold">/100</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-mono font-semibold text-slate-400">#{item.scoreId}</span>
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-50 text-emerald-600 border-emerald-100">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Hoàn thành
                        </span>
                        {isFirst && (
                          <span className="px-2 py-0.5 bg-[#eec54e]/20 text-[#b8940a] rounded-full text-[10px] font-bold">Mới nhất</span>
                        )}
                      </div>
                      <p className="text-[14px] font-bold text-slate-900">
                        Đánh giá ngày {new Date(item.calculatedAt).toLocaleDateString("vi-VN")}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-400">
                        <span>{new Date(item.calculatedAt).toLocaleTimeString("vi-VN")}</span>
                      </div>
                    </div>

                    {/* Scores row */}
                    <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                      {[
                        { label: "Team", score: item.teamScore },
                        { label: "Market", score: item.marketScore },
                        { label: "Product", score: item.productScore },
                      ].map(m => (
                        <div key={m.label} className="text-center px-2">
                          <p className={cn("text-[13px] font-bold",
                            m.score >= 75 ? "text-emerald-600" : m.score >= 50 ? "text-amber-600" : "text-red-500"
                          )}>{m.score}</p>
                          <p className="text-[9px] text-slate-400">{m.label}</p>
                        </div>
                      ))}
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-400 transition-colors flex-shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </StartupShell>
  );
}
