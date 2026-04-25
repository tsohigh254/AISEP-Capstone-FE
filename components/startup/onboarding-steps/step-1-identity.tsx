"use client";

import { useEffect, useState } from "react";
import { Building2, ArrowRight, Globe, TrendingUp, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { GetIndustriesTree, GetStages, IIndustryTree, IStageMasterItem } from "@/services/master/master.api";

const labelCls = "block text-[12px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5";
const inputCls = "w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-[13px] text-slate-800 placeholder:text-slate-300 outline-none transition-all bg-white focus:border-[#eec54e] focus:ring-2 focus:ring-[#eec54e]/20 shadow-sm";

export interface OnboardFormData {
  startupName: string;
  oneLiner: string;
  industryId: string;
  subIndustryId: string;
  stageId: string;
  problem: string;
  solution: string;
  targetAudience: string;
}

interface Step1Props {
  data: OnboardFormData;
  update: (data: OnboardFormData) => void;
  onNext: () => void;
}

export function Step1({ data, update, onNext }: Step1Props) {
  const [industries, setIndustries] = useState<IIndustryTree[]>([]);
  const [stages, setStages] = useState<IStageMasterItem[]>([]);

  useEffect(() => {
    GetIndustriesTree().then(setIndustries).catch(() => {});
    GetStages().then(setStages).catch(() => {});
  }, []);

  const selectedParent = industries.find((item) => item.industryId === Number(data.industryId));
  const selectedParentChildren = selectedParent?.subIndustries ?? [];
  const isValid = data.startupName.trim() && data.industryId && data.stageId;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-400">
      <div className="space-y-1.5">
        <p className="text-[11px] font-bold text-[#eec54e] uppercase tracking-widest">Bước 1 / 2</p>
        <h2 className="text-[26px] font-black text-slate-900 tracking-tight leading-tight">
          Startup của bạn là gì?
        </h2>
        <p className="text-[13px] text-slate-500 leading-relaxed">
          Chỉ cần 3 thông tin cơ bản, bạn có thể bổ sung chi tiết sau.
        </p>
      </div>

      <div className="space-y-5">
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className={labelCls}>
              Lĩnh vực <span className="text-red-400 normal-case">*</span>
            </label>
            <div className="relative group">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#eec54e] transition-colors z-10 pointer-events-none" />
              <select
                className={cn(inputCls, "appearance-none cursor-pointer pr-9")}
                value={data.industryId || ""}
                onChange={e => update({ ...data, industryId: e.target.value, subIndustryId: "" })}
              >
                <option value="" disabled>
                  {industries.length === 0 ? "Đang tải..." : "Chọn lĩnh vực"}
                </option>
                {industries.map(parent => (
                  <option key={parent.industryId} value={parent.industryId.toString()}>
                    {parent.industryName}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelCls}>Ngành phụ</label>
            <div className="relative group">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#eec54e] transition-colors z-10 pointer-events-none" />
              <select
                className={cn(inputCls, "appearance-none cursor-pointer pr-9 disabled:cursor-not-allowed disabled:opacity-60")}
                value={data.subIndustryId || ""}
                onChange={e => update({ ...data, subIndustryId: e.target.value })}
                disabled={!data.industryId || selectedParentChildren.length === 0}
              >
                <option value="">
                  {!data.industryId
                    ? "Chọn lĩnh vực trước"
                    : selectedParentChildren.length === 0
                      ? "Không có ngành phụ"
                      : "Chọn ngành phụ"}
                </option>
                {selectedParentChildren.map(child => (
                  <option key={child.industryId} value={child.industryId.toString()}>
                    {child.industryName}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelCls}>
              Giai đoạn <span className="text-red-400 normal-case">*</span>
            </label>
            <div className="relative group">
              <TrendingUp className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#eec54e] transition-colors z-10 pointer-events-none" />
              <select
                className={cn(inputCls, "appearance-none cursor-pointer pr-9")}
                value={data.stageId}
                onChange={e => update({ ...data, stageId: e.target.value })}
              >
                <option value="" disabled>{stages.length === 0 ? "Đang tải..." : "Chọn giai đoạn"}</option>
                {stages.map((stage) => (
                  <option key={stage.stageId} value={stage.stageId.toString()}>
                    {stage.stageName}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
        <span className="text-[16px] mt-0.5">?</span>
        <p className="text-[12px] text-slate-500 leading-relaxed">
          Không chắc chọn gì? Cứ chọn gần đúng nhất, bạn có thể chỉnh lại sau trong trang hồ sơ.
        </p>
      </div>

      <div className="flex items-center justify-end pt-2 border-t border-slate-50">
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
