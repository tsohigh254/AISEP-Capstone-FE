"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { StartupShell } from "@/components/startup/startup-shell";
import {
  Sparkles, CheckCircle2, XCircle, FileText, ChevronRight,
  ArrowRight, Clock, AlertTriangle, RefreshCw, BarChart3,
  History, FileSearch, Info, ShieldCheck, Loader2, Layout, BookOpen,
  Brain, Target, FileBarChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GetLatestScore, GetEvaluationHistory, GetEvaluationStatus, GetEvaluationReport } from "@/services/ai/ai.api";
import { GetDocument, GetStartupDocuments } from "@/services/document/document.api";
import { GetStartupProfile, GetMembers } from "@/services/startup/startup.api";
import { mapCanonicalToReport, mapStatusToUI, normalizeTo100 } from "./canonical-mapper";
import { calcProfileCompleteness } from "@/lib/profile-completeness";
import { AIEvaluationStatus, AIEvaluationReport } from "./types";

function fileNameFromUrl(url?: string | null): string {
  if (!url) return "Untitled";
  try {
    const parts = url.split("/");
    return parts[parts.length - 1] || "Untitled";
  } catch {
    return "Untitled";
  }
}

// Lấy tên tài liệu ưu tiên: label, name, title, fileNameFromUrl(fileUrl), "Không tên tài liệu"
function getDocumentDisplayName(item: any): string {
  if (item?.label && item.label.trim()) return item.label;
  if (item?.name && item.name.trim()) return item.name;
  if (item?.title && item.title.trim()) return item.title;
  if (item?.fileUrl && fileNameFromUrl(item.fileUrl).trim()) return fileNameFromUrl(item.fileUrl);
  return "Không tên tài liệu";
}

/* ─── Status config ────────────────────────────────────────── */

const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  NOT_REQUESTED: { label: "Chưa đánh giá", color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200", icon: <Info className="w-3.5 h-3.5" /> },
  QUEUED:        { label: "Đang chờ", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100", icon: <Clock className="w-3.5 h-3.5" /> },
  VALIDATING:    { label: "Đang xác thực", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", icon: <Loader2 className="w-3.5 h-3.5 animate-spin" /> },
  ANALYZING:     { label: "Đang phân tích", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100", icon: <Loader2 className="w-3.5 h-3.5 animate-spin" /> },
  SCORING:       { label: "Đang chấm điểm", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100", icon: <Loader2 className="w-3.5 h-3.5 animate-spin" /> },
  GENERATING_REPORT: { label: "Đang tạo báo cáo", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", icon: <Loader2 className="w-3.5 h-3.5 animate-spin" /> },
  COMPLETED:     { label: "Hoàn thành", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  FAILED:        { label: "Thất bại", color: "text-red-600", bg: "bg-red-50", border: "border-red-100", icon: <XCircle className="w-3.5 h-3.5" /> },
  INSUFFICIENT_DATA: { label: "Thiếu dữ liệu", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
};

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

function OnboardingView({ allReady, profile, documents }: { allReady: boolean; profile?: any; documents?: any }) {
  const router = useRouter();
  const p = profile ?? { ready: false, completionPercent: 0, items: [] };
  const d = documents ?? { ready: false, items: [], eligibleDocs: [] };

  return (
    <div className="space-y-6">

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-2xl p-8 md:p-10 overflow-hidden">
        {/* Decorative */}
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
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", p.ready ? "bg-emerald-50" : "bg-amber-50")}>
                    {p.ready ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                  </div>
                  <p className="text-[13px] font-bold text-slate-800">Hồ sơ Startup</p>
                </div>
                <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-bold", p.ready ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
                  {p.completionPercent}%
                </span>
              </div>
          <div className="space-y-2.5">
            {p.items.map((item: any, i: number) => {
              const label = item?.label ?? item?.name ?? item?.title ?? (item?.fileUrl ? fileNameFromUrl(item.fileUrl) : "Không tên tài liệu");
              return (
                <div key={i} className="flex items-start gap-2">
                  {item.ready
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    : <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />}
                  <div>
                    <p className="text-[12px] text-slate-600">{label}</p>
                    {item.detail && <p className="text-[11px] text-slate-400">{item.detail}</p>}
                  </div>
                </div>
              );
            })}
          </div>
          {!p.ready && (
            <Link href="/startup/startup-profile" className="flex items-center gap-1 mt-4 text-[12px] font-semibold text-amber-600 hover:text-amber-700 transition-colors">
              Hoàn thiện hồ sơ <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {/* Documents */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", d.ready ? "bg-emerald-50" : "bg-amber-50")}> 
                {d.ready ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
              </div>
              <p className="text-[13px] font-bold text-slate-800">Tài liệu kinh doanh</p>
            </div>
            <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-bold", d.ready ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
              {d.eligibleDocs.filter((doc: any) => doc.recommended).length} phù hợp
            </span>
          </div>
          <div className="space-y-2.5">
            {d.items.map((item: any, i: number) => {
              const label = getDocumentDisplayName(item);
              return (
                <div key={i} className="flex items-start gap-2">
                  {item.ready
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    : <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />}
                  <p className="text-[12px] text-slate-600">{label}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
            {d.eligibleDocs.filter((dd: any) => dd.recommended).map((doc: any) => (
              <div key={doc.id} className="flex items-center gap-2">
                {doc.type === "PITCH_DECK" ? <Layout className="w-3 h-3 text-blue-400" /> : <BookOpen className="w-3 h-3 text-violet-400" />}
                <p className="text-[11px] text-slate-500 truncate">{doc.name}</p>
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 font-semibold flex-shrink-0">Khuyến nghị</span>
              </div>
            ))}
          </div>
          {!d.ready && (
            <Link href="/startup/documents" className="flex items-center gap-1 mt-4 text-[12px] font-semibold text-amber-600 hover:text-amber-700 transition-colors">
              Quản lý tài liệu <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>

      {/* What AI evaluates */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileSearch className="w-4 h-4 text-blue-500" />
          <p className="text-[14px] font-bold text-slate-800">AI sẽ đánh giá những gì?</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            "Dữ liệu hồ sơ startup (đội ngũ, thị trường, sản phẩm)",
            "Tài liệu kinh doanh (Pitch Deck, Business Plan)",
            "Chỉ số traction và tài chính hiện có",
            "Kết quả: điểm số, tóm tắt, rủi ro, gaps, và khuyến nghị cụ thể",
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 px-3 py-2 bg-slate-50 rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#eec54e] mt-0.5 flex-shrink-0" />
              <p className="text-[12px] text-slate-600">{item}</p>
            </div>
          ))}
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

function DashboardView({ latestCompleted, profile, documents }: { latestCompleted: NonNullable<AIEvaluationReport>; profile?: any; documents?: any }) {
  const router = useRouter();
  const p = profile ?? { ready: true, completionPercent: 100, items: [] };
  const d = documents ?? { ready: true, items: [], eligibleDocs: [] };

    // --- Đồng bộ logic lọc tài liệu hợp lệ ---
    const mapType = (t: any) => {
      if (typeof t === 'number') {
        if (t === 0) return 'PITCH_DECK';
        if (t === 1) return 'BUSINESS_PLAN';
      }
      const s = t?.toString().toUpperCase();
      if (s === '0') return 'PITCH_DECK';
      if (s === '1') return 'BUSINESS_PLAN';
      if (s === 'PITCH_DECK') return 'PITCH_DECK';
      if (s === 'BUSINESS_PLAN' || s === 'BUSSINESS_PLAN') return 'BUSINESS_PLAN';
      return '';
    };
    const isAnchored = (proof: any) => {
      const p = (proof ?? '').toString().toLowerCase();
      return [
        'anchored', 'recorded', 'verified', 'submitted', '0'
      ].includes(p);
    };
    const aiEligibleDocs = (d.items ?? []).filter((doc: any) => {
      const t = mapType(doc.type ?? doc.Type ?? doc.documentType);
      return (t === 'PITCH_DECK' || t === 'BUSINESS_PLAN') && isAnchored(doc.proofStatus ?? doc.blockchainStatus ?? doc.proof);
    });
  const status: AIEvaluationStatus = "COMPLETED";
  const statusCfg = STATUS_CFG[status];

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
            <span className={cn("flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border", statusCfg.color, statusCfg.bg, statusCfg.border)}>
              {statusCfg.icon}
              {statusCfg.label}
            </span>
          </div>
          <p className="text-[12px] text-slate-400">
            Lần đánh giá gần nhất: <span className="font-semibold text-slate-500">{latestCompleted.calculatedAt}</span>
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

      {/* Readiness Cards (3 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Profile Readiness */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", p.ready ? "bg-emerald-50" : "bg-amber-50")}>
              {p.ready ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-800">Hồ sơ Startup</p>
              <p className="text-[11px] text-slate-400">{p.completionPercent}% hoàn thành</p>
            </div>
          </div>
          <div className="space-y-2.5">
            {p.items.map((item: any, i: number) => (
              <div key={i} className="flex items-start gap-2">
                {item.ready ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />}
                <div>
                  <p className="text-[12px] text-slate-600">{item.label}</p>
                  {item.detail && <p className="text-[11px] text-slate-400">{item.detail}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Document Readiness */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", d.ready ? "bg-emerald-50" : "bg-amber-50")}> 
              {d.ready ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-800">Tài liệu kinh doanh</p>
              <p className="text-[11px] text-slate-400">{aiEligibleDocs.length} tài liệu phù hợp</p>
            </div>
          </div>
          <div className="space-y-2.5">
            {d.items.map((item: any, i: number) => {
              const label = getDocumentDisplayName(item);
              const t = mapType(item.type ?? item.Type ?? item.documentType);
              const anchored = isAnchored(item.proofStatus ?? item.blockchainStatus ?? item.proof);
              const ready = (t === 'PITCH_DECK' || t === 'BUSINESS_PLAN') && anchored;
              return (
                <div key={i} className="flex items-start gap-2">
                  {ready
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    : <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />}
                  <p className="text-[12px] text-slate-600">{label}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
            {aiEligibleDocs.map((doc: any) => (
              <div key={doc.id} className="flex items-center gap-2">
                {mapType(doc.type ?? doc.Type ?? doc.documentType) === "PITCH_DECK"
                  ? <Layout className="w-3 h-3 text-blue-400" />
                  : <BookOpen className="w-3 h-3 text-violet-400" />}
                <p className="text-[11px] text-slate-500 truncate">{getDocumentDisplayName(doc)}</p>
                <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 font-semibold flex-shrink-0">Hợp lệ</span>
              </div>
            ))}
          </div>
        </div>

        {/* Evaluation Scope */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <FileSearch className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-[13px] font-bold text-slate-800">Phạm vi đánh giá</p>
          </div>
          <div className="space-y-2.5">
            {["Dữ liệu hồ sơ startup", "Tài liệu kinh doanh đủ điều kiện", "Dữ liệu mới nhất được hỗ trợ", "Điểm số, tóm tắt, rủi ro, gaps, khuyến nghị"].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <ChevronRight className="w-3 h-3 text-slate-300 mt-1 flex-shrink-0" />
                <p className="text-[12px] text-slate-600">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-start gap-2 px-3 py-2 bg-blue-50/50 rounded-xl">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] text-blue-600 leading-relaxed">
                Chỉ mang tính hỗ trợ quyết định, không thay thế lời khuyên đầu tư.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Result Preview */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="w-4 h-4 text-[#eec54e]" />
          <p className="text-[14px] font-bold text-slate-800">Kết quả đánh giá gần nhất</p>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <ScoreRing score={latestCompleted.overallScore} size={100} />
            <p className="text-[11px] text-slate-400 font-semibold">Startup Potential Score</p>
          </div>
          <div className="flex-1 min-w-0 space-y-3">
            <p className="text-[13px] text-slate-600 leading-relaxed line-clamp-3">{latestCompleted.executiveSummary}</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Team", score: latestCompleted.teamScore },
                { label: "Market", score: latestCompleted.marketScore },
                { label: "Product", score: latestCompleted.productScore },
                { label: "Traction", score: latestCompleted.tractionScore },
                { label: "Financial", score: latestCompleted.financialScore },
              ].map(m => (
                <div key={m.label} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[11px] text-slate-400">{m.label}</span>
                  <span className={cn("text-[12px] font-bold", m.score >= 75 ? "text-emerald-600" : m.score >= 50 ? "text-amber-600" : "text-red-500")}>{m.score}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button onClick={() => router.push("/startup/ai-evaluation/score")} className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#eec54e] text-slate-900 text-[12px] font-bold hover:bg-[#e6b800] transition-all">
                <BarChart3 className="w-3.5 h-3.5" />Xem điểm tiềm năng
              </button>
              <button onClick={() => router.push(`/startup/ai-evaluation/${latestCompleted.evaluationId}`)} className="flex items-center gap-1.5 h-9 px-4 rounded-xl bg-slate-100 text-slate-700 text-[12px] font-semibold hover:bg-slate-200 transition-all">
                <FileText className="w-3.5 h-3.5" />Xem báo cáo chi tiết
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
                <p className="text-[12px] text-slate-400">{latestCompleted ? 1 : 0} lượt đánh giá</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-400 transition-colors" />
          </div>
        </button>
        <button onClick={() => router.push(`/startup/ai-evaluation/${latestCompleted.evaluationId}`)} className="group bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 text-left hover:border-amber-200 hover:shadow-[0_2px_8px_rgba(238,197,78,0.12)] transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-amber-50 transition-colors"><FileText className="w-5 h-5 text-slate-400 group-hover:text-amber-500 transition-colors" /></div>
              <div>
                <p className="text-[14px] font-bold text-slate-800">Báo cáo chi tiết mới nhất</p>
                <p className="text-[12px] text-slate-400">{latestCompleted.snapshotLabel}</p>
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

function PendingRunView({ run, status, onRefresh }: { run: any; status: AIEvaluationStatus | null; onRefresh: () => void }) {
  const router = useRouter();
  const statusCfg = (status && STATUS_CFG[status]) || STATUS_CFG.QUEUED;
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow p-6 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">{statusCfg.icon}</div>
          <div>
            <p className="text-[16px] font-bold text-slate-900">Đang xử lý đánh giá</p>
            <p className="text-[13px] text-slate-500 mt-1">ID: {run?.evaluationId ?? "-"} • {run?.calculatedAt ?? ""}</p>
            <p className="text-[13px] text-slate-600 mt-3">Trạng thái hiện tại: <span className={cn("font-semibold ml-1", statusCfg.color)}>{statusCfg.label}</span></p>
            {run?.overallScore > 0 && (
              <p className="text-[20px] font-black text-slate-900 mt-3">{run.overallScore}/100</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => router.push(`/startup/ai-evaluation/${run?.evaluationId}`)} className="h-9 px-4 rounded-xl bg-slate-100 text-slate-700 text-[13px] font-semibold hover:bg-slate-200">Xem chi tiết</button>
          <button onClick={onRefresh} className="h-9 px-4 rounded-xl bg-[#eec54e] text-slate-900 text-[13px] font-bold hover:bg-[#e6b800]">Làm mới</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────── */

function AIEvaluationHomePageInner() {
  const searchParams = useSearchParams();
  const [latestCompleted, setLatestCompleted] = useState<AIEvaluationReport | null>(null);
  const [latestRun, setLatestRun] = useState<any | null>(null);
  const [runStatus, setRunStatus] = useState<AIEvaluationStatus | null>(null);
  const [runLoading, setRunLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>({ ready: false, completionPercent: 0, items: [] });
  const [documents, setDocuments] = useState<any>({ ready: false, items: [], eligibleDocs: [] });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        // Load profile and members to compute a consistent completeness percent
        const pr = await GetStartupProfile() as unknown as any;
        const mr = await GetMembers().catch(() => null) as unknown as any;
        const pdata = pr?.data ?? pr ?? {};
        const membersData = mr?.data ?? mr ?? [];

        const completeness = pdata?.profileCompleteness ?? pdata?.completionPercent ?? pdata?.completion ?? pdata?.percent ?? calcProfileCompleteness(pdata, membersData);
        const prof = {
          ready: Boolean(pdata?.isComplete ?? pdata?.ready ?? pdata?.isReady ?? false),
          completionPercent: completeness,
          items: pdata?.items ?? pdata?.checks ?? [],
        };
        const startupId = pdata?.startupID ?? pdata?.startupId ?? pdata?.StartupID ?? 0;
        let docsItems: any[] = pdata?.documents ?? [];
        try {
          if (startupId) {
            const dres = await GetStartupDocuments(startupId) as unknown as any;
            docsItems = dres?.data ?? dres ?? docsItems;
          } else {
            const dres = await GetDocument() as unknown as any;
            docsItems = dres?.data ?? dres ?? docsItems;
          }
        } catch (err) {
          // ignore and fallback to embedded profile documents
        }

        const docs = {
          ready: Boolean(Array.isArray(docsItems) && docsItems.length > 0),
          items: docsItems,
          eligibleDocs: (pdata?.eligibleDocs ?? docsItems) || [],
        };
        if (!cancelled) { setProfile(prof); setDocuments(docs); }

        // Try to fetch latest score (may 404 if no score yet)
        try {
          const sres = await GetLatestScore() as unknown as any;
          const spayload = sres?.data ?? sres;
          if (spayload) {
            const runId = spayload?.runId ?? spayload?.RunId ?? spayload?.id ?? spayload?.evaluationId ?? 0;
            const canonical = spayload?.report ?? spayload?.Report ?? spayload;
            const mapped = mapCanonicalToReport(Number(runId) || 0, canonical);
            if (!cancelled) setLatestCompleted(mapped);
          } else {
            if (!cancelled) setLatestCompleted(null);
          }
        } catch (err: any) {
          if (!cancelled) {
            setLatestCompleted(null);
            if (!err?.response || err?.response?.status !== 404) setApiError(err?.message ?? "Lỗi khi lấy điểm mới");
          }
        }

        // Load evaluation history (to find any recent run in progress)
        try {
          if (startupId) {
            const hres = await GetEvaluationHistory(startupId) as unknown as any;
            const list = hres?.data ?? hres ?? [];
            if (Array.isArray(list) && list.length > 0) {
              const r = list[0];
              const evaluationId = String(r?.runId ?? r?.RunId ?? r?.id ?? r?.Id ?? r?.run_id ?? r?.id ?? "");
              const sid = Number(evaluationId) || 0;
              const status = mapStatusToUI(r?.status ?? r?.Status ?? r?.StatusName ?? r?.statusName ?? "");
              const overallScore = normalizeTo100(r?.overallScore ?? r?.OverallScore ?? r?.overall_score ?? 0);
              const calculatedAt = r?.updatedAt ?? r?.updated_at ?? r?.submittedAt ?? r?.submitted_at ?? r?.calculatedAt ?? "";
              const snapshotLabel = r?.snapshotLabel ?? r?.label ?? r?.title ?? "";
              const mappedRun = {
                evaluationId,
                startupId: String(r?.startupId ?? r?.StartupId ?? r?.startupID ?? ""),
                status,
                overallScore,
                calculatedAt,
                snapshotLabel,
                executiveSummary: r?.summary ?? r?.executiveSummary ?? "",
              } as any;

              // If the most recent run is already completed, try to fetch its report and show it as the latestCompleted.
              if (status === "COMPLETED") {
                try {
                  if (!cancelled) {
                    // Only fetch report if we don't already have a latestCompleted
                    if (!latestCompleted) {
                      const rres = await GetEvaluationReport(sid) as unknown as any;
                      const reportPayload = rres?.data?.report ?? rres?.data ?? rres;
                      const mapped = mapCanonicalToReport(sid, reportPayload);
                      if (!cancelled) {
                        setLatestCompleted(mapped);
                        setLatestRun(null);
                        setRunStatus(status);
                      }
                    } else {
                      if (!cancelled) { setLatestRun(null); setRunStatus(status); }
                    }
                  }
                } catch (err) {
                  // If fetching report failed, fall back to showing the run summary so user can refresh
                  if (!cancelled) { setLatestRun(mappedRun); setRunStatus(status); }
                }
              } else {
                if (!cancelled) { setLatestRun(mappedRun); setRunStatus(status); }
              }
            }
          }
        } catch (err: any) {
          if (!cancelled) {
            setLatestRun(null);
            if (!err?.response || err?.response?.status !== 404) setApiError(err?.message ?? "Lỗi khi lấy lịch sử đánh giá");
          }
        }

      } catch (err: any) {
        console.error("Failed to load AI evaluation home data", err);
        if (!cancelled) {
          setProfile({ ready: false, completionPercent: 0, items: [] });
          setDocuments({ ready: false, items: [], eligibleDocs: [] });
          setApiError(err?.message ?? "Lỗi khi tải dữ liệu trang");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Poll status for an in-progress run
  useEffect(() => {
    if (!latestRun || !runStatus) return;
    const nonTerminal = runStatus !== "COMPLETED" && runStatus !== "FAILED" && runStatus !== "INSUFFICIENT_DATA" && runStatus !== "ACCESS_RESTRICTED";
    if (!nonTerminal) return;

    let cancelled = false;
    const iv = setInterval(async () => {
      try {
        setRunLoading(true);
        const sid = Number(latestRun.evaluationId);
        if (!sid) return;
        const sres = await GetEvaluationStatus(sid) as unknown as any;
        const spayload = sres?.data ?? sres ?? {};
        const newStatus = mapStatusToUI(spayload?.status ?? spayload?.Status ?? spayload?.StatusName ?? spayload?.statusName ?? "");
        if (newStatus && newStatus !== runStatus) setRunStatus(newStatus);

        if (newStatus === "COMPLETED") {
          try {
            const rres = await GetEvaluationReport(sid) as unknown as any;
            const reportPayload = rres?.data?.report ?? rres?.data ?? rres;
            const mapped = mapCanonicalToReport(sid, reportPayload);
            if (!cancelled) {
              setLatestCompleted(mapped);
              setLatestRun(null);
            }
          } catch (err) {
            // report not ready or fetch failed; will retry
          }
          clearInterval(iv);
        }

        if (newStatus === "FAILED") {
          // stop polling on failure; keep latestRun to show failure state
          clearInterval(iv);
        }
      } catch (err) {
        // ignore transient errors
      } finally {
        setRunLoading(false);
      }
    }, 8000);

    return () => { cancelled = true; clearInterval(iv); };
  }, [latestRun, runStatus]);

  const allReady = profile?.ready && documents?.ready;
  // ?demo=new to preview onboarding state
  const forceNew = searchParams.get("demo") === "new";
  const hasResult = !forceNew && !!latestCompleted;

  const isProcessingRun = latestRun && runStatus && !(runStatus === "COMPLETED" || runStatus === "FAILED" || runStatus === "INSUFFICIENT_DATA" || runStatus === "ACCESS_RESTRICTED");

  const handleRefreshRun = async () => {
    if (!latestRun) return;
    try {
      setRunLoading(true);
      const sid = Number(latestRun.evaluationId);
      if (!sid) return;
      const sres = await GetEvaluationStatus(sid) as unknown as any;
      const spayload = sres?.data ?? sres ?? {};
      const newStatus = mapStatusToUI(spayload?.status ?? spayload?.Status ?? spayload?.StatusName ?? spayload?.statusName ?? "");
      setRunStatus(newStatus);
      if (newStatus === "COMPLETED") {
        const rres = await GetEvaluationReport(sid) as unknown as any;
        const reportPayload = rres?.data?.report ?? rres?.data ?? rres;
        const mapped = mapCanonicalToReport(sid, reportPayload);
        setLatestCompleted(mapped);
        setLatestRun(null);
      }
    } catch (err) {
      console.error("Refresh run failed", err);
    } finally {
      setRunLoading(false);
    }
  };

  return (
    <StartupShell>
      <div className="max-w-[1100px] mx-auto pb-20 animate-in fade-in duration-500 min-h-[600px]">
        {/* API error banner */}
        {apiError && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-100 flex items-center justify-between">
            <div className="text-sm text-red-700">{apiError}</div>
            <div className="flex gap-2">
              <button onClick={() => { setApiError(null); window.location.reload(); }} className="h-9 px-3 rounded bg-red-600 text-white text-[12px] font-semibold">Thử lại</button>
              <button onClick={() => setApiError(null)} className="h-9 px-3 rounded bg-slate-100 text-slate-700 text-[12px] font-semibold">Đóng</button>
            </div>
          </div>
        )}

        {/* Show a small banner for an in-progress run to avoid swapping major page content */}
        {isProcessingRun && latestRun && (
          <PendingRunView run={latestRun} status={runStatus} onRefresh={handleRefreshRun} />
        )}

        {/* Main content stays mounted to reduce layout shifts */}
        {hasResult && latestCompleted ? (
          <DashboardView latestCompleted={latestCompleted} profile={profile} documents={documents} />
        ) : (
          <OnboardingView allReady={allReady} profile={profile} documents={documents} />
        )}
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
