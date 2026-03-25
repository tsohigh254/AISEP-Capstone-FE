"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ShieldCheck,
  Clock,
  ExternalLink,
  Download,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  History,
  Info,
  ChevronRight,
  Eye,
  MessageSquare,
  MoreVertical,
  Plus,
  Zap,
  Building2,
  User,
  GraduationCap,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { 
  KYCSubtype, 
  AssessmentValue, 
  KYC_SUBTYPE_CONFIGS, 
  ASSESSMENT_LABELS,
  getSuggestedResult,
  SCORE_MAP,
  HARD_FAIL_VALUES
} from "@/types/staff-kyc";

// --- Types ---
type KYCStatus = "PENDING" | "IN_REVIEW" | "PENDING_MORE_INFO" | "APPROVED" | "REJECTED" | "FAILED";

// --- Subtype Resolver Mock ---
const getSubtypeById = (id: string): KYCSubtype => {
  if (id.endsWith("002")) return "STARTUP_NO_ENTITY";
  if (id.endsWith("003")) return "INSTITUTIONAL_INVESTOR";
  if (id.endsWith("004")) return "INDIVIDUAL_INVESTOR";
  if (id.endsWith("005")) return "ADVISOR";
  return "STARTUP_ENTITY";
};

// --- Helper Functions ---
const AVATAR_COLORS = [
  "from-violet-500 to-violet-600", "from-blue-500 to-blue-600",
  "from-emerald-500 to-emerald-600", "from-rose-500 to-rose-600",
  "from-amber-500 to-amber-600", "from-cyan-500 to-cyan-600",
  "from-pink-500 to-pink-600", "from-indigo-500 to-indigo-600",
];

function getAvatarGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const DUMMY_ENTITY_NAMES: Record<KYCSubtype, string> = {
  STARTUP_ENTITY: "TechAlpha Co.",
  STARTUP_NO_ENTITY: "Project Phoenix",
  INSTITUTIONAL_INVESTOR: "Global Venture Fund",
  INDIVIDUAL_INVESTOR: "Nguyễn Văn A (Cá nhân)",
  ADVISOR: "Trần Thị Cố Vấn"
};

const STATUS_CFG: Record<KYCStatus | "FAILED", { label: string, badge: string, dot: string }> = {
  PENDING: { label: "Chờ xử lý", badge: "bg-amber-50 text-amber-700 border-amber-200/80", dot: "bg-amber-400" },
  IN_REVIEW: { label: "Đang soát xét", badge: "bg-blue-50 text-blue-700 border-blue-200/80", dot: "bg-blue-400" },
  PENDING_MORE_INFO: { label: "Chờ bổ sung", badge: "bg-purple-50 text-purple-700 border-purple-200/80", dot: "bg-purple-400" },
  APPROVED: { label: "Đã duyệt", badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80", dot: "bg-emerald-400" },
  REJECTED: { label: "Từ chối", badge: "bg-red-50 text-red-700 border-red-200/80", dot: "bg-red-400" },
  FAILED: { label: "Thẩm định thất bại", badge: "bg-red-50 text-red-700 border-red-200/80", dot: "bg-red-400" },
};

export default function KYCDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [activeTab, setActiveTab] = useState<"INFO" | "HISTORY">("INFO");
  const subtype = useMemo(() => getSubtypeById(id), [id]);
  const config = KYC_SUBTYPE_CONFIGS[subtype];
  const SubtypeIcon = config.icon;
  const entityName = DUMMY_ENTITY_NAMES[subtype];
  const avatarGradient = useMemo(() => getAvatarGradient(entityName), [entityName]);

  // Initialize assessments
  const [assessments, setAssessments] = useState<Record<string, AssessmentValue>>(
    Object.fromEntries(config.fields.map(f => [f.id, f.options[0]]))
  );

  const [internalNote, setInternalNote] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const updateAssessment = (fieldId: string, val: AssessmentValue) => {
    setAssessments(prev => ({ ...prev, [fieldId]: val }));
  };

  const result = useMemo(() => getSuggestedResult(subtype, assessments), [subtype, assessments]);
  const isComplete = Object.keys(assessments).length === config.fields.length;

  const [isSuccess, setIsSuccess] = useState(false);

  if (isSuccess) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-20" />
          <CheckCircle2 className="w-12 h-12 text-emerald-500 relative z-10" />
        </div>
        <h2 className="text-[24px] font-black text-slate-900 tracking-tight">Xử lý thành công!</h2>
        <p className="text-[14px] text-slate-500 mt-2 text-center max-w-sm">
          Hồ sơ <span className="font-bold text-slate-900">{entityName}</span> đã được cập nhật nhãn <span className="font-bold text-emerald-600">{result.suggestedLabel}</span>. 
          Thông báo đã được gửi tới người dùng.
        </p>
        <div className="flex items-center gap-4 mt-10">
          <Link 
            href="/staff/kyc"
            className="px-6 py-2.5 rounded-xl bg-[#0f172a] text-white text-[13px] font-bold hover:bg-[#1e293b] transition-all shadow-lg shadow-slate-200 active:scale-95"
          >
            Về danh sách
          </Link>
          <button 
            onClick={() => setIsSuccess(false)}
            className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-bold hover:bg-slate-50 transition-all active:scale-95"
          >
            Xem lại hồ sơ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-400">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          href="/staff/kyc"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors text-[13px] font-medium group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại danh sách
        </Link>
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 transition-all">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Page Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-[18px] font-bold shrink-0 shadow-sm", avatarGradient)}>
              {entityName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-[20px] font-bold text-slate-900 leading-tight font-plus-jakarta-sans">{entityName}</h1>
                <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-semibold border", STATUS_CFG["IN_REVIEW"].badge)}>
                  <div className={cn("w-1.5 h-1.5 rounded-full", STATUS_CFG["IN_REVIEW"].dot)} />
                  {STATUS_CFG["IN_REVIEW"].label}
                </span>
                {result.hasHardFail && (
                  <span className="text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" />
                    HARD FAIL
                  </span>
                )}
              </div>
              <p className="text-[13px] text-slate-500 mt-1">{config.label}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Nộp: {new Date().toLocaleDateString('vi-VN')}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">#{id}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 border-b border-slate-100 no-scrollbar overflow-x-auto">
            {[ { id: "INFO", label: "Soát xét hồ sơ" }, { id: "HISTORY", label: "Lịch sử xử lý" } ].map((tab) => (
              <button 
                key={tab.id}
                className={cn("px-4 py-2 text-[13px] font-bold whitespace-nowrap border-b-2 -mb-px transition-colors font-plus-jakarta-sans", 
                  activeTab === tab.id ? "border-[#0f172a] text-[#0f172a]" : "border-transparent text-slate-500 hover:text-slate-700"
                )}
                onClick={() => setActiveTab(tab.id as any)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {activeTab === "INFO" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-[13px] font-semibold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  Thẩm định chi tiết
                </h2>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Khu vực xử lý</span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100">Thông tin</th>
                      <th className="px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100">Dữ liệu</th>
                      <th className="px-6 py-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100 w-64 text-right">Đánh giá</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {config.fields.map((field) => (
                      <tr key={field.id} className="group hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-5 align-top">
                          <p className="text-[13px] font-semibold text-slate-700">{field.label}</p>
                        </td>
                        <td className="px-6 py-5 align-top">
                           {field.type === "text" && (
                            <p className="text-[13px] text-slate-600 leading-relaxed font-normal">{field.value || "—"}</p>
                           )}
                           {field.type === "link" && (
                            <a href="#" className="inline-flex items-center gap-1.5 text-[13px] text-blue-600 font-medium hover:underline">
                              Mở liên kết
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                           )}
                           {field.type === "file" && (
                            <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-white transition-colors">
                              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4 text-red-500" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-700 text-[12px] truncate">Document_Proof.pdf</p>
                                <button className="text-blue-600 hover:text-blue-800 font-medium text-[11px] uppercase tracking-tight">Xem tài liệu</button>
                              </div>
                            </div>
                           )}
                        </td>
                        <td className="px-6 py-5 align-top text-right">
                          <div className="space-y-2 inline-block text-left w-full">
                            <select 
                              value={assessments[field.id]}
                              onChange={(e) => updateAssessment(field.id, e.target.value as AssessmentValue)}
                              className={cn(
                                "w-full px-3 py-2 rounded-xl text-[12px] font-medium border outline-none transition-all appearance-none cursor-pointer focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e]",
                                HARD_FAIL_VALUES.includes(assessments[field.id]) 
                                  ? "bg-red-50 border-red-200 text-red-700"
                                  : SCORE_MAP[assessments[field.id]] >= 2
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                    : "bg-white border-slate-200 text-slate-700"
                              )}
                            >
                              {field.options.map(opt => (
                                <option key={opt} value={opt}>{ASSESSMENT_LABELS[opt]}</option>
                              ))}
                            </select>
                            <div className="flex items-center justify-between px-1">
                               <span className={cn("text-[10px] font-bold uppercase tracking-wide", 
                                  SCORE_MAP[assessments[field.id]] >= 2 ? "text-emerald-500" :
                                  SCORE_MAP[assessments[field.id]] >= 1 ? "text-blue-500" :
                                  SCORE_MAP[assessments[field.id]] < 0 ? "text-red-500" : "text-slate-400"
                               )}>
                                {SCORE_MAP[assessments[field.id]] > 0 ? `+${SCORE_MAP[assessments[field.id]]}` : SCORE_MAP[assessments[field.id]]} điểm
                               </span>
                               {HARD_FAIL_VALUES.includes(assessments[field.id]) && (
                                 <span className="text-[10px] font-bold text-red-600 uppercase italic">Vi phạm nghiêm trọng</span>
                               )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Evidence Preview Panel */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[13px] font-semibold text-slate-900 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-slate-400" />
                  Xem trước minh chứng
                </h2>
                <button className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  Tải xuống
                </button>
              </div>
              <div className="aspect-[4/3] bg-slate-50 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200 group transition-colors hover:border-slate-300">
                <FileText className="w-10 h-10 text-slate-200 mb-3 group-hover:scale-110 transition-transform" />
                <p className="text-[13px] text-slate-400 italic">Chọn một tài liệu để xem trước nội dung</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-5">
            {/* Action Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
              <h2 className="text-[13px] font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                Kết quả soát xét
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">Điểm hệ thống</span>
                  <span className={cn("text-[18px] font-bold", result.totalScore >= 6 ? "text-emerald-600" : "text-amber-600")}>
                    {result.totalScore} <span className="text-[12px] font-medium text-slate-400">/ {config.fields.length * 2}</span>
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">Gợi ý nhãn</span>
                  <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border", 
                    result.suggestedDecision === "APPROVE" ? "bg-emerald-50 text-emerald-700 border-emerald-200/80" :
                    result.suggestedDecision === "REJECT" ? "bg-red-50 text-red-700 border-red-200/80" :
                    "bg-amber-50 text-amber-700 border-amber-200/80"
                  )}>
                    <Zap className="w-3 h-3" />
                    {result.suggestedLabel}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-[11px] text-slate-400 uppercase tracking-wide font-medium">Ghi chú nội bộ</p>
                  <textarea 
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    placeholder="Nhập ghi chú quan trọng..."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-[13px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] resize-none h-24 transition-all"
                  />
                </div>

                <button 
                  disabled={!isComplete}
                  onClick={() => setShowConfirm(true)}
                  className={cn(
                    "w-full py-2.5 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95",
                    isComplete ? "bg-[#0f172a] text-white hover:bg-[#1e293b]" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  )}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Xác nhận kết quả
                </button>
              </div>
            </div>

            {/* Timeline Row */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
              <h3 className="text-[13px] font-semibold text-slate-900 mb-5 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" />
                Lịch sử xử lý
              </h3>
              <div className="relative">
                {[
                  { time: "2 giờ trước", action: "Người dùng nộp hồ sơ", actor: "Cá nhân/Tổ chức", isLatest: false },
                  { time: "1 giờ trước", action: "AI Engine tự động chấm điểm", actor: "Hệ thống", isLatest: true },
                ].map((entry, idx, arr) => {
                  const isLast = idx === arr.length - 1;
                  return (
                    <div key={idx} className="flex gap-3 pb-5 last:pb-0">
                      <div className="flex flex-col items-center">
                        <div className={cn("w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 z-10",
                          entry.isLatest ? "bg-[#eec54e]" : "bg-slate-300"
                        )} />
                        {!isLast && <div className="w-px flex-1 bg-slate-100 mt-1.5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] text-slate-700 font-medium leading-tight">{entry.action}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{entry.actor} · {entry.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Logic Guide */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
              <h3 className="text-[13px] font-semibold text-slate-900 mb-5 flex items-center gap-2 uppercase tracking-wide">
                <ShieldCheck className="w-4 h-4 text-[#eec54e]" />
                Hướng dẫn gán nhãn
              </h3>
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                   <div className="flex items-center justify-between mb-1">
                     <span className="text-[11px] font-bold text-emerald-600 uppercase">Đã xác thực</span>
                     <span className="text-[11px] font-bold text-slate-400">Min 10đ</span>
                   </div>
                   <p className="text-[11px] text-slate-500 leading-relaxed font-normal">Không có cảnh báo đỏ hoặc vi phạm nghiêm trọng.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                   <div className="flex items-center justify-between mb-1">
                     <span className="text-[11px] font-bold text-blue-600 uppercase">Cơ bản</span>
                     <span className="text-[11px] font-bold text-slate-400">Min 6đ</span>
                   </div>
                   <p className="text-[11px] text-slate-500 leading-relaxed font-normal">Cho phép sai sót nhỏ không ảnh hưởng cốt lõi.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-16 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto transition-all group-hover:scale-110">
            <History className="w-6 h-6 text-slate-300" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-slate-500">Dữ liệu lịch sử đang được tải...</p>
            <p className="text-[13px] text-slate-400">Bạn sẽ thấy chi tiết các bước xử lý tại đây.</p>
          </div>
        </div>
      )}

      {/* Decision Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[15px] font-semibold text-slate-900">Xác nhận phê duyệt</h3>
                  <button onClick={() => setShowConfirm(false)} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
                    <XCircle className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
                
                <p className="text-[13px] text-slate-500 leading-relaxed">
                  Bạn đang chuẩn bị áp dụng nhãn <span className="font-bold text-slate-900 border-b border-[#eec54e]">{result.suggestedLabel}</span> cho hồ sơ <span className="font-bold text-slate-900">{entityName}</span>.
                </p>

                <div className="mt-6 p-4 rounded-xl bg-[#0f172a] text-white flex items-center justify-between shadow-lg shadow-black/5">
                   <div>
                     <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Điểm số</p>
                     <p className="text-[24px] font-bold mt-0.5 tracking-tight">{result.totalScore}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Phân loại</p>
                     <span className={cn("inline-block mt-1 px-3 py-1 rounded-lg text-[12px] font-bold uppercase tracking-tight", 
                        result.suggestedDecision === "APPROVE" ? "bg-emerald-500" : "bg-amber-500"
                     )}>
                       {result.suggestedLabel}
                     </span>
                   </div>
                </div>
             </div>
             
             <div className="px-6 py-4 bg-slate-50 flex items-center justify-end gap-3">
               <button onClick={() => setShowConfirm(false)} className="px-4 py-2 text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors">
                 Huỷ bỏ
               </button>
               <button 
                  className={cn("px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all shadow-sm active:scale-95",
                    result.suggestedDecision === "APPROVE" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-[#0f172a] hover:bg-[#1e293b]"
                  )}
                  onClick={() => {
                    setIsSuccess(true);
                    setShowConfirm(false);
                  }}
               >
                 Phê duyệt hồ sơ
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
