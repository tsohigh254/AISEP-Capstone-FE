"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCountUp } from "@/lib/useCountUp";
import { cn } from "@/lib/utils";
import {
  Building2,
  Target,
  Brain,
  Eye,
  Handshake,
  Sparkles,
  FolderOpen,
  FileEdit,
  TrendingUp,
  Search,
  MoreVertical,
  Bookmark,
  Loader2,
  AlertTriangle,
  ShieldCheck as ShieldCheckIcon
} from "lucide-react";
import { GetInvestorProfile, GetInvestorWatchlist } from "@/services/investor/investor.api";
import { GetInvestorKYCStatus } from "@/services/investor/investor-kyc";
import { IInvestorKYCStatus } from "@/types/investor-kyc";
import { InvestorPublicProfileModal } from "@/components/investor/investor-public-profile-modal";
import { toast } from "sonner";

export default function InvestorDashboardPage() {
  const router = useRouter();
  const [showPublicProfile, setShowPublicProfile] = useState(false);
  const [profile, setProfile] = useState<IInvestorProfile | null>(null);
  const [kycStatus, setKycStatus] = useState<IInvestorKYCStatus | null>(null);
  const [watchlist, setWatchlist] = useState<IWatchlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [profileRes, kycRes, watchlistRes] = await Promise.all([
        GetInvestorProfile(),
        GetInvestorKYCStatus(),
        GetInvestorWatchlist(1, 5),
      ]);

      if (profileRes.isSuccess) setProfile(profileRes.data ?? null);
      if (kycRes.isSuccess) setKycStatus(kycRes.data as any);
      if (watchlistRes.isSuccess) setWatchlist(watchlistRes.data?.items ?? []);

      // Simple Redirection Guard: If profile is incomplete, send to onboard
      if (profileRes.isSuccess && (!profileRes.data || profileRes.data.profileStatus === "Draft")) {
          router.push("/investor/onboard");
      }
    } catch (err) {
      toast.error("Lỗi khi tải dữ liệu Dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const profileProgressCount = useMemo(() => {
    if (!profile) return 0;
    const fields = [
        profile.fullName, profile.firmName, profile.title, 
        profile.bio, profile.location, profile.website, 
        profile.linkedInURL, profile.investmentThesis
    ];
    const filled = fields.filter(f => !!f).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  const profileProgress = useCountUp(profileProgressCount, 1200, 0);
  const connectCount = useCountUp(0, 1200, 0); // Placeholder for actual connections
  const docCount = useCountUp(0, 800, 0); // Placeholder for actual docs
  const viewCount = useCountUp(0, 600, 0); // Placeholder for actual views

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-[#e6cc4c]" />
        <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Đang tải dữ liệu...</p>
      </div>
    );
  }

  const isVerified = kycStatus?.workflowStatus === "VERIFIED";
  const isPending = kycStatus?.workflowStatus === "PENDING_REVIEW";
  const isFailed = kycStatus?.workflowStatus === "VERIFICATION_FAILED";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Verification CTA Banner */}
      {!isVerified && !isPending && (
          <div className="bg-[#e6cc4c]/10 border-2 border-dashed border-[#e6cc4c]/40 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#e6cc4c]/20 flex items-center justify-center text-[#e6cc4c]">
                      <ShieldCheckIcon className="w-6 h-6" />
                  </div>
                  <div>
                      <h4 className="text-[14px] font-bold text-slate-800">Tài khoản chưa được xác thực (KYC)</h4>
                      <p className="text-[12px] text-slate-500">Xác thực ngay để nhận được sự tin tưởng từ các Startup và truy cập dữ liệu chuyên sâu.</p>
                  </div>
              </div>
              <Link href="/investor/kyc" className="px-6 py-2 bg-[#171611] text-white text-[12px] font-bold rounded-xl hover:bg-slate-700 transition-all whitespace-nowrap">
                  Xác thực ngay
              </Link>
          </div>
      )}

      {isPending && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              <p className="text-[13px] font-medium text-blue-700">Hồ sơ định danh của bạn đang được duyệt. Quá trình này có thể mất 1-2 ngày làm việc.</p>
          </div>
      )}

      {isFailed && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <p className="text-[13px] font-medium text-red-700">Xác thực thất bại. Vui lòng kiểm tra lại hồ sơ và nộp lại.</p>
              </div>
              <Link href="/investor/kyc" className="px-5 py-2 bg-red-600 text-white text-[12px] font-bold rounded-xl hover:bg-red-700 transition-all">
                  Nộp lại hồ sơ
              </Link>
          </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl p-6 shadow-sm border border-neutral-surface flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-48 h-48 rounded-xl bg-slate-900 overflow-hidden shrink-0 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
            <span className="text-white text-7xl font-black relative z-10">{profile?.fullName?.charAt(0) || "V"}</span>
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-[#171611]">Chào mừng, {profile?.fullName || profile?.firmName || "Nhà đầu tư"}</h1>
                {isVerified ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full border border-green-200 uppercase tracking-[0.1em] flex items-center gap-1">
                        <ShieldCheckIcon className="w-3 h-3" /> Đã Xác Thực
                    </span>
                ) : (
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-full border border-slate-200 uppercase tracking-[0.1em]">Chưa Xác Thực</span>
                )}
              </div>
              <p className="text-neutral-muted text-sm mb-6 leading-relaxed">
                Hồ sơ nhà đầu tư của bạn hiện đạt {profileProgressCount}%. 
                {profileProgressCount < 100 ? " Hãy cập nhật đầy đủ thông tin để AI đề xuất Startup chính xác hơn." : " Hồ sơ của bạn đã được tối ưu cho việc matching."}
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs font-bold text-[#171611]">
                  <span>Tiến độ hoàn thiện hồ sơ</span>
                  <span ref={profileProgress.ref} className="text-[#171611]">{profileProgress.count}%</span>
                </div>
                <div className="w-full h-3 bg-[#f4f4f0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#e6cc4c] rounded-full transition-all duration-1000 ease-out" style={{ width: `${profileProgress.count}%` }}></div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/investor/profile" className="bg-[#e6cc4c] text-[#171611] font-bold px-6 py-2.5 rounded-xl hover:shadow-lg transition-all flex items-center gap-2 group">
                <FileEdit className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                Hoàn thiện hồ sơ
              </Link>
              <button
                onClick={() => setShowPublicProfile(true)}
                className="bg-[#f4f4f0] text-[#171611] font-bold px-6 py-2.5 rounded-xl hover:bg-neutral-200 transition-all flex items-center gap-2"
              >
                <Eye className="w-5 h-5" />
                Xem hồ sơ công khai
              </button>
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-neutral-surface">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-[#171611]">Thao tác nhanh</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Search, label: "Khám phá", href: "/investor/startups", color: "text-blue-500", bg: "bg-blue-50" },
              { icon: Brain, label: "AI Chatbot", href: "/investor/ai-chatbot", color: "text-purple-500", bg: "bg-purple-50" },
              { icon: Bookmark, label: "Danh sách theo dõi", href: "/investor/watchlist", color: "text-orange-500", bg: "bg-orange-50" },
              { icon: Handshake, label: "Kết nối", href: "/investor/connections", color: "text-emerald-500", bg: "bg-emerald-50" },
            ].map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#f8f8f6] hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all group border border-transparent hover:border-neutral-surface"
              >
                <div className={cn("size-10 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-110", item.bg)}>
                  <item.icon className={cn("w-5 h-5 transition-colors", item.color)} />
                </div>
                <span className="text-[11px] font-black text-[#171611] text-center leading-tight uppercase tracking-tight">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-5 lg:col-span-5 bg-[#e6cc4c]/10 p-6 rounded-2xl shadow-sm border-2 border-[#e6cc4c]/30 flex items-center justify-between group hover:bg-[#e6cc4c]/20 transition-all cursor-pointer">
          <div>
            <p className="text-neutral-muted text-sm font-bold mb-1 uppercase tracking-widest">Startup đang theo dõi</p>
            <div className="flex items-baseline gap-3">
              <span ref={connectCount.ref} className="text-4xl font-bold text-[#171611]">{connectCount.count}</span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <Bookmark className="w-7 h-7 text-[#e6cc4c]" />
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 lg:col-span-4 bg-[#e6cc4c]/10 p-6 rounded-2xl shadow-sm border-2 border-[#e6cc4c]/30 flex items-center justify-between group hover:bg-[#e6cc4c]/20 transition-all cursor-pointer">
          <div>
            <p className="text-neutral-muted text-sm font-bold mb-1 uppercase tracking-widest">Tài liệu đã truy cập</p>
            <div className="flex items-baseline gap-3">
              <span ref={docCount.ref} className="text-4xl font-bold text-[#171611]">{docCount.count}</span>
              <span className="text-neutral-muted text-sm font-bold lowercase">Files</span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
            <FolderOpen className="w-7 h-7 text-[#e6cc4c]" />
          </div>
        </div>
        <div className="col-span-12 md:col-span-3 lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-neutral-surface flex items-center justify-between group hover:bg-[#f8f8f6] transition-colors cursor-pointer">
          <div>
            <p className="text-neutral-muted text-sm font-bold mb-1 uppercase tracking-widest">Kết nối Startup</p>
            <div className="flex items-baseline gap-3">
              <span ref={viewCount.ref} className="text-4xl font-bold text-[#171611]">{viewCount.count}</span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-full bg-[#f4f4f0] flex items-center justify-center group-hover:bg-white transition-colors">
            <Handshake className="w-7 h-7 text-neutral-muted" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 pb-12">
        <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl shadow-sm border border-neutral-surface p-6">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-[#e6cc4c]" />
            <h3 className="font-bold text-lg text-[#171611]">Phân tích Thị trường bằng AI</h3>
          </div>
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <p className="text-xs font-bold text-green-800 mb-2 flex items-center gap-1 uppercase tracking-tight">
                <TrendingUp className="w-4 h-4" /> Xu hướng công nghệ
              </p>
              <ul className="text-xs text-green-700 space-y-1.5 list-disc ml-4 font-medium">
                <li>SaaS B2B tăng 35% lượng gọi vốn trong Q2/2024.</li>
                <li>GreenTech & ClimateTech đang là xu hướng mới tại Việt Nam.</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <p className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-1 uppercase tracking-tight">
                <Brain className="w-4 h-4" /> Đề xuất chiến lược
              </p>
              <ul className="text-xs text-blue-700 space-y-1.5 list-disc ml-4 font-medium">
                <li>Phân bổ vốn giai đoạn Seed đang mang lại tỷ suất ROI (đánh giá bằng AI) tốt nhất.</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl shadow-sm border border-neutral-surface overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-neutral-surface">
            <h3 className="font-bold text-lg text-[#171611]">Hoạt động gần đây trên Danh sách theo dõi</h3>
            <Link href="/investor/watchlist" className="text-[#e6cc4c] font-bold text-sm hover:underline tracking-tight">Xem tất cả</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#f8f8f6]">
                <tr className="text-[10px] uppercase text-neutral-muted font-bold tracking-widest">
                  <th className="px-6 py-3 tracking-[0.1em]">STARTUP</th>
                  <th className="px-6 py-3 tracking-[0.1em]">CẬP NHẬT MỚI</th>
                  <th className="px-6 py-3 tracking-[0.1em]">THỜI GIAN</th>
                  <th className="px-6 py-3 text-right pr-10">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-surface">
                {watchlist.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Bookmark className="w-8 h-8 text-slate-200" />
                        <p className="text-[13px] font-bold text-slate-400">Chưa có Startup nào trong danh sách theo dõi</p>
                        <p className="text-[11px] text-slate-400">Khám phá và thêm Startup để theo dõi hoạt động tại đây.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  watchlist.map((item) => (
                    <tr key={item.watchlistId} className="hover:bg-[#f8f8f6]/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex-shrink-0 flex items-center justify-center text-[11px] font-black text-slate-500">
                            {item.startupName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-bold text-[#171611]">{item.startupName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Bookmark className="w-4 h-4 text-orange-500" />
                          <span className="text-xs font-bold text-neutral-700 tracking-tight">Đã thêm vào danh sách theo dõi</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-neutral-muted tracking-tight">
                        {new Date(item.addedAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 text-right pr-6">
                        <button className="text-neutral-muted hover:text-[#171611] transition-colors p-1 rounded-lg hover:bg-[#f4f4f0]">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <InvestorPublicProfileModal
        open={showPublicProfile}
        onOpenChange={setShowPublicProfile}
        profile={profile}
        isKycVerified={isVerified}
      />
    </div>
  );
}
