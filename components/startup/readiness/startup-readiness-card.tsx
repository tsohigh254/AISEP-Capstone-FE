"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, Loader2, RefreshCcw, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { GetStartupReadiness, RecalculateStartupReadiness } from "@/services/startup/readiness.api";
import type { StartupReadinessResult } from "@/types/readiness";
import {
  STATUS_META,
  clampScore,
  formatReadinessDate,
  getMissingItemLabel,
} from "./readiness-config";

function ReadinessStatusBadge({ status }: { status: StartupReadinessResult["status"] }) {
  const cfg = STATUS_META[status] ?? STATUS_META.NOTREADY;
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-semibold border", cfg.badge)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
      <div className="flex items-center justify-between mb-5">
        <div className="h-5 w-44 rounded-lg bg-slate-100 animate-pulse" />
        <div className="h-6 w-24 rounded-lg bg-slate-100 animate-pulse" />
      </div>
      <div className="h-10 w-24 rounded-lg bg-slate-100 animate-pulse mb-4" />
      <div className="h-3 w-full rounded-full bg-slate-100 animate-pulse" />
      <div className="mt-5 space-y-2">
        <div className="h-4 w-5/6 rounded bg-slate-100 animate-pulse" />
        <div className="h-4 w-2/3 rounded bg-slate-100 animate-pulse" />
      </div>
    </div>
  );
}

export function StartupReadinessCard() {
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
    setError(res.message || res.error?.message || "Không thể tải mức độ sẵn sàng.");
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadReadiness()
      .catch(() => {
        if (!cancelled) setError("Không thể tải mức độ sẵn sàng.");
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
        setError(res.message || res.error?.message || "Không thể cập nhật điểm readiness.");
      }
    } catch {
      setError("Không thể cập nhật điểm readiness.");
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) return <CardSkeleton />;

  if (error && !readiness) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-900">Chưa tải được Sẵn sàng gọi vốn</p>
            <p className="text-[12px] text-slate-500 mt-1">{error}</p>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                loadReadiness().finally(() => setLoading(false));
              }}
              className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-[12px] font-semibold hover:bg-slate-50 transition-colors"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!readiness) return null;

  const score = clampScore(readiness.overallScore);
  const statusCfg = STATUS_META[readiness.status] ?? STATUS_META.NOTREADY;
  const missingItems = readiness.missingItems ?? [];
  const topMissing = missingItems.slice(0, 3);
  const appliedCaps = [...(readiness.appliedCaps ?? [])].sort((a, b) => a.cappedAt - b.cappedAt);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#eec54e]/15 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5 text-[#b78b0a]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-slate-900">Sẵn sàng gọi vốn</h2>
            <p className="text-[12px] text-slate-500 mt-0.5">Cập nhật {formatReadinessDate(readiness.calculatedAt)}</p>
          </div>
        </div>
        <ReadinessStatusBadge status={readiness.status} />
      </div>

      <div className="flex items-end justify-between gap-4 mb-3">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-[34px] font-bold leading-none text-slate-900">{score}</span>
            <span className="text-[13px] font-semibold text-slate-400">/100</span>
          </div>
          <p className="text-[12px] text-slate-500 mt-2">{statusCfg.summary}</p>
        </div>
        <button
          type="button"
          onClick={handleRecalculate}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 text-[12px] font-semibold hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {refreshing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
          Làm mới
        </button>
      </div>

      <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-500", statusCfg.bar)} style={{ width: `${score}%` }} />
      </div>

      {appliedCaps.length > 0 && (
        <div className="mt-4 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[12px] text-amber-700">
            Điểm đang bị giới hạn ở mức tối đa {appliedCaps[0].cappedAt} do còn thiếu điều kiện bắt buộc.
          </p>
        </div>
      )}

      <div className="mt-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Mục cần hoàn thiện</p>
          <span className="text-[11px] font-semibold text-slate-500">{missingItems.length} mục</span>
        </div>
        {topMissing.length > 0 ? (
          <ul className="space-y-1.5">
            {topMissing.map((item) => (
              <li key={`${item.dimension}-${item.code}`} className="text-[12px] text-slate-600 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 mt-1.5" />
                <span>{getMissingItemLabel(item.code, item.label)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[12px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
            Không còn mục thiếu quan trọng trong checklist hiện tại.
          </p>
        )}
      </div>

      {error && <p className="mt-3 text-[12px] text-red-500">{error}</p>}

      <div className="mt-5 flex items-center justify-between gap-3">
        <Link
          href="/startup/readiness"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f172a] text-white text-[13px] font-medium hover:bg-[#1e293b] transition-colors shadow-sm"
        >
          Xem chi tiết
          <ArrowRight className="w-4 h-4" />
        </Link>
        <span className="text-[11px] text-slate-400">Tự động tính theo dữ liệu mới nhất</span>
      </div>
    </div>
  );
}
