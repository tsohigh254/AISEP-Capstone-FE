"use client";

import { InvestorShell } from "@/components/investor/investor-shell";
import {
  X,
  Plus,
  Sparkles,
  Shield,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatedNumber } from "@/lib/useCountUp";

/* ────────────────────────────────────────────────────────────────────
   Types & mock data
   ──────────────────────────────────────────────────────────────────── */
type Startup = {
  id: number;
  name: string;
  initials: string;
  stage: string;
  industry: string;
  location: string;
  fundingNeeds: string;
  aiScore: number;
  marketScore: number;
  teamScore: number;
  traction: string;
  latestDoc: string;
  blockchain: "Verified" | "Pending";
  foundingDate: string;
  status: "Active" | "Draft";
};

const MOCK_STARTUPS: Startup[] = [
  {
    id: 1,
    name: "NeuralViet AI",
    initials: "NV",
    stage: "Seed",
    industry: "AI & Machine Learning",
    location: "Hồ Chí Minh",
    fundingNeeds: "$800K",
    aiScore: 87,
    marketScore: 85,
    teamScore: 82,
    traction: "12K Users · $65K MRR",
    latestDoc: "Pitch Deck (3 ngày trước)",
    blockchain: "Verified",
    foundingDate: "Tháng 3, 2023",
    status: "Active",
  },
  {
    id: 2,
    name: "PayGo Finance",
    initials: "PG",
    stage: "Series A",
    industry: "FinTech",
    location: "Hà Nội",
    fundingNeeds: "$2.5M",
    aiScore: 91,
    marketScore: 90,
    teamScore: 89,
    traction: "50K Users · $210K MRR",
    latestDoc: "Financials Q4 (1 tuần trước)",
    blockchain: "Verified",
    foundingDate: "Tháng 6, 2022",
    status: "Active",
  },
  {
    id: 3,
    name: "MediScan",
    initials: "MS",
    stage: "Pre-Seed",
    industry: "HealthTech",
    location: "Đà Nẵng",
    fundingNeeds: "$300K",
    aiScore: 79,
    marketScore: 78,
    teamScore: 75,
    traction: "2K Users · $8K MRR",
    latestDoc: "Business Plan (1 tháng trước)",
    blockchain: "Verified",
    foundingDate: "Tháng 9, 2024",
    status: "Active",
  },
];

const MONOGRAM_PALETTES = [
  { bg: "bg-slate-100",   text: "text-slate-600",   border: "border-slate-200/60" },
  { bg: "bg-sky-50",      text: "text-sky-600",     border: "border-sky-100/60" },
  { bg: "bg-violet-50",   text: "text-violet-600",  border: "border-violet-100/60" },
  { bg: "bg-amber-50",    text: "text-amber-600",   border: "border-amber-100/60" },
  { bg: "bg-emerald-50",  text: "text-emerald-600", border: "border-emerald-100/60" },
];

function getPalette(id: number) {
  return MONOGRAM_PALETTES[id % MONOGRAM_PALETTES.length];
}

/* ────────────────────────────────────────────────────────────────────
   Score bar helper
   ──────────────────────────────────────────────────────────────────── */
function ScoreBar({ value, max = 100, delay = 0 }: { value: number; max?: number; delay?: number }) {
  const pct = Math.round((value / max) * 100);
  const color =
    pct >= 85 ? "bg-emerald-400" :
    pct >= 70 ? "bg-[#e6cc4c]" :
    "bg-slate-300";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <AnimatedNumber
        value={value}
        duration={900}
        delay={delay}
        format={(n) => n.toFixed(0)}
        className="text-[13px] font-semibold text-slate-800 w-7 text-right tabular-nums"
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────
   Table row helper — alternating background for clarity
   ──────────────────────────────────────────────────────────────────── */
function CompareRow({
  label,
  children,
  dim,
}: {
  label: string;
  children: React.ReactNode;
  dim?: boolean;
}) {
  return (
    <tr className={`border-t border-slate-100 ${dim ? "bg-slate-50/40" : "bg-white"} hover:bg-slate-50/60 transition-colors`}>
      <td className="px-5 py-3.5 text-[12px] font-semibold text-slate-400 uppercase tracking-[0.04em] w-[180px] whitespace-nowrap">
        {label}
      </td>
      {children}
    </tr>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Page
   ════════════════════════════════════════════════════════════════════ */
export default function CompareStartupsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Startup[]>(MOCK_STARTUPS);

  const remove = (id: number) => setSelected((prev) => prev.filter((s) => s.id !== id));

  const best = (values: number[]) => Math.max(...values);

  return (
    <InvestorShell>
      <div className="space-y-7">
        {/* ─── Header ─── */}
        <div>
          <h1 className="text-[28px] font-semibold text-[#0f172a] tracking-[-0.025em] leading-tight">
            So sánh Startup
          </h1>
          <p className="text-[14px] text-slate-400 mt-1.5 font-normal">
            Đánh giá song song các startup để đưa ra quyết định đầu tư tốt hơn
          </p>
        </div>

        {/* ─── Selected startup pills ─── */}
        <div className="flex items-center gap-2 flex-wrap">
          {selected.map((s) => {
            const p = getPalette(s.id);
            return (
              <div
                key={s.id}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-sm text-[13px] font-medium text-slate-700"
              >
                <div className={`w-5 h-5 rounded-md ${p.bg} border ${p.border} flex items-center justify-center`}>
                  <span className={`${p.text} text-[9px] font-bold`}>{s.initials}</span>
                </div>
                {s.name}
                <button
                  onClick={() => remove(s.id)}
                  className="w-4 h-4 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors ml-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
          <button
            onClick={() => router.push("/investor/startups")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-slate-300 text-[13px] font-medium text-slate-400 hover:border-slate-400 hover:text-slate-600 transition-colors bg-white"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm startup
          </button>
        </div>

        {selected.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-800 font-semibold text-[16px] mb-1">Chưa có startup nào</p>
            <p className="text-slate-400 text-[14px] mb-5">Thêm startup từ trang Khám phá để so sánh</p>
            <button
              onClick={() => router.push("/investor/startups")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium bg-[#0f172a] text-white hover:bg-[#1e293b] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Khám phá Startup
            </button>
          </div>
        ) : (
          /* ─── Comparison Table ─── */
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                {/* Sticky startup header row */}
                <thead>
                  <tr className="bg-slate-50/80">
                    <th className="px-5 py-4 text-left w-[180px]">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.05em]">Tiêu chí</span>
                    </th>
                    {selected.map((s) => {
                      const p = getPalette(s.id);
                      return (
                        <th key={s.id} className="px-5 py-4 text-left min-w-[200px]">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-9 h-9 rounded-xl ${p.bg} border ${p.border} flex items-center justify-center shrink-0`}>
                              <span className={`${p.text} font-semibold text-[12px]`}>{s.initials}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-[14px] text-[#0f172a] truncate">{s.name}</p>
                              <p className="text-[11px] text-slate-400 font-normal">{s.industry}</p>
                            </div>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody>
                  {/* Stage */}
                  <CompareRow label="Giai đoạn">
                    {selected.map((s) => (
                      <td key={s.id} className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100/70">
                          {s.stage}
                        </span>
                      </td>
                    ))}
                  </CompareRow>

                  {/* Location */}
                  <CompareRow label="Địa điểm" dim>
                    {selected.map((s) => (
                      <td key={s.id} className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-[13px] text-slate-600 font-normal">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {s.location}
                        </div>
                      </td>
                    ))}
                  </CompareRow>

                  {/* Funding Needs */}
                  <CompareRow label="Gọi vốn">
                    {selected.map((s) => (
                      <td key={s.id} className="px-5 py-3.5">
                        <span className="text-[14px] font-semibold text-[#0f172a]">{s.fundingNeeds}</span>
                      </td>
                    ))}
                  </CompareRow>

                  {/* AI Score */}
                  <CompareRow label="AI Score" dim>
                    {selected.map((s, idx) => {
                      const isBest = s.aiScore === best(selected.map((x) => x.aiScore));
                      return (
                        <td key={s.id} className="px-5 py-3.5">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3 text-[#e6cc4c] shrink-0" />
                              {isBest && <span className="text-[9px] font-bold text-[#0f172a] bg-[#e6cc4c] px-1.5 py-[1px] rounded-md uppercase tracking-[0.04em]">Tốt nhất</span>}
                            </div>
                            <ScoreBar value={s.aiScore} delay={idx * 120} />
                          </div>
                        </td>
                      );
                    })}
                  </CompareRow>

                  {/* Market Score */}
                  <CompareRow label="Thị trường">
                    {selected.map((s, idx) => (
                      <td key={s.id} className="px-5 py-3.5">
                        <ScoreBar value={s.marketScore} delay={idx * 120 + 150} />
                      </td>
                    ))}
                  </CompareRow>

                  {/* Team Score */}
                  <CompareRow label="Đội ngũ" dim>
                    {selected.map((s, idx) => (
                      <td key={s.id} className="px-5 py-3.5">
                        <ScoreBar value={s.teamScore} delay={idx * 120 + 300} />
                      </td>
                    ))}
                  </CompareRow>

                  {/* Traction */}
                  <CompareRow label="Traction">
                    {selected.map((s) => (
                      <td key={s.id} className="px-5 py-3.5 text-[13px] text-slate-700 font-normal">
                        {s.traction}
                      </td>
                    ))}
                  </CompareRow>

                  {/* Latest Doc */}
                  <CompareRow label="Tài liệu mới nhất" dim>
                    {selected.map((s) => (
                      <td key={s.id} className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5 text-[13px] text-slate-600 font-normal">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {s.latestDoc}
                        </div>
                      </td>
                    ))}
                  </CompareRow>

                  {/* Blockchain */}
                  <CompareRow label="Xác minh">
                    {selected.map((s) => (
                      <td key={s.id} className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                          s.blockchain === "Verified"
                            ? "text-emerald-700 bg-emerald-50 border-emerald-100/70"
                            : "text-amber-600 bg-amber-50 border-amber-100/70"
                        }`}>
                          {s.blockchain === "Verified"
                            ? <><Shield className="w-3 h-3" />Đã xác minh</>
                            : <>Đang xử lý</>}
                        </span>
                      </td>
                    ))}
                  </CompareRow>

                  {/* Status */}
                  <CompareRow label="Trạng thái" dim>
                    {selected.map((s) => (
                      <td key={s.id} className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${s.status === "Active" ? "text-emerald-600" : "text-slate-400"}`}>
                          <CheckCircle2 className={`w-3.5 h-3.5 ${s.status === "Active" ? "text-emerald-500" : "text-slate-300"}`} />
                          {s.status === "Active" ? "Đang hoạt động" : "Nháp"}
                        </span>
                      </td>
                    ))}
                  </CompareRow>

                  {/* Founding Date */}
                  <CompareRow label="Thành lập">
                    {selected.map((s) => (
                      <td key={s.id} className="px-5 py-3.5 text-[13px] text-slate-600 font-normal">
                        {s.foundingDate}
                      </td>
                    ))}
                  </CompareRow>

                  {/* CTA row */}
                  <CompareRow label="">
                    {selected.map((s) => (
                      <td key={s.id} className="px-5 py-4">
                        <button
                          onClick={() => router.push(`/investor/startups/${s.id}`)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold text-[#0f172a] border border-slate-200 bg-white hover:bg-[#0f172a] hover:text-white hover:border-[#0f172a] transition-all duration-200 shadow-sm"
                        >
                          Xem hồ sơ
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    ))}
                  </CompareRow>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </InvestorShell>
  );
}
