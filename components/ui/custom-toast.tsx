"use client";

import { CheckCircle2, X, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface CustomToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  type?: "success" | "error" | "info";
}

export function CustomToast({ message, isVisible, onClose, type = "success" }: CustomToastProps) {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible && !shouldRender) return null;

  return (
    <div 
      className={cn(
        "fixed top-8 right-8 z-[100] transition-all duration-500 transform",
        isVisible ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0 pointer-events-none"
      )}
      onTransitionEnd={() => {
        if (!isVisible) setShouldRender(false);
      }}
    >
      <div className={cn(
        "px-6 py-4 rounded-[24px] shadow-2xl shadow-black/10 border flex items-center gap-4 bg-white dark:bg-slate-900 min-w-[320px]",
        type === "success" ? "border-emerald-100 dark:border-emerald-900/30" : 
        type === "error" ? "border-red-100 dark:border-red-900/30" :
        "border-slate-100 dark:border-slate-800"
      )}>
        <div className={cn(
          "size-10 rounded-xl flex items-center justify-center shrink-0",
          type === "success" ? "bg-emerald-50 dark:bg-emerald-500/10" : 
          type === "error" ? "bg-red-50 dark:bg-red-500/10" :
          "bg-slate-50 dark:bg-slate-800"
        )}>
          {type === "success" && <CheckCircle2 className="size-6 text-emerald-500" />}
          {type === "error" && <AlertCircle className="size-6 text-red-500" />}
        </div>
        
        <div className="flex-1">
          <p className="text-[14px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Thông báo</p>
          <p className="text-[13px] text-slate-500 font-medium">{message}</p>
        </div>

        <button 
          onClick={onClose}
          className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
