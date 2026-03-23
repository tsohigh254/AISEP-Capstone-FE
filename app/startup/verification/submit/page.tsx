"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { StartupShell } from "@/components/startup/startup-shell";
import { KycSubmitForm } from "@/components/startup/kyc-submit-form";

export default function KycSubmitPage() {
  return (
    <StartupShell>
      <div className="max-w-[1000px] mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
        
        <Link 
          href="/startup/verification" 
          className="inline-flex items-center gap-2 text-[12px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Quay lại tổng quan
        </Link>

        <div className="space-y-1">
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Xác minh danh tính Startup</h1>
          <p className="text-[14px] text-slate-500">Cung cấp thông tin cơ bản để xây dựng mức độ tin cậy ban đầu trên nền tảng AISEP.</p>
        </div>

        <KycSubmitForm />
      </div>
    </StartupShell>
  );
}
