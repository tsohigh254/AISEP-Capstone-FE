"use client";

import Link from "next/link";
import { Brain, Star, TrendingUp, Sparkles, Handshake, Target, Settings2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const mockRecommendations = [
  {
    id: "rec001",
    startupId: 1,
    name: "TechAlpha Co.",
    industry: "SaaS",
    stage: "Seed",
    target: "$500K",
    score: 95,
    matchReason: "Cùng lĩnh vực SaaS B2B trong danh mục yêu thích ưu tiên số 1 của bạn. Tỷ suất doanh thu định kỳ MRR tăng đều đặn 3 tháng qua.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDPGo-MuNE1TA-f-CzA3CrxNhiTpXx6O33MdUq3W-IaDVQ7ym67WVsYzj_6y6DQg7FbffRXZWJQ18VrNJYBVodrdwsmss985qeqimmBjPdnV8vkYvC_Q0fjlVaghZCf_kvrqxGxP3dHivWdkDz8TKh0loaFMvqcs5oad2AIl1Y8j3vh7qi0ytZkwm8RLLxKFAiP7YQiEOYFqcO6_VLODJkRpYPEu1mAFYT3uLh98c8wUw33fLRLbsIZOwPUkI4ofRFvsVh95t_5Ghc",
  },
  {
    id: "rec002",
    startupId: 2,
    name: "MediChain AI",
    industry: "HealthTech / Blockchain",
    stage: "Series A",
    target: "$2M",
    score: 88,
    matchReason: "Phù hợp tiêu chí 'Nguy cơ trung bình, Lợi nhuận cao' (High-risk, High-reward) tại khu vực Châu Á. Data room đã được AI xác thực mạnh.",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDKY4d1Y63lERm80mlyRmr3m2Np_8yG6dWJUtCxN7kvLrLu89DM4CSm8QpBtvvwm3konSP-3BflEBvD1vqDcqq91_XkNfgpXBi-GPYd-hBFOCZXxz2lwC-9Czkenukr5SyakSEBVtFO25lNewwy9nxMzGyi50hodZ59AUpBSMAX5bRNom8hV9w2Ni1St46YJ1PH-4LxUjHCc1vVLoVNzGnhOEiEB8wmQvzY7Ci7l7jd4qiiMK_8yyL4A1qfApGUmiShlRKOIamZjWU",
  }
];

export default function RecommendationsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl p-8 shadow-sm border border-slate-800 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Brain className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-6 h-6 text-[#e6cc4c]" />
            <span className="text-sm font-black text-[#e6cc4c] uppercase tracking-widest">AI Tuyển chọn</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">Gợi ý Startup từ AISEP</h1>
          <p className="text-slate-300 leading-relaxed text-sm">
            AISEP phân tích hàng nghìn hồ sơ startup trên nền tảng, đối chiếu với Investment Thesis và khẩu vị rủi ro của bạn để đưa ra danh sách các cơ hội đầu tư phù hợp nhất. Danh sách được làm mới mỗi 24 giờ.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/investor/profile">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all border border-white/10">
                <Settings2 className="w-4 h-4" /> Cập nhật Thesis
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <h2 className="text-lg font-bold text-[#171611] flex items-center gap-2">
          <Star className="w-5 h-5 text-[#e6cc4c] fill-[#e6cc4c]" /> Top Matching Hôm Nay
        </h2>
        <span className="text-xs text-neutral-muted font-bold flex items-center gap-1">
          <Info className="w-4 h-4" /> Cập nhật 2 giờ trước
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockRecommendations.map((rec) => (
          <div key={rec.id} className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-surface hover:border-[#e6cc4c]/50 transition-all flex flex-col h-full group relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#e6cc4c]/90 text-[#171611] px-4 py-1.5 rounded-bl-xl font-black text-sm flex items-center gap-1 z-10">
              <Brain className="w-4 h-4" /> {rec.score}% Phù hợp
            </div>
            
            <div className="flex items-center gap-4 mb-4 mt-2">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-neutral-100 flex-shrink-0">
                <img src={rec.img} alt={rec.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div>
                <Link href={`/investor/startups/${rec.startupId}`} className="text-lg font-bold text-[#171611] hover:text-[#C8A000] transition-colors">
                  {rec.name}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold bg-[#f4f4f0] px-2 py-0.5 rounded-md text-neutral-600">{rec.industry}</span>
                  <span className="text-xs font-bold bg-[#f4f4f0] px-2 py-0.5 rounded-md text-neutral-600">{rec.stage}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#e6cc4c]/10 rounded-xl p-4 border border-[#e6cc4c]/20 mb-6 flex-1">
              <p className="text-[10px] font-black text-[#C8A000] uppercase tracking-widest mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Tại sao phù hợp?
              </p>
              <p className="text-sm text-[#171611]/80 leading-relaxed font-medium">
                {rec.matchReason}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link href={`/investor/startups/${rec.startupId}`} className="w-full flex-1">
                <button className="w-full justify-center bg-[#f8f8f6] text-[#171611] border border-neutral-surface font-bold px-4 py-2.5 rounded-xl hover:bg-neutral-100 transition-all flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4" /> Xem chi tiết
                </button>
              </Link>
              <button className="w-full flex-1 justify-center bg-[#e6cc4c] text-[#171611] font-bold px-4 py-2.5 rounded-xl hover:shadow-lg transition-all flex items-center gap-2 text-sm">
                <Handshake className="w-4 h-4" /> Kết nối
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
