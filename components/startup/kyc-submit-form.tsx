"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  Users, 
  ArrowRight, 
  Send, 
  ShieldCheck, 
  Download,
  CheckCircle2,
  Trash2,
  X,
  Upload,
  ChevronRight,
  Info,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { KycFileUploader } from "@/components/startup/kyc-file-uploader";
import { toast } from "sonner";
import { StartupKycCase, SubmitStartupKYC, ResubmitStartupKYC } from "@/services/startup/startup-kyc.api";

const inputCls = "w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] outline-none transition-all";
const labelCls = "block text-[12px] font-bold text-slate-500 mb-1.5 uppercase tracking-tight";

interface KycSubmitFormProps {
  initialData?: StartupKycCase | null;
  isResubmit?: boolean;
}

export function KycSubmitForm({ initialData, isResubmit }: KycSubmitFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"WITH_LEGAL_ENTITY" | "WITHOUT_LEGAL_ENTITY">(
    initialData?.startupVerificationType || "WITH_LEGAL_ENTITY"
  );
  
  const [agreed, setAgreed] = useState(false);

  // Form states
  const [legalName, setLegalName] = useState(initialData?.submissionSummary?.legalFullName || "");
  const [taxCode, setTaxCode] = useState(initialData?.submissionSummary?.enterpriseCode || "");
  const [repName, setRepName] = useState(initialData?.submissionSummary?.representativeFullName || "");
  const [repRole, setRepRole] = useState(initialData?.submissionSummary?.representativeRole || "");
  const [email, setEmail] = useState(initialData?.submissionSummary?.workEmail || initialData?.submissionSummary?.contactEmail || "");
  const [link, setLink] = useState(initialData?.submissionSummary?.publicLink || "");
  const [files, setFiles] = useState<File[]>([]);

  const handleSubmit = async () => {
    if (!agreed) {
      toast.error("Vui lòng cam kết thông tin là chính xác.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("startupVerificationType", mode);
      if (mode === "WITH_LEGAL_ENTITY") {
        formData.append("legalFullName", legalName);
        formData.append("enterpriseCode", taxCode);
      } else {
        formData.append("projectName", legalName);
      }
      formData.append("representativeFullName", repName);
      formData.append("representativeRole", repRole);
      formData.append("workEmail", email);
      formData.append("publicLink", link);
      files.forEach(file => formData.append("evidenceFiles", file));

      const apiFn = isResubmit ? ResubmitStartupKYC : SubmitStartupKYC;
      const res = await apiFn(formData) as unknown as IBackendRes<null>;

      if (res.success || res.isSuccess) {
        toast.success(isResubmit ? "Hồ sơ đã được cập nhật thành công!" : "Hồ sơ đã được gửi đi thành công!");
        router.push("/startup/verification/status");
      } else {
        toast.error(res.message || "Gửi hồ sơ thất bại. Vui lòng thử lại.");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Lỗi kết nối. Vui lòng thử lại.";
      toast.error(typeof msg === "string" ? msg : "Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Path Correction Banner (if resubmit) */}
      {isResubmit && initialData?.requestedAdditionalItems && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3 shadow-sm">
           <div className="flex items-center gap-2 text-amber-700">
              <Info className="w-5 h-5" />
              <p className="text-[14px] font-bold">Lưu ý sửa đổi theo Staff:</p>
           </div>
           <div className="grid grid-cols-1 gap-2">
              {initialData.requestedAdditionalItems.map(item => (
                <div key={item.id} className="flex items-start gap-2 bg-white/60 p-3 rounded-xl border border-amber-100">
                   <div className="size-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                   <div>
                      <p className="text-[13px] font-bold text-slate-800">{item.title}</p>
                      <p className="text-[12px] text-slate-600">{item.description}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        
        {/* Step: Choose Path (Locked if resubmitting) */}
        {!isResubmit && (
           <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Lộ trình muốn xác thực</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => setMode("WITH_LEGAL_ENTITY")}
                  className={cn("flex flex-col p-4 rounded-xl border-2 transition-all text-left group", mode === "WITH_LEGAL_ENTITY" ? "border-[#eec54e] bg-[#eec54e]/5" : "border-slate-100 hover:border-slate-300")}
                >
                  <Building2 className={cn("w-6 h-6 mb-2", mode === "WITH_LEGAL_ENTITY" ? "text-[#eec54e]" : "text-slate-400")} />
                  <p className="text-[13px] font-bold text-slate-800">Có tư cách pháp nhân</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Dành cho công ty đã đăng ký kinh doanh chính thức.</p>
                </button>
                <button 
                  onClick={() => setMode("WITHOUT_LEGAL_ENTITY")}
                  className={cn("flex flex-col p-4 rounded-xl border-2 transition-all text-left group", mode === "WITHOUT_LEGAL_ENTITY" ? "border-[#eec54e] bg-[#eec54e]/5" : "border-slate-100 hover:border-slate-300")}
                >
                  <Users className={cn("w-6 h-6 mb-2", mode === "WITHOUT_LEGAL_ENTITY" ? "text-[#eec54e]" : "text-slate-400")} />
                  <p className="text-[13px] font-bold text-slate-800">Chưa có pháp nhân</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Dành cho dự án đang phát triển hoặc nhóm sáng lập.</p>
                </button>
              </div>
           </div>
        )}

        <div className="p-8 space-y-8">
          {/* Identity Fields */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-l-4 border-[#eec54e] pl-4">
               <h3 className="text-[15px] font-bold text-slate-900">Thông tin định danh</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-1.5 md:col-span-2">
                 <label className={labelCls}>{mode === "WITH_LEGAL_ENTITY" ? "Tên đầy đủ theo pháp luật" : "Tên dự án / Startup"}</label>
                 <input 
                   disabled={loading}
                   className={inputCls} 
                   value={mode === "WITH_LEGAL_ENTITY" ? legalName : legalName}
                   onChange={e => setLegalName(e.target.value)}
                   placeholder={mode === "WITH_LEGAL_ENTITY" ? "Vd: Công ty TNHH AISEP Việt Nam" : "Vd: Dự án Nông trại Thông minh"} 
                 />
               </div>
               {mode === "WITH_LEGAL_ENTITY" && (
                 <div className="space-y-1.5">
                    <label className={labelCls}>Mã số doanh nghiệp / MST</label>
                    <input disabled={loading} value={taxCode} onChange={e => setTaxCode(e.target.value)} className={inputCls} placeholder="10 chữ số" />
                 </div>
               )}
               <div className="space-y-1.5">
                  <label className={labelCls}>{mode === "WITH_LEGAL_ENTITY" ? "Người đại diện pháp luật" : "Người đại diện nhóm"}</label>
                  <input disabled={loading} value={repName} onChange={e => setRepName(e.target.value)} className={inputCls} placeholder="Họ và tên đầy đủ" />
               </div>
               <div className="space-y-1.5">
                  <label className={labelCls}>Chức vụ</label>
                  <input disabled={loading} value={repRole} onChange={e => setRepRole(e.target.value)} className={inputCls} placeholder="Vd: Founder, Giám đốc..." />
               </div>
               <div className="space-y-1.5">
                  <label className={labelCls}>Email liên hệ công việc</label>
                  <input disabled={loading} value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder="Email chính xác" />
               </div>
               <div className="space-y-1.5 md:col-span-2">
                  <label className={labelCls}>Website / Landing Page / LinkedIn</label>
                  <input disabled={loading} value={link} onChange={e => setLink(e.target.value)} className={inputCls} placeholder="https://..." />
               </div>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Evidence Fields */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-l-4 border-[#eec54e] pl-4">
               <h3 className="text-[15px] font-bold text-slate-900">Tài liệu minh chứng</h3>
            </div>
            
            <div className="space-y-4">
               <p className="text-[13px] text-slate-500 leading-relaxed">
                 {mode === "WITH_LEGAL_ENTITY" ? "Vui lòng đính kèm Giấy phép kinh doanh (quyết định thành lập) chính thức." : "Tải lên tài liệu chứng minh dự án đang hoạt động (Pitch deck, Screenshot sản phẩm, link GitHub...)."}
               </p>
               <KycFileUploader 
                 label={mode === "WITH_LEGAL_ENTITY" ? "Giấy phép kinh doanh" : "Tài liệu minh chứng dự án"}
                 limit={mode === "WITH_LEGAL_ENTITY" ? 1 : 3} 
                 onChange={setFiles}
               />
               <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-slate-400 mt-0.5" />
                  <p className="text-[11px] text-slate-400 leading-normal">
                    AISEP sử dụng quy chuẩn bảo mật AES-256 để bảo vệ tài liệu của bạn. Tài liệu chỉ được dùng cho mục đích xác thực danh tính.
                  </p>
               </div>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Commitment */}
          <div className="space-y-6">
            <div 
              onClick={() => !loading && setAgreed(!agreed)}
              className={cn("flex items-start gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer group", agreed ? "border-emerald-100 bg-emerald-50/30" : "border-slate-50 bg-slate-50/50 hover:border-slate-200")}
            >
               <div className={cn("size-6 rounded-lg border-2 flex items-center justify-center transition-all mt-0.5 shrink-0", agreed ? "bg-emerald-500 border-emerald-500" : "bg-white border-slate-300 group-hover:border-slate-400")}>
                  {agreed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
               </div>
               <div className="space-y-1">
                  <p className="text-[14px] font-bold text-slate-800">Cam kết tính trung thực</p>
                  <p className="text-[12px] text-slate-500 leading-relaxed">
                    Tôi xác nhận rằng mọi thông tin và tài liệu cung cấp trên là chính xác và hợp pháp. Tôi hoàn toàn chịu trách nhiệm nếu có bất kỳ sự sai lệch cố ý nào.
                  </p>
               </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="bg-slate-50/80 px-8 py-5 flex items-center justify-between gap-4">
           <p className="text-[11px] text-slate-400 hidden md:block">Kiểm tra kỹ thông tin trước khi nhấn nút.</p>
           <button 
             onClick={handleSubmit}
             disabled={loading || !agreed}
             className={cn("flex items-center gap-2.5 px-10 py-3.5 rounded-xl text-white font-bold text-[14px] transition-all shadow-lg active:scale-95 disabled:scale-100 disabled:opacity-50", loading ? "bg-slate-400" : "bg-[#0f172a] hover:bg-[#1e293b] shadow-slate-200")}
           >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isResubmit ? <Send className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
              {loading ? "Đang xử lý..." : isResubmit ? "Gửi lại hồ sơ" : "Nộp hồ sơ duyệt"}
           </button>
        </div>

      </div>
    </div>
  );
}
