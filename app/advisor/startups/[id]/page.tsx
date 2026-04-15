"use client";

import { AdvisorShell } from "@/components/advisor/advisor-shell";
import {
  ChevronRight,
  MapPin,
  Building2,
  TrendingUp,
  FileText,
  Sparkles,
  Bot,
  Shield,
  Loader2,
  Star,
  Briefcase,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Hash,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "@/services/interceptor";
import {
  startupFinNext,
  startupMedScanAI,
  startupEduPlatform,
  startupGreenLogistics
} from "@/services/advisor/advisor-consulting.mock";
import { GetStartupDocuments, ViewDocument } from "@/services/document/document.api";
import { cn } from "@/lib/utils";
import { Download, FolderOpen, RefreshCcw } from "lucide-react";

const MOCK_STARTUPS = [
  { ...startupFinNext, startupID: 101, companyName: startupFinNext.displayName, oneLiner: "Giải pháp quản lý tài chính thông minh cho SME." },
  { ...startupMedScanAI, startupID: 102, companyName: startupMedScanAI.displayName, oneLiner: "Chẩn đoán hình ảnh y tế bằng AI chính xác vượt trội." },
  { ...startupEduPlatform, startupID: 103, companyName: startupEduPlatform.displayName, oneLiner: "Cá nhân hóa lộ trình học tập cho sinh viên." },
  { ...startupGreenLogistics, startupID: 104, companyName: startupGreenLogistics.displayName, oneLiner: "Tối ưu hóa vận tải bền vững và tiết kiệm năng lượng." },
];

const MONOGRAM_PALETTES = [
  { bg: "bg-slate-100", text: "text-slate-600" },
  { bg: "bg-sky-50", text: "text-sky-600" },
  { bg: "bg-violet-50", text: "text-violet-600" },
  { bg: "bg-amber-50", text: "text-amber-600" },
  { bg: "bg-emerald-50", text: "text-emerald-600" },
  { bg: "bg-rose-50", text: "text-rose-600" },
  { bg: "bg-indigo-50", text: "text-indigo-600" },
  { bg: "bg-teal-50", text: "text-teal-600" },
];

function getMonogramPalette(id: number) {
  return MONOGRAM_PALETTES[id % MONOGRAM_PALETTES.length];
}

export default function AdvisorStartupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const startupId = Number(params.id);

  const [startup, setStartup] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "ai-report">("overview");
  const [startupDocs, setStartupDocs] = useState<IDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);

  const fetchStartup = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // For now, using mock or handling 404 gracefully if backend not ready
      const res = await axios.get(`/api/startups/${startupId}`);
      if (res.data && (res as any).success) {
        setStartup(res.data);
      } else {
        // Fallback for demo/dev if API returns 404
        throw new Error("API not found");
      }
    } catch {
      // MOCK FALLBACK for UI demo
      const matched = MOCK_STARTUPS.find(s => s.startupID === startupId);
      if (matched) {
        setStartup({
            ...matched,
            country: "Vietnam",
            location: matched.startupID === 101 ? "Hồ Chí Minh" : "Hà Nội",
            updatedAt: new Date().toISOString(),
            profileStatus: "Active"
        });
      } else {
        setError("Không tìm thấy thông tin startup. Vui lòng liên hệ quản trị viên.");
      }
    } finally {
      setLoading(false);
    }
  }, [startupId]);

  useEffect(() => { if (startupId) fetchStartup(); }, [startupId, fetchStartup]);

  useEffect(() => {
    if (!startupId || startupId <= 0) return;
    let cancelled = false;
    (async () => {
      setDocsLoading(true);
      try {
        const res = await GetStartupDocuments(startupId);
        if (!cancelled && res?.isSuccess) setStartupDocs(res.data ?? []);
      } catch { /* silent */ }
      finally { if (!cancelled) setDocsLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [startupId]);

  const getInitials = (name: string) => name.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase();

  if (loading) {
    return (
      <AdvisorShell>
        <div className="flex flex-col items-center justify-center py-32 text-slate-400">
          <Loader2 className="w-7 h-7 animate-spin mb-3" />
          <p className="text-[14px] font-normal">Đang tải thông tin startup...</p>
        </div>
      </AdvisorShell>
    );
  }

  if (error || !startup) {
    return (
      <AdvisorShell>
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-slate-800 font-semibold text-[16px] mb-1">{error || "Không tìm thấy startup"}</p>
          <button onClick={() => router.back()} className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
            Quay lại
          </button>
        </div>
      </AdvisorShell>
    );
  }

  const palette = getMonogramPalette(startup.startupID);

  return (
    <AdvisorShell>
      <div className="space-y-7">
        {/* Breadcrumbs (Handled by AdvisorShell but redundant check here if needed) */}
        
        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200/80 p-1 w-fit shadow-[0_1px_3px_rgba(0,0,0,0.03)] focus-within:ring-2 focus-within:ring-[#eec54e]/20">
          {(["overview", "ai-report"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${
                activeTab === tab
                  ? "bg-[#0f172a] text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tab === "overview" ? <Eye className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              {tab === "overview" ? "Tổng quan" : "AI Report"}
            </button>
          ))}
        </div>

        {activeTab === "overview" ? (
          <div className="grid grid-cols-12 gap-6">
            {/* ─── Left Column ─── */}
            <div className="col-span-12 lg:col-span-8 space-y-5">
              {/* Hero */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="h-28 bg-gradient-to-r from-[#e6cc4c]/5 via-[#e6cc4c]/10 to-[#e6cc4c]/5 relative">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:24px_24px]" />
                </div>
                <div className="px-7 pb-7 -mt-10 relative">
                  <div className="flex items-end gap-5 mb-5">
                    {startup.logoURL ? (
                      <img src={startup.logoURL} alt={startup.companyName} className="w-20 h-20 rounded-2xl object-cover border-[3px] border-white shadow-md" />
                    ) : (
                      <div className={`w-20 h-20 rounded-2xl ${palette.bg} flex items-center justify-center border-[3px] border-white shadow-md`}>
                        <span className={`${palette.text} font-semibold text-[22px] tracking-tight`}>{getInitials(startup.companyName)}</span>
                      </div>
                    )}
                    <div className="flex-1 pb-0.5">
                      <h1 className="text-[22px] font-bold text-[#0f172a] tracking-tight leading-tight">{startup.companyName}</h1>
                      <p className="text-[14px] text-slate-500 mt-1 font-normal leading-relaxed italic">"{startup.oneLiner || "Chưa có khẩu hiệu"}"</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 text-[11px] font-semibold text-slate-600 border border-slate-100">
                      <Building2 className="w-3 h-3 text-slate-400" />
                      {startup.industry}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-50 text-[11px] font-semibold text-slate-500 border border-slate-100">{startup.subIndustry}</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100/60">
                      <TrendingUp className="w-3 h-3" />
                      {startup.stage}
                    </span>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-5">
                    {[
                      { icon: MapPin, label: "Vị trí", value: startup.location ? `${startup.location}${startup.country ? `, ${startup.country}` : ""}` : "N/A" },
                      { icon: Clock, label: "Cập nhật", value: startup.updatedAt ? new Date(startup.updatedAt).toLocaleDateString("vi-VN") : "Gần đây" },
                      { icon: Hash, label: "ID Startup", value: `#${startup.startupID}` },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                          <item.icon className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.label}</p>
                          <p className="text-[13px] text-slate-800 font-semibold truncate">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Startup Profile Details */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-7">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100/60">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <h2 className="text-[16px] font-bold text-[#0f172a]">Thông tin chi tiết</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-2">Về mô hình kinh doanh</h3>
                    <p className="text-[14px] text-slate-600 leading-relaxed">
                      {startup.companyName} tập trung giải quyết các bài toán trong lĩnh vực {startup.industry}. 
                      Sản phẩm hiện đang ở giai đoạn {startup.stage} với mục tiêu tối ưu hóa trải nghiệm người dùng và mở rộng quy mô thị trường.
                      Hệ thống đang tích cực tìm kiếm sự hỗ trợ từ các chuyên gia để hoàn thiện lộ trình phát triển.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-50">
                    <div>
                      <p className="text-[11px] text-slate-400 font-bold uppercase mb-1">Vòng gọi vốn</p>
                      <p className="text-[14px] font-semibold text-slate-800">{startup.fundingStage || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-bold uppercase mb-1">Trạng thái hồ sơ</p>
                      <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                        {startup.profileStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents Data Room */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100/60">
                      <FolderOpen className="w-4 h-4 text-amber-600" />
                    </div>
                    <h2 className="text-[16px] font-bold text-[#0f172a]">Tài liệu Data Room</h2>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">{startupDocs.length} tài liệu</span>
                </div>
                <div className="px-7 py-5">
                  {docsLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <RefreshCcw className="w-4 h-4 text-slate-300 animate-spin" />
                      <span className="ml-2 text-[12px] text-slate-400">Đang tải...</span>
                    </div>
                  ) : startupDocs.length === 0 ? (
                    <div className="text-center py-6">
                      <FolderOpen className="w-6 h-6 text-slate-200 mx-auto mb-2" />
                      <p className="text-[13px] text-slate-400">Chưa có tài liệu nào được chia sẻ</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {startupDocs.map((doc) => {
                        const docType = (doc.documentType ?? "").toLowerCase();
                        const color = docType.includes("pitch") ? "text-red-500"
                          : docType.includes("business") || docType.includes("financ") ? "text-green-500"
                          : docType.includes("legal") ? "text-blue-500"
                          : "text-slate-500";
                        const label = docType.includes("pitch") ? "Pitch Deck"
                          : docType.includes("business") ? "Business Plan"
                          : docType.includes("financ") ? "Tài chính"
                          : docType.includes("legal") ? "Pháp lý"
                          : doc.documentType ?? "Khác";
                        const uploadDate = doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString("vi-VN") : "—";

                        return (
                          <div key={doc.documentID} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:bg-slate-50 hover:border-[#eec54e]/40 transition-all group">
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center border border-slate-100 group-hover:bg-[#eec54e]/10 transition-colors flex-shrink-0">
                                <FileText className={cn("w-5 h-5", color)} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[14px] font-semibold text-slate-700 group-hover:text-[#0f172a] transition-colors truncate">{doc.title ?? "Untitled"}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{label} • {uploadDate} • v{doc.version ?? "1"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
                              {doc.fileUrl && (
                                <a
                                  href={/\.pdf(\?|$)/i.test(doc.fileUrl)
                                    ? doc.fileUrl
                                    : `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(doc.fileUrl)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => { ViewDocument(doc.documentID).catch(() => {}); }}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                                  title="Xem tài liệu"
                                >
                                  <Eye className="w-4 h-4" />
                                </a>
                              )}
                              <button
                                onClick={async () => {
                                  try {
                                    const token = localStorage.getItem("accessToken") ?? "";
                                    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/documents/${doc.documentID}/download`, {
                                      headers: { Authorization: `Bearer ${token}` },
                                    });
                                    if (!res.ok) throw new Error("Download failed");
                                    const blob = await res.blob();
                                    const cd = res.headers.get("content-disposition");
                                    const match = cd?.match(/filename="?(.+?)"?$/);
                                    const fileName = match?.[1] ?? `${doc.title ?? "document"}.pdf`;
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement("a");
                                    a.href = url; a.download = fileName;
                                    document.body.appendChild(a); a.click();
                                    document.body.removeChild(a);
                                    URL.revokeObjectURL(url);
                                  } catch {
                                    // silent — toast not available in advisor shell
                                  }
                                }}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-[#eec54e]/10 hover:text-[#eec54e] transition-all"
                                title="Tải xuống"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ─── Right Column ─── */}
            <div className="col-span-12 lg:col-span-4 space-y-5">
              {/* Startup Context for Advisor */}
              <div className="bg-[#0f172a] rounded-2xl p-6 text-white overflow-hidden relative group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#e6cc4c]/10 rounded-full blur-2xl group-hover:bg-[#e6cc4c]/20 transition-all duration-500" />
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
                    <Sparkles className="w-4 h-4 text-[#e6cc4c]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[14px] tracking-tight">AI Insight</h3>
                    <p className="text-[9px] text-white/40 font-black uppercase tracking-[0.1em]">Consultancy Match</p>
                  </div>
                </div>
                <div className="space-y-4 mb-6">
                  <p className="text-[12px] text-white/70 leading-relaxed">
                    Dựa trên chuyên môn của bạn, Startup này có mức độ phù hợp <span className="text-[#e6cc4c] font-bold">85%</span> cho các vấn đề về <span className="text-[#e6cc4c] font-medium">{startup.industry} strategy</span>.
                  </p>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[11px] font-bold text-[#e6cc4c] mb-1">Gợi ý chủ đề tư vấn:</p>
                    <ul className="text-[11px] text-white/50 space-y-1 list-disc ml-3">
                      <li>Tối ưu hóa roadmap sản phẩm</li>
                      <li>Chiến lược thâm nhập thị trường</li>
                      <li>Hoàn thiện Pitch Deck cho vòng tiếp theo</li>
                    </ul>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveTab("ai-report")}
                  className="w-full h-10 flex items-center justify-center gap-2 bg-[#e6cc4c] hover:bg-[#efd354] text-[#0f172a] font-bold text-[13px] rounded-xl transition-all shadow-lg shadow-[#e6cc4c]/5 active:scale-[0.98]"
                >
                  <Bot className="w-4 h-4" />
                  Xem AI Analysis
                </button>
              </div>

              {/* Security & Verification */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100/60">
                    <Shield className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[13px] text-slate-800">Xác thực hệ thống</h3>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Blockchain Verified</p>
                  </div>
                </div>
                <p className="text-[12px] text-slate-500 leading-relaxed mb-4">
                  Toàn bộ hồ sơ và tài liệu của Startup này đã được xác thực minh bạch qua hệ thống blockchain AISEP.
                </p>
                <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50/50 rounded-lg border border-emerald-100/50 w-fit">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-tight">Dữ liệu an toàn</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ═══ AI REPORT TAB ═══ */
          <div className="max-w-3xl mx-auto py-4">
             <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-[#0f172a] flex items-center justify-center shadow-lg shadow-[#0f172a]/10">
                    <Bot className="w-6 h-6 text-[#e6cc4c]" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-bold text-[#0f172a]">Báo cáo Phân tích AI</h2>
                    <p className="text-[13px] text-slate-400">Tự động tạo bởi AISEP Intelligence Engine</p>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-3">
                        <Sparkles className="w-5 h-5 text-[#e6cc4c]/30" />
                    </div>
                    <h3 className="text-[14px] font-bold text-slate-700 mb-2">Tóm tắt đánh giá</h3>
                    <p className="text-[14px] text-slate-600 leading-relaxed">
                        Startup <span className="font-bold text-slate-900">{startup.companyName}</span> thể hiện sự sắc bén trong việc chọn thị trường mục tiêu. 
                        Đội ngũ đã xây dựng được MVP ổn định và có những tín hiệu tích cực đầu tiên về market-fit. 
                        Điểm yếu hiện tại nằm ở chiến lược mở rộng quy mô (scaling) và cần một lộ trình tài chính cụ thể hơn cho các vòng tiếp theo.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-1">Chỉ số sức khỏe Startup</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { label: "Tiềm năng thị trường", score: 85, color: "text-[#e6cc4c]", bg: "bg-[#e6cc4c]" },
                          { label: "Năng lực công nghệ", score: 70, color: "text-emerald-500", bg: "bg-emerald-500" },
                          { label: "Traction & Tăng trưởng", score: 65, color: "text-blue-500", bg: "bg-blue-500" },
                          { label: "Mức độ sẵn sàng đầu tư", score: 45, color: "text-rose-500", bg: "bg-rose-500" },
                        ].map((m) => (
                          <div key={m.label} className="p-4 rounded-xl border border-slate-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[12px] font-semibold text-slate-600">{m.label}</span>
                                <span className={cn("text-[14px] font-bold", m.color)}>{m.score}/100</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-50 overflow-hidden">
                                <div className={cn("h-full rounded-full transition-all duration-1000", m.bg)} style={{ width: `${m.score}%` }} />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <h3 className="text-[14px] font-bold text-slate-900">Khuyến nghị lộ trình</h3>
                    </div>
                    <div className="space-y-3">
                        {[
                            "Tập trung hoàn thiện mô hình doanh thu để tăng điểm Readiness.",
                            "Mở rộng mạng lưới đối tác chiến lược trong ngành EdTech.",
                            "Tăng cường thu thập phản hồi người dùng cho các tính năng AI trọng tâm."
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 text-[13px] text-slate-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#e6cc4c] shrink-0" />
                                {item}
                            </div>
                        ))}
                    </div>
                  </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </AdvisorShell>
  );
}
