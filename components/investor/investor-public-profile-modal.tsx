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
  Loader2,
} from "lucide-react";

interface InvestorPublicProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: IInvestorProfile | null;
  isKycVerified?: boolean;
}

export function InvestorPublicProfileModal({
  open,
  onOpenChange,
  profile,
  isKycVerified = false,
}: InvestorPublicProfileModalProps) {
  const displayName = profile?.fullName || profile?.firmName || "Nhà đầu tư";
  const investorTypeLabel =
    profile?.investorType === "INSTITUTIONAL"
      ? "Quỹ đầu tư (VC / CVC)"
      : profile?.investorType === "INDIVIDUAL_ANGEL"
      ? "Angel Investor"
      : profile?.investorType || "Nhà đầu tư";

  const preferredStages = profile?.preferredStages ?? [];
  const preferredIndustries = profile?.preferredIndustries ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border-none p-0 shadow-2xl">
        <div className="relative">
          <div className="h-32 rounded-t-2xl bg-gradient-to-r from-slate-900 to-slate-800" />
          <div className="absolute left-6 -bottom-10 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-slate-900 shadow-lg">
            {profile?.profilePhotoURL ? (
              <img src={profile.profilePhotoURL} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-black text-white">{displayName.charAt(0).toUpperCase()}</span>
            )}
          </div>
        </div>

        {!profile ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#e6cc4c]" />
          </div>
        ) : (
          <div className="space-y-6 px-6 pb-6 pt-14">
            <DialogHeader className="text-left">
              <div className="flex flex-wrap items-center gap-3">
                <DialogTitle className="text-2xl font-bold text-[#171611]">
                  {displayName}
                </DialogTitle>
                {isKycVerified && (
                  <span className="flex items-center gap-1 rounded-full border border-green-200 bg-green-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-green-700">
                    <ShieldCheck className="h-3 w-3" />
                    Đã xác thực
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-4 text-sm font-medium text-neutral-500">
                {investorTypeLabel && (
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {investorTypeLabel}
                  </div>
                )}
                {(profile.location || profile.country) && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {[profile.location, profile.country].filter(Boolean).join(", ")}
                  </div>
                )}
              </div>
            </DialogHeader>

            {profile.bio && (
              <div>
                <h4 className="mb-2 font-be-vietnam text-xs font-black uppercase tracking-widest text-neutral-400">
                  Giới thiệu
                </h4>
                <p className="font-be-vietnam text-sm leading-relaxed text-[#171611]">
                  {profile.bio}
                </p>
              </div>
            )}

            {profile.investmentThesis && (
              <div>
                <h4 className="mb-2 font-be-vietnam text-xs font-black uppercase tracking-widest text-neutral-400">
                  Khẩu vị đầu tư
                </h4>
                <p className="font-be-vietnam text-sm leading-relaxed text-[#171611]">
                  {profile.investmentThesis}
                </p>
              </div>
            )}

            {preferredStages.length > 0 && (
              <div>
                <h4 className="mb-3 font-be-vietnam text-xs font-black uppercase tracking-widest text-neutral-400">
                  Giai đoạn ưu tiên
                </h4>
                <div className="flex flex-wrap gap-2">
                  {preferredStages.map((stage) => (
                    <span
                      key={stage}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-700"
                    >
                      {stage}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {preferredIndustries.length > 0 && (
              <div>
                <h4 className="mb-3 font-be-vietnam text-xs font-black uppercase tracking-widest text-neutral-400">
                  Lĩnh vực quan tâm
                </h4>
                <div className="flex flex-wrap gap-2">
                  {preferredIndustries.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[#e6cc4c]/20 bg-[#e6cc4c]/10 px-3 py-1.5 text-[11px] font-bold text-[#171611] transition-colors hover:bg-[#e6cc4c]/20"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

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
                    {profile.acceptingConnections ? "Sẵn sàng nhận hồ sơ mới" : "Tạm thời không nhận hồ sơ"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
