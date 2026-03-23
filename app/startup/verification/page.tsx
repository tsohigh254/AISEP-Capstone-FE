"use client";

import { useEffect, useState } from "react";
import { StartupShell } from "@/components/startup/startup-shell";
import { 
  ShieldCheck, 
  Building2, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  FileText,
  ChevronRight,
  Info
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getMockKycStatus, StartupKycCase } from "@/services/startup/startup-kyc.mock";

export default function KycDashboardPage() {
  const [kycCase, setKycCase] = useState<StartupKycCase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would check the true state
    getMockKycStatus("NOT_SUBMITTED").then(res => {
      setKycCase(res);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <StartupShell>
      <div className="max-w-[1000px] mx-auto space-y-6 pb-20 mt-8">
        <div className="space-y-4">
          <div className="h-10 w-48 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-4 w-96 bg-slate-100 rounded-lg animate-pulse" />
        </div>
        <div className="h-[240px] w-full bg-slate-100 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="h-24 bg-slate-50 rounded-2xl animate-pulse" />
          <div className="h-24 bg-slate-50 rounded-2xl animate-pulse" />
        </div>
      </div>
    </StartupShell>
  );

  const hasSubmitted = kycCase && kycCase.workflowStatus !== "NOT_SUBMITTED";

  return (
    <StartupShell>
      <div className="max-w-[1000px] mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
        
        {/* Page Header */}
        <div className="space-y-2">
           <h1 className="text-[32px] font-bold text-slate-900 tracking-tight">
             {hasSubmitted ? "Trạng thái xác minh" : "Yêu cầu xác minh Startup"}
           </h1>
           <p className="text-[15px] text-slate-500 max-w-2xl leading-relaxed">
             {hasSubmitted 
               ? "Theo dõi tiến độ thẩm định hồ sơ định danh của bạn." 
               : "AISEP yêu cầu xác thực danh tính để đảm bảo tính minh bạch và xây dựng lòng tin giữa Startup và các Cố vấn/Nhà đầu tư."}
           </p>
        </div>

        {!hasSubmitted ? (
          /* MERGED REQUIREMENTS VIEW */
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Path 1 */}
              <div className="bg-white rounded-2xl border border-slate-200 border-b-4 border-b-[#eec54e] p-8 space-y-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="size-14 rounded-2xl bg-[#eec54e]/10 flex items-center justify-center">
                    <Building2 className="w-7 h-7 text-[#eec54e]" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-[18px] font-bold text-slate-900">Có tư cách pháp nhân</h2>
                    <p className="text-[13px] text-slate-500 leading-relaxed">Dành cho các doanh nghiệp đã đăng ký kinh doanh chính thức.</p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tài liệu cần có:</p>
                    <ul className="space-y-2">
                        {["Giấy phép ĐKKD chính thức", "Mã số thuế doanh nghiệp", "Email công ty chính danh"].map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-[13px] text-slate-600">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            {item}
                          </li>
                        ))}
                    </ul>
                  </div>
              </div>

              {/* Path 2 */}
              <div className="bg-white rounded-2xl border border-slate-200 border-b-4 border-b-slate-900 p-8 space-y-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="size-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <Users className="w-7 h-7 text-slate-600" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-[18px] font-bold text-slate-900">Chưa có pháp nhân</h2>
                    <p className="text-[13px] text-slate-500 leading-relaxed">Dành cho nhóm sáng lập, dự án đang phát triển hoặc chưa ĐKKD.</p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tài liệu cần có:</p>
                    <ul className="space-y-2">
                        {["Pitch deck / One-pager dự án", "Link sản phẩm / Demo / GitHub", "Minh chứng hoạt động thực tế"].map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-[13px] text-slate-600">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            {item}
                          </li>
                        ))}
                    </ul>
                  </div>
              </div>
            </div>

            <div className="bg-[#0f172a] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-white shadow-xl shadow-slate-200">
              <div className="space-y-2">
                  <h3 className="text-[18px] font-bold">Bắt đầu xác thực ngay hôm nay</h3>
                  <p className="text-[13px] text-slate-400">Quá trình thẩm định thường mất từ 24h - 48h làm việc.</p>
              </div>
              <Link 
                href="/startup/verification/submit"
                className="px-10 py-4 bg-[#eec54e] hover:bg-[#d4ba42] text-[#0f172a] font-bold rounded-xl transition-all flex items-center gap-2 group whitespace-nowrap shadow-lg hover:translate-y-[-2px]"
              >
                  Tiến hành nộp hồ sơ
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ) : (
          /* Current Status Dashboard */
          <div className="space-y-6">
             <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div className="flex items-center gap-5">
                      <div className="size-16 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
                         <Clock className="w-8 h-8 text-blue-500" />
                      </div>
                      <div>
                         <div className="flex items-center gap-2 mb-1">
                            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Đang thẩm định</span>
                            <span className="text-[12px] text-slate-400">Mã hồ sơ: {kycCase.id}</span>
                         </div>
                         <h3 className="text-[18px] font-bold text-slate-900">Hồ sơ Startup đang được AISEP xem xét</h3>
                         <p className="text-[13px] text-slate-500">Dự kiến có kết quả trước 18:00 ngày mai.</p>
                      </div>
                   </div>
                   <Link 
                    href="/startup/verification/status"
                    className="px-6 py-3 bg-[#0f172a] text-white font-bold rounded-xl hover:bg-[#1e293b] transition-all shadow-sm flex items-center justify-center gap-2"
                   >
                      Xem chi tiết kết quả
                      <ChevronRight className="w-4 h-4" />
                   </Link>
                </div>
             </div>

             {/* Helpful Tips (Only for submitted state) */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-start gap-4 hover:bg-white hover:border-[#eec54e]/30 transition-all cursor-pointer group">
                   <div className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:border-[#eec54e]/50 transition-colors">
                      <Building2 className="w-5 h-5 text-slate-400 group-hover:text-[#eec54e]" />
                   </div>
                   <div>
                      <h4 className="text-[14px] font-bold text-slate-900">Hồ sơ Pháp nhân</h4>
                      <p className="text-[12px] text-slate-500 leading-relaxed mt-0.5">Mẹo: GPKD bản quét màu sẽ được phê duyệt nhanh hơn 30% so với ảnh chụp.</p>
                   </div>
                </div>
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-start gap-4 hover:bg-white hover:border-[#eec54e]/30 transition-all cursor-pointer group">
                   <div className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:border-[#eec54e]/50 transition-colors">
                      <Users className="w-5 h-5 text-slate-400 group-hover:text-[#eec54e]" />
                   </div>
                   <div>
                      <h4 className="text-[14px] font-bold text-slate-900">Hồ sơ Đội ngũ</h4>
                      <p className="text-[12px] text-slate-500 leading-relaxed mt-0.5">Xác thực Founding Team thông qua bằng chứng thực tế (GitHub, LinkedIn).</p>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* Labels info (Persistent Footer) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-8">
           <div className="flex items-center gap-2 mb-6">
              <Info className="w-4 h-4 text-slate-400" />
              <h3 className="text-[14px] font-bold text-slate-900">Lợi ích sau khi xác thực</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "VERIFIED COMPANY", color: "blue", desc: "Tăng 100% độ tin cậy với Nhà đầu tư" },
                { label: "VERIFIED FOUNDING TEAM", color: "violet", desc: "Tăng 80% tỷ lệ phản hồi từ Cố vấn" },
                { label: "BASIC VERIFIED", color: "emerald", desc: "Mở khóa các tính năng Workspace cơ bản" }
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                   <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold border whitespace-nowrap", 
                    item.color === "blue" ? "bg-blue-50 text-blue-700 border-blue-200/80" : 
                    item.color === "violet" ? "bg-violet-50 text-violet-700 border-violet-200/80" : 
                    "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                   )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", 
                        item.color === "blue" ? "bg-blue-400" : 
                        item.color === "violet" ? "bg-violet-400" : 
                        "bg-emerald-400"
                      )} />
                      {item.label}
                   </span>
                   <p className="text-[12px] text-slate-500 leading-snug">{item.desc}</p>
                </div>
              ))}
           </div>
        </div>

      </div>
    </StartupShell>
  );
}
