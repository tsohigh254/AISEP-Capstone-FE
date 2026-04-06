"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { InvestorProfileFooter } from "@/components/investor/investor-profile-footer";
import { InvestorEditProvider } from "@/context/investor-edit-context";

const editTabs = [
    { label: "Thông tin cơ bản", href: "/investor/profile/edit/info" },
    { label: "Kế hoạch & Tiêu chí", href: "/investor/profile/edit/thesis" },
    { label: "AI Matching", href: "/investor/profile/edit/matching" },
    { label: "Xác thực KYC", href: "/investor/profile/edit/kyc" },
];

export default function InvestorProfileEditLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <InvestorEditProvider>
            <div className="max-w-6xl mx-auto w-full pb-32 space-y-6">
                <div>
                    <h1 className="text-[22px] font-semibold text-[#0f172a] tracking-[-0.02em] mb-5">Chỉnh sửa hồ sơ Investor</h1>
                    <div className="flex gap-0 border-b border-slate-200 overflow-x-auto no-scrollbar">
                        {editTabs.map((tab) => (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={cn(
                                    "pb-3 px-4 text-[13px] font-medium transition-all relative whitespace-nowrap",
                                    pathname === tab.href
                                        ? "text-[#0f172a]"
                                        : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {tab.label}
                                {pathname === tab.href && (
                                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0f172a] rounded-full" />
                                )}
                            </Link>
                        ))}
                    </div>
                </div>

                {children}
                {pathname !== "/investor/profile/edit/kyc" && <InvestorProfileFooter />}
            </div>
        </InvestorEditProvider>
    );
}
