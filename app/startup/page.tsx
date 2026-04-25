"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { StartupShell } from "@/components/startup/startup-shell";
import { useCountUp } from "@/lib/useCountUp";
import { cn } from "@/lib/utils";
import {
  BrainCircuit,
  FileText,
  Users,
  Handshake,
  Sparkles,
  FolderOpen,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Eye,
  MoreVertical,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GetDocument } from "@/services/document/document.api";
import { GetMentorships, GetMentorshipSessions } from "@/services/startup/startup-mentorship.api";
import { GetSentConnections, GetReceivedConnections } from "@/services/connection/connection.api";
import { GetStartupProfile, GetMembers } from "@/services/startup/startup.api";
import { GetEvaluationHistory, GetEvaluationReport } from "@/services/ai/ai.api";
import { mapCanonicalToReport } from "./ai-evaluation/canonical-mapper";
import { calcProfileCompleteness } from "@/lib/profile-completeness";
import { StartupReadinessCard } from "@/components/startup/readiness/startup-readiness-card";

export default function StartupDashboardPage() {
  const [showProfile, setShowProfile] = useState(false);

  // States tải data API thật
  const [realDocCount, setRealDocCount] = useState(0);
  const [realConnectCount, setRealConnectCount] = useState(0);
  const [realAiScore, setRealAiScore] = useState(0); // Sẽ lấy từ API
  const [aiSummary, setAiSummary] = useState<string>("");
  const [aiStrengths, setAiStrengths] = useState<string[]>([]);

  const [activeHandlingTab, setActiveHandlingTab] = useState<"Consulting" | "Documents" | "Verification">("Consulting");
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [actionableDocs, setActionableDocs] = useState<any[]>([]);
  const [recentDocs, setRecentDocs] = useState<any[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [profileMembers, setProfileMembers] = useState<any[]>([]);

  const completeness = calcProfileCompleteness(profileData, profileMembers);
  const profileProgress = useCountUp(completeness, 1200, 0);

  // Helper: lấy tên file từ URL nếu backend không cung cấp `title`
  const fileNameFromUrl = (url?: string | null) => {
    if (!url) return null;
    try {
      const parts = url.split("/");
      return parts[parts.length - 1] || null;
    } catch {
      return null;
    }
  };

  const getSessionTimestamp = (s: any) => {
    const raw =
      s?.scheduledStartAt || s?.scheduledAt || s?.ScheduledStartAt || s?.ScheduledAt ||
      s?.startAt || s?.StartAt || s?.createdAt || s?.CreatedAt || 0;
    const t = new Date(raw).getTime();
    return Number.isFinite(t) ? t : 0;
  };

  const getSessionId = (s: any) =>
    s?.sessionID ?? s?.sessionId ?? s?.SessionID ?? s?.id ?? s?.Id ?? null;

  const getSessionMentorshipId = (s: any) =>
    s?.MentorshipID ?? s?.mentorshipID ?? s?.mentorshipId ?? s?.MentorshipId ??
    s?.mentorship?.MentorshipID ?? s?.mentorship?.mentorshipID ?? s?.mentorship?.mentorshipId ?? s?.mentorship?.id ??
    s?.Mentorship?.MentorshipID ?? s?.Mentorship?.mentorshipID ?? s?.Mentorship?.mentorshipId ?? s?.Mentorship?.id ??
    null;

  const buildRecentSessions = (sessions: any[], mentorshipStatusMap?: Map<number, string>) => {
    const unique = new Map<string, any>();

    for (const s of sessions || []) {
      const sessionId = getSessionId(s);
      const mentorshipId = getSessionMentorshipId(s);
      const ts = getSessionTimestamp(s);

      if (!ts) continue;

      const key = sessionId != null
        ? `session:${String(sessionId)}`
        : `mentor:${String(mentorshipId ?? "")}:${String(ts)}`;

      if (!unique.has(key)) unique.set(key, s);
    }

    const sorted = Array.from(unique.values()).sort((a: any, b: any) => getSessionTimestamp(b) - getSessionTimestamp(a));

    return sorted.slice(0, 4).map((s: any) => {
      const mId = getSessionMentorshipId(s);
      const mStatus = mentorshipStatusMap && mId ? (mentorshipStatusMap.get(Number(mId)) || "") : "";
      return { ...s, _mentorshipStatus: mStatus };
    });
  };

  useEffect(() => {
    // 0. Tải profile và members để tính độ hoàn thiện
    Promise.all([
      GetStartupProfile().catch(() => null),
      GetMembers().catch(() => null),
    ]).then(([resProfile, resMembers]: any) => {
      if (resProfile && (resProfile.success || resProfile.isSuccess) && resProfile.data) {
        setProfileData(resProfile.data);
        // Lấy điểm AI và summary từ lần đánh giá gần nhất (COMPLETED) đúng startupId
        const startupId = resProfile.data.id || resProfile.data.startupId || resProfile.data.startupID;
        if (startupId) {
          const normalizeScore = (raw: any): number | null => {
            if (raw == null) return null;
            const n = Number(raw);
            if (!Number.isFinite(n)) return null;
            if (n <= 1) return Math.round(n * 100);
            if (n <= 10) return Math.round(n * 10);
            return Math.round(n);
          };

          const extractEvaluationId = (item: any): number => {
            const idRaw = item?.evaluationId ?? item?.runId ?? item?.RunId ?? item?.id ?? item?.Id ?? item?.run_id ?? 0;
            return Number(idRaw) || 0;
          };

          const isCompleted = (item: any): boolean => {
            const statusRaw = item?.status ?? item?.Status ?? item?.statusName ?? item?.StatusName ?? "";
            const status = String(statusRaw).toUpperCase();
            return status === "COMPLETED" || status === "PARTIAL_COMPLETED";
          };

          GetEvaluationHistory(startupId)
            .then(async (res: any) => {
              if (!(res.success || res.isSuccess) || !Array.isArray(res.data)) return;

              const completedList = [...res.data]
                .filter((x: any) => isCompleted(x))
                .map((x: any) => ({
                  item: x,
                  evaluationId: extractEvaluationId(x),
                  ts: new Date(x.generatedAt || x.calculatedAt || x.createdAt || x.updatedAt || x.created_at || x.updated_at || 0).getTime() || 0,
                }))
                .filter((x: any) => x.evaluationId > 0)
                .sort((a: any, b: any) => (b.ts - a.ts) || (b.evaluationId - a.evaluationId));

              for (const candidate of completedList) {
                const { item, evaluationId } = candidate;

                try {
                  const reportRes: any = await GetEvaluationReport(evaluationId);
                  const reportPayload = reportRes?.data?.report ?? reportRes?.data ?? reportRes;
                  const mapped = mapCanonicalToReport(evaluationId, reportPayload);

                  const score = normalizeScore(mapped?.overallScore)
                    ?? normalizeScore(item?.overallScore ?? item?.OverallScore ?? item?.overall_score)
                    ?? 0;

                  const strengths = Array.isArray(mapped?.strengths)
                    ? mapped.strengths.filter((s: any) => typeof s === "string" && s.trim().length > 0)
                    : [];

                  setRealAiScore(score);
                  setAiSummary(typeof mapped?.executiveSummary === "string" ? mapped.executiveSummary : "");
                  setAiStrengths(strengths);
                  return;
                } catch {
                  const mapped = mapCanonicalToReport(evaluationId, item);

                  const score = normalizeScore(mapped?.overallScore)
                    ?? normalizeScore(item?.overallScore ?? item?.OverallScore ?? item?.overall_score)
                    ?? 0;

                  const strengths = Array.isArray(mapped?.strengths)
                    ? mapped.strengths.filter((s: any) => typeof s === "string" && s.trim().length > 0)
                    : [];

                  if (score > 0 || strengths.length > 0 || (typeof mapped?.executiveSummary === "string" && mapped.executiveSummary.trim().length > 0)) {
                    setRealAiScore(score);
                    setAiSummary(typeof mapped?.executiveSummary === "string" ? mapped.executiveSummary : "");
                    setAiStrengths(strengths);
                    return;
                  }
                }
              }

              // Không có bản COMPLETED hợp lệ
              setRealAiScore(0);
              setAiSummary("");
              setAiStrengths([]);
            })
            .catch(() => {});
        }
      }
      if (resMembers && (resMembers.success || resMembers.isSuccess) && Array.isArray(resMembers.data)) {
        setProfileMembers(resMembers.data);
      }
    });

    // 1. Tải thống kê số lượng tài liệu thật
    GetDocument()
      .then((res: any) => {
        const data = res.data;
        if ((res.success || res.isSuccess) && Array.isArray(data)) {
          // Xếp tài liệu mới nhất lên đầu tiên theo ngày
          const sortedDocs = [...data].sort((a: any, b: any) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
          
          setRealDocCount(sortedDocs.length);
          
          // Lọc tài liệu cần xử lý: chưa hoàn tất blockchain (chưa Anchored)
          const needsVerifying = sortedDocs.filter((d: any) => {
            const p = String(d.proofStatus ?? "").toLowerCase().trim();
            // Đã anchored (on-chain) = hoàn tất, không cần xử lý
            return p !== "anchored" && p !== "0";
          });
          setActionableDocs(needsVerifying.slice(0, 3));

          // Gán tài liệu gần đây
          setRecentDocs(sortedDocs.slice(0, 3));
        }
      })
      .catch(() => {});

    // 2. Tải thống kê số lượng Kết nối Nhà đầu tư (khớp tab "Đã kết nối" ở /startup/investors)
    Promise.all([
      GetSentConnections(1, 100, "Accepted").catch(() => null),
      GetReceivedConnections(1, 100, "Accepted").catch(() => null),
    ])
      .then(([sentConnRes, receivedConnRes]: any) => {
        const getItems = (res: any) => {
          if (!res || !(res.success || res.isSuccess)) return [];
          const payload = res.data ?? res;
          if (Array.isArray(payload?.items)) return payload.items;
          if (Array.isArray(payload?.data)) return payload.data;
          if (Array.isArray(payload)) return payload;
          return [];
        };

        const sentItems = getItems(sentConnRes);
        const receivedItems = getItems(receivedConnRes);
        const allAccepted = [...sentItems, ...receivedItems];

        // Deduplicate by connectionID to avoid double count if backend returns overlap.
        const uniqueById = Array.from(
          new Map(
            allAccepted
              .filter((x: any) => x && x.connectionID != null)
              .map((x: any) => [String(x.connectionID), x])
          ).values()
        );

        const totalAccepted = uniqueById.length > 0
          ? uniqueById.length
          : allAccepted.length;

        setRealConnectCount(totalAccepted);
      })
      .catch(() => {});

    // 3. Tải danh sách phiên tư vấn (sessions) — dùng endpoint sessions nếu có
    GetMentorshipSessions({ page: 1, pageSize: 50 })
      .then((res: any) => {
        if (res.success || res.isSuccess) {
          const rawData = res.data || res;
          const allSessions = Array.isArray(rawData.items) ? rawData.items
            : Array.isArray(rawData.data) ? rawData.data
            : Array.isArray(rawData) ? rawData
            : [];

          // Lấy thêm danh sách mentorship để biết trạng thái mentorship (ví dụ: Cancelled/Completed)
          GetMentorships({ page: 1, pageSize: 50 })
            .then((mentRes: any) => {
              const rawM = mentRes.data || mentRes;
              const allMentorships = Array.isArray(rawM.items) ? rawM.items
                : Array.isArray(rawM.data) ? rawM.data
                : Array.isArray(rawM) ? rawM
                : [];

              const mentorshipStatusMap = new Map<number, string>();
              for (const m of allMentorships) {
                const id = m.MentorshipID ?? m.mentorshipID ?? m.mentorshipId ?? m.MentorshipId ?? m.id ?? null;
                const status = String(m.Status || m.status || m.StatusName || m.statusName || m.StatusText || m.statusText || "").toLowerCase();
                if (id) mentorshipStatusMap.set(Number(id), status);
              }

              const excluded = [
                "cancelled","canceled","cancel","cancelled_by_advisor","cancelled_by_user","cancel_by_advisor","cancel_by_user",
                "rejected","declined","completed","finished","done","closed"
              ];

              // Chỉ giữ các session hợp lệ: loại bỏ các session có status xấu và các mentorship đã hủy/hoàn thành, và chỉ lấy các phiên còn trong tương lai
              const actionableFiltered = allSessions.filter((s: any) => {
                const status = String(s.sessionStatus || s.status || s.SessionStatus || "").toLowerCase();
                if (excluded.includes(status)) return false;

                const mId = s.MentorshipID ?? s.mentorshipID ?? s.mentorshipId ?? s.MentorshipId ?? s.mentorshipid ?? s.mentorshipId ?? null;
                const mentorshipStatus = mId ? (mentorshipStatusMap.get(Number(mId)) || "") : "";
                if (mentorshipStatus && excluded.includes(mentorshipStatus)) return false;

                const scheduledAt = s.scheduledStartAt || s.scheduledAt || s.ScheduledStartAt || s.ScheduledAt || s.startAt || s.StartAt;
                const start = scheduledAt ? new Date(scheduledAt) : null;
                if (!start) return false;
                return start.getTime() >= Date.now();
              });

              // Sắp xếp theo thời gian (gần nhất trước)
              actionableFiltered.sort((a: any, b: any) => {
                const aTime = new Date(a.scheduledStartAt || a.scheduledAt || a.ScheduledStartAt || a.ScheduledAt).getTime() || 0;
                const bTime = new Date(b.scheduledStartAt || b.scheduledAt || b.ScheduledStartAt || b.ScheduledAt).getTime() || 0;
                return aTime - bTime;
              });


              // Gom trùng theo mentorship id để không hiển thị nhiều mục giống nhau
              const seen = new Set<string>();
              const uniqueByMentorship: any[] = [];
              const extractMentorshipId = (s: any) =>
                s?.MentorshipID ?? s?.mentorshipID ?? s?.mentorshipId ?? s?.MentorshipId ??
                s?.mentorship?.MentorshipID ?? s?.mentorship?.mentorshipID ?? s?.mentorship?.mentorshipId ?? s?.mentorship?.id ??
                s?.Mentorship?.MentorshipID ?? s?.mentorship?.MentorshipId ?? s?.mentorship?.id ?? null;

              for (const s of actionableFiltered) {
                const mIdRaw = extractMentorshipId(s);
                const key = String(mIdRaw ?? "").trim();
                if (!key) continue;
                if (seen.has(key)) continue;
                seen.add(key);
                uniqueByMentorship.push(s);
              }

              setUpcomingSessions(uniqueByMentorship.slice(0, 3));

              // Luôn hiển thị đúng 4 phiên gần nhất (khử trùng theo sessionID trước khi cắt top 4)
              setRecentSessions(buildRecentSessions(allSessions, mentorshipStatusMap));
            })
            .catch(() => {
              // Nếu không lấy được mentorship list thì fallback về filter cục bộ chỉ dựa vào session
              const actionableFiltered = allSessions.filter((s: any) => {
                const status = String(s.sessionStatus || s.status || s.SessionStatus || "").toLowerCase();
                if (["cancelled","canceled","completed"].includes(status)) return false;
                const scheduledAt = s.scheduledStartAt || s.scheduledAt || s.ScheduledStartAt || s.ScheduledAt || s.startAt || s.StartAt;
                const start = scheduledAt ? new Date(scheduledAt) : null;
                if (!start) return false;
                return start.getTime() >= Date.now();
              });

              actionableFiltered.sort((a: any, b: any) => {
                const aTime = new Date(a.scheduledStartAt || a.scheduledAt || a.ScheduledStartAt || a.ScheduledAt).getTime() || 0;
                const bTime = new Date(b.scheduledStartAt || b.scheduledAt || b.ScheduledStartAt || b.ScheduledAt).getTime() || 0;
                return aTime - bTime;
              });

              const seen = new Set<string>();
              const uniqueByMentorship: any[] = [];
              const extractMentorshipId = (s: any) =>
                s?.MentorshipID ?? s?.mentorshipID ?? s?.mentorshipId ?? s?.MentorshipId ??
                s?.mentorship?.MentorshipID ?? s?.mentorship?.mentorshipID ?? s?.mentorship?.mentorshipId ?? s?.mentorship?.id ??
                s?.Mentorship?.MentorshipID ?? s?.mentorship?.MentorshipId ?? s?.mentorship?.id ?? null;

              for (const s of actionableFiltered) {
                const mIdRaw = extractMentorshipId(s);
                const key = String(mIdRaw ?? "").trim();
                if (!key) continue;
                if (seen.has(key)) continue;
                seen.add(key);
                uniqueByMentorship.push(s);
              }

              setUpcomingSessions(uniqueByMentorship.slice(0, 3));

              // Fallback: vẫn khử trùng và lấy 4 phiên gần nhất
              setRecentSessions(buildRecentSessions(allSessions));
            });
        }
      })
      .catch(() => {});
    }, []);

  const aiScore = useCountUp(realAiScore, 1200, 150);
  const docCount = useCountUp(realDocCount, 800, 300);
  const connectCount = useCountUp(realConnectCount, 600, 450);

  return (
    <StartupShell>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl p-6 shadow-sm border border-neutral-surface flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-48 h-48 rounded-xl bg-[#e6cc4c]/10 overflow-hidden shrink-0">
              <img
                alt="Startup brand visual"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPGo-MuNE1TA-f-CzA3CrxNhiTpXx6O33MdUq3W-IaDVQ7ym67WVsYzj_6y6DQg7FbffRXZWJQ18VrNJYBVodrdwsmss985qeqimmBjPdnV8vkYvC_Q0fjlVaghZCf_kvrqxGxP3dHivWdkDz8TKh0loaFMvqcs5oad2AIl1Y8j3vh7qi0ytZkwm8RLLxKFAiP7YQiEOYFqcO6_VLODJkRpYPEu1mAFYT3uLh98c8wUw33fLRLbsIZOwPUkI4ofRFvsVh95t_5Ghc"
              />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-[#171611]">AISEP Startup Platform</h1>
                  {completeness >= 100
                    ? <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full border border-emerald-200 uppercase tracking-[0.1em]">HOÀN THIỆN</span>
                    : <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-black rounded-full border border-yellow-200 uppercase tracking-[0.1em]">CHƯA HOÀN THIỆN</span>
                  }
                </div>
                <p className="text-neutral-muted text-sm mb-6 leading-relaxed">Hồ sơ của bạn hiện đạt {completeness}%. Hoàn thiện các mục còn thiếu để tăng 3x khả năng tiếp cận nhà đầu tư và nhận đánh giá AI chuyên sâu.</p>
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
                <Link
                  href="/startup/startup-profile"
                  className="bg-[#f4f4f0] text-[#171611] font-bold px-6 py-2.5 rounded-xl hover:bg-neutral-200 transition-all flex items-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  Xem hồ sơ công khai
                </Link>
              </div>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-neutral-surface">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-[#171611]">Thao tác nhanh</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: FileText, label: "Tài liệu & SHTT", href: "/startup/documents", color: "text-blue-500", bg: "bg-blue-50" },
                { icon: BrainCircuit, label: "Đánh giá tiềm năng", href: "/startup/ai-evaluation", color: "text-purple-500", bg: "bg-purple-50" },
                { icon: Users, label: "Tìm cố vấn", href: "/startup/experts", color: "text-orange-500", bg: "bg-orange-50" },
                { icon: Handshake, label: "Kết nối đầu tư", href: "/startup/investors", color: "text-emerald-500", bg: "bg-emerald-50" },
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
          <div className="col-span-12 md:col-span-5 lg:col-span-5 bg-[#e6cc4c]/10 p-6 rounded-2xl shadow-sm border-2 border-[#e6cc4c]/30 flex items-center justify-between group hover:bg-[#e6cc4c]/20 transition-all">
            <div>
              <p className="text-neutral-muted text-sm font-bold mb-1 uppercase tracking-widest">AI Score</p>
              <div className="flex items-baseline gap-3">
                <span ref={aiScore.ref} className="text-4xl font-bold text-[#171611]">{aiScore.count}</span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <Sparkles className="w-7 h-7 text-[#e6cc4c]" />
            </div>
          </div>
          <Link href="/startup/documents" className="col-span-12 md:col-span-4 lg:col-span-4 bg-[#e6cc4c]/10 p-6 rounded-2xl shadow-sm border-2 border-[#e6cc4c]/30 flex items-center justify-between group hover:bg-[#e6cc4c]/20 transition-all">
            <div>
              <p className="text-neutral-muted text-sm font-bold mb-1 uppercase tracking-widest">Documents</p>
              <div className="flex items-baseline gap-3">
                <span ref={docCount.ref} className="text-4xl font-bold text-[#171611]">{docCount.count}</span>
                <span className="text-neutral-muted text-sm font-bold lowercase">Files</span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <FolderOpen className="w-7 h-7 text-[#e6cc4c]" />
            </div>
          </Link>
          <div className="col-span-12 md:col-span-3 lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-neutral-surface flex items-center justify-between group hover:bg-[#f8f8f6] transition-colors">
            <div>
              <p className="text-neutral-muted text-sm font-bold mb-1 uppercase tracking-widest">Kết nối</p>
              <div className="flex items-baseline gap-3">
                <span ref={connectCount.ref} className="text-4xl font-bold text-[#171611]">{String(connectCount.count).padStart(2, '0')}</span>
                <span className="text-neutral-muted text-sm font-bold lowercase tracking-tight">Hoạt động</span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-full bg-[#f4f4f0] flex items-center justify-center group-hover:bg-white transition-colors">
              <Handshake className="w-7 h-7 text-neutral-muted" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12">
            <StartupReadinessCard />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 bg-white rounded-2xl shadow-sm border border-neutral-surface overflow-hidden">
            <div className="p-6 border-b border-neutral-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="font-bold text-lg text-[#171611]">Cần xử lý</h3>
              <div className="flex gap-1 bg-[#f4f4f0] p-1 rounded-xl">
                <button 
                  onClick={() => setActiveHandlingTab("Consulting")}
                  className={cn("px-4 py-1.5 text-xs font-bold rounded-lg transition-colors", activeHandlingTab === "Consulting" ? "bg-white shadow-sm text-[#171611]" : "text-neutral-muted hover:text-[#171611]")}>
                  Consulting
                  {upcomingSessions.length > 0 && <span className="ml-1.5 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-[8px]">{upcomingSessions.length}</span>}
                </button>
                <button 
                  onClick={() => setActiveHandlingTab("Documents")}
                  className={cn("px-4 py-1.5 text-xs font-bold rounded-lg transition-colors", activeHandlingTab === "Documents" ? "bg-white shadow-sm text-[#171611]" : "text-neutral-muted hover:text-[#171611]")}>
                  Documents
                  {actionableDocs.length > 0 && <span className="ml-1.5 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-[8px]">{actionableDocs.length}</span>}
                </button>
              </div>
            </div>
            <div className="divide-y divide-neutral-surface min-h-[120px]">
              {activeHandlingTab === "Consulting" && upcomingSessions.length === 0 && (
                <div className="p-5 text-center text-sm font-medium text-neutral-400 italic">
                  Bạn không có phiên tư vấn nào đang chờ xử lý.
                </div>
              )}
              {activeHandlingTab === "Consulting" && upcomingSessions.map((session, idx) => {
                const advisorName = session?.advisor?.fullName || session?.advisorName || session?.AdvisorName || "Không tên";
                const scheduledAt = session?.scheduledStartAt || session?.scheduledAt || session?.ScheduledStartAt || session?.ScheduledAt;
                const scheduledDate = scheduledAt ? new Date(scheduledAt).toLocaleDateString("vi-VN") : "Sắp xếp";
                const scheduledTime = scheduledAt ? new Date(scheduledAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "";
                const topic = session?.objective || session?.topics || session?.TopicsDiscussed || "";
                const mentorshipId = session?.mentorshipID || session?.mentorshipId || session?.MentorshipID || "";

                return (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-[#f8f8f6] transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#171611]">Lịch tư vấn với Mentor {advisorName}</p>
                        <p className="text-xs text-neutral-muted font-medium italic">
                          {scheduledDate} • {scheduledTime}
                          &nbsp;•&nbsp; Topic: {topic}
                        </p>
                        <p className="text-[11px] text-neutral-muted mt-1">ID: {mentorshipId}/{session?.sessionID || session?.sessionId || session?.SessionID || ''}</p>
                      </div>
                    </div>
                    <Link href={`/startup/mentorship-requests/${mentorshipId}`} className="bg-[#e6cc4c] px-4 py-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Xem chi tiết
                    </Link>
                  </div>
                );
              })}

              {activeHandlingTab === "Documents" && actionableDocs.length === 0 && (
                <div className="p-5 text-center text-sm font-medium text-neutral-400 italic">
                  Kho tài liệu của bạn đã được cập nhật đầy đủ.
                </div>
              )}
              {activeHandlingTab === "Documents" && actionableDocs.map((doc, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-[#f8f8f6] transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                            <div>
                            {/* Prefer explicit title or filename when available, fallback to documentType */}
                            {(() => {
                              const name = doc?.title || fileNameFromUrl(doc?.fileUrl) || `Tài liệu ${doc?.documentType || "Mới"}`;
                              return (
                                <>
                                  <p className="text-sm font-bold text-[#171611]">{name} {doc?.version ? `· v${doc.version}` : null}</p>
                                  <p className="text-xs text-neutral-muted font-medium italic">
                                    Trạng thái xác thực: <span className="text-red-500">{
                                      (() => {
                                        const p = String(doc.proofStatus ?? "").toLowerCase().trim();
                                        if (!p) return "Chưa gửi";
                                        if (p === "pending" || p === "3") return "Chờ xác nhận";
                                        if (p === "hashcomputed" || p === "2") return "Đã hash, chưa gửi";
                                        if (p === "revoked" || p === "1") return "Đã thu hồi";
                                        return doc.proofStatus || "Chưa gửi";
                                      })()
                                    }</span> • Cập nhật lúc {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString("vi-VN") : ""}
                                  </p>
                                </>
                              );
                            })()}
                          </div>
                  </div>
                  <Link href={"/startup/documents"} className="bg-[#e6cc4c] px-4 py-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Tải lại
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl shadow-sm border border-neutral-surface p-6">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-[#e6cc4c]" />
              <h3 className="font-bold text-lg text-[#171611]">AI Evaluation Summary</h3>
            </div>
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <p className="text-xs font-bold text-green-800 mb-2 flex items-center gap-1 uppercase tracking-tight">
                  <TrendingUp className="w-4 h-4" /> Thế mạnh (Strengths)
                </p>
                {aiStrengths && aiStrengths.length > 0 ? (
                  <ul className="text-xs text-green-700 space-y-1.5 list-disc ml-4 font-medium">
                    {aiStrengths.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-green-600 italic">Chưa có dữ liệu strengths từ AI.</p>
                )}
              </div>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl shadow-sm border border-neutral-surface overflow-hidden">
            <div className="p-6 border-b border-neutral-surface flex items-center justify-between">
              <h3 className="font-bold text-lg text-[#171611]">Tài liệu gần đây</h3>
              <Link href="/startup/documents" className="text-[#e6cc4c] font-bold text-sm hover:underline tracking-tight">Quản lý kho</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#f8f8f6]">
                  <tr className="text-[10px] uppercase text-neutral-muted font-bold tracking-widest">
                    <th className="px-6 py-3 tracking-[0.1em]">TÊN TÀI LIỆU</th>
                    <th className="px-6 py-3 tracking-[0.1em]">LOẠI</th>      
                    <th className="px-6 py-3 tracking-[0.1em]">NGÀY TẢI</th> 
                    <th className="px-6 py-3 text-right pr-10">Thao tác</th>   
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-surface">
                  {recentDocs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm font-medium text-neutral-400 italic">
                        Chưa có tài liệu nào gần đây
                      </td>
                    </tr>
                  ) : (
                    recentDocs.map((doc, idx) => (
                      <tr key={idx} className="hover:bg-[#f8f8f6]/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-yellow-600" />
                            <span className="text-sm font-bold text-[#171611]">
                              {doc.title || `Tài liệu ${doc.documentType || "KHÁC"} - ${doc.version || "1.0"}`}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-neutral-muted uppercase tracking-tight">
                          {doc.documentType || "KHÁC"}
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-neutral-muted tracking-tight">
                          {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString("vi-VN") : "Gần đây"}
                        </td>
                        <td className="px-6 py-4 text-right pr-6">
                          <button className="text-neutral-muted hover:text-[#171611] transition-colors p-1 rounded-lg hover:bg-[#f4f4f0]">
                            &bull;&bull;&bull;
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

        <div className="grid grid-cols-12 gap-6 pb-12">
          <div className="col-span-12 bg-white rounded-2xl shadow-sm border border-neutral-surface p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg text-[#171611] tracking-tight">Consulting & Advisors sessions</h3>
              <Link href="/startup/mentorship-requests" className="text-[#e6cc4c] font-bold text-sm hover:underline tracking-tight">Xem tất cả</Link>
            </div>
            {recentSessions.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-neutral-200 mx-auto mb-3" />
                <p className="text-sm text-neutral-400 font-medium">Chưa có phiên tư vấn nào</p>
                <Link href="/startup/experts" className="text-[#e6cc4c] text-xs font-bold mt-2 inline-block hover:underline">Tìm cố vấn</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentSessions.map((session, idx) => {
                  const advisorName = session?.advisor?.fullName || session?.advisorName || session?.AdvisorName || "Cố vấn";
                  const advisorAvatar =
                    session?.advisor?.profilePhotoURL ||
                    session?.advisor?.profilePhotoUrl ||
                    session?.advisorProfilePhotoURL ||
                    session?.advisorProfilePhotoUrl ||
                    session?.AdvisorProfilePhotoURL ||
                    session?.advisorAvatar ||
                    "";
                  const scheduledAt = session?.scheduledStartAt || session?.scheduledAt || session?.ScheduledStartAt || session?.ScheduledAt;
                  const scheduledDate = scheduledAt ? new Date(scheduledAt).toLocaleDateString("vi-VN") : "—";
                  const scheduledTime = scheduledAt ? new Date(scheduledAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "";
                  const rawStatus = String(session?.sessionStatus || session?.status || session?.SessionStatus || session?._mentorshipStatus || "").toLowerCase();
                  const mentorshipId = session?.mentorshipID || session?.mentorshipId || session?.MentorshipID || "";

                  const now = Date.now();
                  const sessionTime = scheduledAt ? new Date(scheduledAt).getTime() : 0;
                  const isPast = sessionTime < now;

                  let statusLabel = "Đang chờ";
                  let statusColor = "text-[#e6cc4c]";
                  if (["completed", "finished", "done"].includes(rawStatus)) {
                    statusLabel = "Đã hoàn thành"; statusColor = "text-green-600";
                  } else if (["cancelled", "canceled", "rejected", "declined"].includes(rawStatus)) {
                    statusLabel = "Đã hủy"; statusColor = "text-red-500";
                  } else if (isPast) {
                    statusLabel = "Đã diễn ra"; statusColor = "text-green-600";
                  } else {
                    statusLabel = "Sắp diễn ra"; statusColor = "text-[#e6cc4c]";
                  }

                  const initials = advisorName.split(" ").map((w: string) => w[0]).join("").substring(0, 2).toUpperCase();

                  return (
                    <Link
                      key={idx}
                      href={mentorshipId ? `/startup/mentorship-requests/${mentorshipId}` : "/startup/mentorship-requests"}
                      className="flex items-center justify-between p-4 bg-[#f8f8f6] rounded-xl hover:shadow-md transition-shadow group cursor-pointer border border-transparent hover:border-[#e6cc4c]/20"
                    >
                      <div className="flex items-center gap-4">
                        {advisorAvatar ? (
                          <img
                            src={advisorAvatar}
                            alt={advisorName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#e6cc4c]/20 flex items-center justify-center border-2 border-white shadow-sm group-hover:scale-105 transition-transform text-sm font-bold text-[#171611]">
                            {initials}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-[#171611]">{advisorName}</p>
                          <p className="text-xs text-neutral-muted font-medium italic">
                            {session?.objective || session?.topics || "Phiên tư vấn"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-[#171611]">{scheduledDate} {scheduledTime}</p>
                        <p className={`text-[10px] font-black uppercase tracking-wider ${statusColor}`}>{statusLabel}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PUBLIC PROFILE DIALOG */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl">
          <div className="relative">
            {/* Cover */}
            <div className="h-32 bg-gradient-to-r from-[#e6cc4c]/60 to-[#e6cc4c]/20 rounded-t-2xl" />
            {/* Avatar */}
            <div className="absolute left-6 -bottom-10 w-20 h-20 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-[#e6cc4c]/10">
              <img
                alt="Startup logo"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPGo-MuNE1TA-f-CzA3CrxNhiTpXx6O33MdUq3W-IaDVQ7ym67WVsYzj_6y6DQg7FbffRXZWJQ18VrNJYBVodrdwsmss985qeqimmBjPdnV8vkYvC_Q0fjlVaghZCf_kvrqxGxP3dHivWdkDz8TKh0loaFMvqcs5oad2AIl1Y8j3vh7qi0ytZkwm8RLLxKFAiP7YQiEOYFqcO6_VLODJkRpYPEu1mAFYT3uLh98c8wUw33fLRLbsIZOwPUkI4ofRFvsVh95t_5Ghc"
              />
            </div>
          </div>

          <div className="px-6 pt-14 pb-6 space-y-6">
            <DialogHeader className="text-left">
              <div className="flex items-center gap-3 flex-wrap">
                <DialogTitle className="text-2xl font-bold text-[#171611]">     
                  AISEP Startup Platform
                </DialogTitle>
                <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black rounded-full border border-green-200 uppercase tracking-[0.1em]"> 
                  Đã xác thực
                </span>
              </div>
              <p className="text-sm text-neutral-500 font-medium">
                SaaS &bull; Hệ sinh thái Khởi nghiệp &bull; TP. Hồ Chí Minh 
              </p>
            </DialogHeader>

            {/* About */}
            <div>
              <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">Giới thiệu</h4>
              <p className="text-sm text-[#171611] leading-relaxed">
                AISEP là nền tảng vận hành hệ sinh thái khởi nghiệp toàn diện, giúp kết nối Startup với Nhà đầu tư và Cố vấn chuyên nghiệp thông qua công nghệ Blockchain và AI.
              </p>
            </div>

            {/* Key Metrics */}
            <div>
              <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-3">Chỉ số nổi bật</h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#f8f8f6] rounded-xl p-4 text-center border border-neutral-100">
                  <p className="text-2xl font-black text-[#171611]">84</p>      
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-1">AI Score</p>
                </div>
                <div className="bg-[#f8f8f6] rounded-xl p-4 text-center border border-neutral-100">
                  <p className="text-2xl font-black text-[#171611]">12</p>      
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-1">Tài liệu</p>
                </div>
                <div className="bg-[#f8f8f6] rounded-xl p-4 text-center border border-neutral-100">
                  <p className="text-2xl font-black text-[#171611]">{completeness}%</p>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-1">Hoàn thiện</p>
                </div>
              </div>
            </div>

            {/* Team */}
            <div>
              <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-3">Đội ngũ sáng lập</h4>
              <div className="flex flex-wrap gap-3">
                {[
                  { name: "Nguyễn Minh Tuấn", role: "CEO & Co-Founder" },   
                  { name: "Trần Thị Hồng", role: "CTO" },
                  { name: "Lê Văn Khoa", role: "COO" },
                ].map((member, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-[#f8f8f6] px-4 py-3 rounded-xl border border-neutral-100">
                    <div className="w-9 h-9 rounded-full bg-[#e6cc4c]/20 flex items-center justify-center text-xs font-black text-[#171611]">
                      {member.name.split(" ").pop()?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#171611]">{member.name}</p>
                      <p className="text-[11px] text-neutral-400 font-medium">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-3">Lĩnh vực</h4>
              <div className="flex flex-wrap gap-2">
                {["Blockchain", "SaaS", "B2B", "Startup Ecosystem", "AI"].map((tag) => (
                  <span key={tag} className="px-3 py-1.5 bg-[#e6cc4c]/10 border border-[#e6cc4c]/20 rounded-full text-xs font-bold text-[#171611]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Stage */}
            <div className="flex items-center justify-between bg-[#e6cc4c]/10 border border-[#e6cc4c]/20 rounded-xl p-4">
              <div>
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Giai đoạn gọi vốn</p>
                <p className="text-lg font-bold text-[#171611]">Pre-Seed &rarr; Seed</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Mục tiêu</p>
                <p className="text-lg font-bold text-[#171611]">$500K</p>       
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </StartupShell>
  );
}
