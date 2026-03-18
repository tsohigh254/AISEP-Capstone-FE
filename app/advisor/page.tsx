"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  DollarSign, 
  Users, 
  Clock,
  Star,
  MoreVertical,
  ChevronDown,
  Eye,
  MessageSquare,
  FileText,
  Sparkles,
  Search,
  Building
} from "lucide-react";
import { AdvisorShell } from "@/components/advisor/advisor-shell";
import { useCountUp } from "@/lib/useCountUp";
import { cn } from "@/lib/utils";
import { GetAdvisorProfile } from "@/services/advisor/advisor.api";
import { useAuth } from "@/context/context";

type ConsultationRequest = {
  id: string;
  status: "URGENT" | "NEW";
  company: string;
  stage: string;
  category: string;
  description: string;
  duration: string;
  date?: string;
  requester: string;
  timeAgo: string;
  rate: string;
};

type WeeklyMetric = {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative";
  subtitle?: string;
};

type Review = {
  id: string;
  rating: number;
  comment: string;
  reviewer: string;
  timeAgo: string;
};

const consultationRequests: ConsultationRequest[] = [
  {
    id: "1",
    status: "URGENT",
    company: "FinTech AI",
    stage: "Seed",
    category: "FinTech",
    description: "Initial consultation on fundraising strategy",
    duration: "1-hour consultation",
    date: "Feb 2, 2PM",
    requester: "Sarah Johnson",
    timeAgo: "2 hours ago",
    rate: "$250/hr",
  },
  {
    id: "2",
    status: "NEW",
    company: "HealthTech Solutions",
    stage: "Pre-seed",
    category: "HealthTech",
    description: "Product-market fit guidance for our healthcare app",
    duration: "3-month mentorship",
    requester: "Mike Rodriguez",
    timeAgo: "5 hours ago",
    rate: "$200/hr",
  },
  {
    id: "3",
    status: "NEW",
    company: "EduPlatform",
    stage: "Series A",
    category: "EdTech",
    description: "Scaling strategy consultation",
    duration: "2-hour consultation",
    requester: "David Chen",
    timeAgo: "1 day ago",
    rate: "$300/hr",
  },
];

const weeklyData = [
  { day: "Mon", value: 4 },
  { day: "Tue", value: 5 },
  { day: "Wed", value: 2 },
  { day: "Thu", value: 1 },
  { day: "Fri", value: 0 },
  { day: "Sat", value: 0 },
  { day: "Sun", value: 0 },
];

const latestReviews: Review[] = [
  {
    id: "1",
    rating: 5,
    comment: "Excellent guidance on our fundraising strategy. Dr. Chen's insights were invaluable!",
    reviewer: "Sarah Johnson",
    timeAgo: "2 days ago",
  },
  {
    id: "2",
    rating: 5,
    comment: "Very professional and helpful. Highly recommend!",
    reviewer: "Mike Rodriguez",
    timeAgo: "3 days ago",
  },
];


export default function AdvisorDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState("Jan 22-28");
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  
  // Profile existence check
  useEffect(() => {
    const checkProfile = async () => {
      try {
        const res = await GetAdvisorProfile();
        // Even if no profile (404/failure), we still allow entering dashboard
        // The hero section will show the "Complete Profile" status
        setIsCheckingProfile(false);
      } catch (err: any) {
        // Just let them in
        setIsCheckingProfile(false);
      }
    };
    
    if (user?.userType?.toLowerCase() === "advisor") {
      checkProfile();
    } else {
      setIsCheckingProfile(false);
    }
  }, [user, router]);

  // Top metrics
  const earnings = useCountUp(12450, 1400, 0);
  const clients = useCountUp(23, 800, 150);
  const sessions = useCountUp(156, 1200, 300);
  const pending = useCountUp(7, 600, 450);
  
  // Weekly summary
  const weeklySessions = useCountUp(12, 800, 0);
  const weeklyHours = useCountUp(18, 800, 150);
  const weeklyRating = useCountUp(49, 800, 300);
  const weeklyEarned = useCountUp(3200, 1000, 450);

  if (isCheckingProfile) {
    return (
      <div className="min-h-screen bg-[#f8f8f6] flex items-center justify-center font-plus-jakarta-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#f0f042] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-black uppercase tracking-widest text-neutral-400">Verifying Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <AdvisorShell>
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Hero Section */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl p-6 shadow-sm border border-neutral-surface flex flex-col md:flex-row gap-6 group hover:shadow-md transition-all">
            <div className="w-full md:w-48 h-48 rounded-xl bg-[#e6cc4c]/10 overflow-hidden shrink-0 relative border-2 border-[#e6cc4c]/10">
              <img
                alt="Advisor profile"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSyd89CCj_zHc_LuQhWMmfq2Fe9NIXo7kap3iqhwQmj6hnZ6O9G9_TEa34oVVb9u8J5WLiZKx69vTFAGzAy-bhFnogecGAGCURhKAi82skiJ-lqbRY4oyNOkcPGFCpuJzHA_CY1eapDWvsmjvttoJFOY2UyF6XDh5BVzml3HhIGL0xmQAsEIg5td4Imhf83cA9Ksa2iMq1iLFJOYjkRWnuond7_4mFqlM6HrmkPr8BPArVgb-lQuIG9HHfZKUjbN28uwltwj3MkxM"
              />
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[9px] font-black text-[#e6cc4c] border border-[#e6cc4c]/20 uppercase">PRO ADVISOR</div>
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-[#171611]">Dr. Anh Tuan</h1>
                  <span className="px-3 py-1 bg-[#fdf8e6] text-[#878164] text-[10px] font-black rounded-full border border-[#e6cc4c]/30 uppercase tracking-[0.1em]">Verified Expert</span>
                </div>
                <p className="text-[#878164] text-sm font-bold uppercase tracking-widest mb-4">Expert in FinTech & Blockchain</p>
                <p className="text-neutral-muted text-sm mb-6 leading-relaxed max-w-xl">
                  Bạn đang đứng trong top 5% chuyên gia có tỷ lệ đánh giá cao nhất hệ thống. Hãy tiếp tục duy trì tương tác để nâng hạng mức độ ưu tiên trong các yêu cầu tư vấn mới.
                </p>

                <div className="space-y-2 mb-8 max-w-md">
                  <div className="flex justify-between items-end">
                    <span className="text-[11px] font-black text-[#878164] uppercase tracking-wider">Tiến độ hoàn thiện hồ sơ</span>
                    <span className="text-xs font-black text-[#171611]">85%</span>
                  </div>
                  <div className="w-full h-2 bg-[#f4f4f0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#171611] rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button className="px-6 py-3 bg-[#e6cc4c] text-[#171611] text-[11px] font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-[#e6cc4c]/20 transition-all flex items-center gap-2 group/btn">
                    <Star className="w-4 h-4 fill-current" />
                    Hoàn thiện hồ sơ
                  </button>
                  <button className="px-6 py-3 bg-white border-2 border-neutral-surface text-[#171611] text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-neutral-surface/20 transition-all flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Xem hồ sơ công khai
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-neutral-surface">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-[#171611]">Thao tác nhanh</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Clock, label: "Lịch rảnh", href: "/advisor/schedule", color: "text-blue-500", bg: "bg-blue-50" },
                { icon: Eye, label: "Xem hồ sơ", href: "/advisor/profile", color: "text-purple-500", bg: "bg-purple-50" },
                { icon: MessageSquare, label: "Tin nhắn", href: "/advisor/messaging", color: "text-orange-500", bg: "bg-orange-50" },
                { icon: FileText, label: "Yêu cầu mới", href: "/advisor/requests", color: "text-emerald-500", bg: "bg-emerald-50" },
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

        {/* Stats Grid */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-neutral-surface flex items-center justify-between group hover:bg-[#fdf8e6] hover:border-[#e6cc4c]/30 transition-all">
            <div>
              <p className="text-[#878164] text-[11px] font-black mb-1 uppercase tracking-widest">TỔNG THU NHẬP</p>
              <div className="flex items-baseline gap-1">
                <span ref={earnings.ref} className="text-3xl font-bold text-[#171611]">{earnings.count.toLocaleString()}</span>
                <span className="text-sm font-bold text-[#878164] ml-1">$</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#fdf8e6] flex items-center justify-center border border-[#e6cc4c]/20 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6 text-[#e6cc4c]" />
            </div>
          </div>

          <div className="col-span-12 md:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-neutral-surface flex items-center justify-between group hover:bg-[#f4f4f0] transition-all">
            <div>
              <p className="text-[#878164] text-[11px] font-black mb-1 uppercase tracking-widest">SESSIONS HOÀN THÀNH</p>
              <div className="flex items-baseline gap-2">
                <span ref={sessions.ref} className="text-3xl font-bold text-[#171611]">{sessions.count}</span>
                <span className="text-[11px] font-bold text-slate-400 lowercase">buổi tư vấn</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#f4f4f0] flex items-center justify-center border border-neutral-surface group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-slate-400" />
            </div>
          </div>

          <div className="col-span-12 md:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-neutral-surface flex items-center justify-between group hover:bg-[#f4f4f0] transition-all">
            <div>
              <p className="text-[#878164] text-[11px] font-black mb-1 uppercase tracking-widest">KẾT NỐI MỚI</p>
              <div className="flex items-baseline gap-2">
                <span ref={pending.ref} className="text-3xl font-bold text-[#171611]">{pending.count.toString().padStart(2, '0')}</span>
                <span className="text-[11px] font-bold text-slate-400 lowercase">yêu cầu mới</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#f4f4f0] flex items-center justify-center border border-neutral-surface group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-[#171611]" />
            </div>
          </div>
        </div>

        {/* Cần xử lý Section (Full Width) */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-surface overflow-hidden">
          <div className="p-6 border-b border-neutral-surface flex items-center justify-between">
            <h3 className="font-bold text-lg text-[#171611]">Cần xử lý</h3>
            <div className="flex bg-[#f4f4f0] p-1 rounded-xl gap-1">
              {["Consulting", "Documents", "Verification"].map((tab) => (
                <button
                  key={tab}
                  className={cn(
                    "px-4 py-1.5 text-[11px] font-black uppercase tracking-wider rounded-lg transition-all",
                    tab === "Consulting" ? "bg-white text-[#171611] shadow-sm" : "text-[#878164] hover:text-[#171611]"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-neutral-surface">
            {consultationRequests.map((request) => (
              <div key={request.id} className="p-6 flex items-center justify-between hover:bg-[#f8f8f6]/50 transition-colors group">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-[#e6cc4c]/10 flex items-center justify-center text-[#e6cc4c] shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-[#171611] truncate">
                      Lịch tư vấn với <span className="text-[#878164]">{request.requester}</span> ({request.company})
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-bold uppercase tracking-wider">
                      {request.date || "Sắp tới"} • Topic: {request.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all">
                  <button className="px-4 py-2 bg-[#e6cc4c] text-[#171611] text-[10px] font-black uppercase rounded-lg hover:shadow-lg transition-all">Duyệt</button>
                  <button className="px-4 py-2 bg-white border border-neutral-surface text-[#171611] text-[10px] font-black uppercase rounded-lg hover:bg-neutral-surface transition-all">Từ chối</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance & Reviews Section (Grid) */}
        <div className="grid grid-cols-12 gap-6">
        {/* Performance & Reviews Section (Grid) */}
        <div className="grid grid-cols-12 gap-6 pb-12">
          {/* Chart/Performance Section */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl shadow-sm border border-neutral-surface p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[#e6cc4c] rounded-full"></div>
                <h4 className="font-bold text-[#171611]">Hiệu suất tuần này</h4>
              </div>
              <div className="flex gap-2">
                {["Tổng quan", "Chi tiết"].map((t) => (
                  <button key={t} className={cn("px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", t === "Tổng quan" ? "bg-[#171611] text-white" : "text-[#878164] hover:bg-[#f4f4f0]")}>{t}</button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-auto">
              {/* Progress Bars */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Mức độ hài lòng</span>
                    <span className="text-xs font-black text-[#171611]">98%</span>
                  </div>
                  <div className="w-full h-2 bg-[#f4f4f0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#e6cc4c] rounded-full shadow-[0_0_8px_rgba(230,204,76,0.5)]" style={{ width: '98%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">Tỷ lệ phản hồi</span>
                    <span className="text-xs font-black text-[#171611]">100%</span>
                  </div>
                  <div className="w-full h-2 bg-[#f4f4f0] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: '100%' }}></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-[#878164] uppercase mb-1 tracking-wider">Weekly Earned</p>
                    <p className="text-xl font-bold text-[#171611]">${weeklyEarned.count.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-[#878164] uppercase mb-1 tracking-wider">Mới (Tuần này)</p>
                    <p className="text-xl font-bold text-[#171611]">{weeklySessions.count} sessions</p>
                  </div>
                </div>
              </div>

              {/* Mini Bar Chart */}
              <div className="flex flex-col">
                <div className="flex items-end justify-between h-32 gap-3 border-b border-[#f4f4f0] pb-2 mb-4">
                  {weeklyData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar">
                      <div className="relative w-full flex justify-center items-end h-full">
                        <div 
                          className="w-full bg-[#f4f4f0] rounded-t-lg group-hover/bar:bg-[#e6cc4c]/50 transition-all cursor-pointer relative"
                          style={{ height: `${(d.value / 7) * 100}%` }}
                        >
                           <div 
                            className="absolute bottom-0 left-0 right-0 bg-[#e6cc4c] rounded-t-lg shadow-[0_-4px_10px_rgba(230,204,76,0.3)]"
                            style={{ height: '50%' }}
                           ></div>
                        </div>
                      </div>
                      <span className="text-[9px] font-black text-[#878164] uppercase">{d.day}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-3 border-2 border-dashed border-[#e6cc4c]/30 rounded-xl text-[10px] font-black text-[#878164] uppercase tracking-widest hover:border-[#e6cc4c] hover:text-[#171611] transition-all flex items-center justify-center gap-2 group/btn">
                  Tải Report chi tiết
                </button>
              </div>
            </div>
          </div>

          {/* Latest Reviews Section */}
          <div className="col-span-12 lg:col-span-4 bg-[#171611] rounded-2xl shadow-sm p-6 text-white overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-700">
              <Star className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h4 className="font-bold text-white/90">Đánh giá mới</h4>
                <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg">
                  <Star className="w-3 h-3 fill-[#e6cc4c] text-[#e6cc4c]" />
                  <span className="text-xs font-black text-[#e6cc4c]">{(weeklyRating.count / 10).toFixed(1)}</span>
                </div>
              </div>
              
              <div className="space-y-6">
                {latestReviews.slice(0, 2).map((review) => (
                  <div key={review.id} className="border-b border-white/10 pb-6 last:border-0 last:pb-0">
                    <p className="text-[13px] font-medium text-white/70 italic leading-relaxed mb-4">
                      "{review.comment}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[11px] font-black border border-white/5">
                        {review.reviewer.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-white truncate max-w-[120px]">{review.reviewer}</p>
                        <p className="text-[9px] text-white/40 uppercase font-black">{review.timeAgo}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </AdvisorShell>
  );
}
