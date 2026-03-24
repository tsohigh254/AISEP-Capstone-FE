"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Building2, 
  MapPin, 
  Target, 
  Handshake, 
  Briefcase, 
  ShieldCheck,
  TrendingUp,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";

interface InvestorPublicProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvestorPublicProfileModal({
  open,
  onOpenChange,
}: InvestorPublicProfileModalProps) {
  // Mock data for VinaCapital Ventures
  const investorData = {
    name: "VinaCapital Ventures",
    type: "Venture Capital (VC)",
    location: "TP. Hồ Chí Minh, Việt Nam",
    isVerified: true,
    about: "VinaCapital Ventures là một quỹ đầu tư mạo hiểm đầu tư vào các công ty khởi nghiệp công nghệ tại Việt Nam. Chúng tôi đồng hành cùng các startup để thúc đẩy sự đổi mới và tăng trưởng trong hệ sinh thái số đang phát triển nhanh chóng.",
    thesis: {
      ticketSize: "$100K - $1M",
      stages: "Seed → Series A",
      portfolioCount: "25+",
    },
    sectors: ["SaaS", "FinTech", "AI", "Logistics", "Consumer Tech"],
    topPortfolio: ["TechAlpha Co.", "MediChain AI", "GreenEats"],
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-none shadow-2xl">
        <div className="relative">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-slate-900 to-slate-800 rounded-t-2xl" />
          {/* Avatar */}
          <div className="absolute left-6 -bottom-10 w-20 h-20 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-slate-900 flex items-center justify-center">
             <span className="text-white text-4xl font-black">V</span>
          </div>
        </div>

        <div className="px-6 pt-14 pb-6 space-y-6">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-3 flex-wrap">
              <DialogTitle className="text-2xl font-bold text-[#171611]">
                {investorData.name}
              </DialogTitle>
              {investorData.isVerified && (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full border border-green-200 uppercase tracking-[0.1em] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  ĐÃ XÁC THỰC
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-neutral-500 font-medium mt-1">
              <div className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                {investorData.type}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {investorData.location}
              </div>
            </div>
          </DialogHeader>

          {/* About */}
          <div>
            <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-2 font-be-vietnam">Giới thiệu</h4>
            <p className="text-sm text-[#171611] leading-relaxed font-be-vietnam">
              {investorData.about}
            </p>
          </div>

          {/* Investment Thesis (Chỉ số) */}
          <div>
            <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-3 font-be-vietnam">Khẩu vị đầu tư</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#f8f8f6] rounded-xl p-4 text-center border border-neutral-100 hover:border-[#e6cc4c]/30 hover:shadow-sm transition-all group">
                <Target className="w-4 h-4 text-neutral-400 mx-auto mb-2 group-hover:text-[#e6cc4c] transition-colors" />
                <p className="text-sm font-black text-[#171611]">{investorData.thesis.ticketSize}</p>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-1">Ticket Size</p>
              </div>
              <div className="bg-[#f8f8f6] rounded-xl p-4 text-center border border-neutral-100 hover:border-[#e6cc4c]/30 hover:shadow-sm transition-all group">
                <TrendingUp className="w-4 h-4 text-neutral-400 mx-auto mb-2 group-hover:text-[#e6cc4c] transition-colors" />
                <p className="text-sm font-black text-[#171611]">{investorData.thesis.stages}</p>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-1">Giai đoạn</p>
              </div>
              <div className="bg-[#f8f8f6] rounded-xl p-4 text-center border border-neutral-100 hover:border-[#e6cc4c]/30 hover:shadow-sm transition-all group">
                <Briefcase className="w-4 h-4 text-neutral-400 mx-auto mb-2 group-hover:text-[#e6cc4c] transition-colors" />
                <p className="text-sm font-black text-[#171611]">{investorData.thesis.portfolioCount}</p>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-1">Danh mục</p>
              </div>
            </div>
          </div>

          {/* Sectors */}
          <div>
            <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-3 font-be-vietnam">Lĩnh vực quan tâm</h4>
            <div className="flex flex-wrap gap-2">
              {investorData.sectors.map((tag) => (
                <span key={tag} className="px-3 py-1.5 bg-[#e6cc4c]/10 border border-[#e6cc4c]/20 rounded-full text-[11px] font-bold text-[#171611] hover:bg-[#e6cc4c]/20 transition-colors">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Top Portfolio / Experience */}
          <div>
            <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-3 font-be-vietnam">Startup tiêu biểu</h4>
            <div className="flex flex-wrap gap-3">
              {investorData.topPortfolio.map((startup, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-black text-[#171611] text-[10px]">
                    {startup.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#171611]">{startup}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA / Contact (Optional) */}
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                <Handshake className="w-5 h-5 text-[#e6cc4c]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.1em]">Trạng thái kết nối</p>
                <p className="text-sm font-bold text-white">Sẵn sàng nhận hồ sơ mới</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-[#e6cc4c] text-slate-900 rounded-lg text-xs font-bold hover:bg-yellow-400 transition-colors">
              Gửi tin nhắn
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
