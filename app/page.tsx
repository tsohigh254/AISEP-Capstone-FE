"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Shield,
  Users,
  Network,
  CheckCircle2,
  Clock,
  FileText,
  BarChart3,
  Star,
  Link2,
  Calendar,
  Rocket,
  Database,
  Plus,
  BadgeCheck,
  Mail,
  MapPin,
  Quote,
} from "lucide-react";
import { PublicHeader } from "@/components/layout/PublicHeader";

export default function Home() {
  const roleOrder = ["startup", "investor", "advisor"] as const;
  const [activeRole, setActiveRole] = useState<
    "startup" | "investor" | "advisor"
  >("startup");
  const [roleDirection, setRoleDirection] = useState(1);
  const prefersReducedMotion = useReducedMotion();

  const handleRoleChange = (nextRole: (typeof roleOrder)[number]) => {
    if (nextRole === activeRole) return;
    const nextIndex = roleOrder.indexOf(nextRole);
    const currentIndex = roleOrder.indexOf(activeRole);
    setRoleDirection(nextIndex > currentIndex ? 1 : -1);
    setActiveRole(nextRole);
  };

  const heroContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.11,
        delayChildren: prefersReducedMotion ? 0 : 0.12,
      },
    },
  };

  const heroItem = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 16 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 1.05, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  const rolePanelVariants = {
    enter: (direction: number) => ({
      opacity: 0,
      x: prefersReducedMotion ? 0 : direction > 0 ? 24 : -24,
    }),
    center: {
      opacity: 1,
      x: 0,
    },
    exit: (direction: number) => ({
      opacity: 0,
      x: prefersReducedMotion ? 0 : direction > 0 ? -20 : 20,
    }),
  };

  const testimonials = [
    {
      name: "Nguyễn Minh Khang",
      role: "Founder • Startup",
      quote:
        "AISEP giúp team mình chuẩn hóa hồ sơ gọi vốn rất nhanh, có checklist rõ ràng nên đỡ bỏ sót tài liệu quan trọng.",
      rating: 5,
    },
    {
      name: "Lê Thu Hà",
      role: "Angel Investor",
      quote:
        "Phần dữ liệu startup trình bày có cấu trúc, tiết kiệm rất nhiều thời gian khi sàng lọc cơ hội đầu tư ban đầu.",
      rating: 5,
    },
    {
      name: "Trần Quốc Việt",
      role: "Advisor • Product",
      quote:
        "Luồng mentorship trực quan, dễ theo dõi tiến độ từng startup và lưu lại báo cáo sau mỗi phiên làm việc.",
      rating: 4,
    },
    {
      name: "Phạm Ngọc Linh",
      role: "Co-founder • Startup",
      quote:
        "Bọn mình thích nhất là cơ chế chia sẻ tài liệu có kiểm soát, vừa tiện vừa đảm bảo bảo mật thông tin nội bộ.",
      rating: 5,
    },
    {
      name: "Đỗ Anh Tuấn",
      role: "VC Associate",
      quote:
        "Nền tảng chạy ổn định, giao diện dễ dùng. Phần đánh giá và tổng hợp thông tin hỗ trợ DD rất tốt ở giai đoạn đầu.",
      rating: 4,
    },
    {
      name: "Vũ Mai Phương",
      role: "Mentor • Growth",
      quote:
        "Từ khi dùng AISEP, việc phối hợp giữa mentor và startup mượt hơn nhiều vì mọi đầu việc đều có lịch sử rõ ràng.",
      rating: 5,
    },
    {
      name: "Bùi Hoàng Nam",
      role: "Founder • SaaS Startup",
      quote:
        "Dashboard theo dõi tiến độ rất trực quan, team mới vào là dùng được ngay mà không cần training nhiều.",
      rating: 5,
    },
    {
      name: "Trịnh Khánh Vy",
      role: "Operations Lead • Startup",
      quote:
        "Khả năng phân quyền và lưu lịch sử chỉnh sửa giúp bọn mình làm việc với nhiều bên mà vẫn kiểm soát được rủi ro.",
      rating: 4,
    },
    {
      name: "Ngô Gia Huy",
      role: "Investment Analyst",
      quote:
        "Mình đánh giá cao phần tổng hợp dữ liệu theo mẫu chuẩn, đọc profile startup nhanh hơn rất nhiều so với trước.",
      rating: 5,
    },
    {
      name: "Phan Yến Nhi",
      role: "Portfolio Manager • VC",
      quote:
        "Các startup trên nền tảng có mức độ chuẩn hóa hồ sơ đồng đều, phù hợp để lọc cơ hội theo tiêu chí đầu tư.",
      rating: 4,
    },
    {
      name: "Lương Đình Quân",
      role: "Mentor • Finance",
      quote:
        "Mình dễ theo dõi từng buổi cố vấn, note và action items đều lưu đầy đủ nên không bị thiếu việc sau phiên họp.",
      rating: 5,
    },
    {
      name: "Hồ Thảo My",
      role: "Advisor • Marketing",
      quote:
        "Giao diện thân thiện, thao tác mượt trên cả laptop và mobile. Startup phản hồi cũng nhanh hơn nhờ luồng rõ ràng.",
      rating: 4,
    },
    {
      name: "Đinh Nhật Long",
      role: "Co-founder • HealthTech",
      quote:
        "Các bước chuẩn bị tài liệu gọi vốn được gợi ý theo checklist nên team mình giảm hẳn thời gian rà soát thủ công.",
      rating: 5,
    },
    {
      name: "Mai Quỳnh Anh",
      role: "Angel Investor",
      quote:
        "Phần thông tin pháp lý và tài chính hiển thị có cấu trúc giúp mình ra quyết định cho vòng gặp đầu rất nhanh.",
      rating: 4,
    },
    {
      name: "Tạ Minh Đức",
      role: "Program Manager • Incubator",
      quote:
        "AISEP phù hợp để vận hành cohort startup vì có thể theo dõi tiến độ và mức độ hoàn thiện hồ sơ theo tuần.",
      rating: 5,
    },
    {
      name: "Võ Hải Đăng",
      role: "Community Mentor",
      quote:
        "Điểm mình thích là khả năng theo dõi lịch sử mentoring theo startup, dễ đánh giá tác động qua từng giai đoạn.",
      rating: 4,
    },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#F6EFBB] text-slate-900">
      <style jsx global>{`
        @keyframes aiSepMarqueeLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes aiSepMarqueeRight {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
      `}</style>
      {/* HEADER */}
      <PublicHeader />

      {/* MAIN */}
      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden h-screen min-h-[720px]">
          <motion.video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            initial={prefersReducedMotion ? false : { scale: 1 }}
            animate={prefersReducedMotion ? undefined : { scale: 1.03 }}
            transition={
              prefersReducedMotion
                ? undefined
                : { duration: 38, repeat: Infinity, repeatType: "reverse", ease: "linear" }
            }
          >
            <source src="/0428(2).mp4" type="video/mp4" />
          </motion.video>
          <div className="absolute inset-0 bg-[#F6EFBB]/52" />

          <div className="relative mx-auto max-w-[1280px] h-full px-6 lg:px-10 flex items-center">
            <div className="w-full origin-center scale-[0.96] sm:scale-[1] md:scale-[1.04] lg:scale-[1.1] xl:scale-[1.16] 2xl:scale-[1.2]">
              <div className="grid w-full grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                <motion.div
                  className="flex flex-col gap-8"
                  variants={heroContainer}
                  initial="hidden"
                  animate="show"
                >
                  <motion.div variants={heroItem} className="space-y-4">
                    <h1 className="text-4xl font-black leading-[1.1] tracking-tight text-[#5B0E14] lg:text-6xl">
                      Nền tảng vận hành Hệ sinh thái Khởi nghiệp toàn diện
                    </h1>
                    <p className="text-lg font-medium text-slate-500">
                      A comprehensive startup ecosystem operation platform.
                    </p>
                  </motion.div>

                  <motion.div variants={heroItem} className="flex flex-wrap gap-3">
                    {[
                      { icon: ShieldCheck, label: "Minh bạch quy trình" },
                      { icon: Shield, label: "Bảo vệ tính toàn vẹn tài liệu" },
                      { icon: Network, label: "Kết nối & cố vấn có kiểm soát" },
                    ].map((item, index) => (
                      <motion.div
                        key={item.label}
                        className="flex items-center gap-2 rounded-full bg-[#f0f04c]/10 px-4 py-2 border border-[#f0f04c]/20"
                        animate={prefersReducedMotion ? undefined : { y: [0, -2, 0] }}
                        transition={{
                          duration: 4.8,
                          repeat: Infinity,
                          repeatDelay: 0.8,
                          ease: "easeInOut",
                          delay: index * 0.35,
                        }}
                      >
                        <item.icon className="w-4 h-4 text-slate-800" />
                        <span className="text-sm font-semibold text-slate-800">
                          {item.label}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>

                  <motion.div variants={heroItem} className="flex flex-wrap gap-4">
                    <motion.div whileHover={{ y: -3, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        href="/auth/register"
                        className="flex min-w-[160px] items-center justify-center rounded-xl bg-[#f0f04c] px-8 py-4 text-base font-bold text-slate-900 shadow-xl shadow-[#f0f04c]/20 hover:shadow-[#f0f04c]/40 transition-all"
                      >
                        Bắt đầu ngay
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                      <a
                        href="#proof"
                        className="flex min-w-[160px] items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-8 py-4 text-base font-bold text-slate-700 hover:bg-slate-50 transition-all"
                      >
                        Xem nền tảng
                      </a>
                    </motion.div>
                  </motion.div>
                </motion.div>

                <motion.div
                  className="relative"
                  initial={prefersReducedMotion ? false : { opacity: 0, x: 28 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
                  transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
                  whileHover={prefersReducedMotion ? undefined : { y: -4 }}
                >
                  <div className="relative aspect-video lg:aspect-[16/9] w-full overflow-hidden rounded-2xl shadow-2xl">
                    <Image
                      src="/anh1.jpg"
                      alt="Đội ngũ AISEP đang trao đổi trước bảng điều khiển nền tảng"
                      fill
                      priority
                      className="object-cover scale-[1.58]"
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      style={{ objectPosition: "center 38%" }}
                    />
                  </div>
                  <motion.div
                    className="absolute -bottom-6 -left-6 hidden md:block w-48 h-48 bg-[#f0f04c] rounded-2xl -z-10 opacity-20 blur-2xl"
                    animate={prefersReducedMotion ? undefined : { scale: [1, 1.08, 1], opacity: [0.16, 0.24, 0.16] }}
                    transition={{ duration: 7.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* PRODUCT PROOF FEED */}
        <section id="proof" className="bg-white py-20">
          <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
            <div className="mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Product Proof Feed
              </h2>
              <p className="mt-2 text-slate-500">
                Trải nghiệm các tính năng cốt lõi được bảo mật bởi công nghệ
                Blockchain.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="group flex flex-col gap-5 p-2 rounded-2xl hover:bg-slate-50 transition-all">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-100 shadow-sm">
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-200 to-slate-100" />
                  <div className="absolute inset-0 p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-300">
                        <div className="w-4 h-4 rounded bg-slate-400" />
                        <div className="w-24 h-2 bg-slate-400 rounded" />
                      </div>
                      <div className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                        <div className="w-1/2 h-2 bg-slate-200 rounded" />
                        <div className="w-12 h-4 rounded-full bg-green-100 text-[8px] flex items-center justify-center font-bold text-green-700">
                          v2.1.0
                        </div>
                      </div>
                      <div className="flex justify-between items-center bg-white p-2 rounded shadow-sm opacity-60">
                        <div className="w-1/3 h-2 bg-slate-200 rounded" />
                        <div className="w-12 h-4 rounded-full bg-slate-100 text-[8px] flex items-center justify-center font-bold text-slate-400">
                          v2.0.4
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-[#f0f04c]/0 group-hover:bg-[#f0f04c]/5 transition-colors" />
                </div>
                <div className="px-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Danh sách tài liệu &amp; phiên bản
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Quản lý tập trung mọi tài liệu dự án với hệ thống phân
                    quyền thông minh.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="group flex flex-col gap-5 p-2 rounded-2xl hover:bg-slate-50 transition-all">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-100 shadow-sm">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#f0f04c]/5 to-slate-100" />
                  <div className="absolute inset-0 p-4">
                    <div className="flex flex-col h-full">
                      <div className="flex justify-center gap-4 mb-4">
                        <div className="w-6 h-6 rounded-full bg-[#f0f04c] flex items-center justify-center text-[10px] font-bold">
                          1
                        </div>
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                          2
                        </div>
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                          3
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-2">
                        <Link2 className="w-8 h-8 text-[#f0f04c]" />
                        <div className="w-3/4 h-2 bg-slate-200 rounded mx-auto" />
                        <div className="w-1/2 h-2 bg-slate-200 rounded mx-auto opacity-50" />
                        <div className="mt-4 w-full h-8 rounded-lg bg-[#f0f04c]/20 border border-[#f0f04c]/40" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-[#f0f04c]/0 group-hover:bg-[#f0f04c]/5 transition-colors" />
                </div>
                <div className="px-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Quy trình Blockchain Proof
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Xác thực tính toàn vẹn và mốc thời gian của mọi tương tác
                    trên chuỗi khối.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="group flex flex-col gap-5 p-2 rounded-2xl hover:bg-slate-50 transition-all">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-100 shadow-sm">
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-200 to-slate-100" />
                  <div className="absolute inset-0 p-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-white shadow-sm border-l-4 border-[#f0f04c]">
                        <div className="w-8 h-8 rounded-full bg-slate-100 mb-2" />
                        <div className="w-12 h-1.5 bg-slate-300 rounded mb-1" />
                        <div className="w-8 h-1.5 bg-slate-200 rounded" />
                      </div>
                      <div className="p-3 rounded-lg bg-white shadow-sm opacity-50">
                        <div className="w-8 h-8 rounded-full bg-slate-100 mb-2" />
                        <div className="w-12 h-1.5 bg-slate-300 rounded mb-1" />
                        <div className="w-8 h-1.5 bg-slate-200 rounded" />
                      </div>
                      <div className="col-span-2 p-3 rounded-lg bg-white shadow-sm border border-slate-100">
                        <div className="flex justify-between">
                          <div className="w-1/2 h-2 bg-slate-200 rounded" />
                          <div className="w-10 h-2 bg-[#f0f04c]/40 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-[#f0f04c]/0 group-hover:bg-[#f0f04c]/5 transition-colors" />
                </div>
                <div className="px-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    Quản lý Mentorship
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Hệ thống kết nối và theo dõi lộ trình cố vấn giữa Mentor và
                    Startup.
                  </p>
                </div>
              </div>
                </div>
              </div>
        </section>

        {/* PILLARS - DARK */}
        <section
          id="pillars"
          className="relative bg-slate-900 text-white py-24 md:py-32 px-6 overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#e6e64c] rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#e6e64c] rounded-full blur-[100px]" />
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex items-center gap-3 mb-12 justify-center md:justify-start">
              <div className="w-12 h-12 bg-[#e6e64c] rounded-xl flex items-center justify-center text-slate-900 shadow-lg shadow-[#e6e64c]/20">
                <Network className="w-7 h-7" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase">
                AISEP
              </span>
            </div>

            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 text-center lg:text-left">
                <h2 className="text-5xl md:text-7xl font-extrabold leading-[1.1] mb-8">
                  Trụ cột cốt lõi của{" "}
                  <span className="text-[#e6e64c]">AISEP</span>
                </h2>
                <p className="text-xl md:text-2xl text-slate-300 max-w-2xl font-medium leading-relaxed mb-12">
                  Nền tảng ứng dụng công nghệ hiện đại nhất để chuẩn hóa và
                  minh bạch hóa dữ liệu doanh nghiệp trong hệ sinh thái đổi
                  mới sáng tạo.
                </p>
                <a
                  href="#roles"
                  className="inline-flex items-center gap-2 bg-[#e6e64c] text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform"
                >
                  Khám phá ngay <ArrowRight className="w-5 h-5" />
                </a>
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group bg-white/5 border border-white/10 backdrop-blur-sm p-8 rounded-2xl flex flex-col items-start hover:shadow-xl hover:-translate-y-1 hover:border-[#e6e64c] transition-all duration-300">
                  <div className="w-16 h-16 bg-[#e6e64c] text-slate-900 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-[#e6e64c]/10 group-hover:scale-110 transition-transform">
                    <Database className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">
                    Quy trình dữ liệu &amp; hồ sơ
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Số hóa và chuẩn hóa hồ sơ doanh nghiệp toàn diện, quản lý
                    khoa học sẵn sàng cho gọi vốn.
                  </p>
                </div>

                <div className="group bg-white/5 border border-white/10 backdrop-blur-sm p-8 rounded-2xl flex flex-col items-start hover:shadow-xl hover:-translate-y-1 hover:border-[#e6e64c] transition-all duration-300">
                  <div className="w-16 h-16 bg-[#e6e64c] text-slate-900 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-[#e6e64c]/10 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">
                    Tin cậy tài liệu (Blockchain)
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Minh bạch và bảo mật tuyệt đối. Định danh duy nhất trên
                    chuỗi khối, chống làm giả.
                  </p>
                </div>

                <div className="group bg-white/5 border border-white/10 backdrop-blur-sm p-8 rounded-2xl flex flex-col items-start hover:shadow-xl hover:-translate-y-1 hover:border-[#e6e64c] transition-all duration-300">
                  <div className="w-16 h-16 bg-[#e6e64c] text-slate-900 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-[#e6e64c]/10 group-hover:scale-110 transition-transform">
                    <Network className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">
                    Kết nối có kiểm soát
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Xây dựng mạng lưới thông minh. Làm chủ việc chia sẻ thông
                    tin với đối tác tin cậy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ROLES & USE CASES */}
        <section id="roles" className="max-w-7xl mx-auto px-6 py-24 space-y-32">
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight">
              Vai trò &amp; Trường hợp sử dụng
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {roleOrder.map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  className={`relative px-8 py-3 font-extrabold rounded-full text-sm border-2 transition-colors ${
                    activeRole === role
                      ? "text-slate-900 border-[#e6e64c] shadow-md"
                      : "bg-white text-slate-600 border-slate-100 hover:border-[#e6e64c]/50 shadow-sm"
                  }`}
                >
                  {activeRole === role && (
                    <motion.span
                      layoutId="role-pill-highlight"
                      className="absolute inset-0 rounded-full bg-[#e6e64c] -z-10"
                      transition={{ type: "spring", stiffness: 360, damping: 30 }}
                    />
                  )}
                  {role === "startup"
                    ? "STARTUP"
                    : role === "investor"
                      ? "NHÀ ĐẦU TƯ"
                      : "CỐ VẤN"}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait" custom={roleDirection}>
          {/* STARTUP TAB */}
          {activeRole === "startup" && (
            <motion.div
              key="startup"
              custom={roleDirection}
              variants={rolePanelVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center"
            >
              <div className="space-y-8">
                <div>
                  <span className="bg-[#e6e64c]/20 text-slate-900 px-4 py-1.5 rounded-full font-black tracking-widest uppercase text-xs">
                    Dành cho Startup
                  </span>
                  <h3 className="text-4xl md:text-5xl font-extrabold mt-6 mb-6 leading-tight">
                    Hoàn thiện hồ sơ năng lực chỉ trong vài phút
                  </h3>
                  <p className="text-slate-600 text-xl leading-relaxed">
                    AISEP giúp các nhà sáng lập theo dõi mức độ hoàn thiện của
                    hồ sơ và chuẩn bị các tài liệu quan trọng để tiếp cận nhà
                    đầu tư chuyên nghiệp.
                  </p>
                </div>
                <ul className="space-y-5">
                  <li className="flex items-center gap-4 text-lg font-semibold">
                    <CheckCircle2 className="w-7 h-7 text-[#e6e64c]" />
                    Tự động đánh giá điểm tín nhiệm
                  </li>
                  <li className="flex items-center gap-4 text-lg font-semibold">
                    <CheckCircle2 className="w-7 h-7 text-[#e6e64c]" />
                    Kho lưu trữ tài liệu bảo mật Blockchain
                  </li>
                  <li className="flex items-center gap-4 text-lg font-semibold">
                    <CheckCircle2 className="w-7 h-7 text-[#e6e64c]" />
                    Chia sẻ hồ sơ gọi vốn chuyên nghiệp
                  </li>
                </ul>
              </div>

              <div className="bg-white p-10 rounded-3xl shadow-2xl border border-slate-100 relative">
                <div className="flex justify-between items-center mb-8">
                  <h4 className="font-extrabold text-xl">
                    Độ hoàn thiện hồ sơ
                  </h4>
                  <span className="bg-[#e6e64c]/20 text-slate-900 px-4 py-1 rounded-full text-sm font-black">
                    85% Hoàn thành
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-4 rounded-full mb-10 overflow-hidden">
                  <div
                    className="bg-[#e6e64c] h-full rounded-full"
                    style={{ width: "85%" }}
                  />
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-200">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-black text-base">Pitch Deck v2.1</p>
                        <p className="text-xs text-slate-500 font-medium">
                          Cập nhật 2 ngày trước
                        </p>
                      </div>
                    </div>
                    <BadgeCheck className="w-6 h-6 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 opacity-60">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-200">
                        <BarChart3 className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-black text-base">
                          Báo cáo tài chính Q3
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          Đang chờ xác thực
                        </p>
                      </div>
                    </div>
                    <Clock className="w-6 h-6 text-slate-300" />
                  </div>
                  <button className="w-full flex items-center justify-center gap-3 py-5 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 hover:border-[#e6e64c] hover:text-slate-900 hover:bg-[#e6e64c]/5 transition-all font-bold">
                    <Plus className="w-5 h-5" />
                    <span>Thêm tài liệu mới</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* INVESTOR TAB */}
          {activeRole === "investor" && (
            <motion.div
              key="investor"
              custom={roleDirection}
              variants={rolePanelVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center"
            >
              <div className="bg-slate-950 rounded-[2.5rem] p-10 overflow-hidden relative min-h-[500px] flex flex-col justify-center shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[#e6e64c]/10 via-transparent to-transparent" />
                <div className="relative z-10 space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-xl transform -rotate-2 hover:rotate-0 transition-all duration-500">
                    <div className="flex gap-5 mb-5">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-100 to-green-200 shrink-0 border border-green-100 flex items-center justify-center">
                        <Rocket className="w-8 h-8 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h5 className="font-black text-lg text-slate-900">
                            EcoSmart Energy
                          </h5>
                          <Star className="w-5 h-5 text-slate-300 hover:text-yellow-500 cursor-pointer" />
                        </div>
                        <p className="text-sm font-bold text-slate-500 mb-3">
                          Series A • CleanTech
                        </p>
                        <div className="flex gap-2">
                          <span className="text-[11px] font-black bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
                            SaaS
                          </span>
                          <span className="text-[11px] font-black bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
                            B2B
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                      <span className="text-sm font-black text-slate-900">
                        $2.5M Target
                      </span>
                      <button className="text-sm font-black text-[#e6e64c] bg-slate-900 px-4 py-1.5 rounded-lg">
                        Details
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-xl transform rotate-1 translate-x-6 hover:rotate-0 transition-all duration-500">
                    <div className="flex gap-5 mb-5">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 shrink-0 border border-blue-100 flex items-center justify-center">
                        <BarChart3 className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h5 className="font-black text-lg text-slate-900">
                            FinFlow Pay
                          </h5>
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        </div>
                        <p className="text-sm font-bold text-slate-500 mb-3">
                          Seed • Fintech
                        </p>
                        <div className="flex gap-2">
                          <span className="text-[11px] font-black bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
                            Payment
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                      <span className="text-sm font-black text-slate-900">
                        $500K Target
                      </span>
                      <button className="text-sm font-black text-[#e6e64c] bg-slate-900 px-4 py-1.5 rounded-lg">
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <span className="bg-[#e6e64c]/20 text-slate-900 px-4 py-1.5 rounded-full font-black tracking-widest uppercase text-xs">
                    Dành cho Nhà đầu tư
                  </span>
                  <h3 className="text-4xl md:text-5xl font-extrabold mt-6 mb-6 leading-tight">
                    Sàng lọc cơ hội đầu tư minh bạch
                  </h3>
                  <p className="text-slate-600 text-xl leading-relaxed">
                    Tiết kiệm hàng trăm giờ Due Diligence với hệ thống hồ sơ đã
                    được xác thực qua Blockchain và các đơn vị kiểm toán uy tín.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-10">
                  <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-5xl font-black text-[#e6e64c] mb-2">
                      500+
                    </p>
                    <p className="text-sm font-extrabold text-slate-500 uppercase tracking-widest">
                      Startup sẵn sàng
                    </p>
                  </div>
                  <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-5xl font-black text-[#e6e64c] mb-2">
                      100%
                    </p>
                    <p className="text-sm font-extrabold text-slate-500 uppercase tracking-widest">
                      Hồ sơ xác thực
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ADVISOR TAB */}
          {activeRole === "advisor" && (
            <motion.div
              key="advisor"
              custom={roleDirection}
              variants={rolePanelVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center"
            >
              <div className="space-y-8">
                <div>
                  <span className="bg-[#e6e64c]/20 text-slate-900 px-4 py-1.5 rounded-full font-black tracking-widest uppercase text-xs">
                    Dành cho Cố vấn
                  </span>
                  <h3 className="text-4xl md:text-5xl font-extrabold mt-6 mb-6 leading-tight">
                    Quản lý phiên cố vấn hiệu quả
                  </h3>
                  <p className="text-slate-600 text-xl leading-relaxed">
                    Hệ thống hóa các phiên làm việc, lưu trữ báo cáo tiến độ và
                    theo dõi sự phát triển của các startup bạn đang đồng hành.
                  </p>
                </div>
                <div className="grid gap-4">
                  <div className="flex gap-6 p-6 rounded-2xl bg-[#e6e64c]/10 border border-[#e6e64c]/20">
                    <BarChart3 className="w-10 h-10 text-slate-800 flex-shrink-0" />
                    <div>
                      <p className="text-xl font-black">
                        Theo dõi KPI real-time
                      </p>
                      <p className="text-slate-600 font-medium">
                        Dễ dàng xem các chỉ số tăng trưởng của startup một cách
                        trực quan.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-6 p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                    <FileText className="w-10 h-10 text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-xl font-black">Báo cáo chuẩn hóa</p>
                      <p className="text-slate-600 font-medium">
                        Tạo báo cáo nhanh chóng sau mỗi buổi Mentorship bằng
                        mẫu chuẩn.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden">
                <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                  <h4 className="font-black text-lg">Lên lịch Mentoring</h4>
                  <Calendar className="w-5 h-5 text-slate-400" />
                </div>
                <div className="p-10 space-y-8">
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                      Chọn Startup
                    </label>
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-5 text-base font-bold">
                      EcoSmart Energy
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                        Ngày
                      </label>
                      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-5 text-base font-bold flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        10/25/2025
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                        Giờ
                      </label>
                      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-5 text-base font-bold flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        02:00 PM
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">
                      Nội dung thảo luận
                    </label>
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-5 text-base font-bold text-slate-400">
                      Ví dụ: Review kế hoạch tài chính năm 2026...
                    </div>
                  </div>
                  <button className="w-full bg-[#e6e64c] text-slate-900 font-black py-5 rounded-2xl hover:scale-[1.02] transition-all shadow-xl shadow-[#e6e64c]/20 text-lg">
                    XÁC NHẬN LỊCH HẸN
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-20 bg-white border-y border-slate-100 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 mb-10">
            <div className="text-center space-y-3">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900">
                Người dùng nói gì về AISEP
              </h2>
              <p className="text-slate-500 text-base md:text-lg">
                Nhận xét thực tế từ startup, nhà đầu tư và cố vấn đang tham gia nền tảng.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="relative">
              <div
                className="flex w-max gap-5 px-6"
                style={{ animation: "aiSepMarqueeLeft 56s linear infinite" }}
                onMouseEnter={(e) => { e.currentTarget.style.animationPlayState = "paused"; }}
                onMouseLeave={(e) => { e.currentTarget.style.animationPlayState = "running"; }}
              >
                {[...testimonials, ...testimonials].map((item, idx) => (
                  <article
                    key={`line1-${idx}`}
                    className="w-[320px] md:w-[360px] rounded-2xl border border-slate-100 bg-white shadow-sm p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-[15px] font-bold text-slate-900">{item.name}</p>
                        <p className="text-[12px] text-slate-500">{item.role}</p>
                      </div>
                      <Quote className="w-5 h-5 text-[#e6e64c]" />
                    </div>
                    <p className="text-[13px] text-slate-600 leading-relaxed min-h-[72px]">
                      {item.quote}
                    </p>
                    <div className="mt-4 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < item.rating ? "text-[#e6e64c] fill-[#e6e64c]" : "text-slate-200"}`}
                        />
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="relative">
              <div
                className="flex w-max gap-5 px-6"
                style={{ animation: "aiSepMarqueeRight 62s linear infinite" }}
                onMouseEnter={(e) => { e.currentTarget.style.animationPlayState = "paused"; }}
                onMouseLeave={(e) => { e.currentTarget.style.animationPlayState = "running"; }}
              >
                {[...testimonials.slice().reverse(), ...testimonials.slice().reverse()].map((item, idx) => (
                  <article
                    key={`line2-${idx}`}
                    className="w-[320px] md:w-[360px] rounded-2xl border border-slate-100 bg-slate-50/70 shadow-sm p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-[15px] font-bold text-slate-900">{item.name}</p>
                        <p className="text-[12px] text-slate-500">{item.role}</p>
                      </div>
                      <Quote className="w-5 h-5 text-[#e6e64c]" />
                    </div>
                    <p className="text-[13px] text-slate-600 leading-relaxed min-h-[72px]">
                      {item.quote}
                    </p>
                    <div className="mt-4 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < item.rating ? "text-[#e6e64c] fill-[#e6e64c]" : "text-slate-200"}`}
                        />
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section id="cta" className="max-w-7xl mx-auto px-6 mt-14 md:mt-20 mb-24">
          <div className="bg-[#e6e64c] rounded-[3rem] p-16 md:p-24 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
              <Rocket className="w-72 h-72" />
            </div>
            <div className="relative z-10 space-y-10">
              <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1]">
                Sẵn sàng nâng tầm doanh nghiệp?
              </h2>
              <p className="text-slate-800 max-w-2xl mx-auto text-xl md:text-2xl font-semibold">
                Tham gia vào hệ sinh thái AISEP ngay hôm nay để kết nối với
                những nhà đầu tư và cố vấn hàng đầu.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  href="/auth/register"
                  className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-xl"
                >
                  Bắt đầu ngay miễn phí
                </Link>
                <a
                  href="#proof"
                  className="bg-white/40 backdrop-blur-md text-slate-900 px-12 py-5 rounded-2xl font-black text-xl hover:bg-white/60 transition-all border-2 border-slate-900/10"
                >
                  Tìm hiểu thêm
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-white py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-[#e6e64c] rounded-lg flex items-center justify-center text-slate-900">
                <Network className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-black tracking-tighter uppercase">
                AISEP
              </h2>
            </div>
            <p className="text-slate-400 font-medium leading-relaxed">
              Chuẩn hóa dữ liệu doanh nghiệp và kết nối đầu tư thông minh.
            </p>
          </div>

          <div>
            <h5 className="text-[#e6e64c] font-black uppercase tracking-widest text-xs mb-8">
              Hệ sinh thái
            </h5>
            <ul className="space-y-4 font-bold text-slate-300">
              <li>
                <Link
                  href="/startup"
                  className="hover:text-[#e6e64c] transition-colors"
                >
                  Dành cho Startup
                </Link>
              </li>
              <li>
                <Link
                  href="/investor"
                  className="hover:text-[#e6e64c] transition-colors"
                >
                  Dành cho Nhà đầu tư
                </Link>
              </li>
              <li>
                <Link
                  href="/advisor"
                  className="hover:text-[#e6e64c] transition-colors"
                >
                  Dành cho Cố vấn
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-[#e6e64c] font-black uppercase tracking-widest text-xs mb-8">
              Sản phẩm
            </h5>
            <ul className="space-y-4 font-bold text-slate-300">
              <li>
                <a
                  href="#"
                  className="hover:text-[#e6e64c] transition-colors"
                >
                  Xác thực Blockchain
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-[#e6e64c] transition-colors"
                >
                  Chỉ số tín nhiệm
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-[#e6e64c] transition-colors"
                >
                  Báo cáo thị trường
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-[#e6e64c] font-black uppercase tracking-widest text-xs mb-8">
              Liên hệ
            </h5>
            <ul className="space-y-4 font-bold text-slate-300">
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#e6e64c]" /> contact@aisep.vn
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-[#e6e64c]" /> TP. Hồ Chí Minh,
                Việt Nam
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm font-bold text-slate-500">
            © 2026 AISEP. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex gap-8">
            <a
              className="text-slate-500 hover:text-[#e6e64c] transition-colors"
              href="#"
            >
              <BarChart3 className="w-5 h-5" />
            </a>
            <a
              className="text-slate-500 hover:text-[#e6e64c] transition-colors"
              href="#"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
