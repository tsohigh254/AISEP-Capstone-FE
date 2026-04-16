"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StartupShell } from "@/components/startup/startup-shell";
import {
  FileText, Star, Download, CheckCircle2,
  BadgeCheck, Calendar, Paperclip, ExternalLink
} from "lucide-react";
import { GetMentorshipReport } from "@/services/startup/startup-mentorship.api";
import type { IMentorshipReport } from "@/types/startup-mentorship";

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ConsultingReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();

  const [report, setReport] = useState<IMentorshipReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [pendingReview, setPendingReview] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await GetMentorshipReport(Number(id));
        if (res.isSuccess && res.data) {
          setReport(res.data);
        } else {
          setNotFound(true);
        }
      } catch (err: any) {
        const status = err?.response?.status;
        const code = err?.response?.data?.code;
        if (status === 403 || code === "REPORT_NOT_AVAILABLE") {
          setPendingReview(true);
        } else {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDownload = () => {
    if (report?.attachmentsURL) {
      window.open(report.attachmentsURL, "_blank", "noopener,noreferrer");
    }
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  if (loading) {
    return (
      <StartupShell>
        <div className="max-w-[900px] mx-auto pt-20 text-center text-slate-400 text-[13px]">Đang tải báo cáo...</div>
      </StartupShell>
    );
  }

  if (pendingReview) {
    return (
      <StartupShell>
        <div className="max-w-[900px] mx-auto pt-20 text-center space-y-4">
          <div className="w-12 h-12 mx-auto bg-amber-50 rounded-full flex items-center justify-center mb-2">
            <FileText className="w-6 h-6 text-amber-500" />
          </div>
          <p className="text-[15px] font-semibold text-slate-700">Báo cáo chưa sẵn sàng</p>
          <p className="text-[13px] text-slate-400">Báo cáo đang chờ phê duyệt từ bộ phận vận hành. Vui lòng quay lại sau.</p>
          <button
            onClick={() => router.push(`/startup/mentorship-requests/${id}`)}
            className="mt-2 text-[13px] font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            ← Quay lại chi tiết yêu cầu
          </button>
        </div>
      </StartupShell>
    );
  }

  if (notFound || !report) {
    return (
      <StartupShell>
        <div className="max-w-[900px] mx-auto pt-20 text-center space-y-4">
          <p className="text-[15px] font-semibold text-slate-700">Chưa có báo cáo</p>
          <p className="text-[13px] text-slate-400">Báo cáo sẽ được cố vấn gửi sau khi phiên tư vấn hoàn tất.</p>
          <button
            onClick={() => router.push(`/startup/mentorship-requests/${id}`)}
            className="mt-2 text-[13px] font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            ← Quay lại chi tiết yêu cầu
          </button>
        </div>
      </StartupShell>
    );
  }

  const createdDate = new Date(report.createdAt).toLocaleDateString("vi-VN", {
    day: "numeric", month: "long", year: "numeric",
  });
  const createdTime = new Date(report.createdAt).toLocaleTimeString("vi-VN", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <StartupShell>
      <div className="max-w-[900px] mx-auto space-y-6 pb-20 animate-in fade-in duration-500">

        {/* Report Header */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-7 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#eec54e]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/3 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded-full text-[10px] font-bold uppercase tracking-widest">
                    Báo cáo hoàn thành
                  </span>
                </div>
                <h1 className="text-[22px] font-bold leading-tight mb-2">Báo cáo tư vấn</h1>
                <div className="flex items-center gap-4 text-[12px] text-white/60">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{createdDate}</span>
                </div>
              </div>
              {report.attachmentsURL && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-[12px] font-semibold text-white transition-all flex-shrink-0"
                >
                  {downloaded ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Download className="w-4 h-4" />}
                  {downloaded ? "Đã mở" : "Tải xuống"}
                </button>
              )}
            </div>

            {/* Advisor */}
            <div className="mt-5 pt-5 border-t border-white/10 flex items-center gap-3">
              <div className="relative">
                <img
                  src={report.advisor.profilePhotoURL || "/images/placeholder-avatar.png"}
                  alt={report.advisor.fullName}
                  className="w-10 h-10 rounded-xl object-cover border-2 border-white/20"
                />
                <BadgeCheck className="absolute -bottom-1 -right-1 w-4 h-4 text-amber-400 bg-slate-900 rounded-full" />
              </div>
              <div>
                <p className="text-[13px] font-bold leading-none">Viết bởi {report.advisor.fullName}</p>
                <p className="text-[11px] text-white/50 mt-0.5">{report.advisor.title}</p>
              </div>
              <div className="ml-auto text-[11px] text-white/40">Gửi lúc {createdTime} · {createdDate}</div>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="space-y-6">
          {/* Tóm tắt */}
          {(report.summary || report.title) && (
             <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-7">
               <div className="flex items-center gap-3 mb-5">
                 <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                   <Star className="w-4 h-4 text-amber-500" />
                 </div>
                 <h2 className="text-[15px] font-bold text-slate-900">{report.title || "Tóm tắt"}</h2>
               </div>
               <div className="text-[14px] text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100 font-medium whitespace-pre-wrap">
                 {report.summary}
               </div>
             </div>
          )}

          {/* Nội dung tư vấn */}
          {(report.discussionOverview || report.keyFindings) && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-7">
               <div className="flex items-center gap-3 mb-5">
                 <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                   <FileText className="w-4 h-4 text-blue-500" />
                 </div>
                 <h2 className="text-[15px] font-bold text-slate-900">Nội dung tư vấn</h2>
               </div>
               <div className="space-y-6">
                 {report.discussionOverview && (
                   <div>
                       <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Nội dung đã thảo luận</h4>
                       <div className="text-[14px] text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100 font-medium whitespace-pre-wrap">
                           {report.discussionOverview}
                       </div>
                   </div>
                 )}
                 {report.keyFindings && (
                   <div>
                       <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 mt-6">Phát hiện chính (Key Findings)</h4>
                       <div className="text-[14px] text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100 font-medium whitespace-pre-wrap">
                           {report.keyFindings}
                       </div>
                   </div>
                 )}
                 {report.identifiedRisks && (
                   <div>
                       <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 mt-6">Rủi ro nhận diện</h4>
                       <div className="text-[14px] text-rose-700 leading-relaxed bg-rose-50/50 p-4 rounded-xl border border-rose-100 font-medium whitespace-pre-wrap">
                           {report.identifiedRisks}
                       </div>
                   </div>
                 )}
               </div>
            </div>
          )}

          {/* Khuyến nghị & Kết luận */}
          {(report.advisorRecommendations || report.nextSteps) && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-7">
               <div className="flex items-center gap-3 mb-5">
                 <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                   <BadgeCheck className="w-4 h-4 text-emerald-500" />
                 </div>
                 <h2 className="text-[15px] font-bold text-slate-900">Khuyến nghị & Kết quả đầu ra</h2>
               </div>
               <div className="space-y-6">
                 {report.advisorRecommendations && (
                   <div>
                       <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Khuyến nghị từ cố vấn</h4>
                       <div className="text-[14px] text-emerald-700 leading-relaxed bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 font-medium whitespace-pre-wrap">
                           {report.advisorRecommendations}
                       </div>
                   </div>
                 )}
                 {report.nextSteps && (
                   <div>
                       <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 mt-6">Các bước tiếp theo (Next Steps)</h4>
                       <div className="text-[14px] text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100 font-medium whitespace-pre-wrap">
                           {report.nextSteps}
                       </div>
                   </div>
                 )}
                 {report.deliverablesSummary && (
                   <div>
                       <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 mt-6">Tài liệu / Deliverables</h4>
                       <div className="text-[14px] text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-xl border border-slate-100 font-medium whitespace-pre-wrap">
                           {report.deliverablesSummary}
                       </div>
                   </div>
                 )}
               </div>
            </div>
          )}

          {/* Fallback to raw content if new fields aren't populated */}
          {(!report.summary && !report.discussionOverview && !report.advisorRecommendations) && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-7">
               <div className="flex items-center gap-3 mb-5">
                 <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                   <FileText className="w-4 h-4 text-blue-500" />
                 </div>
                 <h2 className="text-[15px] font-bold text-slate-900">Nội dung báo cáo</h2>
               </div>
               <div className="text-[14px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                 {report.content}
               </div>
            </div>
          )}
        </div>

        {/* Attachment */}
        {report.attachmentsURL && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">
                <Paperclip className="w-4 h-4 text-slate-400" />
              </div>
              <h2 className="text-[15px] font-bold text-slate-900">Tài liệu đính kèm</h2>
            </div>
            <a
              href={report.attachmentsURL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-4 py-3 rounded-xl border border-slate-200 hover:border-[#eec54e]/50 hover:bg-amber-50/30 transition-all group"
            >
              <Download className="w-4 h-4 text-emerald-500" />
              <span className="text-[13px] font-semibold text-slate-700 group-hover:text-slate-900 max-w-[400px] truncate">
                {report.attachmentsURL.split("/").pop() || "Tải tài liệu đính kèm"}
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#eec54e]" />
            </a>
          </div>
        )}

        {/* CTA Footer */}
        <div className="flex items-center justify-between px-6 py-5 bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <button
            onClick={() => router.push(`/startup/mentorship-requests/${id}`)}
            className="text-[13px] font-medium text-slate-500 hover:text-slate-700 transition-colors"
          >
            ← Quay lại chi tiết yêu cầu
          </button>
          <div className="flex items-center gap-3">
            {report.attachmentsURL && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-xl text-[13px] font-semibold hover:bg-slate-50 transition-all"
              >
                {downloaded ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Download className="w-4 h-4" />}
                {downloaded ? "Đã mở" : "Tải tài liệu"}
              </button>
            )}
            <button
              onClick={() => router.push(`/startup/mentorship-requests/${id}/feedback`)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0f172a] text-white rounded-xl text-[13px] font-semibold hover:bg-slate-700 transition-all shadow-sm"
            >
              <Star className="w-4 h-4" />
              Gửi đánh giá
            </button>
          </div>
        </div>
      </div>
    </StartupShell>
  );
}
