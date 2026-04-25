"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, Inbox, Loader2, RefreshCcw, Target } from "lucide-react";
import { StartupShell } from "@/components/startup/startup-shell";
import { cn } from "@/lib/utils";
import { GetStartupReadiness, RecalculateStartupReadiness } from "@/services/startup/readiness.api";
import type { ReadinessDimension, StartupReadinessResult } from "@/types/readiness";
import {
  DIMENSION_MAX,
  DIMENSION_META,
  STATUS_META,
  clampScore,
  formatReadinessDate,
  getActionMeta,
  getCapRuleIcon,
  getCapRuleLabel,
  getMissingItemLabel,
} from "@/components/startup/readiness/readiness-config";

const DIMENSION_ORDER: ReadinessDimension[] = ["profile", "kyc", "documents", "ai", "trust"];

function StatusBadge({ status }: { status: StartupReadinessResult["status"] }) {
  const cfg = STATUS_META[status] ?? STATUS_META.NOTREADY;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-semibold border", cfg.badge)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

function LoadingState() {
  return (
    <StartupShell>
      <div className="max-w-[1100px] mx-auto animate-in fade-in duration-400">
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      </div>
    </StartupShell>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <StartupShell>
      <div className="max-w-[1100px] mx-auto animate-in fade-in duration-400">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] py-20 px-6 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-[20px] font-bold text-slate-900">Không thể tải readiness</h1>
          <p className="text-[13px] text-slate-500 mt-2 max-w-md">{message}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f172a] text-white text-[13px] font-medium hover:bg-[#1e293b] transition-colors shadow-sm"
          >
            <RefreshCcw className="w-4 h-4" />
            Thử lại
          </button>
        </div>
      </div>
    </StartupShell>
  );
}

export default function StartupReadinessPage() {
  const [readiness, setReadiness] = useState<StartupReadinessResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReadiness = useCallback(async () => {
    setError(null);
    const res = await GetStartupReadiness();
    if ((res.success || res.isSuccess) && res.data) {
      setReadiness(res.data);
      return;
    }
    throw new Error(res.message || res.error?.message || "Không thể tải dữ liệu readiness.");
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadReadiness()
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Không thể tải dữ liệu readiness.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [loadReadiness]);

  const handleRecalculate = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const res = await RecalculateStartupReadiness();
      if ((res.success || res.isSuccess) && res.data) {
        setReadiness(res.data);
      } else {
        setError(res.message || res.error?.message || "Không thể cập nhật readiness.");
      }
    } catch {
      setError("Không thể cập nhật readiness.");
    } finally {
      setRefreshing(false);
    }
  };

  const missingByDimension = useMemo(() => {
    const grouped: Record<ReadinessDimension, StartupReadinessResult["missingItems"]> = {
      profile: [],
      kyc: [],
      documents: [],
      ai: [],
      trust: [],
    };

    for (const item of readiness?.missingItems ?? []) {
      grouped[item.dimension]?.push(item);
    }

    return grouped;
  }, [readiness?.missingItems]);

  if (loading) return <LoadingState />;
  if (!readiness) {
    return <ErrorState message={error ?? "Không thể tải dữ liệu readiness."} onRetry={() => loadReadiness().catch((err: unknown) => setError(err instanceof Error ? err.message : "Không thể tải dữ liệu readiness."))} />;
  }

  const score = clampScore(readiness.overallScore);
  const statusCfg = STATUS_META[readiness.status] ?? STATUS_META.NOTREADY;
  const appliedCaps = [...(readiness.appliedCaps ?? [])].sort((a, b) => a.cappedAt - b.cappedAt);
  const nextActions = readiness.nextActions ?? [];

  return (
    <StartupShell>
      <div className="max-w-[1100px] mx-auto space-y-6 animate-in fade-in duration-400">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#eec54e]/15 flex items-center justify-center shrink-0">
                <Target className="w-6 h-6 text-[#b78b0a]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-[20px] font-bold text-slate-900 leading-tight">Sẵn sàng gọi vốn</h1>
                  <StatusBadge status={readiness.status} />
                </div>
                <p className="text-[13px] text-slate-500 mt-1 max-w-2xl">{statusCfg.summary}</p>
                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-2">
                  Cập nhật lần cuối: {formatReadinessDate(readiness.calculatedAt)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRecalculate}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-[13px] font-medium hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
              Tính lại điểm
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 items-center">
            <div className="text-center lg:text-left">
              <div className="flex items-baseline justify-center lg:justify-start gap-1">
                <span className="text-[56px] font-bold leading-none text-slate-900">{score}</span>
                <span className="text-[15px] font-semibold text-slate-400">/100</span>
              </div>
              <p className="text-[12px] font-medium text-slate-500 mt-2">Điểm sau khi áp dụng các cap bắt buộc.</p>
            </div>
            <div>
              <div className="h-4 rounded-full bg-slate-100 overflow-hidden">
                <div className={cn("h-full rounded-full transition-all duration-500", statusCfg.bar)} style={{ width: `${score}%` }} />
              </div>
              <div className="grid grid-cols-4 gap-2 mt-3 text-[10px] font-semibold text-slate-400">
                <span>0 Chưa sẵn sàng</span>
                <span>40 Cần cải thiện</span>
                <span>70 Gần sẵn sàng</span>
                <span className="text-right">85 Sẵn sàng</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-5 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-[12px] text-red-700">{error}</p>
            </div>
          )}
        </div>

        {appliedCaps.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
            <h2 className="text-[13px] font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Điều kiện đang giới hạn điểm
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {appliedCaps.map((cap) => {
                const Icon = getCapRuleIcon(cap.rule);
                return (
                  <div key={`${cap.rule}-${cap.cappedAt}`} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3">
                    <Icon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[13px] font-semibold text-amber-800">Giới hạn tối đa {cap.cappedAt} điểm</p>
                      <p className="text-[12px] text-amber-700 mt-1">{getCapRuleLabel(cap.rule, cap.description)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {DIMENSION_ORDER.map((dimension) => {
            const meta = DIMENSION_META[dimension];
            const Icon = meta.icon;
            const max = DIMENSION_MAX[dimension];
            const value = clampScore(readiness.dimensions[dimension], max);
            const percent = Math.round((value / max) * 100);
            const missing = missingByDimension[dimension];
            const barColor = percent >= 80 ? "bg-emerald-500" : percent >= 50 ? "bg-amber-500" : "bg-red-500";

            return (
              <div key={dimension} className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-5 py-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-slate-500" />
                  </div>
                  <span className="text-[13px] font-bold text-slate-900">{value}/{max}</span>
                </div>
                <h3 className="text-[13px] font-semibold text-slate-900">{meta.label}</h3>
                <p className="text-[12px] text-slate-500 mt-1 min-h-[52px]">{meta.description}</p>
                <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden mt-4">
                  <div className={cn("h-full rounded-full transition-all duration-500", barColor)} style={{ width: `${percent}%` }} />
                </div>
                <div className="mt-4">
                  {missing.length > 0 ? (
                    <ul className="space-y-1.5">
                      {missing.slice(0, 3).map((item) => (
                        <li key={`${item.dimension}-${item.code}`} className="text-[11px] text-slate-600 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 mt-1.5" />
                          <span>{getMissingItemLabel(item.code, item.label)}</span>
                        </li>
                      ))}
                      {missing.length > 3 && <li className="text-[11px] text-slate-400">+{missing.length - 3} mục khác</li>}
                    </ul>
                  ) : (
                    <p className="text-[11px] text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Đã đạt yêu cầu hiện tại
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
            <h2 className="text-[13px] font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Inbox className="w-4 h-4 text-slate-400" />
              Checklist còn thiếu
            </h2>
            {(readiness.missingItems ?? []).length > 0 ? (
              <div className="space-y-4">
                {DIMENSION_ORDER.map((dimension) => {
                  const items = missingByDimension[dimension];
                  if (items.length === 0) return null;
                  const meta = DIMENSION_META[dimension];
                  return (
                    <div key={dimension}>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-2">{meta.label}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {items.map((item) => (
                          <div key={`${item.dimension}-${item.code}`} className="rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-2.5">
                            <p className="text-[13px] font-medium text-slate-700">{getMissingItemLabel(item.code, item.label)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="text-[14px] font-semibold text-slate-600">Checklist hiện không còn mục thiếu</p>
                <p className="text-[13px] text-slate-400">Tiếp tục giữ hồ sơ và tài liệu luôn được cập nhật.</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
            <h2 className="text-[13px] font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-slate-400" />
              Hành động tiếp theo
            </h2>
            {nextActions.length > 0 ? (
              <div className="space-y-2.5">
                {nextActions.map((action) => {
                  const meta = getActionMeta(action.code, action.label, action.target);
                  const Icon = meta.icon;
                  return (
                    <Link
                      key={action.code}
                      href={meta.href}
                      className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-3.5 py-3 hover:bg-slate-50 transition-colors"
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <span className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-white">
                          <Icon className="w-4 h-4 text-slate-500" />
                        </span>
                        <span className="text-[13px] font-semibold text-slate-700">{meta.label}</span>
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-300 shrink-0 group-hover:text-slate-500" />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                <p className="text-[13px] font-semibold text-emerald-700">Không có hành động bắt buộc</p>
                <p className="text-[12px] text-emerald-600 mt-1">Bạn có thể tiếp tục cập nhật tài liệu khi có thay đổi mới.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </StartupShell>
  );
}
