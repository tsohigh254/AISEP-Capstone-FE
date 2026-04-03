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
  Info,
  Sparkles,
  Rocket
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GetStartupKYCStatus } from "@/services/startup/startup.api";

interface StartupKYCStatus {
  workflowStatus: string;
  verificationLabel: string;
  explanation: string;
  lastUpdated: string;
  remarks?: string;
  flaggedFields?: string[];
  submissionSummary?: {
    companyName: string;
    submittedAt: string;
    version: number;
  };
}

export default function KycDashboardPage() {
  const [kycStatus, setKycStatus] = useState<StartupKYCStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async (silent = false) => {
    if (!silent) setLoading(true);
    GetStartupKYCStatus()
      .then((res: any) => {
        const data = res as unknown as IBackendRes<StartupKYCStatus>;
        if ((data.success || data.isSuccess) && data.data) {
          setKycStatus(data.data);
        } else {
          setKycStatus({ workflowStatus: "NOT_STARTED" } as StartupKYCStatus);
        }
      })
      .catch((err: any) => {
        const status = err?.response?.status;
        if (status === 404) {
          setKycStatus({ workflowStatus: "NOT_STARTED" } as StartupKYCStatus);
        } else {
          setKycStatus({ workflowStatus: "NOT_STARTED" } as StartupKYCStatus);
        }
      })
      .finally(() => {
        if (!silent) setLoading(false);
      });
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // Polling when status is pending
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const isPending = kycStatus?.workflowStatus === "PENDING_REVIEW" || kycStatus?.workflowStatus === "PENDING_MORE_INFO";

    if (isPending) {
      interval = setInterval(() => {
        fetchStatus(true);
      }, 10000); // Poll every 10 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [kycStatus?.workflowStatus]);

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

  const status = kycStatus?.workflowStatus || "NOT_STARTED";
  const isVerified = status === "VERIFIED";
  const isPending = status === "PENDING_REVIEW";
  const isFailed = status === "VERIFICATION_FAILED";
  const isNotStarted = status === "NOT_STARTED";

  return (
    <StartupShell>
      <div className="max-w-[1000px] mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
        
        {/* Page Header */}
        <div className="space-y-2 text-center md:text-left">
           <h1 className="text-[32px] md:text-[38px] font-black text-slate-900 tracking-tight">
             Thẩm định Startup
           </h1>
           <p className="text-[15px] text-slate-500 max-w-2xl leading-relaxed">
             Tăng cường uy tín và mở khóa các cơ hội kết nối chuyên sâu với Nhà đầu tư thông qua hệ thống định danh AISEP.
           </p>
        </div>

        {/* Current Status Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex items-start gap-6">
                <div className={cn(
                  "size-16 md:size-20 rounded-2xl flex items-center justify-center border shrink-0 transition-transform hover:scale-105",
                  isVerified ? "bg-emerald-50 border-emerald-100 text-emerald-500" :
                  isPending ? "bg-blue-50 border-blue-100 text-blue-500" :
                  isFailed ? "bg-red-50 border-red-100 text-red-500" :
                  "bg-slate-50 border-slate-100 text-slate-400"
                )}>
                  {isVerified ? <ShieldCheck className="w-8 h-8 md:w-10 md:h-10" /> :
                   isPending ? <Clock className="w-8 h-8 md:w-10 md:h-10 animate-pulse" /> :
                   isFailed ? <AlertCircle className="w-8 h-8 md:w-10 md:h-10" /> :
                   <Building2 className="w-8 h-8 md:w-10 md:h-10" />}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-widest border",
                      isVerified ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      isPending ? "bg-blue-50 text-blue-700 border-blue-200" :
                      isFailed ? "bg-red-50 text-red-700 border-red-200" :
                      "bg-slate-50 text-slate-500 border-slate-200"
                    )}>
                      {isVerified ? "Đã xác minh" :
                       isPending ? "Đang chờ duyệt" :
                       isFailed ? "Cần cập nhật" :
                       "Chưa bắt đầu"}
                    </span>
                    {kycStatus?.verificationLabel && (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest">
                        {kycStatus.verificationLabel}
                      </span>
                    )}
                  </div>
                  <h2 className="text-[20px] md:text-[24px] font-black text-slate-900 leading-tight">
                    {isVerified ? "Startup của bạn đã được đối tác tin cậy" :
                     isPending ? "Hồ sơ của bạn đang được thẩm định" :
                     isFailed ? "Yêu cầu bổ sung thông tin" :
                     "Bắt đầu quy trình xác thực Startup"}
                  </h2>
                  <p className="text-[14px] text-slate-500 leading-relaxed max-w-xl">
                    {kycStatus?.explanation || "Hoàn thiện hồ sơ pháp lý và năng lực cốt lõi để nhận được huy hiệu Verified từ AISEP."}
                  </p>
                  
                  {isFailed && kycStatus?.remarks && (
                    <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100 flex gap-3">
                      <Info className="w-5 h-5 text-red-500 shrink-0" />
                      <div>
                        <p className="text-[13px] font-bold text-red-900">Ghi chú từ Staff:</p>
                        <p className="text-[13px] text-red-700">{kycStatus.remarks}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="shrink-0 flex flex-col gap-3">
                {isNotStarted || isFailed ? (
                  <Link
                    href="/startup/verification/submit"
                    className="inline-flex items-center justify-center px-8 py-4 bg-[#eec54e] hover:bg-[#d4ba42] text-[#0f172a] font-black rounded-xl transition-all shadow-lg shadow-[#eec54e]/20 group active:scale-95"
                  >
                    {isFailed ? "Cập nhật hồ sơ" : "Bắt đầu ngay"}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ) : (
                  <Link
                    href="/startup/verification/submit"
                    className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-slate-900 text-slate-900 font-black rounded-xl hover:bg-slate-50 transition-all active:scale-95"
                  >
                    Xem hồ sơ đã nộp
                  </Link>
                )}
                <p className="text-[11px] text-center text-slate-400 font-medium italic">
                  {kycStatus?.lastUpdated ? `Cập nhật lần cuối: ${new Date(kycStatus.lastUpdated).toLocaleDateString("vi-VN")}` : "Bảo mật & Tin cậy"}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50/50 border-t border-slate-100 p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex gap-4">
                <div className="size-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-100">
                  <ShieldCheck className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-slate-900">Độ tin cậy cao</h4>
                  <p className="text-[12px] text-slate-500">Tăng khả năng được tiếp cận bởi các quỹ đầu tư lớn.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="size-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-100">
                  <FileText className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-slate-900">Mở khóa quyền lợi</h4>
                  <p className="text-[12px] text-slate-500">Ưu tiên hiển thị trên bảng tin công ty tiềm năng.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="size-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-100">
                  <Sparkles className="w-5 h-5 text-[#eec54e]" />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-slate-900">Huy hiệu Verified</h4>
                  <p className="text-[12px] text-slate-500">Đánh dấu startup chính danh trên nền tảng AISEP.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Info */}
        <div className="bg-slate-900 rounded-3xl p-10 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Rocket className="w-40 h-40" />
          </div>
          <div className="relative z-10 space-y-6 max-w-xl">
             <h3 className="text-[24px] font-black leading-tight">Tại sao cần xác thực danh tính Startup?</h3>
             <div className="space-y-4">
                <div className="flex gap-3">
                   <div className="size-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                   </div>
                   <p className="text-[15px] text-slate-300 font-medium">Bảo vệ ý tưởng và thông tin nhạy cảm khỏi rò rỉ.</p>
                </div>
                <div className="flex gap-3">
                   <div className="size-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                   </div>
                   <p className="text-[15px] text-slate-300 font-medium">Xây dựng uy tín ngay từ ngày đầu với cố vấn và chuyên gia.</p>
                </div>
                <div className="flex gap-3">
                   <div className="size-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                   </div>
                   <p className="text-[15px] text-slate-300 font-medium">Tham gia vào mạng lưới kết nối độc quyền với các quỹ đầu tư mạo hiểm (VC).</p>
                </div>
             </div>
          </div>
        </div>

      </div>
    </StartupShell>
  );
}
