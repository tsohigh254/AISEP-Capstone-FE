"use client";

import Image from "next/image";
import type { ConsultingFormat } from "@/types/advisor-consulting";

export const FORMAT_CFG: Record<ConsultingFormat, {
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
}> = {
  GOOGLE_MEET: {
    label: "Google Meet",
    shortLabel: "Google Meet",
    icon: (
      <Image
        src="https://thesvg.org/icons/google-meet/default.svg"
        alt="Google Meet"
        width={14}
        height={14}
        unoptimized
      />
    ),
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200/80",
  },
  MICROSOFT_TEAMS: {
    label: "Microsoft Teams",
    shortLabel: "MS Teams",
    icon: (
      <Image
        src="https://thesvg.org/icons/microsoft-teams/default.svg"
        alt="Microsoft Teams"
        width={14}
        height={14}
        unoptimized
      />
    ),
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200/80",
  },
};

export function FormatBadge({ format, size = "md" }: { format: ConsultingFormat; size?: "sm" | "md" }) {
  const cfg = FORMAT_CFG[format];
  const sz = size === "sm" ? "text-[10px]" : "text-[11px]";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border font-semibold ${sz} ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      {cfg.icon}
      {cfg.shortLabel}
    </span>
  );
}
