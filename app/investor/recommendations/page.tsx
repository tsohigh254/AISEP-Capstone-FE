"use client";

import { InvestorShell } from "@/components/investor/investor-shell";
import {
  MapPin,
  Search,
  Sparkles,
  Eye,
  Loader2,
  X,
  ArrowUpRight,
  Bot,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GetRecommendations } from "@/services/investor/investor.api";

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

const MOCK_RECS: IStartupSearchItem[] = [
  { startupID: 1, companyName: "NeuralViet AI", oneLiner: "Nền tảng AI tự động hoá quy trình doanh nghiệp Việt Nam, giúp tiết kiệm 60% chi phí vận hành.", stage: "Seed", industry: "AI & Machine Learning", subIndustry: "Enterprise AI", location: "Hồ Chí Minh", country: "Vietnam", logoURL: "", fundingStage: "Seed", profileStatus: "Active", updatedAt: "2026-03-15T10:00:00Z" },
  { startupID: 2, companyName: "PayGo Finance", oneLiner: "Ví điện tử và giải pháp thanh toán không tiền mặt cho thị trường nông thôn Đông Nam Á.", stage: "Series A", industry: "FinTech", subIndustry: "Digital Payments", location: "Hà Nội", country: "Vietnam", logoURL: "", fundingStage: "Series A", profileStatus: "Active", updatedAt: "2026-03-12T08:30:00Z" },
  { startupID: 3, companyName: "MediScan", oneLiner: "Ứng dụng chẩn đoán hình ảnh y tế bằng AI, hỗ trợ bác sĩ phát hiện sớm ung thư.", stage: "Pre-Seed", industry: "HealthTech", subIndustry: "Medical Imaging", location: "Đà Nẵng", country: "Vietnam", logoURL: "", fundingStage: "Angel", profileStatus: "Active", updatedAt: "2026-03-10T14:20:00Z" },
  { startupID: 8, companyName: "SolarVN Energy", oneLiner: "Giải pháp năng lượng mặt trời và pin lưu trữ cho hộ gia đình và doanh nghiệp nhỏ.", stage: "Series B", industry: "CleanTech", subIndustry: "Solar Energy", location: "Bình Dương", country: "Vietnam", logoURL: "", fundingStage: "Series B", profileStatus: "Active", updatedAt: "2026-03-11T13:00:00Z" },
  { startupID: 11, companyName: "VoiceAI Lab", oneLiner: "Công nghệ nhận dạng giọng nói tiếng Việt, chatbot và trợ lý ảo cho doanh nghiệp.", stage: "Series A", industry: "AI & Machine Learning", subIndustry: "NLP / Voice", location: "Hồ Chí Minh", country: "Vietnam", logoURL: "", fundingStage: "Series A", profileStatus: "Active", updatedAt: "2026-03-16T09:00:00Z" },
];

export default function AIRecommendationsPage() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<IStartupSearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStartup, setSelectedStartup] = useState<IStartupSearchItem | null>(null);

  const fetchRecommendations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = (await GetRecommendations()) as unknown as IBackendRes<any>;
      if (res.success && res.data) {
        const items: IStartupSearchItem[] = Array.isArray(res.data) ? res.data : Array.isArray(res.data.items) ? res.data.items : [];
        if (items.length > 0) { setRecommendations(items); } else { setRecommendations(MOCK_RECS); }
      } else {
        setRecommendations(MOCK_RECS);
      }
    } catch {
      setRecommendations(MOCK_RECS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRecommendations(); }, [fetchRecommendations]);

  const filtered = recommendations.filter((s) =>
    !searchQuery ||
    s.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.oneLiner?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => name.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase();

  return (
    <InvestorShell>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-[#0f172a] flex items-center justify-center">
              <Bot className="w-4 h-4 text-[#e6cc4c]" />
            </div>
            <h1 className="text-[28px] font-semibold text-[#0f172a] tracking-[-0.02em] leading-tight">AI Recommendations</h1>
          </div>
          <p className="text-[15px] text-slate-500 mt-1.5 font-normal ml-[42px]">
            Startup được AI gợi ý dựa trên portfolio và sở thích đầu tư của bạn
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm trong danh sách gợi ý..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-11 h-12 bg-white border border-slate-200 rounded-xl text-[14px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all font-normal shadow-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {error && (
          <div className="rounded-xl bg-amber-50 border border-amber-100 px-5 py-4 text-[13px] text-amber-700 font-medium">
            {error}
            <button onClick={fetchRecommendations} className="ml-2 text-amber-800 underline underline-offset-2 hover:no-underline font-semibold">Thử lại</button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Loader2 className="w-7 h-7 animate-spin mb-3" />
            <p className="text-[14px] font-normal">Đang tải gợi ý AI...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-800 font-semibold text-[16px] mb-1">{searchQuery ? "Không tìm thấy startup phù hợp" : "Chưa có gợi ý nào từ AI"}</p>
            <p className="text-slate-400 text-[14px]">Hệ thống AI đang phân tích portfolio của bạn</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filtered.map((rec) => {
              const palette = getMonogramPalette(rec.startupID);
              return (
                <article
                  key={rec.startupID}
                  onClick={() => router.push(`/investor/startups/${rec.startupID}`)}
                  className="group bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 cursor-pointer"
                >
                  <div className="p-5 pb-4">
                    {/* AI Badge */}
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0f172a] text-[10px] font-semibold text-[#e6cc4c] uppercase tracking-[0.04em]">
                        <Sparkles className="w-3 h-3" />
                        AI Recommended
                      </span>
                      <button onClick={(e) => { e.stopPropagation(); setSelectedStartup(rec); }} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-all">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-start gap-3.5 mb-3.5">
                      {rec.logoURL ? (
                        <img src={rec.logoURL} alt={rec.companyName} className="w-11 h-11 rounded-xl object-cover border border-slate-100" />
                      ) : (
                        <div className={`w-11 h-11 rounded-xl ${palette.bg} flex items-center justify-center`}>
                          <span className={`${palette.text} font-semibold text-[14px]`}>{getInitials(rec.companyName)}</span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <h3 className="font-semibold text-[15px] text-slate-900 tracking-[-0.01em] truncate leading-tight">{rec.companyName}</h3>
                        <div className="flex items-center gap-1.5 mt-1 text-[12px] text-slate-400 font-normal">
                          {rec.industry && <span>{rec.industry}</span>}
                          {rec.industry && rec.stage && <span className="text-slate-300">·</span>}
                          {rec.stage && <span>{rec.stage}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
                      {rec.fundingStage && <span className="inline-flex items-center px-2 py-[3px] rounded-md text-[11px] font-medium text-violet-600 bg-violet-50/70 border border-violet-100/60">{rec.fundingStage}</span>}
                      {rec.subIndustry && <span className="inline-flex items-center px-2 py-[3px] rounded-md bg-slate-50 text-[11px] font-medium text-slate-600 border border-slate-100">{rec.subIndustry}</span>}
                    </div>

                    {rec.oneLiner && (
                      <div className="bg-slate-50/80 rounded-xl px-4 py-3 border border-slate-100/60">
                        <p className="text-[13px] text-slate-500 leading-[1.6] font-normal line-clamp-2">{rec.oneLiner}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/40 rounded-b-2xl">
                    {rec.location ? (
                      <div className="flex items-center gap-1.5 text-[12px] text-slate-400 font-normal">
                        <MapPin className="w-3.5 h-3.5" />
                        {rec.location}{rec.country ? `, ${rec.country}` : ""}
                      </div>
                    ) : <div />}
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-800 group-hover:text-[#b8a038] transition-colors">
                      Xem chi tiết
                      <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {selectedStartup && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${getMonogramPalette(selectedStartup.startupID).bg} flex items-center justify-center`}>
                  <span className={`${getMonogramPalette(selectedStartup.startupID).text} font-semibold text-[14px]`}>{getInitials(selectedStartup.companyName)}</span>
                </div>
                <div>
                  <h2 className="text-[18px] font-semibold text-[#0f172a]">{selectedStartup.companyName}</h2>
                  <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
                    {selectedStartup.industry && <span>{selectedStartup.industry}</span>}
                    {selectedStartup.location && <><span className="text-slate-300">·</span><span>{selectedStartup.location}</span></>}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedStartup(null)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex flex-wrap gap-1.5">
                {selectedStartup.industry && <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-50 text-[11px] font-medium text-slate-600 border border-slate-100">{selectedStartup.industry}</span>}
                {selectedStartup.stage && <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100/60">{selectedStartup.stage}</span>}
                {selectedStartup.fundingStage && <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium text-violet-600 bg-violet-50/70 border border-violet-100/60">{selectedStartup.fundingStage}</span>}
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#0f172a] text-[11px] font-semibold text-[#e6cc4c]"><Sparkles className="w-3 h-3" />AI Recommended</span>
              </div>

              {selectedStartup.oneLiner && (
                <div>
                  <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-[0.04em] mb-2">Mô tả</p>
                  <p className="text-[14px] text-slate-600 leading-[1.7]">{selectedStartup.oneLiner}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Industry", value: selectedStartup.industry },
                  { label: "Sub-Industry", value: selectedStartup.subIndustry },
                  { label: "Stage", value: selectedStartup.stage },
                  { label: "Funding", value: selectedStartup.fundingStage },
                  { label: "Status", value: selectedStartup.profileStatus },
                  { label: "Country", value: selectedStartup.country },
                ].filter(f => f.value).map((field) => (
                  <div key={field.label} className="bg-slate-50 rounded-xl p-4 border border-slate-100/60">
                    <p className="text-[11px] text-slate-400 font-medium mb-1">{field.label}</p>
                    <p className="text-[14px] text-slate-800 font-medium">{field.value}</p>
                  </div>
                ))}
              </div>

              <button onClick={() => { setSelectedStartup(null); router.push(`/investor/startups/${selectedStartup.startupID}`); }} className="w-full h-10 rounded-xl text-[13px] font-semibold bg-[#0f172a] text-white hover:bg-[#1e293b] transition-colors inline-flex items-center justify-center gap-2">
                <ArrowUpRight className="w-4 h-4" />
                Xem trang chi tiết
              </button>
            </div>
          </div>
        </div>
      )}
    </InvestorShell>
  );
}
