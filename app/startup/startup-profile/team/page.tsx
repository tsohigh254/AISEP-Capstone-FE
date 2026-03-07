"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { TeamMemberModal } from "@/components/startup/team-member-modal";

interface TeamMember {
    id?: string;
    name: string;
    roles: string[];
    description: string;
    title: string;
    status: string;
    avatar: string;
    linkedin: string;
}

const initialTeam: TeamMember[] = [
    {
        id: "1",
        name: "Nguyễn Văn An",
        roles: ["Founder"],
        description: "Hơn 10 năm kinh nghiệm trong lĩnh vực Fintech. Cựu giám đốc sản phẩm tại tập đoàn đa quốc gia.",
        title: "CEO & Co-founder",
        status: "Toàn thời gian",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBBOSubJaOrSi0MHEH5BwM0--Dv3I-NC0MBcpJdqaHqGtHOEis4wtxHUnf82GmFK2DyRglsorEt3_80nBXkcJI7LVk6OGhYiwLmxHdsu0ubnioPalxZ4GZwuJdUb_4sCgbgnCb1xvfv-HTANgmw9l2z7Qbg-8B1CxP-_UrDqM68ZYxBH49TZdx0vj3kkDU8BTdY5C8bvqzv6odePlmXcYuCtH04BdIw8R76CEKQJ2N3hNtO4OjoUauIbq-SgQCGxXS4k_brbY3o73s",
        linkedin: "#"
    },
    {
        id: "2",
        name: "Trần Thị Bình",
        roles: [],
        description: "Chuyên gia AI/ML với nhiều công bố khoa học quốc tế. Từng làm việc tại Silicon Valley.",
        title: "CTO",
        status: "Toàn thời gian",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA7_vQFLkRg76R9zTkEgS108KHuW2_rWrwURaOracUpn1hO4Zw7WDS2uK8Rd-i7DOqP6CxJDhMeg-nQyRU_b1US89SJt_FO2s7H9Zf6qjCwE9tYIZPLQKtykNHdhE1f-k_hvjSPfc3kAzxVc3fsESMRjAGe6KFSM3N9tEDJGoRRlMzndyo0yj6LiwPSdnVtZ4VUIdK04Vaj6UsQ7u7mlsf8SMV2xIe3zO5S67PUV1qkPIt4JJ-An9HT0y264XMvTk9nsQJjv9CGjWg",
        linkedin: "#"
    }
];

export default function StartupTeamPage() {
    const [team, setTeam] = useState<TeamMember[]>(initialTeam);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

    const handleAddMember = () => {
        setSelectedMember(null);
        setIsModalOpen(true);
    };

    const handleEditMember = (member: TeamMember) => {
        setSelectedMember(member);
        setIsModalOpen(true);
    };

    const handleDeleteMember = (id: string) => {
        setTeam(prev => prev.filter(m => m.id !== id));
    };

    const handleSaveMember = (memberData: TeamMember) => {
        if (selectedMember) {
            // Edit
            setTeam(prev => prev.map(m => m.id === selectedMember.id ? { ...memberData, id: m.id } : m));
        } else {
            // Add
            const newMember = { ...memberData, id: Math.random().toString(36).substr(2, 9) };
            setTeam(prev => [...prev, newMember]);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6 pb-20">
            <section className="bg-white rounded-[24px] shadow-sm border border-neutral-surface overflow-hidden">
                <div className="p-6 border-b border-neutral-surface bg-[#fdfbe9]/30 flex items-center justify-between">
                    <div>
                        <h3 className="font-black text-[#171611] text-lg flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#e6cc4c]">groups</span>
                            Đội ngũ sáng lập & nhân sự chủ chốt
                        </h3>
                        <p className="text-sm text-neutral-muted mt-1 font-bold">Giới thiệu những con người đứng sau sự thành công của dự án.</p>
                    </div>
                    <button
                        onClick={handleAddMember}
                        className="bg-[#e6cc4c] hover:bg-[#d4ba3d] text-white text-sm font-black px-5 py-2.5 rounded-2xl shadow-lg shadow-[#e6cc4c]/20 flex items-center gap-2 transition-all active:scale-95"
                    >
                        <span className="material-symbols-outlined text-lg font-black">add</span>
                        Thêm thành viên
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-neutral-surface/50 text-neutral-muted text-[11px] uppercase tracking-widest">
                                <th className="px-8 py-5 font-black">Thành viên</th>
                                <th className="px-8 py-5 font-black">Chức danh / Vai trò</th>
                                <th className="px-8 py-5 font-black">Liên kết</th>
                                <th className="px-8 py-5 font-black text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-surface">
                            {team.map((member) => (
                                <tr key={member.id} className="hover:bg-neutral-surface/20 transition-colors">
                                    <td className="px-8 py-7">
                                        <div className="flex gap-4">
                                            <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#e6cc4c]/20 shadow-sm bg-neutral-surface flex items-center justify-center">
                                                {member.avatar ? (
                                                    <img alt={member.name} className="w-full h-full object-cover" src={member.avatar} />
                                                ) : (
                                                    <span className="material-symbols-outlined text-neutral-muted">person</span>
                                                )}
                                            </div>
                                            <div className="space-y-1.5 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-black text-[15px] text-[#171611]">{member.name}</h4>
                                                    {member.roles.map(role => (
                                                        <span key={role} className="px-2.5 py-0.5 bg-[#e6cc4c] text-white text-[9px] font-black rounded-full uppercase tracking-widest">{role}</span>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-neutral-muted font-bold leading-relaxed line-clamp-2 max-w-sm italic opacity-80">
                                                    {member.description}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-black text-[#171611] leading-none">{member.title}</span>
                                            <span className="text-[10px] text-neutral-muted font-bold uppercase tracking-widest">{member.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <a
                                            href={member.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={cn(
                                                "inline-flex items-center justify-center w-9 h-9 rounded-xl transition-colors shadow-sm",
                                                member.linkedin && member.linkedin !== "#"
                                                    ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                                    : "bg-neutral-surface text-neutral-muted cursor-not-allowed opacity-50"
                                            )}
                                        >
                                            <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
                                        </a>
                                    </td>
                                    <td className="px-8 py-7 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEditMember(member)}
                                                className="w-9 h-9 flex items-center justify-center rounded-xl text-neutral-muted hover:bg-[#e6cc4c]/10 hover:text-[#171611] transition-all active:scale-90"
                                            >
                                                <span className="material-symbols-outlined text-xl">edit</span>
                                            </button>
                                            <button
                                                onClick={() => member.id && handleDeleteMember(member.id)}
                                                className="w-9 h-9 flex items-center justify-center rounded-xl text-neutral-muted hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                                            >
                                                <span className="material-symbols-outlined text-xl">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 border-t border-neutral-surface bg-neutral-surface/10 text-center">
                    <p className="text-[11px] text-neutral-muted font-bold italic">Hồ sơ có ít nhất 2 thành viên sáng lập thường được nhà đầu tư đánh giá cao hơn.</p>
                </div>
            </section>

            <TeamMemberModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveMember}
                member={selectedMember}
            />
        </div>
    );
}
