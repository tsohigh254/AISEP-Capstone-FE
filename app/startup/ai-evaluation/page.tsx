"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { StartupShell } from "@/components/startup/startup-shell";
import {
  Sparkles, CheckCircle2, XCircle, FileText, ChevronRight,
  ArrowRight, Clock, AlertTriangle, RefreshCw, BarChart3,
  History, FileSearch, Info, ShieldCheck, Loader2, Layout, BookOpen,
  Brain, Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GetLatestScore, GetScoreHistory } from "@/services/ai/ai.api";
import { GetStartupProfile } from "@/services/startup/startup.api";
import { GetDocument } from "@/services/document/document.api";
import type { AIScoreLatestResponse } from "./types";

/* ─── Score Ring ────────────────────────────────────────────── */

function ScoreRing({ score, size = 80 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const pct = score / 100;
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={c} strokeDashoffset={c * (1 - pct)} strokeLinecap="round"
        className="transition-all duration-1000" />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        className="rotate-[90deg] origin-center text-[20px] font-black fill-slate-900">{score}</text>
    </svg>
  );
}

/* ─── Onboarding (first-time, no evaluation) ───────────────── */

function OnboardingView({ allReady, profileReady, hasEligibleDocs }: { allReady: boolean; profileReady: boolean; hasEligibleDocs: boolean }) {
  const router = useRouter();

  return (
    <div className="space-y-6">

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-2xl p-8 md:p-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#eec54e]/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#eec54e]/5 rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#eec54e]/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#eec54e]" />
            </div>
            <div>
              <h1 className="text-[24px] font-bold text-white leading-tight">Đánh giá AI cho Startup</h1>
              <p className="text-[13px] text-slate-400">Khám phá tiềm năng startup của bạn qua lăng kính AI</p>
            </div>
          </div>

          <p className="text-[14px] text-slate-300 leading-relaxed mb-6">
            Hệ thống AI sẽ phân tích hồ sơ startup và tài liệu kinh doanh của bạn để đưa ra
            <span className="text-[#eec54e] font-semibold"> điểm tiềm năng</span>,
            <span className="text-emerald-400 font-semibold"> phân tích điểm mạnh/yếu</span>, và
            <span className="text-blue-400 font-semibold"> khuyến nghị cải thiện</span> — giúp bạn sẵn sàng hơn cho việc gọi vốn.
          </p>

          {allReady ? (
            <button
              onClick={() => router.push("/startup/ai-evaluation/request")}
              className="flex items-center gap-2 h-11 px-6 rounded-xl bg-[#eec54e] text-slate-900 text-[14px] font-bold hover:bg-[#e6b800] transition-all shadow-lg shadow-[#eec54e]/20"
            >
              <Sparkles className="w-4.5 h-4.5" />
              Bắt đầu đánh giá AI
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/startup/startup-profile")}
                className="flex items-center gap-2 h-11 px-6 rounded-xl bg-amber-500/20 text-amber-300 text-[14px] font-bold hover:bg-amber-500/30 transition-all border border-amber-500/30"
              >
                <AlertTriangle className="w-4 h-4" />
                Hoàn thiện yêu cầu trước
              </button>
            </div>
          )}
        </div>
      </div>

      {/* How it works — 3 steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { step: 1, icon: <FileText className="w-5 h-5 text-blue-500" />, iconBg: "bg-blue-50", title: "Chuẩn bị hồ sơ", desc: "Hoàn thiện thông tin startup và tải lên Pitch Deck, Business Plan." },
          { step: 2, icon: <Brain className="w-5 h-5 text-purple-500" />, iconBg: "bg-purple-50", title: "AI phân tích", desc: "Hệ thống AI phân tích dữ liệu và tài liệu, đánh giá trên 5 lĩnh vực chính." },
          { step: 3, icon: <Target className="w-5 h-5 text-emerald-500" />, iconBg: "bg-emerald-50", title: "Nhận kết quả", desc: "Xem điểm tiềm năng, phân tích chi tiết, và khuyến nghị cải thiện cụ thể." },
        ].map(s => (
          <div key={s.step} className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 rounded-full bg-[#eec54e] text-slate-900 text-[12px] font-black flex items-center justify-center flex-shrink-0">{s.step}</div>
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", s.iconBg)}>{s.icon}</div>
            </div>
            <p className="text-[14px] font-bold text-slate-800 mb-1">{s.title}</p>
            <p className="text-[12px] text-slate-400 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Readiness Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Profile */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", profileReady ? "bg-emerald-50" : "bg-amber-50")}>
                {profileReady ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
              </div>
              <p className="text-[13px] font-bold text-slate-800">Hồ sơ Startup</p>
            </div>
            <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-bold", profileReady ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
              {profileReady ? "Đạt" : "Chưa đạt"}
            </span>
          </div>
          {!profileReady && (
            <Link href="/startup/startup-profile" className="flex items-center gap-1 mt-2 text-[12px] font-semibold text-amber-600 hover:text-amber-700 transition-colors">
              Hoàn thiện hồ sơ <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {/* Documents */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", hasEligibleDocs ? "bg-emerald-50" : "bg-amber-50")}>
                {hasEligibleDocs ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
              </div>
              <p className="text-[13px] font-bold text-slate-800">Tài liệu kinh doanh</p>
            </div>
            <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-bold", hasEligibleDocs ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
              {hasEligibleDocs ? "Đạt" : "Chưa đạt"}
            </span>
          </div>
          {!hasEligibleDocs && (
            <Link href="/startup/documents" className="flex items-center gap-1 mt-2 text-[12px] font-semibold text-amber-600 hover:text-amber-700 transition-colors">
              Quản lý tài liệu <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Đánh giá AI chỉ mang tính chất hỗ trợ quyết định và chuẩn bị. Đây không phải lời khuyên đầu tư và không thay thế cho đánh giá chính thức từ chuyên gia.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Dashboard (has evaluation results) ───────────────────── */

function DashboardView({ latestScore, historyCount }: { latestScore: AIScoreLatestResponse; historyCount: number }) {
  const router = useRouter();

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#eec54e]/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#eec54e]" />
            </div>
            <h1 className="text-[22px] font-bold text-slate-900 leading-none">Đánh giá AI</h1>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border bg-emerald-50 text-emerald-600 border-emerald-100">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Hoàn thành
            </span>
          </div>
          <p className="text-[13px] text-slate-400">
            AI đánh giá startup dựa trên dữ liệu hồ sơ và tài liệu kinh doanh đã tải lên.
          </p>
          <p className="text-[12px] text-slate-400 mt-1">
            Lần đánh giá gần nhất: <span className="font-semibold text-slate-500">{new Date(latestScore.calculatedAt).toLocaleDateString("vi-VN")}</span>
          </p>
        </div>
        <button
          onClick={() => router.push("/startup/ai-evaluation/request")}
          className="flex items-center gap-2 h-10 px-5 rounded-xl bg-[#0f172a] text-white text-[13px] font-semibold hover:bg-slate-700 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Đánh giá mới
        </button>
      </div>

      {/* Latest Result Preview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="w-4 h-4 text-[#eec54e]" />
          <p className="text-[14px] font-bold text-slate-800">Kết quả đánh giá gần nhất</p>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <ScoreRing score={latestScore.overallScore} size={100} />
            <p className="text-[11px] text-slate-400 font-semibold">Startup Potential Score</p>
          </div>
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Team", score: latestScore.teamScore },
                { label: "Market", score: latestScore.marketScore },
                { label: "Product", score: latestScore.productScore },
                { label: "Traction", score: latestScore.tractionScore },
                { label: "Financial", score: latestScore.financialScore },
              ].map(m => (
                <div key={m.label} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[11px] text-slate-400">{m.label}</span>
                  <span className={cn("text-[12px] font-bold", m.score >= 75 ? "text-emerald-600" : m.score >= 50 ? "text-amber-600" : "text-red-500")}>{m.score}</span>
                </div>
              ))}
            </div>

            {/* Top recommendations */}
            {latestScore.recommendations.length > 0 && (
              <div className="space-y-1.5 mt-2">
                {latestScore.recommendations.slice(0, 2).map((rec, i) => (
                  <p key={i} className="text-[12px] text-slate-500">
                    <span className="font-semibold text-slate-600">{rec.category}:</span> {rec.recommendationText}
                  </p>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button onClick={() => router.push("/startup/ai-evaluation/score")} className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#eec54e] text-slate-900 text-[12px] font-bold hover:bg-[#e6b800] transition-all">
                <BarChart3 className="w-3.5 h-3.5" />Xem điểm tiềm năng
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button onClick={() => router.push("/startup/ai-evaluation/history")} className="group bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 text-left hover:border-amber-200 hover:shadow-[0_2px_8px_rgba(238,197,78,0.12)] transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-amber-50 transition-colors"><History className="w-5 h-5 text-slate-400 group-hover:text-amber-500 transition-colors" /></div>
              <div>
                <p className="text-[14px] font-bold text-slate-800">Lịch sử đánh giá</p>
                <p className="text-[12px] text-slate-400">{historyCount} lượt đánh giá</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-400 transition-colors" />
          </div>
        </button>
        <button onClick={() => router.push("/startup/ai-evaluation/request")} className="group bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 text-left hover:border-amber-200 hover:shadow-[0_2px_8px_rgba(238,197,78,0.12)] transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-amber-50 transition-colors"><Sparkles className="w-5 h-5 text-slate-400 group-hover:text-amber-500 transition-colors" /></div>
              <div>
                <p className="text-[14px] font-bold text-slate-800">Yêu cầu đánh giá mới</p>
                <p className="text-[12px] text-slate-400">Gửi tài liệu cho AI phân tích</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-400 transition-colors" />
          </div>
        </button>
      </div>

      {/* Disclaimer */}
      <div className="px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Báo cáo đánh giá AI được tạo ra chỉ nhằm mục đích hỗ trợ quyết định và chuẩn bị. Đây không phải lời khuyên đầu tư và không thay thế cho đánh giá chính thức từ chuyên gia.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────── */

function AIEvaluationHomePageInner() {
  const router = useRouter();
  const [latestScore, setLatestScore] = useState<AIScoreLatestResponse | null>(null);
  const [historyCount, setHistoryCount] = useState(0);
  const [profileReady, setProfileReady] = useState(false);
  const [hasEligibleDocs, setHasEligibleDocs] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [scoreRes, historyRes, profileRes, docsRes] = await Promise.all([
          GetLatestScore().catch(() => null),
          GetScoreHistory().catch(() => null),
          GetStartupProfile().catch(() => null),
          GetDocument(false).catch(() => null),
        ]);

        // Latest score
        const sData = (scoreRes as any)?.data ?? null;
        if (sData?.scoreId) setLatestScore(sData);

        // History count
        const hData = (historyRes as any)?.data ?? null;
        if (hData?.scores) setHistoryCount(hData.scores.length);

        // Profile readiness
        const pData = (profileRes as any)?.data ?? null;
        if (pData?.companyName && pData?.stage) setProfileReady(true);

        // Document readiness
        const dData = (docsRes as any)?.data ?? [];
        if (Array.isArray(dData)) {
          const eligible = dData.filter((d: any) =>
            String(d.documentType) === "0" || String(d.documentType) === "1"
            || d.documentType === "Pitch_Deck" || d.documentType === "Bussiness_Plan"
          );
          setHasEligibleDocs(eligible.length > 0);
        }
      } catch {
        // silently handle
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <StartupShell>
        <div className="max-w-[1100px] mx-auto pb-20 pt-10 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      </StartupShell>
    );
  }

  const allReady = profileReady && hasEligibleDocs;

  return (
    <StartupShell>
      <div className="max-w-[1100px] mx-auto pb-20 animate-in fade-in duration-500">
        {latestScore
          ? <DashboardView latestScore={latestScore} historyCount={historyCount} />
          : <OnboardingView allReady={allReady} profileReady={profileReady} hasEligibleDocs={hasEligibleDocs} />
        }
      </div>
    </StartupShell>
  );
}

export default function AIEvaluationHomePage() {
  return (
    <Suspense>
      <AIEvaluationHomePageInner />
    </Suspense>
  );
}
