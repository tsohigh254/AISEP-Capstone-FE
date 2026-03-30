"use client";

import { useEffect, useState } from "react";
import { Building2, ArrowRight, Globe, TrendingUp, ChevronDown, Sparkles, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { GetIndustriesFlat, IIndustryFlat } from "@/services/master/master.api";
import { StartupStage } from "@/services/startup/startup.api";

const labelCls = "block text-[12px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5";
const inputCls = "w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-[13px] text-slate-800 placeholder:text-slate-300 outline-none transition-all bg-white focus:border-[#eec54e] focus:ring-2 focus:ring-[#eec54e]/20 shadow-sm";

export interface OnboardFormData {
  startupName: string;
  oneLiner: string;
  businessCode: string;
  industryID: string;
  stage: string;
  problem: string;
  solution: string;
  targetAudience: string;
}

interface Step1Props {
  data: OnboardFormData;
  update: (data: OnboardFormData) => void;
  onNext: () => void;
  onSkip?: () => void;
}

export function Step1({ data, update, onNext, onSkip }: Step1Props) {
  const [industries, setIndustries] = useState<IIndustryFlat[]>([]);

  useEffect(() => {
    GetIndustriesFlat()
      .then(all => setIndustries(all.filter(i => !i.parentIndustryID)))
      .catch(() => {});
  }, []);

  const isValid = data.startupName.trim() && data.industryID && data.stage;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-400">

      {/* Header */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-bold text-[#eec54e] uppercase tracking-widest">Bước 1 / 2</p>
        <h2 className="text-[26px] font-black text-slate-900 tracking-tight leading-tight">
          Startup của bạn là gì?
        </h2>
        <p className="text-[13px] text-slate-500 leading-relaxed">
          Chỉ cần 3 thông tin cơ bản — bạn có thể bổ sung chi tiết sau.
        </p>
      </div>

      {/* Fields */}
      <div className="space-y-5">

        {/* Name */}
        <div className="space-y-1.5">
          <label className={labelCls}>
            Tên Startup <span className="text-red-400 normal-case">*</span>
          </label>
          <div className="relative group">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#eec54e] transition-colors" />
            <input
              className={inputCls}
              value={data.startupName}
              onChange={e => update({ ...data, startupName: e.target.value })}
              placeholder="Vd: AISEP Việt Nam, GreenTech..."
              autoFocus
            />
          </div>
        </div>

        {/* One-liner / Tagline */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className={labelCls}>Khẩu hiệu / Tagline</label>
            <span className="text-[11px] font-semibold tabular-nums text-slate-400">
              {data.oneLiner.length}/100
            </span>
          </div>
          <div className="relative group">
            <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#eec54e] transition-colors" />
            <input
              className={inputCls}
              value={data.oneLiner}
              onChange={e => update({ ...data, oneLiner: e.target.value.slice(0, 100) })}
              placeholder="Mô tả startup trong một câu ngắn gọn..."
            />
          </div>
        </div>

        {/* Mã số kinh doanh (Business Code) — gửi kèm CreateStartupProfile */}
        <div className="space-y-1.5">
          <label className={labelCls}>Mã số kinh doanh (Business Code)</label>
          <div className="relative group">
            <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#eec54e] transition-colors" />
            <input
              className={inputCls}
              value={data.businessCode}
              onChange={e => update({ ...data, businessCode: e.target.value })}
              placeholder="Ví dụ: 0312345678"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Industry */}
          <div className="space-y-1.5">
            <label className={labelCls}>
              Lĩnh vực <span className="text-red-400 normal-case">*</span>
            </label>
            <div className="relative group">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#eec54e] transition-colors z-10 pointer-events-none" />
              <select
                className={cn(inputCls, "appearance-none cursor-pointer pr-9")}
                value={data.industryID || ""}
                onChange={e => update({ ...data, industryID: e.target.value })}
              >
                <option value="" disabled>
                  {industries.length === 0 ? "Đang tải..." : "Chọn lĩnh vực"}
                </option>
                {industries.map(ind => (
                  <option key={ind.industryID} value={ind.industryID}>
                    {ind.industryName}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Stage */}
          <div className="space-y-1.5">
            <label className={labelCls}>
              Giai đoạn <span className="text-red-400 normal-case">*</span>
            </label>
            <div className="relative group">
              <TrendingUp className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#eec54e] transition-colors z-10 pointer-events-none" />
              <select
                className={cn(inputCls, "appearance-none cursor-pointer pr-9")}
                value={data.stage}
                onChange={e => update({ ...data, stage: e.target.value })}
              >
                <option value="" disabled>Chọn giai đoạn</option>
                <option value={StartupStage.Idea.toString()}>Ý tưởng (Idea)</option>
                <option value={StartupStage.PreSeed.toString()}>Tiền ươm mầm (Pre-Seed)</option>
                <option value={StartupStage.Seed.toString()}>Ươm mầm (Seed)</option>
                <option value={StartupStage.SeriesA.toString()}>Series A</option>
                <option value={StartupStage.SeriesB.toString()}>Series B</option>
                <option value={StartupStage.SeriesC.toString()}>Series C+</option>
                <option value={StartupStage.Growth.toString()}>Tăng trưởng (Growth)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Tip */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
        <span className="text-[16px] mt-0.5">💡</span>
        <p className="text-[12px] text-slate-500 leading-relaxed">
          Không chắc chọn gì? Cứ chọn gần đúng nhất — bạn có thể chỉnh lại sau trong trang hồ sơ.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
        {onSkip ? (
          <button
            onClick={onSkip}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-500 text-[13px] font-medium hover:bg-slate-50 transition-colors"
          >
            Bỏ qua
          </button>
        ) : <div />}
        <button
          onClick={onNext}
          disabled={!isValid}
          className={cn(
            "inline-flex items-center gap-1.5 px-6 h-11 rounded-xl font-semibold text-[13px] transition-all shadow-sm",
            isValid
              ? "bg-[#0f172a] text-white hover:bg-[#1e293b]"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          )}
        >
          Tiếp tục
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
