"use client";

import { AuthGuard } from "@/components/auth-guard";

export default function StaffPage() {
  return (
    <AuthGuard allowedRoles={["Staff"]}>
      <main className="flex min-h-screen items-center justify-center bg-[#f8f8f6]">
        <h1 className="text-2xl font-semibold text-slate-700">Staff Dashboard — Coming soon</h1>
      </main>
    </AuthGuard>
  );
}
