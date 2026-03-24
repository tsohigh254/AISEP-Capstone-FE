"use client";

import Link from "next/link";
import { useState } from "react";
import { Bookmark, Search, Trash2, Sparkles, Building2, TrendingUp, Handshake, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const mockWatchlist = [
  {
    id: 1,
    name: "TechAlpha Co.",
    industry: "SaaS & AI",
    stage: "Seed",
    target: "$500K",
    score: 84,
    addedAt: "12/05/2024",
    status: "Đang gọi vốn",
    reason: "Sản phẩm AI có tính ứng dụng cao, đội ngũ sáng lập giàu kinh nghiệm trong lĩnh vực B2B.",
    statusColor: "text-green-600 bg-green-50 border-green-200",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDPGo-MuNE1TA-f-CzA3CrxNhiTpXx6O33MdUq3W-IaDVQ7ym67WVsYzj_6y6DQg7FbffRXZWJQ18VrNJYBVodrdwsmss985qeqimmBjPdnV8vkYvC_Q0fjlVaghZCf_kvrqxGxP3dHivWdkDz8TKh0loaFMvqcs5oad2AIl1Y8j3vh7qi0ytZkwm8RLLxKFAiP7YQiEOYFqcO6_VLODJkRpYPEu1mAFYT3uLh98c8wUw33fLRLbsIZOwPUkI4ofRFvsVh95t_5Ghc",
  },
  {
    id: 2,
    name: "MediChain AI",
    industry: "HealthTech",
    stage: "Pre-Seed",
    target: "$200K",
    score: 88,
    addedAt: "08/04/2024",
    status: "Chuẩn bị vòng mới",
    reason: "Giải pháp Blockchain cho y tế rất tiềm năng, đúng với tiêu chí đầu tư Impact Investing của quỹ.",
    statusColor: "text-blue-600 bg-blue-50 border-blue-200",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDKY4d1Y63lERm80mlyRmr3m2Np_8yG6dWJUtCxN7kvLrLu89DM4CSm8QpBtvvwm3konSP-3BflEBvD1vqDcqq91_XkNfgpXBi-GPYd-hBFOCZXxz22lwC-9Czkenukr5SyakSEBVtFO25lNewwy9nxMzGyi50hodZ59AUpBSMAX5bRNom8hV9w2Ni1St46YJ1PH-4LxUjHCc1vVLoVNzGnhOEiEB8wmQvzY7Ci7l7jd4qiiMK_8yyL4A1qfApGUmiShlRKOIamZjWU",
  },
];

export default function WatchlistPage() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-neutral-surface">
        <div>
          <div className="flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-[#e6cc4c]" />
            <h1 className="text-2xl font-bold text-[#171611]">Danh sách theo dõi</h1>
          </div>
          <p className="text-sm text-neutral-muted mt-1">Quản lý và theo dõi các startup bạn quan tâm để không bỏ lỡ cơ hội đầu tư.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Tìm trong danh sách..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#f8f8f6] border border-transparent focus:bg-white focus:border-[#e6cc4c] focus:ring-4 focus:ring-[#e6cc4c]/10 rounded-xl outline-none transition-all text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#f8f8f6] border-b border-neutral-surface">
              <tr className="text-[10px] uppercase text-neutral-muted font-bold tracking-widest">
                <th className="px-6 py-4 tracking-[0.1em]">STARTUP & LĨNH VỰC</th>
                <th className="px-6 py-4 tracking-[0.1em]">GIAI ĐOẠN</th>
                <th className="px-6 py-4 tracking-[0.1em]">ĐIỂM AI</th>
                <th className="px-6 py-4 tracking-[0.1em]">LÝ DO THEO DÕI</th>
                <th className="px-6 py-4 tracking-[0.1em]">TRẠNG THÁI</th>
                <th className="px-6 py-4 text-right pr-6 tracking-[0.1em]">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-surface">
              {mockWatchlist.map((startup) => (
                <tr key={startup.id} className="hover:bg-[#f8f8f6]/50 transition-colors group text-sm">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-neutral-100 shadow-sm flex-shrink-0">
                        <img src={startup.img} alt={startup.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <Link href={`/investor/startups/${startup.id}`} className="text-sm font-bold text-[#171611] hover:text-[#C8A000] transition-colors line-clamp-1">
                          {startup.name}
                        </Link>
                        <p className="text-xs text-neutral-muted font-medium flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3" /> {startup.industry}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-[#171611] flex items-center gap-1.5 whitespace-nowrap"><TrendingUp className="w-4 h-4 text-neutral-400" /> {startup.stage}</p>
                    <p className="text-xs text-neutral-muted mt-0.5 whitespace-nowrap">Mục tiêu: {startup.target}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 bg-[#e6cc4c]/10 text-[#C8A000] px-2.5 py-1.5 rounded-lg border border-[#e6cc4c]/20 w-fit">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="font-black leading-none">{startup.score}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-[240px]">
                    <div className="bg-[#f8f8f6] p-3 rounded-xl border border-neutral-100">
                      <p className="text-[12px] text-[#171611] leading-relaxed font-medium italic">
                        "{startup.reason}"
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border whitespace-nowrap", startup.statusColor)}>
                      {startup.status}
                    </span>
                    <p className="text-[10px] text-neutral-400 mt-1 italic font-medium whitespace-nowrap">Lưu lúc: {startup.addedAt}</p>
                  </td>
                  <td className="px-6 py-4 text-right pr-6 space-x-2">
                    <Link href={`/investor/startups/${startup.id}`}>
                      <button title="Xem chi tiết" className="text-neutral-500 hover:text-[#171611] transition-colors p-2 rounded-lg hover:bg-[#f4f4f0] bg-white border border-neutral-200 shadow-sm">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </Link>
                    <button title="Kết nối" className="text-[#C8A000] hover:text-[#E6B800] transition-colors p-2 rounded-lg hover:bg-[#e6cc4c]/10 bg-[#e6cc4c]/5 border border-[#e6cc4c]/20 shadow-sm">
                      <Handshake className="w-4 h-4" />
                    </button>
                    <button title="Xóa" className="text-neutral-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {mockWatchlist.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm font-medium text-neutral-500">
                    Danh sách theo dõi hiện đang trống. Khám phá thêm startup để theo dõi!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
