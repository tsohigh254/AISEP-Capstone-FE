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
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
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
      className={`fixed top-0 z-50 w-full transition-all duration-700 ease-out px-4 sm:px-6 lg:px-10 py-4 font-manrope ${
        isScrolled ? "mt-1" : "mt-4"
      } ${mounted ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"}`}
    >
      <div className={`mx-auto max-w-[1200px] rounded-2xl border transition-all duration-500 ease-in-out flex items-center justify-between px-6 lg:px-8 group/header ${
        isScrolled 
          ? "bg-white/90 backdrop-blur-md border-slate-200/50 shadow-lg py-2" 
          : "bg-white/30 backdrop-blur-sm border-white/20 shadow-sm py-4 hover:bg-white/60 hover:backdrop-blur-xl hover:border-white/40 hover:shadow-md"
      }`}>
        <Link 
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition-all duration-300 group/logo"
          onClick={(e) => {
            if (pathname === "/") {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
        >
          <div className={`transition-all duration-700 delay-300 ${mounted ? "scale-100 rotate-0" : "scale-0 -rotate-12"}`}>
            <svg className="h-9 w-auto flex-shrink-0 group-hover/logo:scale-110 group-hover/logo:rotate-3 transition-all duration-500" viewBox="425 214 196 142" xmlns="http://www.w3.org/2000/svg">
              <path fill="#F0A500" d="M528.294495,272.249176 C532.020630,271.159119 532.906860,268.448914 533.867676,265.449799 C535.802979,259.408997 541.379211,257.171539 546.497681,260.041779 C550.585571,262.334106 552.357971,267.148407 550.587708,271.151367 C548.773071,275.254730 543.780762,277.647247 539.242615,275.743347 C536.010803,274.387482 533.506592,275.034882 530.762512,276.396454 C523.005981,280.244965 515.210388,284.016083 507.488556,287.932800 C502.019379,290.706940 501.513702,296.870636 506.287506,300.729858 C509.783264,303.555939 513.722229,306.026459 516.581177,309.402679 C520.923767,314.531036 526.257446,314.049774 531.826904,313.505585 C533.454651,313.346497 534.374390,312.046173 535.337097,310.893738 C540.672119,304.507141 545.981750,298.099060 551.356201,291.745850 C553.119690,289.661285 554.246826,287.661224 554.063293,284.619507 C553.826965,280.703217 556.001953,277.910767 560.278870,277.694733 C562.666382,277.574158 564.243286,276.526672 565.735168,274.744263 C573.427490,265.553467 581.183960,256.415497 588.999390,247.329056 C592.103577,243.720093 594.713379,240.418274 593.101196,234.905457 C591.775574,230.372589 595.638428,225.800690 600.427612,224.596893 C605.320007,223.367142 609.245056,225.388168 611.269287,230.179382 C613.287842,234.957123 612.057007,241.198624 607.538025,242.087143 C595.447632,244.464279 590.773621,254.854019 583.510254,262.429077 C579.369141,266.747894 575.688293,271.511810 571.857544,276.122955 C569.632141,278.801758 567.404724,281.400757 567.140686,285.242615 C566.884766,288.966919 564.198486,290.772247 560.689026,290.993469 C557.865601,291.171387 556.195801,292.703003 554.578247,294.743011 C549.717407,300.872986 544.878723,307.029785 539.761292,312.942322 C537.741516,315.275970 536.957275,317.553314 537.063660,320.597931 C537.279541,326.775635 533.929199,330.804657 528.772766,331.151398 C523.616699,331.498169 520.158875,327.921295 519.794556,321.519257 C519.670044,319.330994 518.966125,317.806732 517.260193,316.428253 C513.635254,313.499084 510.235413,310.292053 506.623810,307.345398 C498.266754,300.527069 488.275360,301.030212 480.194489,308.408295 C472.572571,315.367340 464.686829,322.029694 457.324036,329.284302 C454.762329,331.808350 452.520905,333.758636 452.866730,338.019165 C453.251434,342.758057 449.313629,347.054596 445.018860,347.674835 C440.488342,348.329102 436.775269,346.896118 434.670868,342.521942 C432.654419,338.330566 433.628967,333.653137 436.915192,330.655640 C438.806000,328.930969 441.084839,328.250519 443.386108,328.722900 C448.079803,329.686401 451.392944,327.471985 454.536804,324.587189 C463.490356,316.371460 472.410217,308.118805 481.394043,299.936371 C483.022247,298.453491 483.464447,296.861664 483.419586,294.654510 C483.227997,285.232941 489.474670,280.941742 498.180878,284.476746 C500.202820,285.297760 501.850006,285.453094 503.832733,284.444336 C511.842072,280.369507 519.916626,276.422913 528.294495,272.249176 z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold tracking-[-0.03em] leading-none text-[#0F172A] font-plus-jakarta-sans group-hover/logo:text-[#F0A500] transition-colors duration-300">AISEP</h2>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {["Tính năng", "Dành cho ai", "Dịch vụ", "Về chúng tôi", "FAQ"].map((item, i) => {
            const isServices = item === "Dịch vụ";
            const isAbout = item === "Về chúng tôi";
            const isFAQ = item === "FAQ";
            const href = isServices ? "/services" : isAbout ? "/about" : isFAQ ? "/faq" : null;
            const isActive = href && pathname === href;

            const baseClass = `text-sm font-semibold transition-all duration-300 relative group/link ${
              isActive ? "text-[#FACC15]" : "text-slate-600 hover:text-[#0F172A]"
            }`;

            const delayStyle = { transitionDelay: `${400 + i * 100}ms` };
            const entranceClass = `transition-all duration-700 ${mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`;

            if (href) {
              return (
                <Link key={i} href={href} className={`${baseClass} ${entranceClass}`} style={delayStyle}>
                  {item}
                  <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-[#FACC15] transition-all duration-300 group-hover/link:w-full group-hover/link:left-0"></span>
                </Link>
              );
            }

            return (
              <button key={i} className={`${baseClass} ${entranceClass}`} style={delayStyle} onClick={() => handleNavClick(item)}>
                {item}
                <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-[#FACC15] transition-all duration-300 group-hover/link:w-full group-hover/link:left-0"></span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className={`text-sm font-bold text-slate-700 hover:text-[#F0A500] px-2 transition-all duration-700 delay-[900ms] ${mounted ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"}`}
          >
            Đăng nhập
          </Link>
          <Link
            href="/auth/register"
            className={`flex items-center justify-center px-6 py-2.5 text-sm font-bold bg-[#FACC15] text-slate-900 rounded-xl hover:shadow-xl hover:shadow-[#FACC15]/30 hover:-translate-y-1 active:scale-95 transition-all duration-700 delay-[1000ms] ${mounted ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
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
