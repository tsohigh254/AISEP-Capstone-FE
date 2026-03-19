"use client";

import { useState } from "react";
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

// --- Dummy Data ---

const upcomingSchedule = [
  {
    startup: "FinNext",
    topic: "Fundraising readiness review",
    date: "Mar 20, 2026",
    time: "10:00 AM",
    duration: "60 min",
    type: "Online",
    typeIcon: Video,
    status: "Scheduled",
    statusColor: "text-blue-600",
    note: "Seed round preparation",
  },
  {
    startup: "MedScan AI",
    topic: "Go-to-market mentoring",
    date: "Mar 20, 2026",
    time: "2:00 PM",
    duration: "90 min",
    type: "Call",
    typeIcon: Phone,
    status: "Requested",
    statusColor: "text-amber-600",
    note: "Rural clinic expansion strategy",
  },
  {
    startup: "EduPlatform",
    topic: "Pitch deck refinement",
    date: "Mar 21, 2026",
    time: "9:30 AM",
    duration: "60 min",
    type: "Online",
    typeIcon: Video,
    status: "Accepted",
    statusColor: "text-green-600",
    note: "Investor demo preparation",
  },
];

const pendingReports = [
  { startup: "FinTech Innovator", date: "Mar 15, 2026", topic: "AI Architecture Consulting", deadline: "Overdue", deadlineColor: "text-red-600", deadlineBg: "bg-red-50" },
  { startup: "HealthTech Connect", date: "Mar 17, 2026", topic: "Product-market fit assessment", deadline: "Due today", deadlineColor: "text-amber-600", deadlineBg: "bg-amber-50" },
];

const recentRatings = [
  { startup: "AgriLink", rating: 5, review: "Extremely actionable advice on investor prep. Our pitch improved significantly.", topic: "Investor prep session", date: "Mar 16, 2026" },
  { startup: "FinNext", rating: 5, review: "Deep understanding of fintech landscape. Roadmap feedback was on point.", topic: "Fundraising readiness", date: "Mar 12, 2026" },
];

// --- Component ---

export default function AdvisorDashboardPage() {
  const [activeTab, setActiveTab] = useState<"today" | "week" | "pending">("today");

  const totalConsult = useCountUp(124, 1200, 0);
  const newRequests = useCountUp(5, 800, 150);
  const activeConns = useCountUp(8, 600, 450);

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
                  Manage consulting requests, upcoming sessions, reports, and performance. You have <strong>5 new requests</strong> and <strong>2 pending reports</strong> this week.
                </p>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs font-bold text-[#171611]">
                    <span>Profile Completeness</span>
                    <span>90%</span>
                  </div>
                  <div className="w-full h-3 bg-[#f4f4f0] rounded-full overflow-hidden">
                    <div className="h-full bg-[#e6cc4c] rounded-full transition-all duration-1000 ease-out" style={{ width: "90%" }}></div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/advisor/requests" className="bg-[#e6cc4c] text-[#171611] font-bold px-6 py-2.5 rounded-xl hover:shadow-lg transition-all flex items-center gap-2 group">
                  <MessageSquare className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  View Requests
                </Link>
                <Link href="/advisor/availability" className="bg-[#f4f4f0] text-[#171611] font-bold px-6 py-2.5 rounded-xl hover:bg-neutral-200 transition-all flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Set Availability
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Actions — 2x2 grid */}
          <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-neutral-surface">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-[#171611]">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: MessageSquare, label: "View Requests", href: "/advisor/requests", color: "text-blue-500", bg: "bg-blue-50" },
                { icon: Calendar, label: "My Schedule", href: "/advisor/schedule", color: "text-purple-500", bg: "bg-purple-50" },
                { icon: FileText, label: "Submit Report", href: "/advisor/reports", color: "text-orange-500", bg: "bg-orange-50" },
                { icon: Star, label: "View Feedback", href: "/advisor/reviews", color: "text-emerald-500", bg: "bg-emerald-50" },
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
              <p className="text-neutral-muted text-sm font-bold mb-1 uppercase tracking-widest">Total Consultations</p>
              <div className="flex items-baseline gap-3">
                <span ref={totalConsult.ref} className="text-4xl font-bold text-[#171611]">{totalConsult.count}</span>
                <span className="text-neutral-muted text-sm font-bold lowercase">sessions</span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <Sparkles className="w-7 h-7 text-[#e6cc4c]" />
            </div>
          </div>

          <Link href="/advisor/requests" className="col-span-12 md:col-span-4 lg:col-span-4 bg-[#e6cc4c]/10 p-6 rounded-2xl shadow-sm border-2 border-[#e6cc4c]/30 flex items-center justify-between group hover:bg-[#e6cc4c]/20 transition-all">
            <div>
              <p className="text-neutral-muted text-sm font-bold mb-1 uppercase tracking-widest">New Requests</p>
              <div className="flex items-baseline gap-3">
                <span ref={newRequests.ref} className="text-4xl font-bold text-[#171611]">{newRequests.count}</span>
                <span className="text-neutral-muted text-sm font-bold lowercase">pending</span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <MessageSquare className="w-7 h-7 text-[#e6cc4c]" />
            </div>
          </Link>

          <div className="col-span-12 md:col-span-3 lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-neutral-surface flex items-center justify-between group hover:bg-[#f8f8f6] transition-colors">
            <div>
              <p className="text-neutral-muted text-sm font-bold mb-1 uppercase tracking-widest">This Week</p>
              <div className="flex items-baseline gap-3">
                <span ref={activeConns.ref} className="text-4xl font-bold text-[#171611]">{String(activeConns.count).padStart(2, '0')}</span>
                <span className="text-neutral-muted text-sm font-bold lowercase tracking-tight">sessions</span>
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
              <h3 className="font-bold text-lg text-[#171611]">Upcoming Schedule & Priority Actions</h3>
              <div className="flex gap-1 bg-[#f4f4f0] p-1 rounded-xl">
                {[
                  { key: "today" as const, label: "Today" },
                  { key: "week" as const, label: "This Week" },
                  { key: "pending" as const, label: "Pending" },
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
                        )}>{item.status}</span>
                      </div>
                      <p className="text-xs text-neutral-muted font-medium italic">{item.date}, {item.time} — {item.topic}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === "Requested" && (
                      <>
                        <button className="bg-[#e6cc4c] px-4 py-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">Accept</button>
                        <button className="bg-neutral-100 px-4 py-2 rounded-lg text-xs font-bold text-neutral-muted opacity-0 group-hover:opacity-100 transition-opacity">Reject</button>
                      </>
                    )}
                    {item.status === "Scheduled" && (
                      <button className="bg-[#e6cc4c] px-4 py-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">Open Session</button>
                    )}
                    {item.status === "Accepted" && (
                      <button className="bg-[#e6cc4c] px-4 py-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">Confirm Schedule</button>
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
              <h3 className="font-bold text-lg text-[#171611]">Advisor Summary</h3>
            </div>
            <div className="space-y-4">
              {/* Expertise */}
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <p className="text-xs font-bold text-green-800 mb-2 flex items-center gap-1 uppercase tracking-tight">
                  <TrendingUp className="w-4 h-4" /> Expertise & Services
                </p>
                <ul className="text-xs text-green-700 space-y-1.5 list-disc ml-4 font-medium">
                  <li>FinTech, SaaS, Go-to-Market Strategy</li>
                  <li>Rate: $150/hr — 30, 60, 90 min sessions</li>
                  <li>Avg Rating: 4.9/5.0 (112 reviews)</li>
                </ul>
              </div>
              {/* Availability & Earnings */}
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                <p className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1 uppercase tracking-tight">
                  <Clock className="w-4 h-4" /> Availability & Earnings
                </p>
                <ul className="text-xs text-amber-700 space-y-1.5 list-disc ml-4 font-medium">
                  <li>Next slot: Mar 22, 10:00 AM</li>
                  <li>12 open hours this week</li>
                  <li>This month earnings: $1,200</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Link href="/advisor/profile" className="flex-1 text-center bg-[#f4f4f0] text-[#171611] font-bold px-3 py-2.5 rounded-xl hover:bg-neutral-200 transition-all text-xs">
                Edit Profile
              </Link>
              <Link href="/advisor/availability" className="flex-1 text-center bg-[#f4f4f0] text-[#171611] font-bold px-3 py-2.5 rounded-xl hover:bg-neutral-200 transition-all text-xs">
                Manage Slots
              </Link>
            </div>
          </div>

          {/* Right: Pending Reports table */}
          <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl shadow-sm border border-neutral-surface overflow-hidden">
            <div className="p-6 border-b border-neutral-surface flex items-center justify-between">
              <h3 className="font-bold text-lg text-[#171611]">Pending Report Submissions</h3>
              <Link href="/advisor/reports" className="text-[#e6cc4c] font-bold text-sm hover:underline tracking-tight">View all</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#f8f8f6]">
                  <tr className="text-[10px] uppercase text-neutral-muted font-bold tracking-widest">
                    <th className="px-6 py-3 tracking-[0.1em]">STARTUP</th>
                    <th className="px-6 py-3 tracking-[0.1em]">TOPIC</th>
                    <th className="px-6 py-3 tracking-[0.1em]">SESSION DATE</th>
                    <th className="px-6 py-3 tracking-[0.1em]">STATUS</th>
                    <th className="px-6 py-3 text-right pr-10">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-surface">
                  {pendingReports.map((report, idx) => (
                    <tr key={idx} className="hover:bg-[#f8f8f6]/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className={cn("w-5 h-5", report.deadline === "Overdue" ? "text-red-500" : "text-amber-500")} />
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
                        <button className="bg-[#e6cc4c] px-4 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          Submit Report
                        </button>
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
            <h3 className="font-bold text-lg text-[#171611] mb-6 tracking-tight">Recent Ratings & Feedback</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentRatings.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-[#f8f8f6] rounded-xl hover:shadow-md transition-shadow group cursor-pointer border border-transparent hover:border-[#e6cc4c]/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#e6cc4c]/20 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                      <Star className="w-5 h-5 text-[#e6cc4c] fill-[#e6cc4c]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#171611]">{item.startup}</p>
                      <p className="text-xs text-neutral-muted font-medium italic">"{item.review.slice(0, 60)}..."</p>
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
