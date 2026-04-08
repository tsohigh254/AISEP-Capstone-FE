"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { InvestorProfileFooter } from "@/components/investor/investor-profile-footer";
import { InvestorEditProvider } from "@/context/investor-edit-context";
import { cn } from "@/lib/utils";

const editTabs = [
  { label: "Thông tin hồ sơ", href: "/investor/profile/edit/info" },
  { label: "Tiêu chí đầu tư", href: "/investor/profile/edit/thesis" },
  { label: "AI Matching", href: "/investor/profile/edit/matching" },
];

export default function InvestorProfileEditLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <InvestorEditProvider>
      <div className="mx-auto w-full max-w-6xl space-y-6 pb-32">
        <div>
          <h1 className="mb-5 text-[22px] font-semibold tracking-[-0.02em] text-[#0f172a]">Chỉnh sửa hồ sơ investor</h1>
          <div className="no-scrollbar flex gap-0 overflow-x-auto border-b border-slate-200">
            {editTabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "relative whitespace-nowrap px-4 pb-3 text-[13px] font-medium transition-all",
                  pathname === tab.href ? "text-[#0f172a]" : "text-slate-400 hover:text-slate-600",
                )}
              >
                {tab.label}
                {pathname === tab.href && <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#0f172a]" />}
              </Link>
            ))}
          </div>
        </div>

        {children}
        <InvestorProfileFooter />
      </div>
    </InvestorEditProvider>
  );
}
