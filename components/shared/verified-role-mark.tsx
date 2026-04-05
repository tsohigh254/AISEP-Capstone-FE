"use client";

import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type VerifiedRoleMarkProps = {
  className?: string;
};

export function VerifiedRoleMark({ className }: VerifiedRoleMarkProps) {
  return (
    <BadgeCheck
      className={cn("h-4 w-4 text-emerald-500 fill-emerald-50", className)}
      aria-label="Đã xác minh KYC"
    />
  );
}
