"use client";

import { Star, Search, Mail, Phone, DollarSign, ChevronRight, ChevronLeft, Filter, Users, Briefcase, StarHalf, Clock, Layout, MessageSquare, FileText, BarChart3, SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { useState } from "react";
import { MentorshipRequestModal } from "@/components/startup/mentorship-request-modal";
import { SessionReviewModal } from "@/components/startup/session-review-modal";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { StartupShell } from "@/components/startup/startup-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Advisor = {
  id: number;
  name: string;
  title: string;
  avatar: string;
  rating: number;
  reviews: number;
  consultationHours: number | string;
  price: string;
  expertise: string[];
};

const advisors: Advisor[] = [
  {
    id: 1,
    name: "Nguyễn Minh Quân",
    title: "Head of Product tại TechGlobal",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDhY2B_40T_b8ifCFhZYE9RUfdodTMIq4hkMeAvPfCxdek8AhcikuKD11XDhYpXmtyvdSlnne2UWZDbdEO4TMXf17yrSsltdyX2-bBHPjbzbTxFQNPTgQkflvmeFd6QdGRvx0WBDDS0vnBvv-defpdnEB2zPF8-sAiLMhhfWCHe6M2UpyMAwTRdjcu8xSEmKOJ3aGlWMMK40SM6ThVvCpVFz_jvRfcX6dDBi4rDUGiVvfrUIHpezyewWd_4dYD9EbKusdQxomMZQhk",
    rating: 4.9,
    reviews: 124,
    consultationHours: "120+",
    price: "50$",
    expertise: ["Product Strategy", "SaaS", "Go-to-market"],
  },
  {
    id: 2,
    name: "Trần Thu Hà",
    title: "Investment Director tại VCFund",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCkeJpKLH89dtH6jy4p8OtegH6mL83JYobMLHvAQeMV-R-JV6ohyzLx5hQ2sZ387P-fztgR4sHa7EhmwJgbBTLxFVFskQsJI0Gohh4EB7LYt7pPNPIzVeMrNhIypAV8fJEz96dPqr4r8kUGO2XeJO1lDMfCEq0VHu2jl5963wBzE9lbl2WoMzmqdPjjGz-t_FAE1IFgbbvm8uMyf_V-UtsjIaqHKgVh5bF0DB5TQdrgyJ8kdtGF1397AobYsJYg8zAxOXwFyWtd32Q",
    rating: 5.0,
    reviews: 85,
    consultationHours: "85+",
    price: "Miễn phí",
    expertise: ["Fundraising", "FinTech"],
  },
  {
    id: 3,
    name: "Phạm Thành Long",
    title: "CTO & Co-founder tại AI-Soft",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBd7t5ciDWV2eTaJsfniBll5lOH1FpM75D-rNgvvVbqucB9qLvuvCqdD2n7NevngnBF0iNuRrvyppt6TSVePvhTgOoUFPXs3COh1SFpjFFfpRM7AvqpVQYWIKMeh8ZaAHBQXX7A9LfSgc9hJLF86zECFTAuBW7cVPKthlob2LHXSFNJoAt5LewaefZBVBDzh253xnffFoI4o3adtsf5g77DpJi4MsoGYiv14LMA-ivJZaM5n2tz_QhJaAEUCzsxPuiFm3f6b9lC-GA",
    rating: 4.8,
    reviews: 210,
    consultationHours: "210+",
    price: "75$",
    expertise: ["AI/ML", "Engineering"],
  },
  {
    id: 4,
    name: "Lê Hồng Nhung",
    title: "Growth Lead tại FastDelivery",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDaiDXjuR0ngcu2gjH7wWIYdvc0Z64rZ4uKjXIuRusn_lY1IEWFYzwMyeYzlUPSUHnBTt6mDDuv0eJ8SL71wy7SaD-05KoaTWJzurSlnJClIIJsgTS--Cv40ApHR5shEQ7SeCpNxnp5xtIwWuRCBa4OUemqewQ9q0w2DqIrWm50zdbyWm-9sYgEnRGt14BdHMznN22ho7LmUpoRO43UFNRR-WvdR3xEiHq7wURyqtcS5fcDxxd6ZjMEG9GhQRcdPpl6nwaJ4uRrLE",
    rating: 4.7,
    reviews: 45,
    consultationHours: "45+",
    price: "40$",
    expertise: ["Growth Hacking", "E-commerce"],
  },
];



const requests = [
  {
    id: 1,
    advisor: advisors[0],
    topic: "Chiến lược tối ưu Product-Market Fit cho SaaS",
    challenge: "Vấn đề về retention rate đang giảm nhẹ...",
    date: "14/03/2024",
    type: "Online",
    status: "Chờ phản hồi",
    statusColor: "text-yellow-600 bg-yellow-50 border-yellow-100",
  },
  {
    id: 2,
    advisor: { name: "Trần Thị Mai Anh", title: "CMO @ VinFast", avatar: advisors[1].avatar },
    topic: "Tư vấn Go-to-Market thị trường quốc tế",
    challenge: "Xây dựng brand guidelines cho thị trường Mỹ...",
    date: "12/03/2024",
    type: "Offline",
    status: "Đã chấp nhận",
    statusColor: "text-blue-600 bg-blue-50 border-blue-100",
  },
  {
    id: 3,
    advisor: { name: "Lê Hoàng Nam", title: "Investment Director", avatar: advisors[2].avatar },
    topic: "Pitching & Fundraising Series A",
    challenge: "Rà soát Pitch Deck và dự phóng tài chính...",
    date: "08/03/2024",
    type: "Online",
    status: "Từ chối",
    statusColor: "text-slate-500 bg-slate-50 border-slate-100",
  }
];

const sessions = [
  {
    id: 1,
    advisor: advisors[0],
    time: "15/03/2024",
    hour: "14:00",
    topic: "Review Product-Market Fit Strategy",
    subTopic: "Thảo luận chuyên sâu về retention rate",
    type: "Online",
    status: "Sắp diễn ra",
    statusColor: "text-blue-600 bg-blue-50 border-blue-100",
    canJoin: true
  },
  {
    id: 2,
    advisor: { name: "Trần Thị Mai Anh", title: "CMO @ VinFast", avatar: advisors[1].avatar },
    time: "12/03/2024",
    hour: "09:30",
    topic: "Go-to-Market International Market",
    subTopic: "Xây dựng brand guidelines thị trường Mỹ",
    type: "Offline",
    status: "Đã hoàn thành",
    statusColor: "text-green-600 bg-green-50 border-green-100",
    canJoin: false
  }
];

const reports = [
  {
    id: 1,
    advisor: advisors[0],
    topic: "Tối ưu hóa sản phẩm SaaS",
    time: "14/03/2024 • 09:30 AM",
    hasReport: true,
    rating: 0,
    status: "Chưa đánh giá"
  },
  {
    id: 2,
    advisor: { name: "Trần Thị Mai Anh", title: "CMO @ VinFast", avatar: advisors[1].avatar },
    topic: "Go-to-Market quốc tế",
    time: "10/03/2024 • 02:00 PM",
    hasReport: true,
    rating: 5,
    status: "Đã đánh giá"
  }
];

export default function StartupAdvisorsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Tìm cố vấn");
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [selectedSession, setSelectedSession] = useState<any>(null);

  const filteredAdvisors = advisors.filter((advisor) => {
    const matchesSearch = advisor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      advisor.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleOpenRequest = (advisor: Advisor) => {
    setSelectedAdvisor(advisor);
    setIsRequestModalOpen(true);
  };

  const handleOpenReview = (report: any) => {
    setSelectedSession({
      advisorName: report.advisor.name,
      advisorAvatar: report.advisor.avatar,
      topic: report.topic,
      time: report.time
    });
    setIsReviewModalOpen(true);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Tìm cố vấn":
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Search & Filters */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-[20px] shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="relative w-full lg:w-[400px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                <Input
                  key="find-advisor-search"
                  type="text"
                  placeholder="Tìm theo tên hoặc chuyên môn..."
                  className="w-full pl-12 pr-4 h-11 bg-[#f8fafc]/50 dark:bg-slate-800/50 border-none rounded-xl text-sm font-bold focus:ring-1 focus:ring-yellow-400/30 transition-all placeholder:text-slate-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto px-2">
                {["Ngành nghề", "Kỹ năng", "Xếp hạng"].map((filter) => (
                  <div key={filter} className="flex items-center gap-2.5 px-4 h-11 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl cursor-pointer group hover:bg-slate-50 transition-colors">
                    <span className="text-[12px] font-bold text-slate-900 dark:text-white uppercase tracking-tight">{filter}</span>
                    <ChevronDown className="size-4 text-slate-400 group-hover:text-slate-900" />
                  </div>
                ))}
                <button className="flex items-center gap-2 px-5 h-11 bg-[#f1f5f9] dark:bg-slate-800 border-none rounded-xl text-[12px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors">
                  <SlidersHorizontal className="size-4" />
                  <span>Lọc nâng cao</span>
                </button>
              </div>
            </div>

            {/* Advisors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
              {filteredAdvisors.map((advisor) => (
                <Card key={advisor.id} className="group overflow-hidden rounded-[24px] border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:shadow-yellow-500/5 hover:-translate-y-1 transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="p-7 space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="relative size-[72px] rounded-2xl overflow-hidden border-2 border-slate-50 dark:border-slate-800 group-hover:border-[#eec54e]/20 transition-colors">
                          <Image src={advisor.avatar} alt={advisor.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-[17px] font-bold text-slate-900 dark:text-white group-hover:text-[#eec54e] transition-colors">{advisor.name}</h3>
                            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-50 dark:bg-yellow-500/10 rounded-lg">
                              <Star className="size-3.5 text-yellow-500 fill-yellow-500" />
                              <span className="text-[12px] font-bold text-yellow-700 dark:text-yellow-500">{advisor.rating}</span>
                            </div>
                          </div>
                          <p className="text-[14px] font-semibold text-slate-400 leading-tight line-clamp-1">{advisor.title}</p>
                          <div className="flex items-center gap-4 pt-2">
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Clock className="size-3.5" />
                              <span className="text-[12px] font-bold uppercase tracking-tight">{advisor.consultationHours} giờ tư vấn</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <DollarSign className="size-3.5" />
                              <span className="text-[12px] font-bold uppercase tracking-tight">Giá: {advisor.price === "Miễn phí" ? "Miễn phí" : `${advisor.price}/h`}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {advisor.expertise.map((tag) => (
                          <span key={tag} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-[11px] font-bold uppercase tracking-wider border border-transparent group-hover:border-slate-200 dark:group-hover:border-slate-700 transition-all">{tag}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 pt-2">
                        <Button variant="outline" onClick={() => router.push(`/startup/experts/${advisor.id}`)} className="flex-1 h-11 rounded-xl border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[13px] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Xem hồ sơ</Button>
                        <Button className="flex-1 h-11 rounded-xl bg-[#fdf8e6] dark:bg-yellow-500/10 text-slate-900 dark:text-yellow-500 border border-[#eec54e]/20 hover:bg-[#eec54e] dark:hover:bg-yellow-500 dark:hover:text-black transition-all font-bold text-[13px] shadow-sm" onClick={() => handleOpenRequest(advisor)}>Gửi yêu cầu</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between pt-8 pb-12 border-t border-slate-100 dark:border-slate-800">
              <p className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">Hiển thị {filteredAdvisors.length} / {advisors.length} Chuyên gia</p>
              <div className="flex items-center gap-2">
                <button className="size-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"><ChevronLeft className="size-5" /></button>
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map((page) => (
                    <button key={page} className={cn("size-10 flex items-center justify-center rounded-xl text-[14px] font-bold transition-all", page === 1 ? "bg-[#eec54e] text-white shadow-lg shadow-yellow-500/20" : "bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800")}>{page}</button>
                  ))}
                </div>
                <button className="size-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"><ChevronRight className="size-5" /></button>
              </div>
            </div>
          </div>
        );

      case "Yêu cầu của tôi":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="relative w-full lg:w-[320px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                <Input key="my-requests-search" type="text" placeholder="Tìm kiếm theo tên cố vấn..." className="w-full pl-10 pr-4 h-10 bg-white dark:bg-slate-900 border-slate-200 rounded-xl text-sm" />
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-[#eec54e] text-white rounded-xl text-sm font-bold shadow-sm">Tất cả</button>
                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50">Chờ phản hồi</button>
                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50">Đã chấp nhận</button>
                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-50">Từ chối</button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Cố vấn</th>
                    <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Chủ đề/Thách thức</th>
                    <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Ngày gửi</th>
                    <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Hình thức</th>
                    <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                    <th className="px-6 py-4 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {requests.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <img src={item.advisor.avatar} alt="" className="size-10 rounded-full object-cover border border-slate-200" />
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">{item.advisor.name}</p>
                            <p className="text-[11px] text-slate-400 font-medium">{item.advisor.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="max-w-[300px]">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{item.topic}</p>
                          <p className="text-xs text-slate-400 mt-1 truncate">{item.challenge}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-medium text-slate-600 dark:text-slate-400">{item.date}</td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-500 text-[12px] font-bold">
                          {item.type === "Online" ? <MessageSquare className="size-3.5" /> : <Users className="size-3.5" />}
                          {item.type}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={cn("px-3 py-1 rounded-full text-[11px] font-black border uppercase tracking-wider", item.statusColor)}>
                          • {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-3">
                          <Link href={`/startup/mentorship-requests/${item.id}`}>
                            <button className="p-2 text-slate-400 hover:text-[#eec54e] transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg">
                              <Search className="size-4" />
                            </button>
                          </Link>
                          {item.status === "Chờ phản hồi" && (
                            <button className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg">
                              <X className="size-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4">
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Hiển thị 1-3 của 12 yêu cầu</p>
              <div className="flex items-center gap-2">
                <button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400"><ChevronLeft className="size-4" /></button>
                {[1, 2, 3].map(p => (
                  <button key={p} className={cn("size-8 rounded-lg text-xs font-bold", p === 1 ? "bg-[#eec54e] text-white" : "border border-slate-200 text-slate-500")}>{p}</button>
                ))}
                <button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400"><ChevronRight className="size-4" /></button>
              </div>
            </div>
          </div>
        );

      case "Các phiên hướng dẫn":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="relative w-full lg:w-[320px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                <Input key="mentorship-sessions-search" type="text" placeholder="Tìm kiếm cố vấn hoặc nội dung..." className="w-full pl-10 pr-4 h-10 bg-white dark:bg-slate-900 border-slate-200 rounded-xl text-sm" />
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-[#eec54e] text-white rounded-xl text-sm font-bold">Sắp tới</button>
                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold">Đã hoàn thành</button>
                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold">Đã hủy</button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Cố vấn</th>
                    <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Thời gian</th>
                    <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Nội dung/Chủ đề</th>
                    <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Hình thức</th>
                    <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Trạng thái</th>
                    <th className="px-6 py-4 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sessions.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <img src={item.advisor.avatar} alt="" className="size-10 rounded-full object-cover border border-slate-200" />
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">{item.advisor.name}</p>
                            <p className="text-[11px] text-slate-400 font-medium">{item.advisor.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.time}</div>
                        <div className="text-xs text-slate-400">{item.hour}</div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate max-w-[250px]">{item.topic}</p>
                        <p className="text-xs text-slate-400 mt-1 truncate max-w-[250px]">{item.subTopic}</p>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-500 text-[12px] font-bold">
                          {item.type === "Online" ? <MessageSquare className="size-3.5" /> : <Users className="size-3.5" />}
                          {item.type}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={cn("px-4 py-1.5 rounded-full text-[11px] font-black border uppercase tracking-wider", item.statusColor)}>
                          • {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-3">
                          {item.canJoin && (
                            <button className="px-4 py-2 bg-yellow-400/20 text-yellow-700 border border-yellow-400/30 rounded-lg text-[11px] font-black uppercase tracking-tight hover:bg-yellow-400 hover:text-white transition-all">Tham gia họp</button>
                          )}
                          <button className="p-2 text-slate-400 hover:text-blue-500 transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg"><Search className="size-4" /></button>
                          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg"><Briefcase className="size-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between pt-4">
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Hiển thị 1-3 của 24 phiên hướng dẫn</p>
              <div className="flex items-center gap-2">
                <button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400"><ChevronLeft className="size-4" /></button>
                {[1, 2, 3].map(p => (
                  <button key={p} className={cn("size-8 rounded-lg text-xs font-bold", p === 1 ? "bg-[#eec54e] text-white" : "border border-slate-200 text-slate-500")}>{p}</button>
                ))}
                <button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400"><ChevronRight className="size-4" /></button>
              </div>
            </div>
          </div>
        );

      case "Báo cáo & Đánh giá":
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="relative w-full lg:w-[320px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
                <Input key="reports-evaluations-search" type="text" placeholder="Tìm kiếm chuyên gia..." className="w-full pl-10 pr-4 h-10 bg-white dark:bg-slate-900 border-slate-200 rounded-xl text-sm" />
              </div>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-[#eec54e] text-white rounded-xl text-sm font-bold">Tất cả</button>
                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold">Chờ đánh giá</button>
                <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-bold">Đã hoàn tất</button>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Cố vấn</th>
                    <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest">Phiên hướng dẫn</th>
                    <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Báo cáo</th>
                    <th className="px-6 py-4 text-left text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Đánh giá</th>
                    <th className="px-6 py-4 text-right text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {reports.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <img src={item.advisor.avatar} alt="" className="size-10 rounded-full object-cover border border-slate-200" />
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">{item.advisor.name}</p>
                            <p className="text-[11px] text-slate-400 font-medium">{item.advisor.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.topic}</p>
                        <p className="text-xs text-slate-400 mt-1">{item.time}</p>
                      </td>
                      <td className="px-6 py-5 text-center">
                        {item.hasReport ? (
                          <button className="flex items-center justify-center gap-2 mx-auto text-[11px] font-black text-[#e6cc4c] uppercase tracking-wide bg-yellow-50 dark:bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-[#e6cc4c]/20 hover:bg-[#e6cc4c] hover:text-white transition-all">
                            <FileText className="size-3.5" /> Xem báo cáo
                          </button>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-400 italic">Chưa có báo cáo</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-center">
                        {item.rating > 0 ? (
                          <div className="flex items-center justify-center gap-0.5">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} className={cn("size-3.5", s <= item.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200")} />)}
                          </div>
                        ) : (
                          <span className="px-3 py-1 bg-yellow-50 text-yellow-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-yellow-100 italic">Chưa đánh giá</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-3">
                          {item.rating === 0 && (
                            <button
                              onClick={() => handleOpenReview(item)}
                              className="px-4 py-2 bg-[#eec54e] text-white rounded-lg text-[11px] font-black uppercase tracking-tight shadow-sm hover:shadow-lg transition-all"
                            >
                              Gửi đánh giá
                            </button>
                          )}
                          <button className="p-2 text-slate-400 hover:text-blue-500 transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg"><Search className="size-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-4">
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Hiển thị 1-3 của 8 báo cáo</p>
              <div className="flex items-center gap-2">
                <button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400"><ChevronLeft className="size-4" /></button>
                {[1, 2].map(p => (
                  <button key={p} className={cn("size-8 rounded-lg text-xs font-bold", p === 1 ? "bg-[#eec54e] text-white" : "border border-slate-200 text-slate-500")}>{p}</button>
                ))}
                <button className="size-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400"><ChevronRight className="size-4" /></button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <StartupShell>
      <div className="max-w-[1440px] mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
        <nav className="flex items-center gap-2 text-[13px] font-medium text-slate-400">
          <Link href="/startup" className="hover:text-slate-600 transition-colors">Workspace</Link>
          <ChevronRight className="size-4 text-slate-300" />
          <Link href="/startup/experts" className="hover:text-slate-600 transition-colors">Tìm cố vấn</Link>
          {activeTab !== "Tìm cố vấn" && (
            <>
              <ChevronRight className="size-4 text-slate-300" />
              <span className="text-slate-600 font-semibold">{activeTab}</span>
            </>
          )}
        </nav>

        <div className="space-y-1.5">
          <h1 className="text-[32px] font-black text-slate-900 tracking-tight leading-none">Quản lý Mentorship</h1>
          <p className="text-slate-500 text-[15px] font-medium leading-relaxed">Theo dõi và quản lý các hoạt động tư vấn cùng chuyên gia.</p>
        </div>

        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-10">
          {["Tìm cố vấn", "Yêu cầu của tôi", "Các phiên hướng dẫn", "Báo cáo & Đánh giá"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-5 text-[15px] font-black transition-all relative tracking-tight",
                activeTab === tab
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#eec54e] rounded-full animate-in slide-in-from-left-2 duration-300" />
              )}
            </button>
          ))}
        </div>

        {renderTabContent()}

        <MentorshipRequestModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          mentor={selectedAdvisor ? { name: selectedAdvisor.name, avatar: selectedAdvisor.avatar } : null}
        />

        <SessionReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          session={selectedSession}
        />
      </div>
    </StartupShell>
  );
}
