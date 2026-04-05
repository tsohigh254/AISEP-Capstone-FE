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
} from "lucide-react";

interface InvestorPublicProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InvestorPublicProfileModal({
  open,
  onOpenChange,
}: InvestorPublicProfileModalProps) {
  const investorData = {
    name: "VinaCapital Ventures",
    type: "Venture Capital (VC)",
    location: "TP. Hồ Chí Minh, Việt Nam",
    isVerified: true,
    about:
      "VinaCapital Ventures là một quỹ đầu tư mạo hiểm đầu tư vào các công ty khởi nghiệp công nghệ tại Việt Nam. Chúng tôi đồng hành cùng các startup để thúc đẩy sự đổi mới và tăng trưởng trong hệ sinh thái số đang phát triển nhanh chóng.",
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-none p-0 shadow-2xl">
        <div className="relative">
          <div className="h-32 rounded-t-2xl bg-gradient-to-r from-slate-900 to-slate-800" />
          <div className="absolute left-6 -bottom-10 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-slate-900 shadow-lg">
            <span className="text-4xl font-black text-white">V</span>
          </div>
        </div>

        <div className="space-y-6 px-6 pb-6 pt-14">
          <DialogHeader className="text-left">
            <div className="flex flex-wrap items-center gap-3">
              <DialogTitle className="text-2xl font-bold text-[#171611]">
                {investorData.name}
              </DialogTitle>
              {investorData.isVerified && (
                <span className="flex items-center gap-1 rounded-full border border-green-200 bg-green-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-green-700">
                  <ShieldCheck className="h-3 w-3" />
                  Đã xác thực
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-4 text-sm font-medium text-neutral-500">
              <div className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                {investorData.type}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {investorData.location}
              </div>
            </div>
          </DialogHeader>

          <div>
            <h4 className="mb-2 font-be-vietnam text-xs font-black uppercase tracking-widest text-neutral-400">
              Giới thiệu
            </h4>
            <p className="font-be-vietnam text-sm leading-relaxed text-[#171611]">
              {investorData.about}
            </p>
          </div>

          <div>
            <h4 className="mb-3 font-be-vietnam text-xs font-black uppercase tracking-widest text-neutral-400">
              Khẩu vị đầu tư
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="group rounded-xl border border-neutral-100 bg-[#f8f8f6] p-4 text-center transition-all hover:border-[#e6cc4c]/30 hover:shadow-sm">
                <Target className="mx-auto mb-2 h-4 w-4 text-neutral-400 transition-colors group-hover:text-[#e6cc4c]" />
                <p className="text-sm font-black text-[#171611]">
                  {investorData.thesis.ticketSize}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Ticket Size
                </p>
              </div>
              <div className="group rounded-xl border border-neutral-100 bg-[#f8f8f6] p-4 text-center transition-all hover:border-[#e6cc4c]/30 hover:shadow-sm">
                <TrendingUp className="mx-auto mb-2 h-4 w-4 text-neutral-400 transition-colors group-hover:text-[#e6cc4c]" />
                <p className="text-sm font-black text-[#171611]">
                  {investorData.thesis.stages}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Giai đoạn
                </p>
              </div>
              <div className="group rounded-xl border border-neutral-100 bg-[#f8f8f6] p-4 text-center transition-all hover:border-[#e6cc4c]/30 hover:shadow-sm">
                <Briefcase className="mx-auto mb-2 h-4 w-4 text-neutral-400 transition-colors group-hover:text-[#e6cc4c]" />
                <p className="text-sm font-black text-[#171611]">
                  {investorData.thesis.portfolioCount}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Danh mục
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-3 font-be-vietnam text-xs font-black uppercase tracking-widest text-neutral-400">
              Lĩnh vực quan tâm
            </h4>
            <div className="flex flex-wrap gap-2">
              {investorData.sectors.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[#e6cc4c]/20 bg-[#e6cc4c]/10 px-3 py-1.5 text-[11px] font-bold text-[#171611] transition-colors hover:bg-[#e6cc4c]/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-3 font-be-vietnam text-xs font-black uppercase tracking-widest text-neutral-400">
              Startup tiêu biểu
            </h4>
            <div className="flex flex-wrap gap-3">
              {investorData.topPortfolio.map((startup, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white px-4 py-3 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-[10px] font-black text-[#171611]">
                    {startup.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#171611]">{startup}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800">
                <Handshake className="h-5 w-5 text-[#e6cc4c]" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
                  Trạng thái kết nối
                </p>
                <p className="text-sm font-bold text-white">
                  Sẵn sàng nhận hồ sơ mới
                </p>
              </div>
            </div>
            <button className="rounded-lg bg-[#e6cc4c] px-4 py-2 text-xs font-bold text-slate-900 transition-colors hover:bg-yellow-400">
              Gửi tin nhắn
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
