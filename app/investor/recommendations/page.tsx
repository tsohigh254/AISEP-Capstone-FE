"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Target, Star, TrendingUp, CheckCircle, Handshake, ShieldCheck, Settings2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { GetRecommendations } from "@/services/investor/investor.api";

export default function RecommendationsPage() {
  const [recs, setRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          const img = m.logoUrl ?? m.logoURL ?? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
          
          return {
            id: startupId ? startupId.toString() : `rec-${idx}`,
            startupId,
            name,
            score,
            fitLabel,
            matchReasons: reasonsArray.filter(r => r && typeof r === "string"),
            img,
          };
        }).filter(Boolean);

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

  return (
    <div className="mx-auto max-w-[1100px] space-y-6 animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-2xl p-8 shadow-sm border border-slate-800 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Target className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-6 h-6 text-[#e6cc4c]" />
            <span className="text-sm font-black text-[#e6cc4c] uppercase tracking-widest">Hệ thống Gợi ý Thông minh</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">Startup phù hợp với bạn</h1>
          <p className="text-slate-300 leading-relaxed text-sm">
            Hệ thống tự động phân tích và so khớp hồ sơ Startup dựa trên các tiêu chí đầu tư của bạn bao gồm: 
            <strong> Lĩnh vực ưu tiên, Giai đoạn gọi vốn, </strong> và <strong> Vị trí địa lý. </strong> 
            Giúp bạn nhanh chóng tiếp cận các cơ hội đầu tư tiềm năng nhất.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/investor/profile">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all border border-white/10">
                <Settings2 className="w-4 h-4" /> Điều chỉnh tiêu chí
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <h2 className="text-lg font-bold text-[#171611] flex items-center gap-2">
          <Star className="w-5 h-5 text-[#e6cc4c] fill-[#e6cc4c]" /> Top Startup phù hợp nhất
        </h2>
        <span className="text-xs text-neutral-muted font-bold flex items-center gap-1">
          <Info className="w-4 h-4" /> Dựa trên Profile của bạn
        </span>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-surface">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-[#e6cc4c] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-neutral-muted font-medium">Đang phân tích dữ liệu phù hợp…</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-surface">
          <p className="text-sm text-rose-600 font-medium">Lỗi: {error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recs?.length === 0 ? (
            <div className="col-span-full bg-white rounded-2xl p-12 shadow-sm border border-dashed border-neutral-surface text-center">
              <Target className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
              <p className="text-sm text-neutral-muted font-medium">Không có gợi ý phù hợp hiện tại. Hãy thử cập nhật Thesis của bạn.</p>
            </div>
          ) : (
            recs.map((rec) => (
              <div key={rec.id} className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-surface hover:border-[#e6cc4c]/50 transition-all flex flex-col h-full group relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#e6cc4c] text-[#171611] px-4 py-1.5 rounded-bl-xl font-black text-sm flex items-center gap-1 z-10 shadow-sm">
                  <CheckCircle className="w-4 h-4" /> {rec.score}% Phù hợp
                </div>

                <div className="flex items-center gap-4 mb-4 mt-2">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-neutral-100 flex-shrink-0">
                    <img src={rec.img} alt={rec.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div>
                    <Link href={`/investor/startups/${rec.startupId}`} className="text-lg font-bold text-[#171611] hover:text-[#C8A000] transition-colors">
                      {rec.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-black bg-[#f4f4f0] px-2 py-0.5 rounded-md text-neutral-500 uppercase tracking-tighter">
                        {rec.fitLabel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 mb-6 flex-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2.5 flex items-center gap-1">
                    <Target className="w-3 h-3" /> Tiêu chí phù hợp
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {rec.matchReasons?.length > 0 ? (
                      rec.matchReasons.map((reason: string, i: number) => (
                        <span key={i} className="text-[11px] font-bold text-[#171611]/70 bg-white border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                          <div className="w-1 h-1 rounded-full bg-[#e6cc4c]" /> {reason}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-neutral-400 italic">Dữ liệu đang cập nhật...</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <Link href={`/investor/startups/${rec.startupId}`} className="w-full flex-1">
                    <button className="w-full justify-center bg-white text-[#171611] border border-neutral-surface font-bold px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 text-sm shadow-sm">
                      <Info className="w-4 h-4" /> Chi tiết
                    </button>
                  </Link>
                  <button className="w-full flex-1 justify-center bg-[#171611] text-white font-bold px-4 py-2.5 rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 text-sm shadow-md">
                    <Handshake className="w-4 h-4" /> Kết nối
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
