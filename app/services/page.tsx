"use client";

import { PublicHeader, Footer } from "@/components/layout";
import { Check, Crown, Infinity, Rocket, X } from "lucide-react";
import Link from "next/link";

type FeatureRow = {
  feature: string;
  free: string | boolean;
  pro: string | boolean;
  fundraising: string | boolean;
};

const FEATURE_MATRIX: FeatureRow[] = [
  { feature: "Tạo hồ sơ startup", free: true, pro: true, fundraising: true },
  { feature: "Duyệt danh sách nhà đầu tư", free: true, pro: true, fundraising: true },
  { feature: "Duyệt danh sách cố vấn", free: true, pro: true, fundraising: true },
  { feature: "Đặt lịch tư vấn với cố vấn", free: true, pro: true, fundraising: true },
  { feature: "Yêu cầu kết nối nhà đầu tư", free: "3", pro: "15", fundraising: "Không giới hạn" },
  { feature: "Yêu cầu tư vấn cố vấn", free: "2", pro: "10", fundraising: "Không giới hạn" },
  { feature: "Kết nối nhà đầu tư phù hợp (AI Matching)", free: false, pro: true, fundraising: true },
  { feature: "Phân tích dữ liệu startup", free: false, pro: true, fundraising: true },
  { feature: "Lịch sử điểm AI Score", free: false, pro: true, fundraising: true },
  { feature: "Xác thực Blockchain", free: false, pro: true, fundraising: true },
  { feature: "Xem nhà đầu tư đang quan tâm", free: false, pro: false, fundraising: true },
  { feature: "Startup nổi bật (Featured)", free: false, pro: false, fundraising: true },
  { feature: "Hỗ trợ ưu tiên", free: false, pro: false, fundraising: true },
];

function RenderValue({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="mx-auto h-5 w-5 text-emerald-500" />;
  if (value === false) return <X className="mx-auto h-5 w-5 text-slate-300" />;
  if (String(value).toLowerCase().includes("giới hạn")) {
    return (
      <span className="inline-flex items-center justify-center gap-1 text-xs font-bold text-emerald-600 whitespace-nowrap">
        <Infinity className="h-3.5 w-3.5 shrink-0" />
        Không giới hạn
      </span>
    );
  }
  return <span className="text-sm font-bold text-slate-700">{value}</span>;
}

export default function ServicesPage() {
  const plans = [
    {
      key: "FREE",
      name: "Free",
      price: "0₫",
      period: "",
      description: "Dùng các chức năng cốt lõi để bắt đầu hành trình khởi nghiệp.",
      cta: "Bắt đầu miễn phí",
      href: "/auth/register",
      highlight: false,
      badge: null,
    },
    {
      key: "PRO",
      name: "Pro",
      price: "99.000₫",
      period: "/tháng",
      description: "Tăng giới hạn kết nối và mở khóa tính năng phân tích chuyên sâu.",
      cta: "Nâng cấp Pro",
      href: "/auth/register",
      highlight: false,
      badge: null,
    },
    {
      key: "FUNDRAISING",
      name: "Fundraising",
      price: "199.000₫",
      period: "/tháng",
      description: "Gói đầy đủ cho startup đang tập trung gọi vốn và mở rộng quy mô.",
      cta: "Nâng cấp Fundraising",
      href: "/auth/register",
      highlight: true,
      badge: "Recommended",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <PublicHeader />

      <main className="pt-32 pb-20">
        <div className="max-w-[1200px] mx-auto px-6">

          {/* Hero */}
          <div className="text-center space-y-5 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 rounded-full border border-amber-100">
              <Crown className="size-4 text-amber-500 fill-amber-500" />
              <span className="text-[11px] font-black text-amber-700 uppercase tracking-widest">Pricing & Plans</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Chọn gói phù hợp cho <br />
              <span className="text-[#FACC15]">Startup của bạn</span>
            </h1>
            <p className="max-w-xl mx-auto text-slate-500 text-lg font-medium">
              Mở rộng năng lực kết nối, phân tích và gọi vốn với các gói dịch vụ được thiết kế riêng cho startup Việt Nam.
            </p>
          </div>

          {/* Plan Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-20">
            {plans.map((plan) => (
              <div
                key={plan.key}
                className={`relative flex flex-col rounded-3xl border p-8 transition-all duration-300 ${
                  plan.highlight
                    ? "border-amber-300 bg-white shadow-2xl shadow-amber-100/60 scale-[1.02]"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-2 mb-6">
                  <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className={`text-4xl font-black tracking-tight ${plan.highlight ? "text-amber-500" : "text-slate-900"}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-slate-400 font-semibold ml-1 text-sm">{plan.period}</span>
                  )}
                </div>

                <div className="h-px bg-slate-100 mb-6" />

                <div className="flex-1" />

                <Link
                  href={plan.href}
                  className={`mt-auto block w-full text-center py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
                    plan.highlight
                      ? "bg-amber-500 text-white shadow-lg shadow-amber-200 hover:bg-amber-600"
                      : "bg-slate-900 text-white hover:bg-slate-700"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* Feature Matrix */}
          <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm mb-20">
            <div className="px-8 py-6 border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-900">So sánh tính năng</h2>
              <p className="text-slate-500 text-sm mt-1">Chi tiết các tính năng theo từng gói dịch vụ.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-8 py-4 font-bold text-slate-600 min-w-[260px]">Tính năng</th>
                    <th className="text-center px-6 py-4 font-bold text-slate-700 w-32">Free</th>
                    <th className="text-center px-6 py-4 font-bold text-slate-700 w-32">Pro</th>
                    <th className="text-center px-6 py-4 font-bold text-amber-600 w-44">Fundraising</th>
                  </tr>
                </thead>
                <tbody>
                  {FEATURE_MATRIX.map((row, idx) => (
                    <tr key={row.feature} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                      <td className="px-8 py-3.5 font-medium text-slate-700">{row.feature}</td>
                      <td className="px-6 py-3.5 text-center"><RenderValue value={row.free} /></td>
                      <td className="px-6 py-3.5 text-center"><RenderValue value={row.pro} /></td>
                      <td className="px-6 py-3.5 text-center"><RenderValue value={row.fundraising} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* CTA Bottom */}
          <div className="p-12 rounded-[40px] bg-[#0F172A] relative overflow-hidden group text-center">
            <div className="absolute top-0 right-0 size-64 bg-amber-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 space-y-6">
              <div className="size-14 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto rotate-12 group-hover:rotate-0 transition-transform duration-500">
                <Rocket className="size-7 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Sẵn sàng để bùng nổ?</h2>
              <p className="text-slate-400 max-w-md mx-auto font-medium">
                Đăng ký ngay hôm nay và nâng cấp gói dịch vụ bất kỳ lúc nào từ trang quản lý tài khoản.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/auth/register"
                  className="px-8 py-3.5 bg-[#FACC15] text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-amber-500/20"
                >
                  Đăng ký miễn phí
                </Link>
                <Link
                  href="/"
                  className="px-8 py-3.5 bg-white/5 text-white border border-white/10 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  Quay về trang chủ
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
