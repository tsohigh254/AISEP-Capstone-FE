"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
    LogOut, Loader2, Users,
    LayoutDashboard, ShieldCheck, FileText,
    AlertTriangle, Activity, Bot,
} from "lucide-react";
import { useAuth } from "@/context/context";
import { Logout } from "@/services/auth/auth.api";

/* ─── Nav config ──────────────────────────────────────────────── */
const NAV_GROUPS: {
    label?: string;
    items: { icon: React.ElementType; label: string; href: string }[];
}[] = [
    {
        items: [
            { icon: LayoutDashboard, label: "Dashboard",        href: "/admin/dashboard" },
        ],
    },
    {
        label: "Quản trị người dùng",
        items: [
            { icon: Users,       label: "Người dùng",          href: "/admin/users"       },
            { icon: ShieldCheck, label: "Vai trò & Quyền",     href: "/admin/roles-permissions" },
        ],
    },
    {
        label: "Tuân thủ & Sự cố",
        items: [
            { icon: FileText,      label: "Audit Logs",        href: "/admin/audit-logs"  },
            { icon: Bot,           label: "AI Logs",           href: "/admin/ai-logs"     },
            { icon: AlertTriangle, label: "Incident Center",   href: "/admin/incident"    },
            { icon: Activity,      label: "System Health",     href: "/admin/system-health" },
        ],
    },
];

/* ─── NavItem ─────────────────────────────────────────────────── */
function NavItem({ icon: Icon, label, href, active, collapsed }: {
    icon: React.ElementType; label: string; href: string; active: boolean; collapsed: boolean;
}) {
    return (
        <Link
            href={href}
            title={collapsed ? label : undefined}
            className={cn(
                "flex items-center rounded-xl transition-all duration-200 group relative",
                collapsed ? "justify-center px-0 py-2.5 mx-1" : "gap-3 px-3 py-2.5",
                active
                    ? "bg-[#fdf8e6] text-[#171611]"
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
            )}
        >
            <Icon className={cn(
                "w-4 h-4 shrink-0 transition-colors",
                active ? "text-[#e6cc4c]" : "group-hover:text-[#e6cc4c]"
            )} />
            {!collapsed && (
                <span className={cn("text-[13px] font-semibold tracking-tight truncate", active ? "text-slate-900" : "")}>
                    {label}
                </span>
            )}
            {!collapsed && active && <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-[#e6cc4c]" />}

            {/* Tooltip on collapsed */}
            {collapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-[12px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-lg">
                    {label}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                </div>
            )}
        </Link>
    );
}

/* ─── Main ────────────────────────────────────────────────────── */
interface AdminSidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, setUser, setAccessToken, setIsAuthen } = useAuth();
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        if (loggingOut) return;
        setLoggingOut(true);
        try { await Logout(); } catch { /* silent */ }
        finally {
            setUser(undefined); setAccessToken(undefined); setIsAuthen(false);
            if (typeof window !== "undefined") localStorage.removeItem("accessToken");
            router.push("/auth/login");
        }
    };

    const displayName  = user?.email?.split("@")[0] || "Admin";
    const displayEmail = user?.email || "admin@aisep.vn";
    const initials     = displayName.charAt(0).toUpperCase();

    return (
        <div className={cn(
            "min-h-screen bg-white border-r border-slate-100 flex flex-col fixed left-0 top-0 z-50 transition-all duration-300",
            collapsed ? "w-[64px]" : "w-[240px]"
        )}>
            {/* Logo */}
            <div className={cn(
                "h-[64px] border-b border-slate-100 flex items-center shrink-0",
                collapsed ? "justify-center px-0" : "px-5"
            )}>
                <Link href="/admin/dashboard" className="flex items-center gap-3 group">
                    <svg className="h-8 w-auto shrink-0 group-hover:scale-105 transition-transform duration-300" viewBox="425 214 196 142" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#F0A500" d="M528.294495,272.249176 C532.020630,271.159119 532.906860,268.448914 533.867676,265.449799 C535.802979,259.408997 541.379211,257.171539 546.497681,260.041779 C550.585571,262.334106 552.357971,267.148407 550.587708,271.151367 C548.773071,275.254730 543.780762,277.647247 539.242615,275.743347 C536.010803,274.387482 533.506592,275.034882 530.762512,276.396454 C523.005981,280.244965 515.210388,284.016083 507.488556,287.932800 C502.019379,290.706940 501.513702,296.870636 506.287506,300.729858 C509.783264,303.555939 513.722229,306.026459 516.581177,309.402679 C520.923767,314.531036 526.257446,314.049774 531.826904,313.505585 C533.454651,313.346497 534.374390,312.046173 535.337097,310.893738 C540.672119,304.507141 545.981750,298.099060 551.356201,291.745850 C553.119690,289.661285 554.246826,287.661224 554.063293,284.619507 C553.826965,280.703217 556.001953,277.910767 560.278870,277.694733 C562.666382,277.574158 564.243286,276.526672 565.735168,274.744263 C573.427490,265.553467 581.183960,256.415497 588.999390,247.329056 C592.103577,243.720093 594.713379,240.418274 593.101196,234.905457 C591.775574,230.372589 595.638428,225.800690 600.427612,224.596893 C605.320007,223.367142 609.245056,225.388168 611.269287,230.179382 C613.287842,234.957123 612.057007,241.198624 607.538025,242.087143 C595.447632,244.464279 590.773621,254.854019 583.510254,262.429077 C579.369141,266.747894 575.688293,271.511810 571.857544,276.122955 C569.632141,278.801758 567.404724,281.400757 567.140686,285.242615 C566.884766,288.966919 564.198486,290.772247 560.689026,290.993469 C557.865601,291.171387 556.195801,292.703003 554.578247,294.743011 C549.717407,300.872986 544.878723,307.029785 539.761292,312.942322 C537.741516,315.275970 536.957275,317.553314 537.063660,320.597931 C537.279541,326.775635 533.929199,330.804657 528.772766,331.151398 C523.616699,331.498169 520.158875,327.921295 519.794556,321.519257 C519.670044,319.330994 518.966125,317.806732 517.260193,316.428253 C513.635254,313.499084 510.235413,310.292053 506.623810,307.345398 C498.266754,300.527069 488.275360,301.030212 480.194489,308.408295 C472.572571,315.367340 464.686829,322.029694 457.324036,329.284302 C454.762329,331.808350 452.520905,333.758636 452.866730,338.019165 C453.251434,342.758057 449.313629,347.054596 445.018860,347.674835 C440.488342,348.329102 436.775269,346.896118 434.670868,342.521942 C432.654419,338.330566 433.628967,333.653137 436.915192,330.655640 C438.806000,328.930969 441.084839,328.250519 443.386108,328.722900 C448.079803,329.686401 451.392944,327.471985 454.536804,324.587189 C463.490356,316.371460 472.410217,308.118805 481.394043,299.936371 C483.022247,298.453491 483.464447,296.861664 483.419586,294.654510 C483.227997,285.232941 489.474670,280.941742 498.180878,284.476746 C500.202820,285.297760 501.850006,285.453094 503.832733,284.444336 C511.842072,280.369507 519.916626,276.422913 528.294495,272.249176 z" />
                    </svg>
                    {!collapsed && (
                        <div className="flex flex-col leading-tight">
                            <h2 className="text-[20px] font-black tracking-tighter font-manrope bg-gradient-to-r from-[#E6B800] to-[#C8A000] bg-clip-text text-transparent">AISEP</h2>
                            <span className="text-[#878164] text-[10px] font-normal font-manrope tracking-wide">Admin</span>
                        </div>
                    )}
                </Link>
            </div>


            {/* Nav */}
            <div className="flex-1 px-2 py-4 overflow-y-auto space-y-4 [&::-webkit-scrollbar]:hidden">
                {NAV_GROUPS.map((group, gi) => (
                    <div key={gi} className="space-y-0.5">
                        {!collapsed && group.label && (
                            <p className="px-3 pb-1.5 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                {group.label}
                            </p>
                        )}
                        {collapsed && group.label && gi > 0 && (
                            <div className="mx-3 mb-2 mt-1 border-t border-slate-100" />
                        )}
                        {group.items.map(item => (
                            <NavItem
                                key={item.href}
                                {...item}
                                collapsed={collapsed}
                                active={pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href))}
                            />
                        ))}
                    </div>
                ))}
            </div>

            {/* User footer */}
            <div className="px-2 py-3 border-t border-slate-100">
                {collapsed ? (
                    <div className="flex flex-col items-center gap-2">
                        <div className="size-8 rounded-full bg-[#fdf8e6] border border-[#eec54e]/30 flex items-center justify-center">
                            <span className="text-[13px] font-black text-[#b8902e]">{initials}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            disabled={loggingOut}
                            title="Đăng xuất"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition-all"
                        >
                            {loggingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                        <div className="size-8 rounded-full bg-[#fdf8e6] border border-[#eec54e]/30 flex items-center justify-center shrink-0">
                            <span className="text-[13px] font-black text-[#b8902e]">{initials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-bold text-slate-800 truncate">{displayName}</p>
                            <p className="text-[10px] text-slate-400 truncate">{displayEmail}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            disabled={loggingOut}
                            title="Đăng xuất"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition-all shrink-0"
                        >
                            {loggingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
