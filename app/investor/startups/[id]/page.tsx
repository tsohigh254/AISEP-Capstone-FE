"use client";

import { InvestorShell } from "@/components/investor/investor-shell";
import {
  ChevronRight,
  MapPin,
  Building2,
  TrendingUp,
  FileText,
  Heart,
  GitCompare,
  Send,
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
  ArrowUpRight,
  Hash,
  X,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { SearchStartups, AddToWatchlist } from "@/services/investor/investor.api";
import { CreateConnection } from "@/services/connection/connection.api";

// ── Mock data ──
const MOCK_STARTUPS: IStartupSearchItem[] = [
  { startupID: 1, companyName: "NeuralViet AI", oneLiner: "Nền tảng AI tự động hoá quy trình doanh nghiệp Việt Nam, giúp tiết kiệm 60% chi phí vận hành.", stage: "Seed", industry: "AI & Machine Learning", subIndustry: "Enterprise AI", location: "Hồ Chí Minh", country: "Vietnam", logoURL: "", fundingStage: "Seed", profileStatus: "Active", updatedAt: "2026-03-15T10:00:00Z" },
  { startupID: 2, companyName: "PayGo Finance", oneLiner: "Ví điện tử và giải pháp thanh toán không tiền mặt cho thị trường nông thôn Đông Nam Á.", stage: "Series A", industry: "FinTech", subIndustry: "Digital Payments", location: "Hà Nội", country: "Vietnam", logoURL: "", fundingStage: "Series A", profileStatus: "Active", updatedAt: "2026-03-12T08:30:00Z" },
  { startupID: 3, companyName: "MediScan", oneLiner: "Ứng dụng chẩn đoán hình ảnh y tế bằng AI, hỗ trợ bác sĩ phát hiện sớm ung thư với độ chính xác 95%.", stage: "Pre-Seed", industry: "HealthTech", subIndustry: "Medical Imaging", location: "Đà Nẵng", country: "Vietnam", logoURL: "", fundingStage: "Angel", profileStatus: "Active", updatedAt: "2026-03-10T14:20:00Z" },
  { startupID: 4, companyName: "EduNova", oneLiner: "Nền tảng học tập cá nhân hoá dùng AI, adaptive learning cho học sinh K-12.", stage: "Seed", industry: "EdTech", subIndustry: "K-12 Learning", location: "Hồ Chí Minh", country: "Vietnam", logoURL: "", fundingStage: "Pre-Seed", profileStatus: "Active", updatedAt: "2026-03-08T09:15:00Z" },
  { startupID: 5, companyName: "GreenFarm IoT", oneLiner: "Hệ thống IoT giám sát và tự động hoá canh tác nông nghiệp thông minh.", stage: "Idea", industry: "AgriTech", subIndustry: "Smart Farming", location: "Cần Thơ", country: "Vietnam", logoURL: "", fundingStage: "Bootstrapped", profileStatus: "Draft", updatedAt: "2026-03-05T16:45:00Z" },
  { startupID: 6, companyName: "ShopeeX Logistics", oneLiner: "Giải pháp giao hàng last-mile bằng drone và xe tự hành cho thương mại điện tử.", stage: "Series A", industry: "E-Commerce", subIndustry: "Logistics", location: "Hồ Chí Minh", country: "Vietnam", logoURL: "", fundingStage: "Series A", profileStatus: "Active", updatedAt: "2026-03-14T11:30:00Z" },
  { startupID: 7, companyName: "CloudBase", oneLiner: "Nền tảng SaaS quản lý dữ liệu đám mây cho doanh nghiệp SME tại Việt Nam.", stage: "Seed", industry: "SaaS", subIndustry: "Cloud Infrastructure", location: "Hà Nội", country: "Vietnam", logoURL: "", fundingStage: "Seed", profileStatus: "Active", updatedAt: "2026-03-13T07:00:00Z" },
  { startupID: 8, companyName: "SolarVN Energy", oneLiner: "Giải pháp năng lượng mặt trời và pin lưu trữ cho hộ gia đình và doanh nghiệp nhỏ.", stage: "Series B", industry: "CleanTech", subIndustry: "Solar Energy", location: "Bình Dương", country: "Vietnam", logoURL: "", fundingStage: "Series B", profileStatus: "Active", updatedAt: "2026-03-11T13:00:00Z" },
  { startupID: 9, companyName: "PropMatch", oneLiner: "Nền tảng kết nối chủ đầu tư bất động sản với nhà đầu tư, sử dụng AI matching.", stage: "Pre-Seed", industry: "PropTech", subIndustry: "Real Estate Marketplace", location: "Hồ Chí Minh", country: "Vietnam", logoURL: "", fundingStage: "Angel", profileStatus: "Active", updatedAt: "2026-03-09T15:30:00Z" },
  { startupID: 10, companyName: "InsureEasy", oneLiner: "Bảo hiểm số micro-insurance cho người lao động và freelancer tại Đông Nam Á.", stage: "Seed", industry: "InsurTech", subIndustry: "Micro Insurance", location: "Hà Nội", country: "Vietnam", logoURL: "", fundingStage: "Seed", profileStatus: "Active", updatedAt: "2026-03-07T10:45:00Z" },
  { startupID: 11, companyName: "VoiceAI Lab", oneLiner: "Công nghệ nhận dạng giọng nói tiếng Việt, chatbot và trợ lý ảo cho doanh nghiệp.", stage: "Series A", industry: "AI & Machine Learning", subIndustry: "NLP / Voice", location: "Hồ Chí Minh", country: "Vietnam", logoURL: "", fundingStage: "Series A", profileStatus: "Active", updatedAt: "2026-03-16T09:00:00Z" },
  { startupID: 12, companyName: "WealthBot", oneLiner: "Robo-advisor quản lý tài sản cá nhân với AI, đầu tư tự động cho nhà đầu tư nhỏ lẻ.", stage: "Pre-Seed", industry: "FinTech", subIndustry: "WealthTech", location: "Đà Nẵng", country: "Vietnam", logoURL: "", fundingStage: "Pre-Seed", profileStatus: "Draft", updatedAt: "2026-03-06T12:00:00Z" },
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

export default function StartupDetailPage() {
  const router = useRouter();
  const params = useParams();
  const startupId = Number(params.id);

  const [startup, setStartup] = useState<IStartupSearchItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "ai-report">("overview");
  const [watchlistAdded, setWatchlistAdded] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectSent, setConnectSent] = useState(false);
  const [connectMessage, setConnectMessage] = useState("");
  const [showConnectModal, setShowConnectModal] = useState(false);

  const fetchStartup = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = (await SearchStartups(1, 100)) as unknown as IBackendRes<IPaginatedRes<IStartupSearchItem>>;
      if (res.success && res.data) {
        const found = (res.data.items ?? []).find((s) => s.startupID === startupId);
        if (found) { setStartup(found); } else {
          const m = MOCK_STARTUPS.find((s) => s.startupID === startupId);
          setStartup(m || null);
          if (!m) setError("Không tìm thấy startup này.");
        }
      } else {
        const m = MOCK_STARTUPS.find((s) => s.startupID === startupId);
        setStartup(m || null);
        if (!m) setError("Không tìm thấy startup này.");
      }
    } catch {
      const m = MOCK_STARTUPS.find((s) => s.startupID === startupId);
      setStartup(m || null);
      if (!m) setError("Không tìm thấy startup này.");
    } finally {
      setLoading(false);
    }
  }, [startupId]);

  useEffect(() => { if (startupId) fetchStartup(); }, [startupId, fetchStartup]);

  const handleAddToWatchlist = async () => {
    if (!startup || watchlistAdded) return;
    setWatchlistLoading(true);
    try { await AddToWatchlist({ startupId: startup.startupID, watchReason: "Quan tâm từ trang chi tiết", priority: "High" }); setWatchlistAdded(true); } catch {} finally { setWatchlistLoading(false); }
  };

  const handleConnect = async () => {
    if (!startup || connectSent) return;
    setConnectLoading(true);
    try { await CreateConnection({ startupId: startup.startupID, message: connectMessage || `Xin chào, tôi quan tâm đến ${startup.companyName} và muốn tìm hiểu thêm.` }); setConnectSent(true); setShowConnectModal(false); } catch {} finally { setConnectLoading(false); }
  };

  const getInitials = (name: string) => name.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase();

  if (loading) {
    return (
      <InvestorShell>
        <div className="flex flex-col items-center justify-center py-32 text-slate-400">
          <Loader2 className="w-7 h-7 animate-spin mb-3" />
          <p className="text-[14px] font-normal">Đang tải thông tin startup...</p>
        </div>
      </InvestorShell>
    );
  }

  if (error || !startup) {
    return (
      <InvestorShell>
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <p className="text-slate-800 font-semibold text-[16px] mb-1">{error || "Không tìm thấy startup"}</p>
          <button onClick={() => router.push("/investor/startups")} className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
            Quay lại danh sách
          </button>
        </div>
      </InvestorShell>
    );
  }

  const palette = getMonogramPalette(startup.startupID);

  return (
    <InvestorShell>
      <div className="space-y-7">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-[13px]">
          <button onClick={() => router.push("/investor")} className="text-slate-400 hover:text-slate-600 transition-colors font-normal">Workspace</button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <button onClick={() => router.push("/investor/startups")} className="text-slate-400 hover:text-slate-600 transition-colors font-normal">Khám phá Startup</button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-800 font-medium">{startup.companyName}</span>
        </nav>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200/80 p-1 w-fit shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
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
                <div className="h-28 bg-gradient-to-r from-slate-50 via-slate-100/50 to-slate-50 relative">
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:24px_24px]" />
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
                      <h1 className="text-[22px] font-semibold text-[#0f172a] tracking-[-0.02em] leading-tight">{startup.companyName}</h1>
                      <p className="text-[14px] text-slate-500 mt-1 font-normal leading-relaxed">{startup.oneLiner || "Chưa có mô tả ngắn"}</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {startup.industry && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 text-[11px] font-medium text-slate-600 border border-slate-100">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {startup.industry}
                      </span>
                    )}
                    {startup.subIndustry && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-50 text-[11px] font-medium text-slate-500 border border-slate-100">{startup.subIndustry}</span>
                    )}
                    {startup.stage && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100/60">
                        <TrendingUp className="w-3 h-3" />
                        {startup.stage}
                      </span>
                    )}
                    {startup.fundingStage && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium text-violet-600 bg-violet-50/70 border border-violet-100/60">
                        <DollarSign className="w-3 h-3" />
                        {startup.fundingStage}
                      </span>
                    )}
                    {startup.profileStatus && (
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium border ${startup.profileStatus === "Active" ? "text-emerald-700 bg-emerald-50 border-emerald-100/60" : "text-slate-500 bg-slate-50 border-slate-100"}`}>
                        <CheckCircle2 className="w-3 h-3" />
                        {startup.profileStatus}
                      </span>
                    )}
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { icon: MapPin, label: "Vị trí", value: startup.location ? `${startup.location}${startup.country ? `, ${startup.country}` : ""}` : null },
                      { icon: Clock, label: "Cập nhật", value: startup.updatedAt ? new Date(startup.updatedAt).toLocaleDateString("vi-VN") : null },
                      { icon: Hash, label: "ID", value: `#${startup.startupID}` },
                    ].filter(i => i.value).map((item) => (
                      <div key={item.label} className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                          <item.icon className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-400 font-medium">{item.label}</p>
                          <p className="text-[13px] text-slate-800 font-medium">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Business Info */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-7">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                    <Briefcase className="w-4 h-4 text-slate-500" />
                  </div>
                  <h2 className="text-[16px] font-semibold text-[#0f172a] tracking-[-0.01em]">Thông tin kinh doanh</h2>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                  {[
                    { label: "Lĩnh vực", value: startup.industry },
                    { label: "Vòng gọi vốn", value: startup.fundingStage },
                    { label: "Lĩnh vực phụ", value: startup.subIndustry },
                    { label: "Trạng thái hồ sơ", value: startup.profileStatus },
                    { label: "Giai đoạn phát triển", value: startup.stage },
                    { label: "Quốc gia", value: startup.country },
                  ].map((field) => (
                    <div key={field.label}>
                      <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-[0.04em] mb-1">{field.label}</p>
                      <p className="text-[14px] text-slate-800 font-normal">{field.value || "Chưa cập nhật"}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-7">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                    <FileText className="w-4 h-4 text-slate-500" />
                  </div>
                  <h2 className="text-[16px] font-semibold text-[#0f172a] tracking-[-0.01em]">Mô tả Startup</h2>
                </div>
                <p className="text-[14px] text-slate-600 leading-[1.7] font-normal">
                  {startup.oneLiner || "Startup này chưa cập nhật mô tả chi tiết. Bạn có thể gửi yêu cầu kết nối để tìm hiểu thêm."}
                </p>
              </div>
            </div>

            {/* ─── Right Column ─── */}
            <div className="col-span-12 lg:col-span-4 space-y-5">
              {/* AI Snapshot */}
              <div className="bg-[#0f172a] rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#e6cc4c]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[14px] tracking-tight">AI Snapshot</h3>
                    <p className="text-[10px] text-white/40 font-medium uppercase tracking-[0.06em]">Powered by AISEP AI</p>
                  </div>
                </div>
                <div className="space-y-3.5 mb-5">
                  {[
                    { label: "Tiềm năng tăng trưởng", pct: 75, color: "bg-[#e6cc4c]" },
                    { label: "Mức độ phù hợp", pct: 82, color: "bg-emerald-400" },
                    { label: "Độ tin cậy dữ liệu", pct: 60, color: "bg-violet-400" },
                  ].map((m) => (
                    <div key={m.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[12px] text-white/50 font-normal">{m.label}</span>
                        <span className="text-[12px] font-semibold text-white/80">{m.pct}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10">
                        <div className={`h-full rounded-full ${m.color}`} style={{ width: `${m.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setActiveTab("ai-report")} className="w-full flex items-center justify-center gap-2 bg-[#e6cc4c] hover:bg-[#d4b84a] text-[#0f172a] font-semibold text-[13px] rounded-xl h-10 transition-colors">
                  <Bot className="w-4 h-4" />
                  Xem AI Report đầy đủ
                </button>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
                <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-[0.04em] mb-3.5">Thao tác nhanh</p>
                <div className="space-y-2">
                  <ActionButton icon={watchlistLoading ? Loader2 : Heart} label={watchlistAdded ? "Đã thêm vào Watchlist" : "Thêm vào Watchlist"} onClick={handleAddToWatchlist} disabled={watchlistAdded || watchlistLoading} done={watchlistAdded} spinning={watchlistLoading} />
                  <ActionButton icon={GitCompare} label="So sánh với Startup khác" onClick={() => router.push(`/investor/compare?ids=${startup.startupID}`)} />
                  <ActionButton icon={connectSent ? CheckCircle2 : Send} label={connectSent ? "Đã gửi yêu cầu kết nối" : "Gửi yêu cầu kết nối"} onClick={() => setShowConnectModal(true)} disabled={connectSent} done={connectSent} primary={!connectSent} />
                </div>
              </div>

              {/* Blockchain */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100/60">
                    <Shield className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[13px] text-slate-800">Xác minh Blockchain</h3>
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.04em]">Document Verification</p>
                  </div>
                </div>
                <p className="text-[12px] text-slate-500 leading-relaxed font-normal mb-3">
                  Tài liệu của startup này được xác minh trên blockchain, đảm bảo tính toàn vẹn và minh bạch dữ liệu.
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-medium text-emerald-600">Hệ thống đang hoạt động</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ═══ AI REPORT TAB ═══ */
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8 space-y-5">
              {/* AI Summary */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-7">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-lg bg-[#0f172a] flex items-center justify-center">
                    <Bot className="w-4 h-4 text-[#e6cc4c]" />
                  </div>
                  <div>
                    <h2 className="text-[16px] font-semibold text-[#0f172a] tracking-[-0.01em]">AI Analysis Report</h2>
                    <p className="text-[12px] text-slate-400 font-normal">Phân tích tự động bởi AISEP AI Engine</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-5 mb-6 border border-slate-100">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-[#e6cc4c] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[13px] font-semibold text-slate-700 mb-1">Tóm tắt AI</p>
                      <p className="text-[13px] text-slate-500 leading-[1.7]">
                        <strong className="text-slate-700">{startup.companyName}</strong> là startup hoạt động trong lĩnh vực <strong className="text-slate-700">{startup.industry || "công nghệ"}</strong>, giai đoạn <strong className="text-slate-700">{startup.stage || "phát triển"}</strong>.
                        {startup.location && <> Trụ sở tại <strong className="text-slate-700">{startup.location}{startup.country ? `, ${startup.country}` : ""}</strong>.</>}
                        {startup.fundingStage && <> Vòng gọi vốn <strong className="text-slate-700">{startup.fundingStage}</strong>.</>}
                        {" "}Startup thể hiện tiềm năng phát triển tốt dựa trên các chỉ số AI.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-[0.04em] mb-4">Chi tiết đánh giá</p>
                <div className="space-y-4">
                  {[
                    { label: "Tiềm năng thị trường", score: 78, color: "bg-[#e6cc4c]", desc: "Thị trường đang tăng trưởng với quy mô lớn" },
                    { label: "Đội ngũ sáng lập", score: 72, color: "bg-emerald-400", desc: "Đội ngũ có kinh nghiệm trong lĩnh vực" },
                    { label: "Mô hình kinh doanh", score: 68, color: "bg-violet-400", desc: "Mô hình có khả năng mở rộng" },
                    { label: "Lợi thế cạnh tranh", score: 65, color: "bg-sky-400", desc: "Có một số điểm khác biệt so với đối thủ" },
                    { label: "Traction & KPIs", score: 55, color: "bg-orange-400", desc: "Đang phát triển, cần thêm dữ liệu" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[13px] font-medium text-slate-700">{item.label}</span>
                        <span className="text-[13px] font-semibold text-slate-800">{item.score}/100</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${item.color} transition-all duration-500`} style={{ width: `${item.score}%` }} />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 font-normal">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-7">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100/60">
                    <Star className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h2 className="text-[16px] font-semibold text-[#0f172a] tracking-[-0.01em]">Khuyến nghị từ AI</h2>
                </div>
                <div className="space-y-2.5">
                  {[
                    { type: "positive" as const, text: "Startup hoạt động trong lĩnh vực có tốc độ tăng trưởng cao, phù hợp với xu hướng thị trường." },
                    { type: "positive" as const, text: "Hồ sơ đang hoạt động và được cập nhật thường xuyên, cho thấy sự cam kết với nền tảng." },
                    { type: "warning" as const, text: "Cần xem xét thêm các chỉ số tài chính và traction trước khi đưa ra quyết định đầu tư." },
                    { type: "info" as const, text: "Nên gửi yêu cầu kết nối để nhận thêm tài liệu chi tiết về mô hình kinh doanh." },
                  ].map((rec, i) => (
                    <div key={i} className={`flex items-start gap-3 px-4 py-3 rounded-xl text-[13px] ${
                      rec.type === "positive" ? "bg-emerald-50/60 border border-emerald-100/60" :
                      rec.type === "warning" ? "bg-amber-50/60 border border-amber-100/60" :
                      "bg-sky-50/60 border border-sky-100/60"
                    }`}>
                      {rec.type === "positive" ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> :
                       rec.type === "warning" ? <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" /> :
                       <Sparkles className="w-4 h-4 text-sky-500 mt-0.5 shrink-0" />}
                      <p className={`font-normal leading-relaxed ${
                        rec.type === "positive" ? "text-emerald-700" :
                        rec.type === "warning" ? "text-amber-700" :
                        "text-sky-700"
                      }`}>{rec.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-span-12 lg:col-span-4 space-y-5">
              {/* Overall Score */}
              <div className="bg-[#0f172a] rounded-2xl p-6 text-white text-center">
                <p className="text-[10px] text-white/40 font-semibold uppercase tracking-[0.06em] mb-4">AI Overall Score</p>
                <div className="w-28 h-28 mx-auto rounded-full flex items-center justify-center mb-3 relative">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                    <circle cx="60" cy="60" r="52" fill="none" stroke="#e6cc4c" strokeWidth="6" strokeDasharray={`${(72 / 100) * 2 * Math.PI * 52} ${2 * Math.PI * 52}`} strokeLinecap="round" />
                  </svg>
                  <span className="text-[32px] font-semibold text-[#e6cc4c]">72</span>
                </div>
                <p className="text-[13px] font-medium text-white/70">Khá tốt</p>
                <p className="text-[10px] text-white/30 font-normal mt-1">Dựa trên phân tích 5 tiêu chí</p>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
                <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-[0.04em] mb-3.5">Thao tác nhanh</p>
                <div className="space-y-2">
                  <ActionButton icon={watchlistLoading ? Loader2 : Heart} label={watchlistAdded ? "Đã thêm vào Watchlist" : "Thêm vào Watchlist"} onClick={handleAddToWatchlist} disabled={watchlistAdded || watchlistLoading} done={watchlistAdded} spinning={watchlistLoading} />
                  <ActionButton icon={connectSent ? CheckCircle2 : Send} label={connectSent ? "Đã gửi yêu cầu" : "Gửi yêu cầu kết nối"} onClick={() => setShowConnectModal(true)} disabled={connectSent} done={connectSent} primary={!connectSent} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Connect Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                  <Send className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-[15px] text-[#0f172a]">Gửi yêu cầu kết nối</h3>
                  <p className="text-[12px] text-slate-400 font-normal">{startup.companyName}</p>
                </div>
              </div>
              <button onClick={() => setShowConnectModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-[13px] font-medium text-slate-700 mb-2">Lời nhắn</label>
              <textarea
                value={connectMessage}
                onChange={(e) => setConnectMessage(e.target.value)}
                placeholder={`Xin chào, tôi quan tâm đến ${startup.companyName} và muốn tìm hiểu thêm về cơ hội đầu tư...`}
                className="w-full h-32 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 resize-none font-normal transition-all"
              />
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowConnectModal(false)} className="flex-1 h-10 rounded-xl text-[13px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">Huỷ</button>
              <button onClick={handleConnect} disabled={connectLoading} className="flex-1 h-10 rounded-xl text-[13px] font-semibold bg-[#0f172a] text-white hover:bg-[#1e293b] transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50">
                {connectLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Gửi yêu cầu
              </button>
            </div>
          </div>
        </div>
      )}
    </InvestorShell>
  );
}

/* ─── Action Button Subcomponent ─── */
function ActionButton({ icon: Icon, label, onClick, disabled, done, primary, spinning }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; onClick?: () => void; disabled?: boolean; done?: boolean; primary?: boolean; spinning?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
        done
          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
          : primary
          ? "bg-[#0f172a] text-white hover:bg-[#1e293b]"
          : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-100 hover:border-slate-200"
      } disabled:opacity-60 disabled:pointer-events-none`}
    >
      <Icon className={`w-4 h-4 ${spinning ? "animate-spin" : ""} ${done ? "fill-emerald-500 text-emerald-500" : ""}`} />
      {label}
    </button>
  );
}
