"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { 
  ArrowLeft, ArrowRight, Building2, MapPin, 
  Globe, Zap, LayoutGrid, Layers, Info,
  User, Camera, UserCircle, MessageSquare, Tag, Briefcase
} from "lucide-react";
import { IInvestorKYCSubmission } from "@/types/investor-kyc";

const INDUSTRY_OPTIONS = [
  "AI & Machine Learning", "Fintech", "Healthtech", "Edtech", 
  "Ecommerce", "SaaS", "Web3", "Greentech", "Logistics", "Consumer Tech"
];

const STAGE_OPTIONS = [
  "Idea / Concept", "MVP", "Seed", "Series A+", "Pre-IPO"
];

interface InvestorProfileStepProps {
  data: Partial<IInvestorKYCSubmission>;
  onChange: (data: Partial<IInvestorKYCSubmission>) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  errors: Record<string, string>;
}

export function InvestorProfileStep({ data, onChange, onNext, onBack, onSkip, errors }: InvestorProfileStepProps) {
  const set = (key: keyof IInvestorKYCSubmission, val: any) => onChange({ ...data, [key]: val });

  const toggleList = (key: keyof IInvestorKYCSubmission, val: string) => {
    const list = (data[key] as string[]) || [];
    if (list.includes(val)) set(key, list.filter(v => v !== val));
    else set(key, [...list, val]);
  };

  const isInstitutional = data.investorCategory === "INSTITUTIONAL";

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
        {/* Avatar/Logo - Optional */}
        <div className="md:col-span-2 flex items-center gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm group cursor-pointer relative overflow-hidden transition-all hover:border-[#eec54e]/50">
            <input 
              type="file" 
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
            <h4 className="text-[14px] font-bold text-slate-900 leading-none">Ảnh đại diện / Logo</h4>
            <p className="text-[13px] text-slate-500 leading-relaxed max-w-[340px] font-normal">
              {isInstitutional ? "Tải lên Logo chính thức của tổ chức để tăng nhận diện thương hiệu." : "Ảnh chân dung chuyên nghiệp giúp tăng 40% khả năng kết nối thành công."}
            </p>
          </div>
        </div>

        {/* Display Name */}
        <div className="space-y-1">
          <Label required icon={UserCircle}>{isInstitutional ? "Tên tổ chức" : "Tên hiển thị"}</Label>
          <input 
            value={data.displayName || ""}
            onChange={e => set("displayName", e.target.value)}
            placeholder={isInstitutional ? "Ví dụ: AISEP Ventures" : "Ví dụ: Nguyễn Văn A"}
            className={inputClass("displayName")}
          />
          {errors.displayName && <p className="text-red-500 text-[11px] font-medium mt-1.5 ml-1">{errors.displayName}</p>}
        </div>

        {/* Organization - Optional */}
        <div className="space-y-1">
          <Label icon={Building2}>Tổ chức / Công ty</Label>
          <input 
            value={data.organizationName || ""}
            onChange={e => set("organizationName", e.target.value)}
            placeholder="Nơi bạn đang công tác"
            className={inputClass("organizationName")}
          />
        </div>

        {/* Role / Title */}
        <div className="space-y-1">
          <Label required icon={Briefcase}>Chức vụ hiện tại</Label>
          <input 
            value={data.currentRoleTitle || ""}
            onChange={e => set("currentRoleTitle", e.target.value)}
            placeholder="Ví dụ: Managing Partner, Angel..."
            className={inputClass("currentRoleTitle")}
          />
          {errors.currentRoleTitle && <p className="text-red-500 text-[11px] font-medium mt-1.5 ml-1">{errors.currentRoleTitle}</p>}
        </div>

        {/* Location */}
        <div className="space-y-1">
          <Label required icon={MapPin}>Địa điểm hoạt động</Label>
          <input 
            value={data.location || ""}
            onChange={e => set("location", e.target.value)}
            placeholder="Ví dụ: Hà Nội, TP. Hồ Chí Minh..."
            className={inputClass("location")}
          />
          {errors.location && <p className="text-red-500 text-[11px] font-medium mt-1.5 ml-1">{errors.location}</p>}
        </div>

        {/* Main Link */}
        <div className="space-y-1">
          <Label required icon={Globe}>{isInstitutional ? "Website chính thức" : "LinkedIn / Profile link"}</Label>
          <input 
            value={data.mainLink || ""}
            onChange={e => set("mainLink", e.target.value)}
            placeholder="https://..."
            className={inputClass("mainLink")}
          />
          {errors.mainLink && <p className="text-red-500 text-[11px] font-medium mt-1.5 ml-1">{errors.mainLink}</p>}
        </div>

        {/* Connection Status */}
        <div className="space-y-1">
          <Label required icon={MessageSquare}>Trạng thái kết nối</Label>
          <select 
            value={data.acceptingConnectionsStatus || "OPEN"}
            onChange={e => set("acceptingConnectionsStatus", e.target.value as any)}
            className={inputClass("acceptingConnectionsStatus")}
          >
            <option value="OPEN">Đang mở (Open to connections)</option>
            <option value="SELECTIVE">Chọn lọc (Selectively open)</option>
            <option value="CLOSED">Tạm đóng (Not accepting now)</option>
          </select>
        </div>

        {/* Thesis - Optional */}
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

        {/* Industries */}
        <div className="md:col-span-2 space-y-4">
          <Label required icon={Tag}>Lĩnh vực quan tâm</Label>
          <div className="flex flex-wrap gap-2">
            {INDUSTRY_OPTIONS.map(opt => (
              <button 
                key={opt}
                type="button"
                onClick={() => toggleList("preferredIndustries", opt)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-[13px] font-bold border transition-all active:scale-95 shadow-sm",
                  (data.preferredIndustries || []).includes(opt)
                    ? "bg-[#eec54e] border-[#eec54e] text-slate-900 shadow-[#eec54e]/20"
                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
          {errors.preferredIndustries && <p className="text-red-500 text-[11px] font-medium mt-1 ml-1">{errors.preferredIndustries}</p>}
        </div>

        {/* Stages */}
        <div className="md:col-span-2 space-y-4">
          <Label required icon={Layers}>Giai đoạn ưu tiên</Label>
          <div className="flex flex-wrap gap-2">
            {STAGE_OPTIONS.map(opt => (
              <button 
                key={opt}
                type="button"
                onClick={() => toggleList("preferredStages", opt)}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-[13px] font-bold border transition-all active:scale-95 shadow-sm",
                  (data.preferredStages || []).includes(opt)
                    ? "bg-[#0f172a] border-[#0f172a] text-white"
                    : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
          {errors.preferredStages && <p className="text-red-500 text-[11px] font-medium mt-1 ml-1">{errors.preferredStages}</p>}
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
          onClick={onSkip}
          className="text-[13px] font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
        >
          Bỏ qua
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
