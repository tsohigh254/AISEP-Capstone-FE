"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft, Save, Send, Edit3, Trash2, Clock,
  FileText, CheckCircle2, AlertCircle, Paperclip,
  History, User, Activity, ChevronRight, Layout,
  MessageSquare, ShieldCheck, Download, Eye, Info, Target, Lightbulb, TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdvisorShell } from "@/components/advisor/advisor-shell";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getAdvisorReportById } from "@/services/advisor/advisor-report.api";
import { UpdateMentorshipReport } from "@/services/advisor/advisor.api";
import type { IConsultationReport, ConsultationReportStatus } from "@/types/advisor-report";

/* ─── Constants ──────────────────────────────────────────────── */

const STATUS_LABEL: Record<ConsultationReportStatus, string> = {
  Draft: "Bản nháp",
  Passed: "Đã hoàn tất",
  Failed: "Không đạt",
  NeedsMoreInfo: "Cần bổ sung",
  PendingReview: "Đang xét duyệt",
};

const STATUS_CFG: Record<ConsultationReportStatus, { dot: string; badge: string }> = {
  Draft: { dot: "bg-slate-400", badge: "bg-slate-50 text-slate-600 border-slate-200/80" },
  Passed: { dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80" },
  Failed: { dot: "bg-red-400", badge: "bg-red-50 text-red-600 border-red-200/80" },
  NeedsMoreInfo: { dot: "bg-blue-400", badge: "bg-blue-50 text-blue-600 border-blue-200/80" },
  PendingReview: { dot: "bg-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-200/80" },
};

/* ─── Components ─────────────────────────────────────────────── */

function InfoRow({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) {
  return (
    <div className="flex items-start gap-3">
      {Icon && <Icon className="w-4 h-4 text-slate-400 mt-0.5" />}
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-[13.5px] font-bold text-slate-700">{value}</p>
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children, accent = "blue" }: any) {
    const borderAccent = accent === "blue" ? "border-l-blue-500" : "border-l-emerald-500";
    const bgAccent = accent === "blue" ? "bg-blue-50/50" : "bg-emerald-50/50";
    const textAccent = accent === "blue" ? "text-blue-600" : "text-emerald-600";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className={cn("px-6 py-4 flex items-center gap-3 border-l-4", borderAccent, bgAccent)}>
        <Icon className={cn("w-4 h-4", textAccent)} />
        <h3 className={cn("text-[14px] font-bold uppercase tracking-wide", textAccent)}>{title}</h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

const AVATAR_COLORS = [
  "from-violet-500 to-violet-600", "from-blue-500 to-blue-600",
  "from-emerald-500 to-emerald-600", "from-rose-500 to-rose-600",
  "from-amber-500 to-amber-600", "from-cyan-500 to-cyan-600",
  "from-pink-500 to-pink-600", "from-indigo-500 to-indigo-600",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/* ─── Main Page ──────────────────────────────────────────────── */

export default function ReportDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [report, setReport] = useState<IConsultationReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);

  useEffect(() => {
    async function fetch() {
      const data = await getAdvisorReportById(id as string);
      setReport(data);
      setIsLoading(false);
    }
    fetch();
  }, [id]);

  const handleSubmit = async () => {
    if (!report) return;
    setIsSubmitting(true);
    try {
      await UpdateMentorshipReport(report.sessionId, report.id, { isDraft: false });
      toast.success("Đã gửơi báo cáo thành công! Startup sẽ thấy báo cáo ngay bây giờ.");
      // Auto-approve: report trở thành Passed ngay sau khi submit
      setReport(prev => prev ? { ...prev, reviewStatus: 'Passed' } : null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra khi nộp báo cáo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return (
    <AdvisorShell>
        <div className="max-w-[1100px] mx-auto p-20 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
    </AdvisorShell>
  );

  if (!report) return (
    <AdvisorShell>
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <AlertCircle className="w-10 h-10 mb-2 opacity-20" />
        <p className="text-[14px] font-semibold">Không tìm thấy báo cáo</p>
      </div>
    </AdvisorShell>
  );

  const cfg = STATUS_CFG[report.reviewStatus] ?? STATUS_CFG['Draft'];
  const avatarGradient = getAvatarColor(report.startup.displayName);

  return (
    <AdvisorShell>
      <div className="max-w-[1100px] mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
        
        {/* Top Nav */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center group-hover:bg-slate-50 transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-[13px] font-bold">Quay lại danh sách</span>
          </button>
          
          <div className="flex items-center gap-3">
            {report.reviewStatus === "Passed" && (
              <button className="px-4 py-2 rounded-xl bg-[#0f172a] text-white text-[13px] font-bold hover:bg-[#1e293b] transition-all shadow-sm flex items-center gap-2">
                <Download className="w-4 h-4" />
                Tải PDF
              </button>
            )}
            
            {report.reviewStatus === "Draft" && (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => router.push(`/advisor/reports/${report.sessionId}/edit`)}
                  className="px-5 py-2 rounded-xl border border-[#eec54e] bg-[#eec54e]/5 text-[#0f172a] text-[13px] font-bold hover:bg-[#eec54e] transition-all flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Chỉnh sửa
                </button>
                <button 
                  onClick={() => setIsSubmitDialogOpen(true)}
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-white text-[13px] font-bold hover:bg-emerald-600 transition-all shadow-[0_4px_12px_rgba(16,185,129,0.3)] flex items-center gap-2 hover:-translate-y-0.5"
                >
                  <Send className="w-4 h-4" />
                  Nộp báo cáo
                </button>
              </div>
            )}

            {report.reviewStatus === "NeedsMoreInfo" && (
              <button
                onClick={() => router.push(`/advisor/reports/${report.sessionId}/edit`)}
                className="px-5 py-2 rounded-xl border border-blue-300 bg-blue-50 text-blue-700 text-[13px] font-bold hover:bg-blue-100 transition-all flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Chỉnh sửa &amp; Nộp lại
              </button>
            )}

            {report.reviewStatus === "Failed" && (
              <button
                onClick={() => router.push(`/advisor/reports/create?sessionId=${report.sessionId}`)}
                className="px-5 py-2 rounded-xl bg-red-500 text-white text-[13px] font-bold hover:bg-red-600 transition-all shadow-[0_4px_12px_rgba(239,68,68,0.3)] flex items-center gap-2 hover:-translate-y-0.5"
              >
                <Send className="w-4 h-4" />
                Nộp báo cáo lại
              </button>
            )}
          </div>
        </div>

        {/* Page Header Card (White Pattern) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
          <div className="flex items-start gap-4">
            {report.startup.logoUrl ? (
              <img
                src={report.startup.logoUrl}
                alt={report.startup.displayName}
                className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-sm border border-slate-100"
              />
            ) : (
              <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-[18px] font-bold shrink-0 shadow-sm", avatarGradient)}>
                {report.startup.displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-[20px] font-bold text-slate-900 leading-tight">
                  {report.title}
                </h1>
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-semibold border",
                  cfg.badge
                )}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
                  {STATUS_LABEL[report.reviewStatus] ?? STATUS_LABEL['Draft']}
                </span>
              </div>
              <p className="text-[13px] text-slate-500 mt-1 font-medium italic line-clamp-1">
                {report.startup.displayName} &middot; Buổi tư vấn ngày {new Date(report.sessionDate).toLocaleDateString("vi-VN")}
              </p>
              <div className="flex items-center gap-4 mt-3 flex-wrap border-t border-slate-50 pt-3">
                <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Cập nhật lần cuối: <span className="text-slate-600">{formatDate(report.lastEditedAt)}</span>
                </span>
                <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  ID: <span className="font-mono text-slate-600">#{report.id}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-[0_1px_3px_rgba(0,0,0,0.04)] relative overflow-hidden">
                <div className="absolute top-0 right-0 py-6 px-10 opacity-5">
                    <History className="w-32 h-32 rotate-12" />
                </div>
                <div className="relative z-10">
                    <h2 className="text-[13px] font-bold text-[#eec54e] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Tóm tắt kết quả
                    </h2>
                    <p className="text-[15px] text-slate-700 leading-relaxed font-semibold mb-8">
                        {report.summary}
                    </p>

                    <div className="grid grid-cols-2 gap-8 py-6 border-t border-slate-100">
                        <InfoRow label="Startup" value={report.startup.displayName} icon={User} />
                        <InfoRow label="Ngày tư vấn" value={new Date(report.sessionDate).toLocaleDateString("vi-VN")} icon={Clock} />
                        <InfoRow label="Hình thức" value="Online Meet" icon={ShieldCheck} />
                        <InfoRow label="Phiên bản" value={`v${report.version}`} icon={History} />
                    </div>
                </div>
            </div>

            {/* Structured Content */}
            <SectionCard title="Nội dung tư vấn" icon={MessageSquare}>
                <div className="space-y-6">
                    <div>
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-500" />
                            Nội dung đã thảo luận
                        </h4>
                        <div className="text-[14px] text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100 font-medium">
                            {report.discussionOverview}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-500" />
                            Phát hiện chính (Key Findings)
                        </h4>
                        <div className="text-[14px] text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100 italic font-medium">
                            "{report.keyFindings}"
                        </div>
                    </div>
                    <div>
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            Rủi ro nhận diện
                        </h4>
                        <div className="text-[14px] text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100 font-medium">
                            {report.identifiedRisks || "Không cung cấp thông tin"}
                        </div>
                    </div>
                </div>
            </SectionCard>

            <SectionCard title="Khuyến nghị & Kết luận" icon={TrendingUp} accent="emerald">
                <div className="space-y-6">
                    <div>
                        <h4 className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-3">Khuyến nghị của Advisor</h4>
                        <div className="text-[14px] text-slate-800 leading-relaxed font-bold bg-emerald-50/20 p-5 rounded-2xl border border-emerald-100 shadow-sm">
                            {report.advisorRecommendations}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-3">Các bước tiếp theo (Next Steps)</h4>
                        <div className="text-[14px] text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100 font-medium">
                            {report.nextSteps || "Không có nội dung"}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/30 flex flex-col justify-center">
                            <h4 className="text-[12px] font-bold text-slate-400 uppercase mb-2">Sản phẩm bàn giao</h4>
                            <p className="text-[13px] text-slate-700 font-bold">{report.deliverablesSummary}</p>
                        </div>
                        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/30 flex flex-col justify-center">
                            <h4 className="text-[12px] font-bold text-slate-400 uppercase mb-2">Buổi theo dõi</h4>
                            <p className={cn(
                                "text-[13px] font-bold",
                                report.followUpRequired ? "text-emerald-600" : "text-slate-400"
                            )}>
                                {report.followUpRequired ? "Có yêu cầu • " + report.followUpNotes : "Không yêu cầu"}
                            </p>
                        </div>
                    </div>
                </div>
            </SectionCard>
          </div>

          {/* Side Column */}
          <div className="space-y-6">
            {/* Staff Feedback */}
          {(report.reviewStatus === "NeedsMoreInfo" || report.reviewStatus === "Failed") &&
            (report.staffRemarks || report.staffReviewNote) && (
            <div className={cn(
              "rounded-2xl border-2 px-6 py-5 animate-in duration-500",
              report.reviewStatus === "Failed"
                ? "border-red-300 bg-red-50/60"
                : "border-red-200 bg-red-50/40"
            )}>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-[13px] font-bold text-red-800 uppercase tracking-widest mb-1">
                    {report.reviewStatus === "Failed" ? "Báo cáo không đạt" : "Cần bổ sung nội dung"}
                  </h3>
                  <p className="text-[13px] text-red-700 leading-relaxed font-medium">
                    {report.staffRemarks || report.staffReviewNote}
                  </p>
                </div>
              </div>
            </div>
          )}

            {/* Startup Acknowledgement */}
            {report.reviewStatus === "Passed" && (
              <div className={cn(
                "rounded-2xl border px-5 py-4",
                report.startupAcknowledgedAt
                  ? "border-emerald-200 bg-emerald-50/50"
                  : "border-amber-200 bg-amber-50/40"
              )}>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className={cn("w-4 h-4 shrink-0 mt-0.5", report.startupAcknowledgedAt ? "text-emerald-500" : "text-amber-400")} />
                  <div>
                    <h3 className={cn("text-[12px] font-bold uppercase tracking-widest mb-1", report.startupAcknowledgedAt ? "text-emerald-700" : "text-amber-700")}>
                      {report.startupAcknowledgedAt ? "Startup đã xác nhận" : "Chờ Startup xác nhận"}
                    </h3>
                    <p className="text-[12px] font-medium text-slate-500">
                      {report.startupAcknowledgedAt
                        ? `Đã đọc và xác nhận lúc ${new Date(report.startupAcknowledgedAt).toLocaleString("vi-VN")}`
                        : "Startup có 24h để xác nhận, sau đó hệ thống tự động xác nhận."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Attachments */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[13px] font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-slate-400" />
                    Tài liệu gửi kèm
                </h3>
                <span className="text-[10px] font-black text-slate-400 px-2 py-0.5 bg-slate-100 rounded-full">{report.attachments.length}</span>
              </div>
              <div className="space-y-2">
                {report.attachments.map(att => (
                   <div key={att.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[12px] font-bold text-slate-700 truncate">{att.originalFileName}</p>
                            </div>
                        </div>
                        <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:text-blue-500 transition-colors">
                            <Download className="w-4 h-4" />
                        </a>
                   </div> 
                ))}
                {report.attachments.length === 0 && (
                    <p className="text-center py-6 text-[12px] text-slate-400 italic">Không có tệp đính kèm</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
          <div className="bg-emerald-500 text-white p-6 pb-8 border-b border-emerald-600/50">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Send className="w-6 h-6" />
              Xác nhận nộp báo cáo
            </DialogTitle>
          </div>
          <div className="bg-white px-6 pt-5 pb-8 -mt-4 rounded-t-3xl shadow-[0_-4px_15px_rgba(0,0,0,0.05)] relative z-10">
            <DialogDescription className="text-slate-600 leading-relaxed text-[14px]">
              Khi nộp báo cáo, hệ thống tự động duyệt và đánh dấu là <strong className="text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">Đã hoàn tất</strong>. Startup sẽ thấy báo cáo của bạn <strong>ngay lập tức</strong>.
              <br /><br />
              Bạn đã chắc chắn muốn gửi chưa?
            </DialogDescription>
            <DialogFooter className="mt-8 flex items-center gap-3">
              <button 
                onClick={() => setIsSubmitDialogOpen(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors text-[13px]"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  setIsSubmitDialogOpen(false);
                  handleSubmit();
                }}
                className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors text-[13px] shadow-[0_4px_12px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Vâng, nộp ngay
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </AdvisorShell>
  );
}
