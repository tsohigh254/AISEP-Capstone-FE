"use client";

import { PublicHeader, Footer } from "@/components/layout";
import { Sparkles, Check, Rocket, Zap, Crown, Shield } from "lucide-react";
import Link from "next/link";

export default function ServicesPage() {
  const plans = [
    {
      role: "Startup Owner",
      plans: [
        {
          name: "Basic",
          price: "Free",
          description: "Phù hợp cho các dự án mới khởi nghiệp muốn trải nghiệm sức mạnh AI.",
          features: ["Đánh giá Pitch Deck cơ bản", "Báo cáo tóm tắt", "1 lần đánh giá/tháng"],
          active: true,
          color: "blue"
        },
        {
          name: "Premium",
          price: "Coming Soon",
          description: "Mở khóa toàn bộ tiềm năng AI cho Startup của bạn.",
          features: ["Ưu tiên hàng chờ", "Phân tích tài chính chuyên sâu", "Gợi ý chiến lược thông minh", "Không giới hạn đánh giá"],
          active: false,
          premium: true,
          color: "amber"
        }
      ]
    },
    {
      role: "Investor / Expert",
      plans: [
        {
          name: "Standard",
          price: "Free",
          description: "Hỗ trợ sàng lọc dự án hiệu quả cho nhà đầu tư cá nhân.",
          features: ["Truy cập kho Startup", "Đánh giá sơ bộ", "Quản lý 5 danh mục đầu tư"],
          active: true,
          color: "emerald"
        },
        {
          name: "Pro",
          price: "Coming Soon",
          description: "Gói chuyên nghiệp tối ưu hóa quy trình thẩm định đầu tư.",
          features: ["Công cụ Due Diligence nâng cao", "Báo cáo rủi ro chi tiết", "Ưu tiên nhận thông báo Startup mới", "Phân tích dữ liệu thị trường"],
          active: false,
          premium: true,
          color: "purple"
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      
      <main className="pt-32 pb-20">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Hero Section */}
          <div className="text-center space-y-6 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 rounded-full border border-amber-100 mb-4">
              <Crown className="size-4 text-amber-500 fill-amber-500" />
              <span className="text-[12px] font-black text-amber-700 uppercase tracking-widest">Pricing & Plans</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-[-0.03em] leading-[0.95] font-plus-jakarta-sans">
              Nâng tầm Startup với <br />
              <span className="text-[#FACC15]">Dịch vụ Premium</span>
            </h1>
            <p className="max-w-2xl mx-auto text-slate-500 text-lg font-medium">
              Chúng tôi đang xây dựng các gói dịch vụ tối ưu hỗ trợ cả Startup và Nhà đầu tư 
              trong việc thẩm định và phát triển dự án.
            </p>
          </div>

          {/* Pricing Sections */}
          <div className="space-y-16">
            {plans.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-100"></div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">{group.role}</h2>
                  <div className="h-px flex-1 bg-slate-100"></div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  {group.plans.map((plan, planIdx) => (
                    <div 
                      key={planIdx}
                      className={`relative group p-10 rounded-[40px] border transition-all duration-500 ${
                        plan.premium 
                        ? "border-amber-200 bg-white shadow-2xl shadow-amber-200/20 hover:scale-[1.02]" 
                        : "border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200"
                      }`}
                    >
                      {plan.premium && (
                        <div className="absolute top-0 right-10 -translate-y-1/2 px-4 py-1.5 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg">
                          Most Powerful
                        </div>
                      )}

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-xl font-black text-slate-900 tracking-tight">{plan.name}</h3>
                          <p className="text-slate-500 text-sm font-medium leading-relaxed">{plan.description}</p>
                        </div>

                        <div className="py-2">
                          <span className={`text-3xl font-black tracking-tight ${plan.premium ? "text-amber-500" : "text-slate-900"}`}>
                            {plan.price}
                          </span>
                          {plan.price !== "Free" && plan.price !== "Coming Soon" && (
                            <span className="text-slate-400 font-bold ml-1">/tháng</span>
                          )}
                        </div>

                        <div className="h-px bg-slate-100"></div>

                        <ul className="space-y-4">
                          {plan.features.map((feature, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-3">
                              <div className={`mt-1 size-5 rounded-full flex items-center justify-center shrink-0 ${plan.premium ? "bg-amber-100" : "bg-slate-200"}`}>
                                <Check className={`size-3 ${plan.premium ? "text-amber-600" : "text-slate-600"}`} />
                              </div>
                              <span className="text-[14px] font-bold text-slate-600 leading-tight">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        <button 
                          disabled={!plan.active}
                          className={`w-full h-14 rounded-2xl font-black text-[14px] uppercase tracking-widest transition-all ${
                            plan.premium 
                            ? "bg-amber-500 text-white shadow-xl shadow-amber-500/20 hover:bg-amber-600 hover:shadow-2xl active:scale-95" 
                            : "bg-slate-900 text-white hover:bg-slate-800 active:scale-95 disabled:opacity-50"
                          }`}
                        >
                          {plan.active ? "Bắt đầu ngay" : "Chờ ra mắt"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Coming Soon Alert */}
          <div className="mt-24 p-12 rounded-[48px] bg-[#0F172A] relative overflow-hidden group">
            <div className="absolute top-0 right-0 size-64 bg-amber-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 text-center space-y-8">
              <div className="size-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto rotate-12 group-hover:rotate-0 transition-transform duration-500">
                <Rocket className="size-8 text-white" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-5xl font-black text-white tracking-[-0.04em] leading-[0.9] font-be-vietnam-pro">Sẵn sàng để bùng nổ?</h2>
                <p className="text-slate-400 font-medium max-w-xl mx-auto">
                  Chúng tôi đang nỗ lực hoàn thiện hệ thống thanh toán và các tính năng Premium. 
                  Hãy đăng ký để nhận thông báo ngay khi các gói dịch vụ được kích hoạt!
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  href="/auth/register"
                  className="px-8 py-4 bg-[#FACC15] text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-amber-500/20"
                >
                  Đăng ký tài khoản trước
                </Link>
                <Link 
                  href="/"
                  className="px-8 py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
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
