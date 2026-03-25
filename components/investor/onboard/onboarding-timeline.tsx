"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface TimelineStep {
  n: number;
  label: string;
}

interface OnboardingTimelineProps {
  currentStep: number;
  steps: TimelineStep[];
}

export function OnboardingTimeline({ currentStep, steps }: OnboardingTimelineProps) {
  return (
    <div className="w-full mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
      {/* Step indicators */}
      <div className="flex items-center gap-4 max-w-[640px] mx-auto">
        {steps.map(({ n, label }) => (
          <div key={n} className="flex items-center gap-3 flex-1 last:flex-none">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 transition-all duration-500 shadow-sm border",
                currentStep > n 
                  ? "bg-emerald-500 text-white border-emerald-400" 
                  : currentStep === n 
                    ? "bg-[#0f172a] text-white border-[#0f172a]" 
                    : "bg-white text-slate-400 border-slate-200"
              )}>
                {currentStep > n ? <Check className="w-4 h-4 stroke-[3]" /> : n}
              </div>
              <div className="flex flex-col">
                <span className={cn(
                  "text-[11px] font-bold uppercase tracking-[0.1em] leading-none mb-1",
                  currentStep === n ? "text-slate-900" : "text-slate-400"
                )}>
                  Bước {n}
                </span>
                <span className={cn(
                  "text-[13px] font-semibold whitespace-nowrap",
                  currentStep === n ? "text-slate-800" : currentStep > n ? "text-emerald-600" : "text-slate-300"
                )}>
                  {label}
                </span>
              </div>
            </div>
            
            {n < steps.length && (
              <div className="flex-1 min-w-[20px] px-2">
                <div className={cn(
                  "h-[2px] w-full rounded-full transition-all duration-700", 
                  currentStep > n ? "bg-emerald-500" : "bg-slate-100"
                )} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
