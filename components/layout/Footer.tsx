"use client";

import Link from "next/link";
import { Mail, MapPin, BarChart, AtSign } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavClick = (id: string) => {
    if (pathname === "/") {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push(`/#${id}`);
    }
  };

  return (
    <footer className="bg-slate-950 text-white py-12 sm:py-20 px-4 sm:px-6 border-t border-white/5 font-manrope">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 sm:gap-16">
        <div className="col-span-1">
          <Link 
            href="/"
            className="flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity w-fit"
            onClick={(e) => {
              if (pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            <img src="/AISEP_Logo.png" alt="AISEP" className="w-10 h-10 rounded-full object-contain" />
            <h1 className="text-2xl font-extrabold tracking-[-0.03em] leading-none uppercase font-plus-jakarta-sans">AISEP</h1>
          </Link>
          <p className="text-slate-400 font-medium leading-relaxed">
            Chuẩn hóa dữ liệu doanh nghiệp và kết nối đầu tư thông minh.
          </p>
        </div>

        <div>
          <h5 className="text-[#FACC15] font-black uppercase tracking-widest text-xs mb-8">Hệ sinh thái</h5>
          <ul className="space-y-4 font-bold text-slate-300">
            <li><button className="hover:text-[#FACC15] transition-colors text-left" onClick={() => handleNavClick("roles")}>Dành cho Startup</button></li>
            <li><button className="hover:text-[#FACC15] transition-colors text-left" onClick={() => handleNavClick("roles")}>Dành cho Nhà đầu tư</button></li>
            <li><button className="hover:text-[#FACC15] transition-colors text-left" onClick={() => handleNavClick("roles")}>Dành cho Cố vấn</button></li>
          </ul>
        </div>

        <div>
          <h5 className="text-[#FACC15] font-black uppercase tracking-widest text-xs mb-8">Sản phẩm</h5>
          <ul className="space-y-4 font-bold text-slate-300">
            <li><button className="hover:text-[#FACC15] transition-colors text-left" onClick={() => handleNavClick("features")}>Xác thực Blockchain</button></li>
            <li><button className="hover:text-[#FACC15] transition-colors text-left" onClick={() => handleNavClick("features")}>Chỉ số tín nhiệm</button></li>
            <li><button className="hover:text-[#FACC15] transition-colors text-left" onClick={() => handleNavClick("features")}>Báo cáo thị trường</button></li>
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
  );
}
