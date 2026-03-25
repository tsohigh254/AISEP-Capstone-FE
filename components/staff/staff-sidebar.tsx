"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  LayoutGrid, 
  Activity, 
  ShieldCheck, 
  Zap, 
  MessageSquare, 
  UserCog, 
  AlertCircle, 
  Users, 
  CreditCard,
  X,
  Menu
} from "lucide-react";

interface StaffSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}


const menuItems = [
  {
    icon: LayoutGrid,
    label: "Bảng điều khiển", // Dashboard
    href: "/staff",
  },
  {
    icon: Activity,
    label: "Giám sát nền tảng", // Platform Activity
    href: "/staff/activity",
  },
  {
    icon: ShieldCheck,
    label: "Xét duyệt KYC", // KYC Review
    href: "/staff/kyc",
  },
];

const governanceItems = [
  {
    icon: Zap,
    label: "AI Exceptions", // AI Exceptions (kept as AI is allowed)
    href: "/staff/ai-exceptions",
  },
  {
    icon: MessageSquare,
    label: "Khiếu nại & Tranh chấp", // Complaints & Disputes
    href: "/staff/complaints",
  },
  {
    icon: UserCog,
    label: "Thay đổi hồ sơ nhạy cảm", // Sensitive Profile Changes
    href: "/staff/profile-changes",
  },
  {
    icon: AlertCircle,
    label: "Báo cáo sự cố", // Issue Reports
    href: "/staff/issue-reports",
  },
];

const operationsItems = [
  {
    icon: Users,
    label: "Vận hành tư vấn", // Consulting Ops
    href: "/staff/consulting-ops",
  },
  {
    icon: CreditCard,
    label: "Vận hành thanh toán", // Payment Ops
    href: "/staff/payment-ops",
  },
];

export function StaffSidebar({ isOpen, onClose }: StaffSidebarProps) {
  const pathname = usePathname();

  const renderLink = (item: any) => {
    const isActive = pathname === item.href || (item.href !== "/staff" && pathname.startsWith(item.href));
    const Icon = item.icon;

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-[16px] transition-all duration-300 group relative font-plus-jakarta-sans cursor-pointer",
          isActive
            ? "bg-[#eec54e]/10 text-[#171611] shadow-sm border border-[#eec54e]/20"
            : "text-slate-500 hover:text-[#171611] hover:bg-slate-50"
        )}
      >
        <Icon className={cn(
          "w-5 h-5 transition-all duration-300",
          isActive ? "text-[#eec54e] scale-110" : "text-slate-400 group-hover:text-[#eec54e]"
        )} />
        <span className="font-bold text-[13px] tracking-tight">{item.label}</span>
        {isActive && (
          <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-[#eec54e] shadow-[0_0_12px_#eec54e]" />
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300" 
          onClick={onClose}
        />
      )}

      <div className={cn(
        "w-[280px] min-h-screen bg-white border-r border-slate-100 flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
      )}>
        {/* Mobile close button */}
        <button 
          onClick={onClose}
          className="lg:hidden absolute top-6 right-[-50px] w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 shadow-sm cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      {/* Logo Section */}
      <div className="p-6">
        <Link href="/staff" className="flex items-center gap-4 cursor-pointer group">
          <svg className="h-9 w-auto flex-shrink-0 group-hover:scale-110 transition-all duration-300" viewBox="425 214 196 142" xmlns="http://www.w3.org/2000/svg">
            <path fill="#F0A500" d="M528.294495,272.249176 C532.020630,271.159119 532.906860,268.448914 533.867676,265.449799 C535.802979,259.408997 541.379211,257.171539 546.497681,260.041779 C550.585571,262.334106 552.357971,267.148407 550.587708,271.151367 C548.773071,275.254730 543.780762,277.647247 539.242615,275.743347 C536.010803,274.387482 533.506592,275.034882 530.762512,276.396454 C523.005981,280.244965 515.210388,284.016083 507.488556,287.932800 C502.019379,290.706940 501.513702,296.870636 506.287506,300.729858 C509.783264,303.555939 513.722229,306.026459 516.581177,309.402679 C520.923767,314.531036 526.257446,314.049774 531.826904,313.505585 C533.454651,313.346497 534.374390,312.046173 535.337097,310.893738 C540.672119,304.507141 545.981750,298.099060 551.356201,291.745850 C553.119690,289.661285 554.246826,287.661224 554.063293,284.619507 C553.826965,280.703217 556.001953,277.910767 560.278870,277.694733 C562.666382,277.574158 564.243286,276.526672 565.735168,274.744263 C573.427490,265.553467 581.183960,256.415497 588.999390,247.329056 C592.103577,243.720093 594.713379,240.418274 593.101196,234.905457 C591.775574,230.372589 595.638428,225.800690 600.427612,224.596893 C605.320007,223.367142 609.245056,225.388168 611.269287,230.179382 C613.287842,234.957123 612.057007,241.198624 607.538025,242.087143 C595.447632,244.464279 590.773621,254.854019 583.510254,262.429077 C579.369141,266.747894 575.688293,271.511810 571.857544,276.122955 C569.632141,278.801758 567.404724,281.400757 567.140686,285.242615 C566.884766,288.966919 564.198486,290.772247 560.689026,290.993469 C557.865601,291.171387 556.195801,292.703003 554.578247,294.743011 C549.717407,300.872986 544.878723,307.029785 539.761292,312.942322 C537.741516,315.275970 536.957275,317.553314 537.063660,320.597931 C537.279541,326.775635 533.929199,330.804657 528.772766,331.151398 C523.616699,331.498169 520.158875,327.921295 519.794556,321.519257 C519.670044,319.330994 518.966125,317.806732 517.260193,316.428253 C513.635254,313.499084 510.235413,310.292053 506.623810,307.345398 C498.266754,300.527069 488.275360,301.030212 480.194489,308.408295 C472.572571,315.367340 464.686829,322.029694 457.324036,329.284302 C454.762329,331.808350 452.520905,333.758636 452.866730,338.019165 C453.251434,342.758057 449.313629,347.054596 445.018860,347.674835 C440.488342,348.329102 436.775269,346.896118 434.670868,342.521942 C432.654419,338.330566 433.628967,333.653137 436.915192,330.655640 C438.806000,328.930969 441.084839,328.250519 443.386108,328.722900 C448.079803,329.686401 451.392944,327.471985 454.536804,324.587189 C463.490356,316.371460 472.410217,308.118805 481.394043,299.936371 C483.022247,298.453491 483.464447,296.861664 483.419586,294.654510 C483.227997,285.232941 489.474670,280.941742 498.180878,284.476746 C500.202820,285.297760 501.850006,285.453094 503.832733,284.444336 C511.842072,280.369507 519.916626,276.422913 528.294495,272.249176 z"/>
          </svg>
          <div className="flex flex-col leading-[1.1]">
            <h2 className="text-[24px] font-bold tracking-tighter font-manrope text-[#C8A000]">AISEP</h2>
            <span className="text-[#8a8a8a] text-[13px] font-medium font-manrope">Workspace</span>
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 px-4 py-4 overflow-y-auto space-y-6 custom-scrollbar">
        <div className="space-y-1">
          {menuItems.map(renderLink)}
        </div>

        <div className="space-y-2">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] font-plus-jakarta-sans">AI & Quản trị</p>
          <div className="space-y-1">
            {governanceItems.map(renderLink)}
          </div>
        </div>

        <div className="space-y-2">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] font-plus-jakarta-sans">Vận hành</p>
          <div className="space-y-1">
            {operationsItems.map(renderLink)}
          </div>
        </div>
      </div>

    </div>
    </>
  );
}
