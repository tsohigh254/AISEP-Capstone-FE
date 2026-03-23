"use client";

import { FileText, Link as LinkIcon, ArrowRight, ArrowLeft, CheckCircle2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { KycFileUploader } from "@/components/startup/kyc-file-uploader";

const labelCls = "block text-[13px] font-semibold text-slate-700 mb-1.5";
const inputCls = "w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-[13px] text-slate-700 placeholder:text-slate-300 outline-none transition-all bg-white focus:border-[#eec54e] focus:ring-2 focus:ring-[#eec54e]/20 shadow-sm";

interface Step3Props {
  data: any;
  update: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function Step3({ data, update, onNext, onPrev }: Step3Props) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-2">
         <h2 className="text-[28px] font-bold text-slate-900 tracking-tight leading-tight">Minh chứng năng lực</h2>
         <p className="text-[14px] text-slate-500 leading-relaxed">Hồ sơ đầy đủ giúp tăng 80% tỷ lệ phản hồi từ Nhà đầu tư và Cố vấn.</p>
      </div>

      <div className="space-y-6">
        {/* Pitch Deck Upload */}
        <div className="space-y-3">
           <label className={labelCls}>Tài liệu Pitch Deck / Profile</label>
           <KycFileUploader 
             label=""
             description="Tải lên tài liệu giới thiệu dự án (.pdf, .pptx)"
             limit={1}
             onChange={(files) => update({ ...data, pitchDeck: files[0] || null })}
           />
        </div>

        <div className="h-px bg-slate-100 my-2" />

        {/* Links */}
        <div className="space-y-4">
           <div className="space-y-1.5">
              <label className={labelCls}>Website / Landing Page</label>
              <div className="relative group">
                 <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#eec54e] transition-colors" />
                 <input 
                  className={inputCls}
                  value={data.websiteUrl}
                  onChange={e => update({ ...data, websiteUrl: e.target.value })}
                  placeholder="https://mysite.com"
                 />
              </div>
           </div>

           <div className="space-y-1.5">
              <label className={labelCls}>Sản phẩm / Demo (GitHub, Figma...)</label>
              <div className="relative group">
                 <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#eec54e] transition-colors" />
                 <input 
                  className={inputCls}
                  value={data.productLink}
                  onChange={e => update({ ...data, productLink: e.target.value })}
                  placeholder="Vd: app.mysite.com hoặc repo github"
                 />
              </div>
           </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-slate-50">
         <button 
          onClick={onPrev}
          className="text-[13px] text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1.5"
         >
            ← Quay lại
         </button>
         <button 
          onClick={onNext}
          className="px-8 h-12 rounded-xl font-bold text-[13px] bg-[#0f172a] text-white hover:bg-[#1e293b] transition-all flex items-center justify-center gap-2 group shadow-sm active:scale-95"
         >
            Tiếp tục
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
         </button>
      </div>
    </div>
  );
}
