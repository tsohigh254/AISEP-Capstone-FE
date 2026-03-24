"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface StepperProps {
  currentStep: number;
  steps: { id: number; label: string; sub: string }[];
}

export function OnboardingStepper({ currentStep, steps }: StepperProps) {
  return (
    <div className="flex items-center gap-4 mb-10 w-full animate-in fade-in duration-500">
      {steps.map((s, idx) => (
        <React.Fragment key={s.id}>
          <div className="flex flex-col items-center gap-2.5 group flex-1 max-w-[120px]">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold transition-all shadow-sm",
              currentStep === s.id ? "bg-[#0f172a] text-white shadow-[#eec54e]/20 ring-[3px] ring-[#eec54e]/20 border border-[#eec54e]" : 
              currentStep > s.id ? "bg-[#0f172a] text-[#eec54e] border border-[#eec54e]/30" : "bg-white text-slate-300 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            )}>
              {currentStep > s.id ? <Check className="w-4 h-4" /> : s.id}
            </div>
            <div className="text-center">
              <p className={cn(
                "text-[11px] font-semibold uppercase tracking-wide whitespace-nowrap",
                currentStep >= s.id ? "text-slate-900" : "text-slate-400"
              )}>{s.label}</p>
            </div>
          </div>
          {idx < steps.length - 1 && (
            <div className={cn(
              "flex-1 h-[2px] mb-6 rounded-full transition-colors duration-700",
              currentStep > s.id ? "bg-[#eec54e]/60" : "bg-slate-100"
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
