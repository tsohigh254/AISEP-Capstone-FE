"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, Save, Send, Plus, X, FileText, Download,
  Info, AlertCircle, CheckCircle2, Paperclip, 
  ChevronDown, Layout, MessageSquare, Target, Lightbulb, TrendingUp,
  User, Clock, Check, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdvisorShell } from "@/components/advisor/advisor-shell";
import { getMockSessions } from "@/services/advisor/advisor-consulting.mock";
import { getAdvisorReportById } from "@/services/advisor/advisor-report.api";
import { UpdateMentorshipReport } from "@/services/advisor/advisor.api";
import type { IConsultingSession } from "@/types/advisor-consulting";
import type { IConsultationReport } from "@/types/advisor-report";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

/* ─── Components ─────────────────────────────────────────────── */

const STEPS = [
  { id: 1, title: "Tổng quan", icon: Layout },
  { id: 2, title: "Thảo luận", icon: MessageSquare },
  { id: 3, title: "Khuyến nghị", icon: TrendingUp },
  { id: 4, title: "Xem trước", icon: CheckCircle2 }
];

function StepperHeader({ activeStep }: { activeStep: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-8 py-5 flex items-center justify-between relative overflow-hidden">
      <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
      <div 
        className="absolute top-1/2 left-10 h-0.5 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500 ease-out" 
        style={{ width: `calc(${((activeStep - 1) / (STEPS.length - 1)) * 100}% - 40px)` }}
      />
      {STEPS.map((step, idx) => {
        const isActive = activeStep === step.id;
        const isCompleted = activeStep > step.id;
        const Icon = step.icon;
        
        return (
          <div key={step.id} className="relative z-10 flex flex-col items-center gap-2.5 bg-white px-2 cursor-pointer transition-transform hover:scale-105">
            <div className={cn(
              "w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300",
              isActive ? "border-blue-500 bg-blue-50 text-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.2)]" : 
              isCompleted ? "border-emerald-500 bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]" : 
              "border-slate-200 bg-white text-slate-300"
            )}>
              {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
            </div>
            <span className={cn(
              "text-[11px] font-bold uppercase tracking-widest",
              isActive ? "text-blue-600" : isCompleted ? "text-emerald-600" : "text-slate-400"
            )}>
              {step.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function FormSection({ title, icon: Icon, children, description }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-slate-900">{title}</h3>
            {description && <p className="text-[11px] text-slate-500 font-medium">{description}</p>}
          </div>
        </div>
      </div>
      <div className="p-6 space-y-5">
        {children}
      </div>
    </div>
  );
}

function PreviewField({ label, content }: { label: string; content: string | boolean }) {
  if (!content) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <div className="text-[13.5px] font-medium text-slate-800 bg-slate-50 border border-slate-100 p-3.5 rounded-xl whitespace-pre-wrap leading-relaxed">
        {content}
      </div>
    </div>
  );
}

function EditReportContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [session, setSession] = useState<IConsultingSession | null>(null);
  const [report, setReport] = useState<IConsultationReport | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingAttachmentUrl, setExistingAttachmentUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    discussionOverview: "",
    keyFindings: "",
    advisorRecommendations: "",
    identifiedRisks: "",
    nextSteps: "",
    deliverablesSummary: "",
    followUpRequired: false,
    followUpNotes: ""
  });

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      
      const fetchedReport = await getAdvisorReportById(id);
      if (fetchedReport) {
        setReport(fetchedReport);
        setFormData({
          title: fetchedReport.title || "",
          summary: fetchedReport.summary || "",
          discussionOverview: fetchedReport.discussionOverview || "",
          keyFindings: fetchedReport.keyFindings || "",
          advisorRecommendations: fetchedReport.advisorRecommendations || "",
          identifiedRisks: fetchedReport.identifiedRisks || "",
          nextSteps: fetchedReport.nextSteps || "",
          deliverablesSummary: fetchedReport.deliverablesSummary || "",
          followUpRequired: fetchedReport.followUpRequired || false,
          followUpNotes: fetchedReport.followUpNotes || ""
        });
        if (fetchedReport.attachmentsURL) {
          setExistingAttachmentUrl(fetchedReport.attachmentsURL);
        }
        
        const foundSes = getMockSessions().find(s => s.id === fetchedReport.sessionId);
        const ses = foundSes || {
          id: fetchedReport.sessionId,
          startup: fetchedReport.startup,
          objective: fetchedReport.title.replace("Báo cáo tư vấn ", "").split(" - ")[0] || "Tư vấn cấu trúc",
          scheduledStartAt: fetchedReport.sessionDate
        } as any;
        setSession(ses);
      }
      setIsLoading(false);
    }
    loadData();
  }, [id]);

  const handleNext = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (activeStep < 4) setActiveStep(activeStep + 1);
  };
  const handleBack = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (activeStep > 1) setActiveStep(activeStep - 1);
  };

  const handleSave = async (status: 'DRAFT' | 'SUBMITTED') => {
    if (status === 'SUBMITTED' && !formData.title) {
      toast.error("Vui lòng nhập tiêu đề báo cáo ở Bước 1");
      setActiveStep(1);
      return;
    }
    if (!report) return;

    setIsSubmitting(true);
    try {
      const isDraft = status === 'DRAFT';
      const reportSummary = formData.summary.trim()
        ? formData.title + "\n\n" + formData.summary
        : formData.title;
      const detailedFindings = [
        formData.discussionOverview,
        formData.keyFindings.trim() ? "\n\nKey Findings:\n" + formData.keyFindings : "",
        formData.identifiedRisks.trim() ? "\n\nRisks:\n" + formData.identifiedRisks : "",
      ].join("");
      const recommendations = [
        formData.advisorRecommendations,
        formData.nextSteps.trim() ? "\n\nNext Steps:\n" + formData.nextSteps : "",
        formData.deliverablesSummary.trim() ? "\n\nDeliverables:\n" + formData.deliverablesSummary : "",
        formData.followUpRequired
          ? "\n\nFollow-up Required:\n" + (formData.followUpNotes?.trim() || "Có")
          : "",
      ].join("");

      // PATCH accepted for both Draft and NeedsMoreInfo — BE only blocks Passed/PendingReview
      await UpdateMentorshipReport(id, report.id, {
        reportSummary,
        detailedFindings,
        recommendations,
        attachmentFile: attachments[0] ?? null,
        isDraft,
      });

      toast.success(isDraft ? "Đã lưu bản nháp thành công" : "Đã gửi báo cáo thành công!");
      if (!isDraft) router.push(`/advisor/reports/${id}`);
    } catch (error) {
      toast.error(status === 'DRAFT' ? "Có lỗi xảy ra khi lưu bản nháp" : "Có lỗi xảy ra khi nộp báo cáo");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (attachments.length + selectedFiles.length > 1) {
      toast.error("Chỉ được đính kèm tối đa 1 tài liệu");
      return;
    }

    const ALLOWED_TYPES = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
    ];
    const validFiles = selectedFiles.filter(file => {
      const isSizeOk = file.size <= 10 * 1024 * 1024;
      const isTypeOk = ALLOWED_TYPES.includes(file.type);
      
      if (!isSizeOk) toast.error(`File ${file.name} vượt quá 10MB`);
      if (!isTypeOk) toast.error(`File ${file.name} không đúng định dạng (PDF, DOC, DOCX, PNG, JPG)`);
      
      return isSizeOk && isTypeOk;
    });

    setAttachments(prev => [...prev, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const AVATAR_COLORS = [
    "from-violet-500 to-violet-600", "from-blue-500 to-blue-600",
    "from-emerald-500 to-emerald-600", "from-rose-500 to-rose-600",
    "from-amber-500 to-amber-600", "from-cyan-500 to-cyan-600",
    "from-pink-500 to-pink-600", "from-indigo-500 to-indigo-600",
  ];
  function getAvatarColor(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-[#eec54e] border-t-transparent animate-spin" />
    </div>
  );

  if (!session || !report) return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <AlertCircle className="w-10 h-10 mb-2 opacity-20" />
      <p className="text-[14px] font-semibold">Không tìm thấy thông tin báo cáo tư vấn</p>
    </div>
  );

  const avatarGradient = getAvatarColor(session.startup.displayName);

  return (
    <div className="max-w-[1100px] mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.push(`/advisor/reports/${id}`)}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center group-hover:bg-slate-50 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </div>
          <span className="text-[13px] font-bold">Hủy chỉnh sửa</span>
        </button>
        <button 
          disabled={isSubmitting}
          onClick={() => handleSave('DRAFT')}
          className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-[13px] font-bold hover:bg-slate-50 transition-all flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Lưu bản nháp
        </button>
      </div>

      {/* Header Info (White Card Pattern) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
        <div className="flex items-start gap-4">
          <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-[18px] font-bold shrink-0 shadow-sm", avatarGradient)}>
            {session.startup.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-[20px] font-bold text-slate-900 leading-tight">Chỉnh sửa báo cáo: {session.objective}</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold border border-[#eec54e] bg-amber-50 text-amber-700 uppercase tracking-widest">
                <Layout className="w-3 h-3" />
                Đang chỉnh sửa
              </span>
            </div>
            <div className="flex items-center gap-4 mt-3 flex-wrap border-t border-slate-50 pt-3">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold uppercase tracking-tight">
                <User className="w-3.5 h-3.5" />
                Startup: <span className="text-slate-600 ml-0.5">{session.startup.displayName}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold uppercase tracking-tight">
                <Clock className="w-3.5 h-3.5" />
                Ngày: <span className="text-slate-600 ml-0.5">{new Date(session.scheduledStartAt).toLocaleDateString("vi-VN")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stepper Header */}
      <StepperHeader activeStep={activeStep} />

      {/* Form Content Steps */}
      <div className="grid gap-6">
        
        {/* STEP 1: Tổng quan */}
        {activeStep === 1 && (
          <FormSection title="Tổng quan & Tóm tắt" icon={Layout} description="Tiêu đề và mục tiêu chung của buổi tư vấn">
            <div className="space-y-4">
              <div>
                <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wide mb-1.5 flex items-center gap-2">
                  Tiêu đề báo cáo <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Ví dụ: Báo cáo tư vấn Chiến lược GTM..."
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] transition-all font-medium placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wide mb-1.5">Tóm tắt nội dung chính</label>
                <textarea 
                  rows={4}
                  value={formData.summary}
                  onChange={e => setFormData({...formData, summary: e.target.value})}
                  placeholder="Ghi lại các điểm quan trọng nhất của buổi gặp..."
                  className="w-full p-4 rounded-xl border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] transition-all font-medium resize-none placeholder:text-slate-400"
                />
              </div>
            </div>
          </FormSection>
        )}

        {/* STEP 2: Thảo luận */}
        {activeStep === 2 && (
          <FormSection title="Phân tích & Thảo luận" icon={MessageSquare} description="Ghi nhận các nội dung chuyên môn đã trao đổi">
            <div className="space-y-5">
              <div>
                <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wide mb-1.5 flex items-center gap-2">
                  <Target className="w-3.5 h-3.5 text-blue-500" />
                  Vấn đề đã thảo luận
                </label>
                <textarea 
                  rows={6}
                  value={formData.discussionOverview}
                  onChange={e => setFormData({...formData, discussionOverview: e.target.value})}
                  placeholder="Advisor và Startup đã cùng giải quyết những vấn đề gì?"
                  className="w-full p-4 rounded-xl border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] transition-all font-medium placeholder:text-slate-400"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wide mb-1.5 flex items-center gap-2">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    Phát hiện chính (Key Findings)
                  </label>
                  <textarea 
                    rows={4}
                    value={formData.keyFindings}
                    onChange={e => setFormData({...formData, keyFindings: e.target.value})}
                    placeholder="Những điểm mấu chốt được rút ra..."
                    className="w-full p-4 rounded-xl border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] transition-all font-medium placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wide mb-1.5 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                    Rủi ro & Thách thức
                  </label>
                  <textarea 
                    rows={4}
                    value={formData.identifiedRisks}
                    onChange={e => setFormData({...formData, identifiedRisks: e.target.value})}
                    placeholder="Các rào cản Startup có thể gặp phải..."
                    className="w-full p-4 rounded-xl border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] transition-all font-medium placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          </FormSection>
        )}

        {/* STEP 3: Khuyến nghị & Kết quả */}
        {activeStep === 3 && (
          <FormSection title="Khuyến nghị & Kế hoạch" icon={TrendingUp} description="Các hành động cụ thể cho Startup trong tương lai">
            <div className="space-y-4">
              <div>
                <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wide mb-1.5">Khuyến nghị của Advisor</label>
                <textarea 
                  rows={4}
                  value={formData.advisorRecommendations}
                  onChange={e => setFormData({...formData, advisorRecommendations: e.target.value})}
                  placeholder="Các hành động cụ thể Startup nên thực hiện..."
                  className="w-full p-4 rounded-xl border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] transition-all font-medium placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wide mb-1.5">Các bước tiếp theo (Next Steps)</label>
                <textarea 
                  rows={3}
                  value={formData.nextSteps}
                  onChange={e => setFormData({...formData, nextSteps: e.target.value})}
                  placeholder="Các việc cần làm ngay sau buổi tư vấn..."
                  className="w-full p-4 rounded-xl border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] transition-all font-medium placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-bold uppercase tracking-wide mb-1.5">Sản phẩm bàn giao (Deliverables)</label>
                <input 
                  type="text" 
                  value={formData.deliverablesSummary}
                  onChange={e => setFormData({...formData, deliverablesSummary: e.target.value})}
                  placeholder="Tài liệu, checklist, hoặc kết quả đã bàn giao (nếu có)..."
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] transition-all font-medium placeholder:text-slate-400"
                />
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div 
                    className={cn(
                      "w-11 h-6 rounded-full relative cursor-pointer transition-colors duration-200 shadow-inner block shrink-0",
                      formData.followUpRequired ? "bg-[#eec54e]" : "bg-slate-200"
                    )} 
                    onClick={() => setFormData({...formData, followUpRequired: !formData.followUpRequired})}
                  >
                    <div className={cn("absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-200 shadow-sm", formData.followUpRequired && "translate-x-5")} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-slate-800">Cần có buổi tái đánh giá (Follow-up)</p>
                    <p className="text-[11px] text-slate-500 font-medium tracking-tight">Đánh dấu nếu cần thêm buổi theo dõi kết quả</p>
                  </div>
                </div>
                {formData.followUpRequired && (
                  <input 
                    type="text"
                    value={formData.followUpNotes}
                    onChange={e => setFormData({...formData, followUpNotes: e.target.value})}
                    placeholder="Ghi chú thêm cho buổi kế tiếp..."
                    className="flex-1 max-w-sm h-11 px-4 rounded-xl border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] transition-all font-medium"
                  />
                )}
              </div>
            </div>
          </FormSection>
        )}

        {/* STEP 4: Xem trước & Đính kèm */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <FormSection title="Tài liệu đính kèm" icon={Paperclip} description="Gửi kèm tệp tin hỗ trợ báo cáo cho Startup (Tối đa 1 tệp)">  
              <div className="space-y-4">
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  className="hidden"
                />
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-hover-amber rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50/50 group hover:border-[#eec54e]/50 hover:bg-amber-50/20 transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-[#eec54e] group-hover:scale-110 transition-all duration-300 mb-3 border border-slate-100">
                    <Plus className="w-6 h-6" />
                  </div>
                  <p className="text-[13px] font-bold text-slate-700">Thêm tệp đính kèm (Tùy chọn)</p>
                  <p className="text-[11px] text-slate-400 mt-1 uppercase font-black tracking-widest leading-none">PDF, DOC, DOCX, PNG, JPG (Max 10MB)</p>
                </div>

                {existingAttachmentUrl && attachments.length === 0 && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-200 animate-in fade-in">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-500 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-bold text-blue-700 truncate">
                          {existingAttachmentUrl.split("/").pop()?.split("?")[0] || "Tài liệu đính kèm"}
                        </p>
                        <p className="text-[10px] text-blue-500 font-medium">Đã lưu — tải lên file mới để thay thế</p>
                      </div>
                    </div>
                    <a
                      href={existingAttachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-400 hover:bg-blue-100 transition-all"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                )}

                {attachments.length > 0 && (
                  <div className="grid gap-2">
                    {attachments.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-sm animate-in fade-in slide-in-from-left-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[12px] font-bold text-slate-700 truncate">{file.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeFile(idx)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormSection>

            <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-8 space-y-6 relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-0 opacity-50" />
                <div className="flex items-center gap-3 mb-6 relative z-10">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    <h2 className="text-[16px] font-bold text-slate-900 border-b-2 border-emerald-200 pb-1">Xem trước nội dung (Preview)</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    <div className="md:col-span-2">
                        <PreviewField label="Tiêu đề & Tóm tắt" content={`${formData.title}\n\n${formData.summary}`} />
                    </div>
                    <div className="md:col-span-2">
                        <PreviewField label="Thảo luận chính" content={formData.discussionOverview} />
                    </div>
                    <PreviewField label="Phát hiện chính" content={formData.keyFindings} />
                    <PreviewField label="Rủi ro nhận diện" content={formData.identifiedRisks} />
                    <div className="md:col-span-2 bg-emerald-50/30 p-4 rounded-xl border border-emerald-100/50">
                        <PreviewField label="Khuyến nghị từ Advisor" content={formData.advisorRecommendations} />
                    </div>
                    <PreviewField label="Bước tiếp theo" content={formData.nextSteps} />
                    <PreviewField label="Sản phẩm bàn giao" content={formData.deliverablesSummary} />
                    <PreviewField label="Yêu cầu Follow-up" content={formData.followUpRequired ? `Có - ${formData.followUpNotes}` : "Không"} />
                </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50 mt-4">
          <button 
            type="button"
            onClick={activeStep === 1 ? () => router.back() : handleBack}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-bold hover:bg-slate-50 transition-all flex items-center gap-2 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {activeStep === 1 ? "Hủy bỏ" : "Quay lại"}
          </button>
          
          {activeStep < 4 ? (
            <button 
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-[#eec54e] text-[#0f172a] text-[13px] font-bold hover:bg-[#d6af3d] transition-all shadow-sm flex items-center gap-2 group"
            >
              Tiếp tục
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button 
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                if (!formData.title || !formData.summary) {
                  toast.error("Vui lòng nhập Tiêu đề và Tóm tắt ở Bước 1");
                  setActiveStep(1);
                  return;
                }
                if (!formData.discussionOverview || !formData.keyFindings) {
                  toast.error("Vui lòng nhập Nội dung thảo luận và Phát hiện chính ở Bước 2");
                  setActiveStep(2);
                  return;
                }
                if (!formData.advisorRecommendations) {
                  toast.error("Vui lòng nhập Khuyến nghị ở Bước 3");
                  setActiveStep(3);
                  return;
                }
                setIsSubmitDialogOpen(true);
              }}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-[13px] font-bold hover:bg-emerald-600 transition-all shadow-[0_4px_12px_rgba(16,185,129,0.3)] flex items-center gap-2 group"
            >
              {isSubmitting ? (
                 <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin block" />
              ) : (
                <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              )}
              Hoàn tất nộp báo cáo
            </button>
          )}
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
              Khi báo cáo được nộp, trạng thái sẽ chuyển sang <strong className="text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">Chờ thẩm định</strong>. Bạn sẽ không thể tiếp tục chỉnh sửa nội dung này trừ khi nhận được yêu cầu bổ sung từ đội ngũ Operations.
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
                  handleSave('SUBMITTED');
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
    </div>
  );
}

export default function EditReportPage() {
  return (
    <AdvisorShell>
      <Suspense fallback={<div className="flex justify-center p-20"><div className="w-8 h-8 rounded-full border-2 border-[#eec54e] border-t-transparent animate-spin" /></div>}>
        <EditReportContent />
      </Suspense>
    </AdvisorShell>
  );
}
