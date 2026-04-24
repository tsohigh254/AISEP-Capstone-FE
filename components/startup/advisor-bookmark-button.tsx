"use client";

import { Bookmark, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type AdvisorBookmarkButtonProps = {
  bookmarked: boolean;
  loading?: boolean;
  onClick: () => void;
  variant?: "chip" | "button";
  className?: string;
};

export function AdvisorBookmarkButton({
  bookmarked,
  loading = false,
  onClick,
  variant = "button",
  className,
}: AdvisorBookmarkButtonProps) {
  const label = bookmarked ? "Đã lưu" : "Lưu";
  const title = bookmarked ? "Bỏ lưu cố vấn" : "Lưu cố vấn";

  if (variant === "chip") {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        title={title}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60",
          bookmarked
            ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700",
          className
        )}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Bookmark className={cn("h-3.5 w-3.5", bookmarked && "fill-current")} />
        )}
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      title={title}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-5 text-[13px] font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60",
        bookmarked
          ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
      )}
      {label}
    </button>
  );
}
