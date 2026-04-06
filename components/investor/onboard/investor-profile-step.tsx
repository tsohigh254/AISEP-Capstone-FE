"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, ArrowRight, Building2, MapPin,
  Globe, Zap, Layers, Linkedin,
  User, Camera, UserCircle, Tag, Briefcase, ChevronDown
} from "lucide-react";
import { IInvestorKYCSubmission } from "@/types/investor-kyc";
import { GetIndustriesFlat, IIndustryFlat } from "@/services/master/master.api";

const STAGE_OPTIONS = [
  "Idea", "Pre-Seed", "Seed", "Series A", "Series B", "Series C+", "IPO Ready"
];

interface InvestorProfileStepProps {
  data: Partial<IInvestorKYCSubmission>;
  onChange: (data: Partial<IInvestorKYCSubmission>) => void;
  onNext: () => void;
  onBack: () => void;
  errors: Record<string, string>;
}

export function InvestorProfileStep({ data, onChange, onNext, onBack, errors }: InvestorProfileStepProps) {
  const set = (key: keyof IInvestorKYCSubmission, val: any) => onChange({ ...data, [key]: val });

  const toggleList = (key: keyof IInvestorKYCSubmission, val: string) => {
    const list = (data[key] as string[]) || [];
    if (list.includes(val)) set(key, list.filter(v => v !== val));
    else set(key, [...list, val]);
  };

  const isInstitutional = data.investorCategory === "INSTITUTIONAL";

  const [industries, setIndustries] = useState<IIndustryFlat[]>([]);
  const [expandedSections, setExpandedSections] = useState<number[]>([]);

  useEffect(() => {
    GetIndustriesFlat().then(setIndustries).catch(() => {});
  }, []);

  const parentIndustries = industries.filter(i => !i.parentIndustryID);
  const childrenMap = industries.reduce((acc, i) => {
    if (i.parentIndustryID) {
      if (!acc[i.parentIndustryID]) acc[i.parentIndustryID] = [];
      acc[i.parentIndustryID].push(i);
    }
    return acc;
  }, {} as Record<number, IIndustryFlat[]>);

  const toggleSection = (id: number) => {
    setExpandedSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const inputClass = (name: string) => cn(
    "w-full h-11 px-3 py-2.5 rounded-xl border text-[13px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] transition-all bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]",
    errors[name] ? "border-red-300 bg-red-50/10" : "border-slate-200"
  );

  const Label = ({ children, required, icon: Icon }: any) => (
    <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 mb-2 ml-0.5 uppercase tracking-wider">
      {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );

  const totalSelected = data.preferredIndustries?.length ?? 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-10">

      <div className="flex items-center gap-4 mb-2 px-1">
        <div className="w-12 h-12 rounded-2xl bg-[#eec54e]/10 flex items-center justify-center shrink-0 border border-[#eec54e]/20 shadow-sm">
          <User className="w-6 h-6 text-[#eec54e]" />
        </div>
        <div>
          <h2 className="text-[15px] font-bold text-slate-900 leading-tight">Hồ sơ chuyên gia</h2>
          <p className="text-[13px] text-slate-500 mt-1 font-normal">Thông tin cơ bản để hiển thị trong hệ thống AISEP.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Avatar / Logo */}
        <div className="md:col-span-2 flex items-center gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm group cursor-pointer relative overflow-hidden transition-all hover:border-[#eec54e]/50">
            <input
              type="file"
              accept="image/png,image/jpeg"
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) set("avatar", URL.createObjectURL(file));
              }}
            />
            {data.avatar ? (
              <img src={data.avatar} className="w-full h-full object-cover" alt="Avatar" />
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-slate-300 group-hover:text-[#eec54e] transition-colors">
                <Camera className="w-7 h-7" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Upload</span>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] font-bold py-1.5 text-center opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider backdrop-blur-sm">
              Thay đổi
            </div>
          </div>
          <div className="space-y-1.5">
            <h4 className="text-[14px] font-bold text-slate-900 leading-none">
              {isInstitutional ? "Logo tổ chức" : "Ảnh đại diện"}
            </h4>
            <p className="text-[13px] text-slate-500 leading-relaxed max-w-[340px] font-normal">
              {isInstitutional
                ? "Tải lên Logo chính thức của tổ chức để tăng nhận diện thương hiệu."
                : "Ảnh chân dung chuyên nghiệp giúp tăng 40% khả năng kết nối thành công."}
            </p>
          </div>
        </div>

        {isInstitutional ? (
          <>
            <div className="space-y-1">
              <Label required icon={Building2}>Tên tổ chức</Label>
              <input
                value={data.displayName || ""}
                onChange={e => set("displayName", e.target.value)}
                placeholder="Ví dụ: AISEP Ventures, Dragon Capital..."
                className={inputClass("displayName")}
              />
              {errors.displayName && <p className="text-red-500 text-[11px] font-medium mt-1.5 ml-1">{errors.displayName}</p>}
            </div>

            <div className="space-y-1">
              <Label icon={Globe}>Website chính thức</Label>
              <input
                value={data.website || ""}
                onChange={e => set("website", e.target.value)}
                placeholder="https://..."
                className={inputClass("website")}
              />
            </div>

            <div className="space-y-1">
              <Label icon={UserCircle}>Người đại diện / Chức vụ</Label>
              <input
                value={data.currentRoleTitle || ""}
                onChange={e => set("currentRoleTitle", e.target.value)}
                placeholder="Ví dụ: Managing Partner, Investment Manager..."
                className={inputClass("currentRoleTitle")}
              />
            </div>

            <div className="space-y-1">
              <Label icon={MapPin}>Địa điểm hoạt động</Label>
              <input
                value={data.location || ""}
                onChange={e => set("location", e.target.value)}
                placeholder="Ví dụ: Hà Nội, TP. Hồ Chí Minh..."
                className={inputClass("location")}
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1">
              <Label required icon={UserCircle}>Tên hiển thị</Label>
              <input
                value={data.displayName || ""}
                onChange={e => set("displayName", e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
                className={inputClass("displayName")}
              />
              {errors.displayName && <p className="text-red-500 text-[11px] font-medium mt-1.5 ml-1">{errors.displayName}</p>}
            </div>

            <div className="space-y-1">
              <Label icon={Briefcase}>Chức vụ hiện tại</Label>
              <input
                value={data.currentRoleTitle || ""}
                onChange={e => set("currentRoleTitle", e.target.value)}
                placeholder="Ví dụ: Angel Investor, Partner..."
                className={inputClass("currentRoleTitle")}
              />
            </div>

            <div className="space-y-1">
              <Label icon={Linkedin}>LinkedIn / Profile link</Label>
              <input
                value={data.website || ""}
                onChange={e => set("website", e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className={inputClass("website")}
              />
            </div>

            <div className="space-y-1">
              <Label icon={MapPin}>Địa điểm hoạt động</Label>
              <input
                value={data.location || ""}
                onChange={e => set("location", e.target.value)}
                placeholder="Ví dụ: Hà Nội, TP. Hồ Chí Minh..."
                className={inputClass("location")}
              />
            </div>
          </>
        )}

        {/* Khẩu vị đầu tư */}
        <div className="md:col-span-2 space-y-1">
          <Label icon={Zap}>Khẩu vị đầu tư (Thesis)</Label>
          <textarea
            value={data.shortThesisSummary || ""}
            onChange={e => set("shortThesisSummary", e.target.value)}
            rows={3}
            placeholder="Chia sẻ ngắn gọn về lĩnh vực, giai đoạn và giá trị bạn mang lại cho Startup..."
            className={cn(inputClass("shortThesisSummary"), "h-auto py-3 resize-none")}
          />
        </div>

        {/* Lĩnh vực quan tâm — grouped accordion */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <Label icon={Tag}>Lĩnh vực quan tâm</Label>
            {totalSelected > 0 && (
              <span className="text-[12px] text-slate-500 mb-2">
                Đã chọn <span className="font-bold text-slate-700">{totalSelected}</span> lĩnh vực
              </span>
            )}
          </div>

          {industries.length === 0 ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-1.5">
              {parentIndustries.map(parent => {
                const children = childrenMap[parent.industryID] || [];
                const selectedCount = children.filter(c =>
                  (data.preferredIndustries || []).includes(c.industryName)
                ).length;
                const isExpanded = expandedSections.includes(parent.industryID);

                // Parent có children → accordion; không có → chip trực tiếp
                if (children.length === 0) {
                  const isSelected = (data.preferredIndustries || []).includes(parent.industryName);
                  return (
                    <button
                      key={parent.industryID}
                      type="button"
                      onClick={() => toggleList("preferredIndustries", parent.industryName)}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-xl border text-[13px] font-semibold transition-all active:scale-[0.99]",
                        isSelected
                          ? "bg-[#eec54e]/10 border-[#eec54e] text-slate-900"
                          : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                      )}
                    >
                      {parent.industryName}
                    </button>
                  );
                }

                return (
                  <div key={parent.industryID} className="border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleSection(parent.industryID)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <span className="text-[13px] font-bold text-slate-700">{parent.industryName}</span>
                      <div className="flex items-center gap-2">
                        {selectedCount > 0 && (
                          <span className="bg-[#eec54e] text-slate-900 text-[11px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                            {selectedCount}
                          </span>
                        )}
                        <ChevronDown className={cn(
                          "w-4 h-4 text-slate-400 transition-transform duration-200",
                          isExpanded && "rotate-180"
                        )} />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 py-3 flex flex-wrap gap-2 bg-white border-t border-slate-100">
                        {children.map(child => (
                          <button
                            key={child.industryID}
                            type="button"
                            onClick={() => toggleList("preferredIndustries", child.industryName)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all active:scale-95",
                              (data.preferredIndustries || []).includes(child.industryName)
                                ? "bg-[#eec54e] border-[#eec54e] text-slate-900"
                                : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-white"
                            )}
                          >
                            {child.industryName}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Giai đoạn ưu tiên */}
        <div className="md:col-span-2 space-y-3">
          <Label icon={Layers}>Giai đoạn ưu tiên</Label>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
            {STAGE_OPTIONS.map(opt => {
              const isSelected = (data.preferredStages || []).includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleList("preferredStages", opt)}
                  className={cn(
                    "py-2.5 rounded-xl text-[12px] font-bold border transition-all active:scale-95 text-center",
                    isSelected
                      ? "bg-[#0f172a] border-[#0f172a] text-white shadow-sm"
                      : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-8 border-t border-slate-100 mt-6">
        <button
          onClick={onBack}
          className="h-11 px-6 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl flex items-center justify-center gap-2 text-[13px] font-semibold hover:bg-slate-100 transition-all active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>

        <button
          onClick={onNext}
          className="h-11 px-8 bg-[#0f172a] text-white rounded-xl text-[13px] font-bold flex items-center gap-2 hover:bg-[#1e293b] transition-all shadow-sm active:scale-[0.98] group"
        >
          Xác nhận hồ sơ
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

    </div>
  );
}
