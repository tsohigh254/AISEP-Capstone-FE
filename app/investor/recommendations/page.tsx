"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Target, Star, CheckCircle, Handshake, ShieldCheck, Settings2, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { GetRecommendations } from "@/services/investor/investor.api";
import { CreateConnection } from "@/services/connection/connection.api";
import { toast } from "sonner";

const AVATAR_COLORS = [
  "from-violet-500 to-violet-600",
  "from-blue-500 to-blue-600",
  "from-emerald-500 to-emerald-600",
  "from-rose-500 to-rose-600",
  "from-amber-500 to-amber-600",
  "from-cyan-500 to-cyan-600",
  "from-pink-500 to-pink-600",
  "from-indigo-500 to-indigo-600",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface RecommendationCard {
  id: string;
  startupId: number;
  name: string;
  score: number;
  fitLabel: string;
  matchReasons: string[];
}

export default function RecommendationsPage() {
  const [recs, setRecs] = useState<RecommendationCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectingStartupIds, setConnectingStartupIds] = useState<Record<number, boolean>>({});
  const [sentConnectionStartupIds, setSentConnectionStartupIds] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    
    GetRecommendations(10)
      .then((res) => {
        if (!mounted) return;
        
        // Handle different response structures (Standard AISEP API envelope)
        const payload = res?.data?.data || res?.data;
        const matches = payload?.matches ?? payload?.Matches ?? [];
        
        if (!Array.isArray(matches)) {
          setRecs([]);
          setLoading(false);
          return;
        }

        const mapped = matches.map((m: any, idx: number) => {
          if (!m) return null;
          
          const startupId = m.startupId ?? m.StartupId ?? m.startupID ?? m.StartupID ?? 0;
          const name = m.startupName ?? m.StartupName ?? "Unknown Startup";
          const score = Math.round((m.finalMatchScore ?? m.FinalMatchScore ?? 0) * 100);
          
          // Ensure matchReasons is always an array of strings
          let rawReasons = m.positiveReasons ?? m.PositiveReasons ?? m.matchReasons ?? m.MatchReasons ?? [];
          if (typeof rawReasons === "string") {
            rawReasons = rawReasons.split(";").map(s => s.trim()).filter(Boolean);
          }
          const reasonsArray = Array.isArray(rawReasons) ? rawReasons : [String(rawReasons)];
          
          const fitLabel = m.fitSummaryLabel ?? m.FitSummaryLabel ?? "Phù hợp";
          return {
            id: startupId ? startupId.toString() : `rec-${idx}`,
            startupId,
            name,
            score,
            fitLabel,
            matchReasons: reasonsArray.filter(r => r && typeof r === "string"),
          };
        }).filter((item): item is RecommendationCard => item !== null);

        setRecs(mapped);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading recommendations:", err);
        if (mounted) {
          setError(err?.response?.data?.message || err.message || "Không thể tải danh sách gợi ý.");
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleCreateConnection = async (startupId: number, startupName: string) => {
    if (!startupId || connectingStartupIds[startupId] || sentConnectionStartupIds[startupId]) return;

    setConnectingStartupIds((prev) => ({ ...prev, [startupId]: true }));
    try {
      const message = `Xin chào ${startupName}, tôi quan tâm đến startup của bạn và mong muốn kết nối để trao đổi thêm về cơ hội hợp tác đầu tư.`;
      const res: any = await CreateConnection({ startupId, message });
      const ok = Boolean(res?.data?.success || res?.data?.isSuccess || res?.success || res?.isSuccess);
      if (ok) {
        setSentConnectionStartupIds((prev) => ({ ...prev, [startupId]: true }));
        toast.success("Đã gửi yêu cầu kết nối");
        return;
      }
      const msg = res?.data?.message || res?.message || "Không thể gửi yêu cầu kết nối";
      toast.error(msg);
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || "Không thể gửi yêu cầu kết nối";
      if ((msg as string).toLowerCase().includes("already") || (msg as string).toLowerCase().includes("exists")) {
        setSentConnectionStartupIds((prev) => ({ ...prev, [startupId]: true }));
        toast.success("Yêu cầu kết nối đã được gửi trước đó");
      } else {
        toast.error(msg);
      }
    } finally {
      setConnectingStartupIds((prev) => ({ ...prev, [startupId]: false }));
    }
  };

  return (
    <div className="mx-auto max-w-[1100px] space-y-5 animate-in fade-in duration-400">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/80 text-[10px] font-semibold mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Hệ thống gợi ý thông minh
            </div>
            <h1 className="text-[20px] font-bold text-slate-900 leading-tight mb-2">Startup phù hợp với bạn</h1>
            <p className="text-[13px] text-slate-600 leading-relaxed max-w-[780px]">
              Hệ thống phân tích và so khớp Startup theo hồ sơ đầu tư của bạn gồm lĩnh vực ưu tiên, giai đoạn gọi vốn và vị trí địa lý.
              Kết quả giúp bạn tiếp cận nhanh các cơ hội tiềm năng nhất.
            </p>
          </div>
          <Link
            href="/investor/profile"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-[13px] font-medium hover:bg-slate-50 transition-colors shrink-0"
          >
            <Settings2 className="w-4 h-4" />
            Điều chỉnh tiêu chí
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-[13px] font-semibold text-slate-900 flex items-center gap-2">
          <Star className="w-4 h-4 text-[#eec54e] fill-[#eec54e]" />
          Top Startup phù hợp nhất
        </h2>
        <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
          <Info className="w-3.5 h-3.5" />
          Dựa trên profile của bạn
        </span>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-16">
          <div className="flex items-center justify-center gap-2 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <p className="text-[13px]">Đang phân tích dữ liệu phù hợp...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
          <p className="text-[13px] text-red-600 font-medium">Lỗi: {error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {recs?.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] py-16 px-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-[14px] font-semibold text-slate-500">Không có gợi ý phù hợp</p>
              <p className="text-[13px] text-slate-400 mt-1">Hãy cập nhật tiêu chí đầu tư để hệ thống đề xuất chính xác hơn.</p>
            </div>
          ) : (
            recs.map((rec) => (
              <div
                key={rec.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow flex flex-col h-full"
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-[15px] font-bold shrink-0",
                        getAvatarColor(rec.name)
                      )}
                    >
                      {rec.name?.charAt(0)?.toUpperCase() || "S"}
                    </div>
                    <div className="min-w-0">
                      <Link href={`/investor/startups/${rec.startupId}`} className="text-[15px] font-semibold text-slate-900 hover:text-[#0f172a] transition-colors truncate block">
                        {rec.name}
                      </Link>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">{rec.fitLabel}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border bg-amber-50 text-amber-700 border-amber-200/80 shrink-0">
                    <CheckCircle className="w-3 h-3" />
                    {rec.score}% phù hợp
                  </span>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-5 flex-1">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Target className="w-3 h-3" /> Tiêu chí phù hợp
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {rec.matchReasons?.length > 0 ? (
                      rec.matchReasons.map((reason: string, i: number) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white text-slate-700 text-[11px] font-semibold border border-slate-200">
                          {reason}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Dữ liệu đang cập nhật...</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/investor/startups/${rec.startupId}`}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-[13px] font-medium hover:bg-slate-50 transition-colors flex-1"
                  >
                    <Info className="w-4 h-4" />
                    Chi tiết
                  </Link>
                  <button
                    type="button"
                    disabled={Boolean(connectingStartupIds[rec.startupId] || sentConnectionStartupIds[rec.startupId])}
                    onClick={() => handleCreateConnection(rec.startupId, rec.name)}
                    className={cn(
                      "inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-medium transition-colors shadow-sm flex-1",
                      connectingStartupIds[rec.startupId] || sentConnectionStartupIds[rec.startupId]
                        ? "bg-slate-300 text-white cursor-not-allowed"
                        : "bg-[#0f172a] text-white hover:bg-[#1e293b]"
                    )}
                  >
                    {connectingStartupIds[rec.startupId] ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Đang gửi...
                      </>
                    ) : sentConnectionStartupIds[rec.startupId] ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Đã gửi
                      </>
                    ) : (
                      <>
                        <Handshake className="w-4 h-4" />
                        Kết nối
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
