"use client";

import { StartupShell } from "@/components/startup/startup-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Star,
    Mail,
    Phone,
    DollarSign,
    ChevronRight,
    Clock,
    MessageSquare,
    Send,
    Calendar,
    Award,
    BookOpen,
    Briefcase,
    Users,
    ChevronLeft
} from "lucide-react";
import { useState, use } from "react";
import { MentorshipRequestModal } from "@/components/startup/mentorship-request-modal";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const advisors = [
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
        bio: "Hơn 10 năm kinh nghiệm trong lĩnh vực quản lý sản phẩm Tech. Đã từng dẫn dắt các dự án quy mô lớn tại các tập đoàn đa quốc gia và startup unicorns.",
        philosophy: "Tập trung vào giá trị cốt lõi của sản phẩm và trải nghiệm người dùng là chìa khóa để thành công bền vững.",
        experience: [
            {
                year: "2021 - Hiện tại",
                role: "Head of Product",
                company: "TechGlobal",
                desc: "Dẫn dắt đội ngũ 50+ người, xây dựng hệ sinh thái sản phẩm SaaS."
            },
            {
                year: "2018 - 2021",
                role: "Senior Product Manager",
                company: "Unicorn App",
                desc: "Phụ trách mảng tăng trưởng người dùng, đạt 10 triệu người dùng hàng tháng."
            }
        ]
    },
    // Add more advisors as needed...
];

export default function ExpertProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

    const mentor = advisors.find(a => a.id === parseInt(id)) || advisors[0];

    return (
        <StartupShell>
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
                {/* Breadcrumbs */}
                <div className="flex items-center justify-between">
                    <nav className="flex items-center gap-2 text-[13px] font-medium text-slate-400">
                        <Link href="/startup" className="hover:text-slate-600 transition-colors">Workspace</Link>
                        <ChevronRight className="size-4 text-slate-300" />
                        <Link href="/startup/experts" className="hover:text-slate-600 transition-colors">Tìm cố vấn</Link>
                        <ChevronRight className="size-4 text-slate-300" />
                        <span className="text-slate-600 font-semibold">{mentor.name}</span>
                    </nav>
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="text-slate-500 font-bold text-sm flex items-center gap-2"
                    >
                        <ChevronLeft className="size-4" />
                        Quay lại
                    </Button>
                </div>

                {/* Hero Section */}
                <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-10 relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 right-0 size-64 bg-yellow-400/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-10 relative z-10">
                        <div className="relative size-40 rounded-[40px] overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl shadow-yellow-500/10">
                            <Image
                                src={mentor.avatar}
                                alt={mentor.name}
                                fill
                                className="object-cover"
                            />
                        </div>

                        <div className="flex-1 space-y-6 text-center md:text-left">
                            <div className="space-y-2">
                                <div className="flex items-center justify-center md:justify-start gap-3">
                                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{mentor.name}</h1>
                                    <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50 border-0 font-bold px-3 py-1 rounded-lg">Verified Expert</Badge>
                                </div>
                                <p className="text-lg font-semibold text-slate-400">{mentor.title}</p>
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="size-10 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 flex items-center justify-center">
                                        <Star className="size-5 text-yellow-500 fill-yellow-500" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white leading-none">{mentor.rating}</p>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{mentor.reviews} Đánh giá</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-6 border-x border-slate-100 dark:border-slate-800">
                                    <div className="size-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                                        <Clock className="size-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white leading-none">{mentor.consultationHours}</p>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Giờ tư vấn</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="size-10 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                                        <DollarSign className="size-5 text-green-500" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white leading-none">{mentor.price === "Miễn phí" ? "Miễn phí" : `${mentor.price}/h`}</p>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Chi phí</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                                <Button className="h-12 px-8 rounded-2xl bg-[#fdf8e6] dark:bg-yellow-500/10 text-slate-900 dark:text-yellow-500 border border-[#eec54e]/20 hover:bg-[#eec54e] dark:hover:bg-yellow-500 dark:hover:text-black transition-all font-bold shadow-lg shadow-yellow-500/10"
                                    onClick={() => setIsRequestModalOpen(true)}
                                >
                                    Gửi yêu cầu Mentorship
                                </Button>
                                <Button variant="outline" className="h-12 px-8 rounded-2xl border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300">
                                    Gửi tin nhắn
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Tabs */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="rounded-[32px] border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                            <CardContent className="p-8 space-y-10">
                                <section className="space-y-4">
                                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Giới thiệu Chuyên gia</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[15px]">
                                        {mentor.bio}
                                    </p>
                                </section>

                                <section className="space-y-4 pt-8 border-t border-slate-50 dark:border-slate-800">
                                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Triết lý hướng dẫn</h3>
                                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 relative">
                                        <MessageSquare className="absolute -top-3 -left-3 size-8 text-[#eec54e]/20" />
                                        <p className="text-slate-700 dark:text-slate-300 font-semibold italic text-[15px]">
                                            "{mentor.philosophy}"
                                        </p>
                                    </div>
                                </section>

                                <section className="space-y-6 pt-8 border-t border-slate-50 dark:border-slate-800">
                                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Kinh nghiệm & Thành tựu</h3>
                                    <div className="space-y-8 relative before:absolute before:inset-0 before:left-[11px] before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
                                        {mentor.experience.map((item, id) => (
                                            <div key={id} className="relative pl-10 space-y-2">
                                                <div className="absolute left-0 top-1.5 size-6 rounded-full bg-white dark:bg-slate-900 border-2 border-[#eec54e] shadow-sm shadow-yellow-500/20 z-10" />
                                                <span className="text-[12px] font-bold text-yellow-600 dark:text-yellow-500 uppercase tracking-wider">{item.year}</span>
                                                <h4 className="text-[16px] font-bold text-slate-900 dark:text-white">{item.role}</h4>
                                                <p className="text-sm font-bold text-slate-500">{item.company}</p>
                                                <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[32px] border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                            <CardContent className="p-8 space-y-6">
                                <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Đánh giá từ Startup</h3>
                                <div className="space-y-6">
                                    {[1, 2].map((i) => (
                                        <div key={i} className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-700" />
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">CEO {i === 1 ? "FoodHub" : "SafeDrive"}</p>
                                                        <p className="text-[11px] font-bold text-slate-400">Startup Vòng hạt giống</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Star className="size-3 text-yellow-500 fill-yellow-500" />
                                                    <span className="text-sm font-bold text-slate-900 dark:text-white">5.0</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                                                "Kiến thức chuyên môn rất sâu rộng, những lời khuyên thực tế giúp chúng tôi tối ưu hóa được 20% chi phí vận hành ngay trong tháng đầu tiên."
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card className="rounded-[32px] border-slate-100 dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-800/50 overflow-hidden border-none p-2 shadow-sm">
                            <CardContent className="bg-white dark:bg-slate-900 rounded-[28px] p-8 space-y-8">
                                <div className="space-y-6">
                                    <h4 className="text-[13px] font-bold text-slate-900 dark:text-white text-center pb-4 border-b border-slate-50 dark:border-slate-800 italic">Thông tin tư vấn</h4>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="size-9 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                                                    <Briefcase className="size-4 text-orange-500" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hỗ trợ tốt nhất</span>
                                            </div>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">Chiến lược</span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="size-9 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                                                    <Calendar className="size-4 text-purple-500" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thời gian rảnh</span>
                                            </div>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">Thứ 3, Thứ 5</span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="size-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                                                    <Users className="size-4 text-blue-500" />
                                                </div>
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mạng lưới</span>
                                            </div>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">500+ Kết nối</span>
                                        </div>
                                    </div>

                                    <Button className="w-full h-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all">
                                        Đặt lịch tư vấn ngay
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-[32px] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                            <CardContent className="p-8 space-y-6">
                                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 dark:border-slate-800 pb-4">Chuyên môn chính</h4>
                                <div className="space-y-5">
                                    {[
                                        { label: "Product Strategy", value: 95 },
                                        { label: "SaaS Development", value: 88 },
                                        { label: "Growth Hacking", value: 80 }
                                    ].map((skill, id) => (
                                        <div key={id} className="space-y-2.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300">{skill.label}</span>
                                                <span className="text-[13px] font-bold text-[#eec54e]">{skill.value}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-[#eec54e] rounded-full shadow-lg shadow-yellow-500/20 transition-all duration-1000" style={{ width: `${skill.value}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Modal */}
                <MentorshipRequestModal
                    isOpen={isRequestModalOpen}
                    onClose={() => setIsRequestModalOpen(false)}
                    mentor={{ name: mentor.name, avatar: mentor.avatar }}
                />
            </div>
        </StartupShell>
    );
}
