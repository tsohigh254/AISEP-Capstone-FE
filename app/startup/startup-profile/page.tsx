"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
    Pencil,
    Calendar,
    Users,
    Building2,
    Globe,
    DollarSign,
    Briefcase,
    CheckCircle2,
} from "lucide-react";
import { GetStartupProfile } from "@/services/startup/startup.api";

export default function StartupProfileViewPage() {
    const [profile, setProfile] = useState<IStartupProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const res = await GetStartupProfile() as unknown as IBackendRes<IStartupProfile>;
                if ((res.success || res.isSuccess) && res.data) {
                    setProfile(res.data);
                } else {
                    setProfile(null);
                }
            } catch {
                setProfile(null);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center">
                <h2 className="text-xl font-semibold text-slate-800 mb-2">Chưa có hồ sơ Startup</h2>
                <p className="text-slate-500 mb-5">Bạn chưa tạo hồ sơ. Vui lòng cập nhật thông tin ở màn chỉnh sửa để bắt đầu.</p>
                <Link href="/startup/startup-profile/info" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0f172a] text-white text-sm font-medium hover:bg-slate-800 transition-colors">
                    <Pencil className="w-4 h-4" />
                    Tạo hồ sơ ngay
                </Link>
            </div>
        );
    }

    const initials = profile.companyName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
    const formatCurrency = (value?: number) => {
        if (!value) return "-";
        return `$${value.toLocaleString()}`;
    };
    const fundingProgress = profile.fundingAmountSought > 0
        ? Math.min(100, (profile.currentFundingRaised / profile.fundingAmountSought) * 100)
        : 0;

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="h-28 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700" />
                <div className="px-6 pb-6">
                    <div className="-mt-10 w-20 h-20 rounded-2xl bg-white border-4 border-white shadow overflow-hidden flex items-center justify-center">
                        {profile.logoURL ? (
                            <img src={profile.logoURL} alt={profile.companyName} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-slate-600 font-bold text-xl">{initials}</span>
                        )}
                    </div>
                    <div className="mt-4 flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-semibold text-slate-900">{profile.companyName}</h1>
                            <p className="text-sm text-slate-500 mt-1">{profile.oneLiner || "Chưa có one-liner"}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-50 text-slate-600 border border-slate-100">
                                    <Briefcase className="w-3 h-3" />
                                    {profile.industryName || "Chưa có ngành"}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                    <CheckCircle2 className="w-3 h-3" />
                                    {profile.stage || "Chưa có giai đoạn"}
                                </span>
                            </div>
                        </div>
                        <Link href="/startup/startup-profile/info" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0f172a] text-white text-sm font-medium hover:bg-slate-800 transition-colors">
                            <Pencil className="w-4 h-4" />
                            Chỉnh sửa hồ sơ
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-5">
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
                        <h3 className="text-sm font-semibold text-slate-700 mb-2">Mô tả startup</h3>
                        <p className="text-sm text-slate-600 leading-relaxed">{profile.description || "Chưa có mô tả chi tiết."}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Đội ngũ ({profile.teamMembers?.length || 0})</h3>
                        {!profile.teamMembers || profile.teamMembers.length === 0 ? (
                            <p className="text-sm text-slate-500">Chưa có thành viên đội ngũ.</p>
                        ) : (
                            <div className="space-y-3">
                                {profile.teamMembers.map((member) => (
                                    <div key={member.teamMemberID} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
                                        <img
                                            src={member.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.fullName)}&background=random`}
                                            alt={member.fullName}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-slate-800 truncate">{member.fullName}</p>
                                            <p className="text-xs text-slate-500 truncate">{member.title} - {member.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Link href="/startup/startup-profile/team" className="inline-flex items-center gap-2 mt-4 text-sm text-slate-700 hover:text-slate-900">
                            <Users className="w-4 h-4" />
                            Quản lý đội ngũ
                        </Link>
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Thông tin nhanh</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-start gap-2 text-slate-600">
                                <Calendar className="w-4 h-4 mt-0.5 text-slate-400" />
                                <span>Thành lập: {profile.foundedDate ? new Date(profile.foundedDate).toLocaleDateString("vi-VN") : "-"}</span>
                            </div>
                            <div className="flex items-start gap-2 text-slate-600">
                                <Building2 className="w-4 h-4 mt-0.5 text-slate-400" />
                                <span>Ngành: {profile.industryName || "-"}</span>
                            </div>
                            <div className="flex items-start gap-2 text-slate-600">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 text-slate-400" />
                                <span>Trạng thái hồ sơ: {profile.profileStatus || "-"}</span>
                            </div>
                            <div className="flex items-start gap-2 text-slate-600">
                                <Globe className="w-4 h-4 mt-0.5 text-slate-400" />
                                {profile.website ? (
                                    <a href={profile.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">
                                        {profile.website}
                                    </a>
                                ) : (
                                    <span>Website: -</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl border border-slate-200/80 p-6">
                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Thông tin gọi vốn</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Mục tiêu gọi vốn</span>
                                <span className="font-medium text-slate-800">{formatCurrency(profile.fundingAmountSought)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Đã huy động</span>
                                <span className="font-medium text-slate-800">{formatCurrency(profile.currentFundingRaised)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Định giá</span>
                                <span className="font-medium text-slate-800">{formatCurrency(profile.valuation)}</span>
                            </div>
                            <div className="pt-2">
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#e6cc4c]" style={{ width: `${fundingProgress}%` }} />
                                </div>
                                <div className="text-xs text-slate-400 mt-1.5 inline-flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    Tiến độ đạt {Math.round(fundingProgress)}% mục tiêu
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}