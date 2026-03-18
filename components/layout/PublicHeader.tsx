"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Rocket, Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface PublicHeaderProps {
  // scrollToSection removed as it's handled internally
}

export function PublicHeader({}: PublicHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (item: string) => {
    setMobileMenuOpen(false);
    const id = item.toLowerCase() === "tính năng" ? "features" : item.toLowerCase() === "dành cho ai" ? "roles" : "trust";
    
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
    <header 
      className={`fixed top-0 z-50 w-full transition-all duration-500 ease-in-out px-4 sm:px-6 lg:px-10 py-4 font-manrope ${
        isScrolled ? "mt-2" : "mt-4"
      }`}
    >
      <div className={`mx-auto max-w-[1200px] rounded-2xl border transition-all duration-500 ease-in-out flex items-center justify-between px-6 lg:px-8 ${
        isScrolled 
          ? "bg-white/90 backdrop-blur-md border-slate-200/50 shadow-lg py-2" 
          : "bg-white/40 backdrop-blur-sm border-white/20 shadow-sm py-4"
      }`}>
        <Link 
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          onClick={(e) => {
            if (pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        >
          <img src="/AISEP_Logo.png" alt="AISEP" className="h-10 w-10 rounded-full object-contain" />
          <h2 className="text-2xl font-extrabold tracking-[-0.03em] leading-none text-[#0F172A] font-plus-jakarta-sans">AISEP</h2>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {["Tính năng", "Dành cho ai"].map((item, i) => (
            <button key={i} className="text-sm font-semibold text-slate-600 hover:text-[#0F172A] transition-colors relative group" onClick={() => handleNavClick(item)}>
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FACC15] transition-all group-hover:w-full"></span>
            </button>
          ))}
          <Link href="/services" className={`text-sm font-semibold transition-colors relative group ${pathname === "/services" ? "text-[#FACC15]" : "text-slate-600 hover:text-[#0F172A]"}`}>
            Dịch vụ
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#FACC15] transition-all group-hover:w-full"></span>
          </Link>
          <Link href="/about" className={`text-sm font-semibold transition-colors ${pathname === "/about" ? "text-[#FACC15]" : "text-slate-600 hover:text-[#0F172A]"}`}>Về chúng tôi</Link>
          <Link href="/faq" className={`text-sm font-semibold transition-colors ${pathname === "/faq" ? "text-[#FACC15]" : "text-slate-600 hover:text-[#0F172A]"}`}>FAQ</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="text-sm font-bold text-slate-700 hover:text-slate-900 px-2"
          >
            Đăng nhập
          </Link>
          <Link
            href="/auth/register"
            className="flex items-center justify-center px-6 py-2.5 text-sm font-bold bg-[#FACC15] text-slate-900 rounded-xl hover:shadow-xl hover:shadow-[#FACC15]/20 hover:-translate-y-0.5 active:scale-95 transition-all"
          >
            Đăng ký
          </Link>
          <button
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-100/50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mx-auto max-w-[1200px] mt-2 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur-md p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          {["Tính năng", "Dành cho ai"].map((item) => (
            <button 
              key={item} 
              className="block text-sm font-semibold text-slate-600 hover:text-slate-900 py-2 text-left w-full border-b border-slate-50" 
              onClick={() => { handleNavClick(item); setMobileMenuOpen(false); }}
            >
              {item}
            </button>
          ))}
          <Link 
            href="/services" 
            className="block text-sm font-semibold text-slate-600 hover:text-slate-900 py-2 border-b border-slate-50"
            onClick={() => setMobileMenuOpen(false)}
          >
            Dịch vụ
          </Link>
          {["Về chúng tôi", "FAQ"].map((item) => (
            <Link 
              key={item}
              href={item === "Về chúng tôi" ? "/about" : "/faq"}
              className="block text-sm font-semibold text-slate-600 hover:text-slate-900 py-2 border-b border-slate-50 last:border-none" 
              onClick={() => setMobileMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
          <div className="flex gap-3 pt-2">
            <Link href="/auth/login" className="flex-1 text-center px-4 py-3 text-sm font-bold text-slate-700 border border-slate-200 rounded-xl">Đăng nhập</Link>
            <Link href="/auth/register" className="flex-1 text-center px-4 py-3 text-sm font-bold bg-[#FACC15] text-slate-900 rounded-xl">Đăng ký</Link>
          </div>
        </div>
      )}
    </header>
  );
}
