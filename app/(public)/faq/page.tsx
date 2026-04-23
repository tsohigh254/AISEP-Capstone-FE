"use client";

import Link from "next/link";
import {
  Rocket,
  Network,
  Mail,
  MapPin,
  BarChart,
  AtSign,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const faqData = [
  {
    question: "Blockchain Proof hoạt động như thế nào trên AISEP?",
    answer:
      'Mỗi khi bạn đăng tải hoặc cập nhật tài liệu quan trọng, hệ thống sẽ tạo một "vân tay kỹ thuật số" (hash) và ghi nhận lên Blockchain. Điều này tạo ra bằng chứng không thể chối cãi về sự tồn tại và tính nguyên bản của tài liệu tại một thời điểm nhất định.',
  },
  {
    question: "Quy trình kết nối giữa Startup và Mentor được thực hiện ra sao?",
    answer:
      "Hệ thống AI của AISEP phân tích hồ sơ Startup và Mentor để đề xuất kết nối phù hợp nhất. Startup có thể gửi yêu cầu mentorship, Mentor xem xét và chấp nhận. Sau đó, cả hai sẽ được kết nối qua hệ thống lịch hẹn và trao đổi trực tiếp trên nền tảng.",
  },
  {
    question: "Làm thế nào để đảm bảo tính riêng tư của dự án?",
    answer:
      "AISEP sử dụng hệ thống phân quyền RBAC (Role-Based Access Control) chặt chẽ. Chỉ những người được bạn cấp quyền mới có thể xem tài liệu và thông tin dự án. Ngoài ra, tất cả dữ liệu được mã hóa end-to-end và lưu trữ trên hạ tầng bảo mật cao.",
  },
  {
    question: "Hệ thống Mentorship có mất phí không?",
    answer:
      "AISEP cung cấp gói cơ bản miễn phí cho các Startup mới. Các phiên Mentorship nâng cao với chuyên gia hàng đầu có thể yêu cầu phí tùy theo gói dịch vụ. Mentor cũng có thể tự thiết lập mức phí tư vấn của riêng mình trên nền tảng.",
  },
  {
    question: "Quyền hạn của Quản trị viên (Admin) bao gồm những gì?",
    answer:
      "Admin có quyền quản lý toàn bộ người dùng, phê duyệt hoặc từ chối đăng ký Startup/Mentor, kiểm duyệt nội dung, quản lý báo cáo vi phạm, cấu hình hệ thống và xem báo cáo tổng hợp về hoạt động của nền tảng.",
  },
  {
    question: "Làm thế nào nếu tôi gặp sự cố kỹ thuật?",
    answer:
      "Bạn có thể liên hệ đội ngũ hỗ trợ qua email contact@aisep.vn hoặc sử dụng tính năng chat hỗ trợ trực tiếp trên nền tảng. Đội ngũ kỹ thuật của chúng tôi sẽ phản hồi trong vòng 24 giờ làm việc.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden font-manrope bg-[#FEFCE8] text-slate-900">
      <div className="h-[73px]" />

      {/* ===== FAQ CONTENT ===== */}
      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 sm:mb-6">
              Câu hỏi thường gặp
            </h1>
            <p className="text-slate-500 max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
              Giải đáp nhanh các thắc mắc về nền tảng và cách thức vận hành.
            </p>
          </div>

          <div className="space-y-4">
            {faqData.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <button
                  className="w-full flex items-center justify-between px-6 sm:px-8 py-5 sm:py-6 text-left cursor-pointer"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="text-base sm:text-lg font-bold text-slate-900 pr-4">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    openIndex === index ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 sm:px-8 pb-5 sm:pb-6 pt-0">
                      <p className="text-slate-500 leading-relaxed">{item.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="bg-slate-950 text-white py-12 sm:py-20 px-4 sm:px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 sm:gap-16">
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-8">
              <img src="/AISEP_Logo.png" alt="AISEP" className="w-10 h-10 rounded-full object-contain" />
              <h1 className="text-xl font-black tracking-tighter uppercase">AISEP</h1>
            </div>
            <p className="text-slate-400 font-medium leading-relaxed">
              Chuẩn hóa dữ liệu doanh nghiệp và kết nối đầu tư thông minh.
            </p>
          </div>

          <div>
            <h5 className="text-[#FACC15] font-black uppercase tracking-widest text-xs mb-8">Hệ sinh thái</h5>
            <ul className="space-y-4 font-bold text-slate-300">
              <li><Link href="/#roles" className="hover:text-[#FACC15] transition-colors">Dành cho Startup</Link></li>
              <li><Link href="/#roles" className="hover:text-[#FACC15] transition-colors">Dành cho Nhà đầu tư</Link></li>
              <li><Link href="/#roles" className="hover:text-[#FACC15] transition-colors">Dành cho Cố vấn</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-[#FACC15] font-black uppercase tracking-widest text-xs mb-8">Sản phẩm</h5>
            <ul className="space-y-4 font-bold text-slate-300">
              <li><Link href="/#features" className="hover:text-[#FACC15] transition-colors">Xác thực Blockchain</Link></li>
              <li><Link href="/#features" className="hover:text-[#FACC15] transition-colors">Chỉ số tín nhiệm</Link></li>
              <li><Link href="/#features" className="hover:text-[#FACC15] transition-colors">Báo cáo thị trường</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-[#FACC15] font-black uppercase tracking-widest text-xs mb-8">Liên hệ</h5>
            <ul className="space-y-4 font-bold text-slate-300">
              <li className="flex items-center gap-3"><Mail className="h-5 w-5 text-[#FACC15]" /> contact@aisep.vn</li>
              <li className="flex items-center gap-3"><MapPin className="h-5 w-5 text-[#FACC15]" /> TP. Hồ Chí Minh, Việt Nam</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 sm:mt-20 pt-8 sm:pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
          <p className="text-sm font-bold text-slate-500">© 2026 AISEP. Tất cả quyền được bảo lưu.</p>
          <div className="flex gap-8">
            <button className="text-slate-500 hover:text-[#FACC15] transition-colors">
              <BarChart className="h-5 w-5" />
            </button>
            <button className="text-slate-500 hover:text-[#FACC15] transition-colors">
              <AtSign className="h-5 w-5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
