"use client";

import { useState, useEffect, useMemo } from "react";
import { AdvisorShell } from "@/components/advisor/advisor-shell";
import Link from "next/link";
import { useCountUp } from "@/lib/useCountUp";
import { cn } from "@/lib/utils";
import {
  FileEdit,
  Eye,
  Clock,
  Calendar,
  Star,
  MessageSquare,
  ClipboardList,
  FileText,
  TrendingUp,
  AlertTriangle,
  MoreVertical,
  Sparkles,
  ShieldCheck,
  DollarSign,
  CheckCircle,
  XCircle,
  Video,
  Phone,
  Users,
  Settings,
  Target,
} from "lucide-react";
import {
  GetAdvisorProfile,
  GetAdvisorMentorships,
  GetAdvisorSessions,
} from "@/services/advisor/advisor.api";

// --- Helpers ---

function isSameWeek(d: Date, ref: Date) {
  const s = new Date(ref);
  const day = s.getDay();
  const diff = day === 0 ? 6 : day - 1;
  s.setDate(s.getDate() - diff);
  s.setHours(0, 0, 0, 0);
  const e = new Date(s);
  e.setDate(e.getDate() + 7);
  return d >= s && d < e;
}

function formatSessionDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatSessionTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function mapSessionStatus(raw: string): "Scheduled" | "Requested" | "Accepted" {
  const s = (raw || "").toLowerCase();
  if (s === "requested" || s === "pending") return "Requested";
  if (s === "accepted" || s === "inprogress" || s === "in_progress") return "Accepted";
  return "Scheduled";
}

function deadlineLabel(completedAt: string): { text: string; color: string; bg: string } {
  const diffDays = Math.floor((Date.now() - new Date(completedAt).getTime()) / 86400000);
  if (diffDays >= 7) return { text: "Quá hạn", color: "text-red-600", bg: "bg-red-50" };
  if (diffDays >= 6) return { text: "Hôm nay hết hạn", color: "text-amber-600", bg: "bg-amber-50" };
  return { text: `Còn ${7 - diffDays} ngày`, color: "text-blue-600", bg: "bg-blue-50" };
}

// --- Component ---

export default function AdvisorDashboardPage() {
  const [activeTab, setActiveTab] = useState<"today" | "week" | "pending">("today");
  const [hideCompleteness, setHideCompleteness] = useState(false);
  const [profile, setProfile] = useState<IAdvisorProfile | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [mentorships, setMentorships] = useState<any[]>([]);

  useEffect(() => {
    const skipped = localStorage.getItem("aisep_advisor_onboarding_skipped") === "true";
    const completed = localStorage.getItem("aisep_advisor_onboarding_completed") === "true";
    if (skipped || completed) setHideCompleteness(true);
  }, []);

  useEffect(() => {
    Promise.all([
      GetAdvisorProfile().catch(() => null),
      GetAdvisorSessions({ pageSize: 100 }).catch(() => null),
      GetAdvisorMentorships({ pageSize: 200 }).catch(() => null),
    ]).then(([profileRes, sessionsRes, mentorshipsRes]) => {
      if (profileRes) {
        const d = (profileRes as any)?.data?.data ?? (profileRes as any)?.data;
        if (d) setProfile(d);
      }
      if (sessionsRes) {
        const d = (sessionsRes as any)?.data?.items ?? (sessionsRes as any)?.data?.data?.items ?? (sessionsRes as any)?.data?.data ?? [];
        setSessions(Array.isArray(d) ? d : []);
      }
      if (mentorshipsRes) {
        const d = (mentorshipsRes as any)?.data?.items ?? (mentorshipsRes as any)?.data?.data?.items ?? (mentorshipsRes as any)?.data?.data ?? [];
        setMentorships(Array.isArray(d) ? d : []);
      }
    });
  }, []);

  const now = new Date();

  const upcomingSchedule = useMemo(() => {
    const active = sessions.filter(s => {
      const st = (s.status || "").toLowerCase();
      return st === "scheduled" || st === "requested" || st === "pending" || st === "accepted";
    });
    active.sort((a, b) => new Date(a.scheduledStartAt).getTime() - new Date(b.scheduledStartAt).getTime());
    return active.slice(0, 5).map(s => ({
      startup: s.startupName || s.startup?.displayName || s.startup?.name || "Startup",
      topic: s.objective || s.topicsDiscussed || "Tư vấn",
      date: formatSessionDate(s.scheduledStartAt),
      time: formatSessionTime(s.scheduledStartAt),
      duration: `${s.durationMinutes || 60} phút`,
      type: (s.sessionFormat || "").toLowerCase().includes("teams") ? "Call" : "Online",
      typeIcon: (s.sessionFormat || "").toLowerCase().includes("teams") ? Phone : Video,
      status: mapSessionStatus(s.status),
      sessionID: s.sessionID,
      mentorshipID: s.mentorshipID,
    }));
  }, [sessions]);

  const pendingReports = useMemo(() => {
    return mentorships
      .filter(m => {
        const st = (m.status || m.mentorshipStatus || "").toLowerCase();
        return st === "completed" && (!m.reports || m.reports.length === 0);
      })
      .slice(0, 5)
      .map(m => {
        const completedAt = m.completedAt || m.updatedAt || m.createdAt || new Date().toISOString();
        const dl = deadlineLabel(completedAt);
        return {
          startup: m.startupName || "Startup",
          date: formatSessionDate(completedAt),
          topic: m.objective || m.obligationSummary || m.challengeDescription || "Tư vấn",
          deadline: dl.text,
          deadlineColor: dl.color,
          deadlineBg: dl.bg,
          mentorshipID: m.mentorshipID || m.id,
        };
      });
  }, [mentorships]);

  const recentRatings = useMemo(() => {
    const ratings: any[] = [];
    for (const m of mentorships) {
      if (!m.feedbacks) continue;
      for (const fb of m.feedbacks) {
        const role = (fb.fromRole || "").toLowerCase();
        if (role === "startup" || role === "startupuser") {
          ratings.push({
            startup: m.startupName || "Startup",
            rating: fb.rating || 5,
            review: fb.comment || "",
            topic: m.objective || m.obligationSummary || "Tư vấn",
            date: formatSessionDate(fb.submittedAt || m.updatedAt || new Date().toISOString()),
          });
        }
      }
    }
    return ratings.slice(-4).reverse();
  }, [mentorships]);

  const totalConsultCount = useMemo(() => {
    const completedSessions = sessions.filter(s => (s.status || "").toLowerCase() === "completed").length;
    const completedMentorships = mentorships.filter(m => {
      const st = (m.status || m.mentorshipStatus || "").toLowerCase();
      return st === "completed" || st === "finalized";
    }).length;
    return completedSessions || completedMentorships || profile?.totalMentees || 0;
  }, [sessions, mentorships, profile]);

  const newRequestsCount = useMemo(() =>
    mentorships.filter(m => {
      const st = (m.status || m.mentorshipStatus || "").toLowerCase();
      return st === "requested" || st === "pending";
    }).length,
  [mentorships]);

  const thisWeekCount = useMemo(() => {
    // Ưu tiên từ endpoint sessions riêng
    const fromSessions = sessions.filter(s => {
      const st = (s.status || "").toLowerCase();
      return (st === "scheduled" || st === "accepted") && s.scheduledStartAt && isSameWeek(new Date(s.scheduledStartAt), now);
    }).length;
    if (fromSessions > 0) return fromSessions;
    // Fallback: đếm sessions lồng trong mentorships
    let count = 0;
    for (const m of mentorships) {
      const nested: any[] = (m as any).sessions || [];
      for (const s of nested) {
        const st = (s.status || s.sessionStatus || "").toLowerCase();
        if ((st === "scheduled" || st === "accepted") && s.scheduledStartAt && isSameWeek(new Date(s.scheduledStartAt), now)) {
          count++;
        }
      }
    }
    return count;
  }, [sessions, mentorships]);

  const totalConsult = useCountUp(totalConsultCount, 1200, 0);
  const newRequests = useCountUp(newRequestsCount, 800, 150);
  const activeConns = useCountUp(thisWeekCount, 600, 450);

  return (
    <AdvisorShell>
      <div className="space-y-6 animate-in fade-in duration-500">

        {/* ═══════════════════════════════════════════════════
            ROW 1 — Hero Card (8 cols) + Quick Actions (4 cols)
        ═══════════════════════════════════════════════════ */}
        <div className="grid grid-cols-12 gap-6">
          {/* Hero Card */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl p-6 shadow-sm border border-neutral-surface flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-48 h-48 rounded-xl bg-[#e6cc4c]/10 overflow-hidden shrink-0">
              <img
                alt="Advisor workspace"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPGo-MuNE1TA-f-CzA3CrxNhiTpXx6O33MdUq3W-IaDVQ7ym67WVsYzj_6y6DQg7FbffRXZWJQ18VrNJYBVodrdwsmss985qeqimmBjPdnV8vkYvC_Q0fjlVaghZCf_kvrqxGxP3dHivWdkDz8TKh0loaFMvqcs5oad2AIl1Y8j3vh7qi0ytZkwm8RLLxKFAiP7YQiEOYFqcO6_VLODJkRpYPEu1mAFYT3uLh98c8wUw33fLRLbsIZOwPUkI4ofRFvsVh95t_5Ghc"
              />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-[#171611]">Advisor Dashboard</h1>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full border border-green-200 uppercase tracking-[0.1em] flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> VERIFIED
                  </span>
                </div>
                <p className="text-neutral-muted text-sm mb-6 leading-relaxed">
                  Quản lý yêu cầu tư vấn, lịch sắp tới, báo cáo và hiệu suất. Bạn có <strong>{newRequestsCount} yêu cầu mới</strong> và <strong>{pendingReports.length} báo cáo chờ nộp</strong> tuần này.
                </p>
                {!hideCompleteness && (
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-xs font-bold text-[#171611]">
                      <span>Độ hoàn thiện hồ sơ</span>
                      <span>90%</span>
                    </div>
                    <div className="w-full h-3 bg-[#f4f4f0] rounded-full overflow-hidden">
                      <div className="h-full bg-[#e6cc4c] rounded-full transition-all duration-1000 ease-out" style={{ width: "90%" }}></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/advisor/requests" className="bg-[#e6cc4c] text-[#171611] font-bold px-6 py-2.5 rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  Xem yêu cầu
                </Link>
                <Link href="/advisor/availability" className="bg-[#f4f4f0] text-[#171611] font-bold px-6 py-2.5 rounded-xl hover:bg-neutral-200 transition-all flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Cài lịch tư vấn
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Actions — 2x2 grid */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-neutral-surface">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-[#171611]">Thao tác nhanh</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: ClipboardList, label: "Xem yêu cầu", href: "/advisor/requests", color: "text-blue-500", bg: "bg-blue-50" },
                { icon: Calendar, label: "Lịch của tôi", href: "/advisor/schedule", color: "text-purple-500", bg: "bg-purple-50" },
                { icon: FileText, label: "Nộp báo cáo", href: "/advisor/reports", color: "text-orange-500", bg: "bg-orange-50" },
                { icon: Star, label: "Xem đánh giá", href: "/advisor/feedback", color: "text-emerald-500", bg: "bg-emerald-50" },
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

        {/* ═══════════════════════════════════════════════════
            ROW 2 — 3 KPI Cards (5 + 4 + 3 cols)
        ═══════════════════════════════════════════════════ */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-5 lg:col-span-5 bg-[#e6cc4c]/10 p-6 rounded-2xl shadow-sm border-2 border-[#e6cc4c]/30 flex items-center justify-between group hover:bg-[#e6cc4c]/20 transition-all">
            <div>
              <p className="text-neutral-muted text-sm font-bold mb-1 uppercase tracking-widest">Tổng buổi tư vấn</p>
              <div className="flex items-baseline gap-3">
                <span ref={totalConsult.ref} className="text-4xl font-bold text-[#171611]">{totalConsult.count}</span>
                <span className="text-neutral-muted text-sm font-bold lowercase">buổi</span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <Sparkles className="w-7 h-7 text-[#e6cc4c]" />
            </div>
          </div>

          <Link href="/advisor/requests" className="col-span-12 md:col-span-4 lg:col-span-4 bg-[#e6cc4c]/10 p-6 rounded-2xl shadow-sm border-2 border-[#e6cc4c]/30 flex items-center justify-between group hover:bg-[#e6cc4c]/20 transition-all">
            <div>
              <p className="text-neutral-muted text-sm font-bold mb-1 uppercase tracking-widest">Yêu cầu mới</p>
              <div className="flex items-baseline gap-3">
                <span ref={newRequests.ref} className="text-4xl font-bold text-[#171611]">{newRequests.count}</span>
                <span className="text-neutral-muted text-sm font-bold lowercase">chờ xử lý</span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <ClipboardList className="w-7 h-7 text-[#e6cc4c]" />
            </div>
          </Link>

          <div className="col-span-12 md:col-span-3 lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-neutral-surface flex items-center justify-between group hover:bg-[#f8f8f6] transition-colors">
            <div>
              <p className="text-neutral-muted text-sm font-bold mb-1 uppercase tracking-widest">Tuần này</p>
              <div className="flex items-baseline gap-3">
                <span ref={activeConns.ref} className="text-4xl font-bold text-[#171611]">{String(activeConns.count).padStart(2, '0')}</span>
                <span className="text-neutral-muted text-sm font-bold lowercase tracking-tight">buổi</span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-full bg-[#f4f4f0] flex items-center justify-center group-hover:bg-white transition-colors">
              <Calendar className="w-7 h-7 text-neutral-muted" />
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            ROW 3 — Full-width: Upcoming Schedule & Priority Actions
        ═══════════════════════════════════════════════════ */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 bg-white rounded-2xl shadow-sm border border-neutral-surface overflow-hidden">
            <div className="p-6 border-b border-neutral-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="font-bold text-lg text-[#171611]">Lịch sắp tới & Ưu tiên xử lý</h3>
              <div className="flex gap-1 bg-[#f4f4f0] p-1 rounded-xl">
                {[
                  { key: "today" as const, label: "Hôm nay" },
                  { key: "week" as const, label: "Tuần này" },
                  { key: "pending" as const, label: "Chờ xử lý" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "px-4 py-1.5 text-xs font-bold rounded-lg transition-colors",
                      activeTab === tab.key
                        ? "bg-white shadow-sm text-[#171611]"
                        : "text-neutral-muted hover:text-[#171611]"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="divide-y divide-neutral-surface">
              {upcomingSchedule.length === 0 && (
                <div className="p-8 text-center text-neutral-muted text-sm">Không có lịch sắp tới</div>
              )}
              {upcomingSchedule.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-[#f8f8f6] transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#e6cc4c]/10 flex items-center justify-center">
                      <item.typeIcon className="w-5 h-5 text-[#e6cc4c]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-[#171611]">{item.startup}</p>
                        <span className="text-[10px] font-bold text-neutral-muted bg-neutral-100 px-2 py-0.5 rounded-full uppercase tracking-tight">{item.duration}</span>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight",
                          item.status === "Scheduled" ? "text-blue-600 bg-blue-50" :
                          item.status === "Requested" ? "text-amber-600 bg-amber-50" :
                          "text-green-600 bg-green-50"
                        )}>{item.status === "Scheduled" ? "Đã lên lịch" : item.status === "Requested" ? "Yêu cầu mới" : "Đã chấp nhận"}</span>
                      </div>
                      <p className="text-xs text-neutral-muted font-medium italic">{item.date}, {item.time} — {item.topic}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === "Requested" && (
                      <>
                        <button className="bg-[#e6cc4c] px-4 py-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">Chấp nhận</button>
                        <button className="bg-neutral-100 px-4 py-2 rounded-lg text-xs font-bold text-neutral-muted opacity-0 group-hover:opacity-100 transition-opacity">Từ chối</button>
                      </>
                    )}
                    {item.status === "Scheduled" && (
                      <button className="bg-[#e6cc4c] px-4 py-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">Vào phiên</button>
                    )}
                    {item.status === "Accepted" && (
                      <button className="bg-[#e6cc4c] px-4 py-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">Xác nhận lịch</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            ROW 4 — Left (4 cols) + Right (8 cols)
            Profile/Availability + Pending Reports table
        ═══════════════════════════════════════════════════ */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left: Profile + Availability + Earnings */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl shadow-sm border border-neutral-surface p-6">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-[#e6cc4c]" />
              <h3 className="font-bold text-lg text-[#171611]">Tổng quan Advisor</h3>
            </div>
            <div className="space-y-4">
              {/* Expertise */}
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <p className="text-xs font-bold text-green-800 mb-2 flex items-center gap-1 uppercase tracking-tight">
                  <TrendingUp className="w-4 h-4" /> Chuyên môn & Dịch vụ
                </p>
                <ul className="text-xs text-green-700 space-y-1.5 list-disc ml-4 font-medium">
                  {profile?.industryFocus && profile.industryFocus.length > 0
                    ? <li>{profile.industryFocus.map(i => i.industry).join(", ")}</li>
                    : <li className="text-green-500 italic">Chưa cập nhật ngành</li>
                  }
                  {profile?.title && <li>{profile.title}</li>}
                  <li>Avg Rating: {profile?.averageRating ? `${profile.averageRating.toFixed(1)}/5.0` : "Chưa có đánh giá"}</li>
                </ul>
              </div>
              {/* Availability */}
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                <p className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1 uppercase tracking-tight">
                  <Clock className="w-4 h-4" /> Trạng thái & Mentees
                </p>
                <ul className="text-xs text-amber-700 space-y-1.5 list-disc ml-4 font-medium">
                  <li>Đang nhận mentee: {profile?.availability?.isAcceptingNewMentees ? "Có" : "Không"}</li>
                  <li>Tổng mentees: {profile?.totalMentees ?? "—"}</li>
                  <li>Tổng giờ tư vấn: {profile?.totalSessionHours ?? "—"} giờ</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Link href="/advisor/profile" className="flex-1 text-center bg-[#f4f4f0] text-[#171611] font-bold px-3 py-2.5 rounded-xl hover:bg-neutral-200 transition-all text-xs">
                Chỉnh hồ sơ
              </Link>
              <Link href="/advisor/availability" className="flex-1 text-center bg-[#f4f4f0] text-[#171611] font-bold px-3 py-2.5 rounded-xl hover:bg-neutral-200 transition-all text-xs">
                Quản lý lịch
              </Link>
            </div>
          </div>

          {/* Right: Pending Reports table */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl shadow-sm border border-neutral-surface overflow-hidden">
            <div className="p-6 border-b border-neutral-surface flex items-center justify-between">
              <h3 className="font-bold text-lg text-[#171611]">Báo cáo chờ nộp</h3>
              <Link href="/advisor/reports" className="text-[#e6cc4c] font-bold text-sm hover:underline tracking-tight">Xem tất cả</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#f8f8f6]">
                  <tr className="text-[10px] uppercase text-neutral-muted font-bold tracking-widest">
                    <th className="px-6 py-3 tracking-[0.1em]">STARTUP</th>
                    <th className="px-6 py-3 tracking-[0.1em]">CHỦ ĐỀ</th>
                    <th className="px-6 py-3 tracking-[0.1em]">NGÀY TƯ VẤN</th>
                    <th className="px-6 py-3 tracking-[0.1em]">TRẠNG THÁI</th>
                    <th className="px-6 py-3 text-right pr-10">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-surface">
                  {pendingReports.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-muted text-sm">Không có báo cáo chờ nộp</td></tr>
                  )}
                  {pendingReports.map((report, idx) => (
                    <tr key={idx} className="hover:bg-[#f8f8f6]/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className={cn("w-5 h-5", report.deadlineColor === "text-red-600" ? "text-red-500" : "text-amber-500")} />
                          <span className="text-sm font-bold text-[#171611]">{report.startup}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-neutral-muted tracking-tight">{report.topic}</td>
                      <td className="px-6 py-4 text-xs font-bold text-neutral-muted tracking-tight">{report.date}</td>
                      <td className="px-6 py-4">
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight", report.deadlineBg, report.deadlineColor)}>
                          {report.deadline}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right pr-6">
                        <Link href={`/advisor/reports`} className="bg-[#e6cc4c] px-4 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          Nộp báo cáo
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            ROW 5 — Full-width: Ratings & Feedback (2-col grid)
        ═══════════════════════════════════════════════════ */}
        <div className="grid grid-cols-12 gap-6 pb-12">
          <div className="col-span-12 bg-white rounded-2xl shadow-sm border border-neutral-surface p-6">
            <h3 className="font-bold text-lg text-[#171611] mb-6 tracking-tight">Đánh giá gần đây</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentRatings.length === 0 && (
                <p className="col-span-2 text-center text-neutral-muted text-sm py-6">Chưa có đánh giá nào</p>
              )}
              {recentRatings.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-[#f8f8f6] rounded-xl hover:shadow-md transition-shadow group cursor-pointer border border-transparent hover:border-[#e6cc4c]/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#e6cc4c]/20 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                      <Star className="w-5 h-5 text-[#e6cc4c] fill-[#e6cc4c]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#171611]">{item.startup}</p>
                      <p className="text-xs text-neutral-muted font-medium italic">{item.review ? `"${item.review.slice(0, 60)}..."` : item.topic}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-0.5 justify-end mb-1">
                      {Array.from({ length: item.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className={cn("text-[10px] font-black uppercase tracking-wider text-neutral-muted")}>{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </AdvisorShell>
  );
}
