"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ShieldCheck, Info, ChevronRight, Save } from "lucide-react";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  step: number;
  totalSteps: number;
  onSaveDraft?: () => void;
  isSaving?: boolean;
}

export function OnboardingLayout({ 
  children, 
  step, 
  totalSteps, 
  onSaveDraft,
  isSaving 
}: OnboardingLayoutProps) {
  return (
    <div className="h-screen bg-slate-50 flex flex-col items-center animate-in fade-in duration-400 overflow-hidden selection:bg-[#eec54e]/30">
      <div className="w-full flex-1 overflow-y-auto no-scrollbar flex flex-col items-center py-10">
        <div className="w-full max-w-[900px] px-6 my-auto">
        
        {/* Main Form Area (Centered) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-8 md:p-10 relative overflow-hidden">
            {/* Step Background Decor */}
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none text-slate-200">
              <ShieldCheck className="w-64 h-64 -mr-20 -mt-20 rotate-12" />
            </div>

            {children}
          </div>

          {/* Bottom Actions (Centered below card) */}
          {onSaveDraft && (
            <div className="flex justify-center px-4">
              <button 
                onClick={onSaveDraft}
                disabled={isSaving}
                className="h-11 px-6 bg-white border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-[13px] font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm group active:scale-[0.98] disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform" />
                )}
                Lưu bản nháp hồ sơ
              </button>
            </div>
          )}
        </div>

        </div>
      </div>
    </div>
  );
}
