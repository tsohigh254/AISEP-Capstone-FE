"use client";

import { Building2, Layers, Briefcase, ArrowRight, Globe, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const labelCls = "block text-[13px] font-semibold text-slate-700 mb-1.5";
const inputCls = "w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-[13px] text-slate-700 placeholder:text-slate-300 outline-none transition-all bg-white focus:border-[#eec54e] focus:ring-2 focus:ring-[#eec54e]/20 shadow-sm";

interface Step1Props {
  data: any;
  update: (data: any) => void;
  onNext: () => void;
  onSkip?: () => void;
}

export function Step1({ data, update, onNext, onSkip }: Step1Props) {
  const isFormValid = data.startupName && data.industry && data.stage;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
         <h2 className="text-[28px] font-bold text-slate-900 tracking-tight leading-tight">Thương hiệu & Định danh</h2>
         <p className="text-[14px] text-slate-500 leading-relaxed">Chúng tôi cần những thông tin cơ bản này để cá nhân hóa lộ trình tăng trưởng của bạn.</p>
      </div>

      <div className="space-y-6">
        {/* Startup Name */}
        <div className="space-y-1.5">
           <label className={labelCls}>Tên Startup / Doanh nghiệp <span className="text-red-400">*</span></label>
           <div className="relative group">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#eec54e] transition-colors" />
              <input 
                className={inputCls} 
                value={data.startupName}
                onChange={e => update({ ...data, startupName: e.target.value })}
                placeholder="Vd: AISEP Việt Nam, GreenTech Global..." 
              />
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {/* Industry */}
           <div className="space-y-1.5">
              <label className={labelCls}>Lĩnh vực hoạt động <span className="text-red-400">*</span></label>
              <div className="relative group">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#eec54e] transition-colors z-10" />
                <select 
                  className={cn(inputCls, "appearance-none cursor-pointer")}
                  value={data.industry}
                  onChange={e => update({ ...data, industry: e.target.value })}
                >
                  <option value="" disabled>Chọn lĩnh vực</option>
                  <option value="Fintech">Fintech</option>
                  <option value="Edtech">Edtech</option>
                  <option value="Healthtech">Healthtech</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="AI / Machine Learning">AI / Machine Learning</option>
                  <option value="Agitech">Agitech</option>
                  <option value="SaaS">SaaS</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
           </div>

           {/* Stage */}
           <div className="space-y-1.5">
              <label className={labelCls}>Giai đoạn phát triển <span className="text-red-400">*</span></label>
              <div className="relative group">
                <TrendingUp className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#eec54e] transition-colors z-10" />
                <select 
                  className={cn(inputCls, "appearance-none cursor-pointer")}
                  value={data.stage}
                  onChange={e => update({ ...data, stage: e.target.value })}
                >
                  <option value="" disabled>Chọn giai đoạn</option>
                  <option value="Idea">Ý tưởng (Idea)</option>
                  <option value="MVP">Sản phẩm thử nghiệm (MVP)</option>
                  <option value="Pre-seed">Tiền hạt giống (Pre-seed)</option>
                  <option value="Seed">Hạt giống (Seed)</option>
                  <option value="Series A+">Series A trở lên</option>
                </select>
              </div>
           </div>
        </div>

        {/* Legal Type Toggle */}
        <div className="space-y-3">
           <label className={labelCls}>Mô hình vận hành</label>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { id: "WITH_LEGAL_ENTITY", label: "Có pháp nhân", desc: "Doanh nghiệp đã ĐKKD" },
                { id: "WITHOUT_LEGAL_ENTITY", label: "Chưa có pháp nhân", desc: "Nhóm sáng lập / Freelance" }
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => update({ ...data, legalType: item.id })}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all",
                    data.legalType === item.id 
                      ? "border-[#eec54e] bg-[#fdf8e6] text-slate-800 ring-2 ring-[#eec54e]/10 shadow-sm" 
                      : "border-slate-100 hover:border-slate-200 bg-white"
                  )}
                >
                  <p className="text-[13px] font-bold text-slate-900">{item.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-6 border-t border-slate-50">
         {onSkip && (
           <button 
             onClick={onSkip}
             className="text-[13px] text-slate-400 hover:text-slate-600 font-medium transition-colors"
           >
              Bỏ qua lúc này
           </button>
         )}
         <button 
          onClick={onNext}
          disabled={!isFormValid}
          className={cn(
            "px-8 h-12 rounded-xl font-bold text-[13px] transition-all flex items-center justify-center gap-2 group shadow-sm",
            isFormValid 
              ? "bg-[#0f172a] text-white hover:bg-[#1e293b]" 
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          )}
         >
            Tiếp tục
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
         </button>
      </div>
    </div>
  );
}
