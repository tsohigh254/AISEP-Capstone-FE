"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { StartupShell } from "@/components/startup/startup-shell";
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Users, 
  ArrowLeft,
  FileText,
  MessageSquare,
  Calendar,
  ChevronRight,
  Loader2,
  Send
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getMockKycStatus, StartupKycCase } from "@/services/startup/startup-kyc.mock";

const STATUS_CFG: any = {
  UNDER_REVIEW: {
    icon: Clock,
    color: "blue",
    title: "Đang chờ phê duyệt",
    subtitle: "Hồ sơ của bạn đang được đội ngũ AISEP thẩm định. Quá trình này thường mất từ 24-48 giờ làm việc.",
    badge: "Under Review"
  },
  APPROVED: {
    icon: CheckCircle2,
    color: "emerald",
    title: "Xác minh thành công",
    subtitle: "Chúc mừng! Startup của bạn đã được xác minh chính thức trên nền tảng AISEP.",
    badge: "Approved"
  },
  PENDING_MORE_INFO: {
    icon: AlertCircle,
    color: "amber",
    title: "Cần bổ sung thông tin",
    subtitle: "AISEP đã xem xét và cần bạn cung cấp thêm một số tài liệu minh chứng để hoàn tất quy trình.",
    badge: "Pending Info"
  },
  FAILED: {
    icon: AlertCircle,
    color: "red",
    title: "Xác minh không đạt",
    subtitle: "Hồ sơ của bạn không đủ điều kiện xác minh tại thời điểm này. Vui lòng kiểm tra lý do bên dưới.",
    badge: "Failed"
  }
};

const getAvatarColor = (color: string) => {
  switch (color) {
    case "blue": return "bg-blue-50 text-blue-500 border-blue-100";
    case "emerald": return "bg-emerald-50 text-emerald-500 border-emerald-100";
    case "amber": return "bg-amber-50 text-amber-500 border-amber-100";
    case "red": return "bg-red-50 text-red-500 border-red-100";
    default: return "bg-slate-50 text-slate-500 border-slate-100";
  }
};

function KycStatusPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const state = searchParams.get("state") || "UNDER_REVIEW";
  
  const [kycCase, setKycCase] = useState<StartupKycCase | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMockKycStatus(state as any).then(res => {
      setKycCase(res);
      setLoading(false);
    });
  }, [state]);

  if (loading) {
    return (
      <StartupShell>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      </StartupShell>
    );
  }

  if (!kycCase) return null;
  const cfg = STATUS_CFG[kycCase.workflowStatus] || STATUS_CFG.UNDER_REVIEW;

  return (
    <StartupShell>
      <div className="max-w-[1000px] mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
        
        {/* Page Header Pattern */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-6">
           <Link 
            href="/startup/verification" 
            className="group flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors"
           >
              <div className="size-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all">
                 <ArrowLeft className="w-4 h-4" />
              </div>
              <span className="text-[13px] font-bold">Quay lại Dashboard</span>
           </Link>
           <div className="flex items-center gap-2">
              <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider", 
                cfg.color === "blue" ? "bg-blue-50 text-blue-700 border-blue-200/80" : 
                cfg.color === "emerald" ? "bg-emerald-50 text-emerald-700 border-emerald-200/80" : 
                cfg.color === "amber" ? "bg-amber-50 text-amber-700 border-amber-200/80" : 
                "bg-red-50 text-red-700 border-red-200/80"
              )}>
                 <div className={cn("size-1.5 rounded-full animate-pulse", 
                   cfg.color === "blue" ? "bg-blue-500" : cfg.color === "emerald" ? "bg-emerald-500" : cfg.color === "amber" ? "bg-amber-500" : "bg-red-500"
                 )} />
                 {cfg.badge}
              </span>
           </div>
        </div>

        {/* 2-Column Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Main Content (Left) */}
           <div className="lg:col-span-2 space-y-6">
              
              {/* Status Hero Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                 <div className="p-8 space-y-6">
                    <div className={cn("size-16 rounded-2xl flex items-center justify-center border", getAvatarColor(cfg.color))}>
                       <cfg.icon className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                       <h2 className="text-[24px] font-bold text-slate-900 tracking-tight">{cfg.title}</h2>
                       <p className="text-[15px] text-slate-500 leading-relaxed max-w-lg">{cfg.subtitle}</p>
                    </div>

                    {kycCase.workflowStatus === "PENDING_MORE_INFO" && (
                       <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5 space-y-4">
                          <div className="flex items-center gap-2 text-amber-700">
                             <MessageSquare className="w-5 h-5" />
                             <span className="text-[14px] font-bold">Phản hồi từ AISEP Staff:</span>
                          </div>
                          <p className="text-[13px] text-slate-600 leading-relaxed">"{kycCase.explanation}"</p>
                          <Link 
                           href="/startup/verification/resubmit"
                           className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-all"
                          >
                             <Send className="w-4 h-4" />
                             Cập nhật hồ sơ & Gửi lại
                          </Link>
                       </div>
                    )}
                 </div>
              </div>

              {/* Submission Summary Section */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-8 space-y-6">
                 <h3 className="text-[16px] font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-400" />
                    Tóm tắt hồ sơ đã nộp
                 </h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                    <div className="space-y-1">
                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tên đơn vị</p>
                       <p className="text-[14px] font-medium text-slate-700">{kycCase.submissionSummary?.legalFullName || kycCase.submissionSummary?.projectName || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Loại hình</p>
                       <p className="text-[14px] font-medium text-slate-700">{kycCase.startupVerificationType === "WITH_LEGAL_ENTITY" ? "Có pháp nhân" : "Chưa có pháp nhân"}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Email liên hệ</p>
                       <p className="text-[14px] font-medium text-slate-700">{kycCase.submissionSummary?.workEmail || "N/A"}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Người đại diện</p>
                       <p className="text-[14px] font-medium text-slate-700">{kycCase.submissionSummary?.representativeFullName || "N/A"}</p>
                    </div>
                 </div>

                 <div className="pt-4 border-t border-slate-50">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Tài liệu đã đính kèm</p>
                    <div className="flex flex-wrap gap-2">
                       {kycCase.submissionSummary?.evidenceFiles.map(file => (
                         <div key={file.id} className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-100 rounded-lg group hover:border-slate-300 transition-colors cursor-pointer">
                            <FileText className="w-4 h-4 text-slate-400" />
                            <span className="text-[12px] text-slate-600 font-medium">{file.fileName}</span>
                         </div>
                       )) || <p className="text-[12px] text-slate-400 italic">Hiện đang giả lập dữ liệu trống...</p>}
                    </div>
                 </div>
              </div>
           </div>

           {/* Sidebar (Right) */}
           <div className="space-y-6">
              <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg space-y-4">
                 <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-[#eec54e]" />
                    <h4 className="text-[15px] font-bold">Lưu ý an toàn</h4>
                 </div>
                 <p className="text-[12px] text-slate-400 leading-relaxed">
                    AISEP cam kết bảo mật mọi thông tin định danh của bạn. Chỉ những chuyên gia và đối tác được cấp quyền mới có thể xem các tài liệu nhạy cảm.
                 </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-4">
                 <h4 className="text-[14px] font-bold text-slate-900">Tiến độ quy trình</h4>
                 <div className="space-y-4 pt-2">
                    {[
                      { label: "Gửi hồ sơ", done: true, date: "20/03/2024" },
                      { label: "Thẩm định sơ bộ", done: true, date: "21/03/2024" },
                      { label: "Kiểm duyệt cuối", done: false, date: "Dự kiến 22/03" }
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-3 relative">
                         <div className={cn("size-5 rounded-full border-2 flex items-center justify-center shrink-0 z-10", step.done ? "bg-emerald-500 border-emerald-500" : "bg-white border-slate-200")}>
                            {step.done && <CheckCircle2 className="w-3 h-3 text-white" />}
                         </div>
                         {i < 2 && <div className={cn("absolute left-[9px] top-5 w-[2px] h-6 bg-slate-100", step.done && "bg-emerald-100")} />}
                         <div>
                            <p className={cn("text-[13px] font-bold leading-none", step.done ? "text-slate-900" : "text-slate-400")}>{step.label}</p>
                            <p className="text-[11px] text-slate-400 mt-1">{step.date}</p>
                         </div>
                      </div>
                    ))}
                 </div>
                 <button className="w-full mt-4 py-2 text-[12px] font-bold text-slate-500 hover:text-slate-900 transition-colors border-t border-slate-50 pt-4 flex items-center justify-center gap-2">
                    Liên hệ hỗ trợ 
                    <ChevronRight className="w-4 h-4" />
                 </button>
              </div>
           </div>
        </div>

      </div>
    </StartupShell>
  );
}

export default function KycStatusPage() {
  return (
    <Suspense>
      <KycStatusPageInner />
    </Suspense>
  );
}
