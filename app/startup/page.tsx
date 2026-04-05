"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StartupShell } from "@/components/startup/startup-shell";
import { GetStartupProfile } from "@/services/startup/startup.api";
import Link from "next/link";
import { useCountUp } from "@/lib/useCountUp";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  FileEdit, 
  Eye, 
  FileUp, 
  Brain, 
  Users, 
  Handshake, 
  Sparkles, 
  FolderOpen, 
  MessageSquare, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  FileDown, 
  MoreVertical 
} from "lucide-react";

export default function StartupDashboardPage() {
  const router = useRouter();
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    // User explicitly chose to skip onboarding — respect that choice

    GetStartupProfile()
      .then(res => {
        const data = res as unknown as IBackendRes<any>;
        if (!(data.success || data.isSuccess) || !data.data) {
          router.replace("/startup/onboard");
        }
      })
      .catch(err => {
        if (err?.response?.status === 404) {
          router.replace("/startup/onboard");
        }
      });
  }, []);

  const profileProgress = useCountUp(65, 1200, 0);
  const aiScore = useCountUp(84, 1200, 150);
  const docCount = useCountUp(12, 800, 300);
  const connectCount = useCountUp(3, 600, 450);

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
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-black rounded-full border border-yellow-200 uppercase tracking-[0.1em]">CHƯA HOÀN THIỆN</span>
                </div>
                <p className="text-neutral-muted text-sm mb-6 leading-relaxed">Hồ sơ của bạn hiện đạt 65%. Hoàn thiện các mục còn thiếu để tăng 3x khả năng tiếp cận nhà đầu tư và nhận đánh giá AI chuyên sâu.</p>
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
                <button
                  onClick={() => setShowProfile(true)}
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
                { icon: FileUp, label: "Tài liệu & IP", href: "/startup/documents", color: "text-blue-500", bg: "bg-blue-50" },
                { icon: Brain, label: "Đánh giá AI", href: "/startup/ai-evaluation", color: "text-purple-500", bg: "bg-purple-50" },
                { icon: Users, label: "Tìm cố vấn", href: "/startup/experts", color: "text-orange-500", bg: "bg-orange-50" },
                { icon: Handshake, label: "Kết nối nhà ĐT", href: "/startup/investors", color: "text-emerald-500", bg: "bg-emerald-50" },
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
          <div className="col-span-12 bg-white rounded-2xl shadow-sm border border-neutral-surface overflow-hidden">
            <div className="p-6 border-b border-neutral-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="font-bold text-lg text-[#171611]">Cần xử lý</h3>
              <div className="flex gap-1 bg-[#f4f4f0] p-1 rounded-xl">
                <button className="px-4 py-1.5 text-xs font-bold bg-white rounded-lg shadow-sm text-[#171611]">Consulting</button>
                <button className="px-4 py-1.5 text-xs font-bold text-neutral-muted hover:text-[#171611] transition-colors">Documents</button>
                <button className="px-4 py-1.5 text-xs font-bold text-neutral-muted hover:text-[#171611] transition-colors">Verification</button>
              </div>
            </div>
            <div className="divide-y divide-neutral-surface">
              <div className="p-4 flex items-center justify-between hover:bg-[#f8f8f6] transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#171611]">Lịch tư vấn với Mentor Nguyễn Văn A</p>
                    <p className="text-xs text-neutral-muted font-medium italic">Ngày mai, 14:00 • Topic: Pitching Deck</p>
                  </div>
                </div>
                <button className="bg-[#e6cc4c] px-4 py-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">Tham gia</button>
              </div>
              <div className="p-4 flex items-center justify-between hover:bg-[#f8f8f6] transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#171611]">Cập nhật Giấy phép Kinh doanh (Bản mới)</p>
                    <p className="text-xs text-neutral-muted font-medium italic">Yêu cầu bởi Ban thẩm định</p>
                  </div>
                </div>
                <button className="bg-[#e6cc4c] px-4 py-2 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">Tải lên</button>
              </div>
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
                <ul className="text-xs text-green-700 space-y-1.5 list-disc ml-4 font-medium">
                  <li>Mô hình kinh doanh có tính khả thi cao trên thị trường Việt Nam.</li>
                  <li>Đội ngũ Founder có kinh nghiệm thực chiến trong lĩnh vực SaaS.</li>
                </ul>
              </div>
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <p className="text-xs font-bold text-red-800 mb-2 flex items-center gap-1 uppercase tracking-tight">
                  <AlertTriangle className="w-4 h-4" /> Rủi ro (Risks)
                </p>
                <ul className="text-xs text-red-700 space-y-1.5 list-disc ml-4 font-medium">
                  <li>Chi phí marketing đang tăng nhanh.</li>
                </ul>
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
                  {[
                    { name: "Pitch_Deck_v2.pdf", type: "Tài liệu gọi vốn", date: "12/05/2024", icon: FileText, iconColor: "text-red-500" },
                    { name: "Cap_Table_Seed.xlsx", type: "Tài chính", date: "10/05/2024", icon: FileText, iconColor: "text-blue-500" },
                  ].map((doc, idx) => (
                    <tr key={idx} className="hover:bg-[#f8f8f6]/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <doc.icon className={cn("w-5 h-5", doc.iconColor)} />
                          <span className="text-sm font-bold text-[#171611]">{doc.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-neutral-muted uppercase tracking-tight">{doc.type}</td>
                      <td className="px-6 py-4 text-xs font-bold text-neutral-muted tracking-tight">{doc.date}</td>
                      <td className="px-6 py-4 text-right pr-6">
                        <button className="text-neutral-muted hover:text-[#171611] transition-colors p-1 rounded-lg hover:bg-[#f4f4f0]">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6 pb-12">
          <div className="col-span-12 bg-white rounded-2xl shadow-sm border border-neutral-surface p-6">
            <h3 className="font-bold text-lg text-[#171611] mb-6 tracking-tight">Consulting & Advisors sessions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  name: "Dr. Anh Tuan",
                  role: "Expert in FinTech & Blockchain",
                  date: "14 May, 2024",
                  status: "Đã hoàn thành",
                  statusColor: "text-green-600",
                  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDSyd89CCj_zHc_LuQhWMmfq2Fe9NIXo7kap3iqhwQmj6hnZ6O9G9_TEa34oVVb9u8J5WLiZKx69vTFAGzAy-bhFnogecGAGCURhKAi82skiJ-lqbRY4oyNOkcPGFCpuJzHA_CY1eapDWvsmjvttoJFOY2UyF6XDh5BVzml3HhIGL0xmQAsEIg5td4Imhf83cA9Ksa2iMq1iLFJOYjkRWnuond7_4mFqlM6HrmkPr8BPArVgb-lQuIG9HHfZKUjbN28uwltwj3MkxM"
                },
                {
                  name: "Ms. Linh Chi",
                  role: "Marketing Strategy Specialist",
                  date: "18 May, 2024",
                  status: "Sắp diễn ra",
                  statusColor: "text-[#e6cc4c]",
                  img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDKY4d1Y63lERm80mlyRmr3m2Np_8yG6dWJUtCxN7kvLrLu89DM4CSm8QpBtvvwm3konSP-3BflEBvD1vqDcqq91_XkNfgpXBi-GPYd-hBFOCZXxz2lwC-9Czkenukr5SyakSEBVtFO25lNewwy9nxMzGyi50hodZ59AUpBSMAX5bRNom8hV9w2Ni1St46YJ1PH-4LxUjHCc1vVLoVNzGnhOEiEB8wmQvzY7Ci7l7jd4qiiMK_8yyL4A1qfApGUmiShlRKOIamZjWU"
                }
              ].map((advisor, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-[#f8f8f6] rounded-xl hover:shadow-md transition-shadow group cursor-pointer border border-transparent hover:border-[#e6cc4c]/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#e6cc4c]/20 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                      <img alt={advisor.name} className="w-full h-full object-cover" src={advisor.img} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#171611]">{advisor.name}</p>
                      <p className="text-xs text-neutral-muted font-medium italic">{advisor.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#171611]">{advisor.date}</p>
                    <p className={`text-[10px] font-black uppercase tracking-wider ${advisor.statusColor}`}>{advisor.status}</p>
                  </div>
                </div>
              ))}
            </div>
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
                SaaS • Hệ sinh thái Khởi nghiệp • TP. Hồ Chí Minh
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
                  <p className="text-2xl font-black text-[#171611]">65%</p>
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
                <p className="text-lg font-bold text-[#171611]">Pre-Seed → Seed</p>
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

