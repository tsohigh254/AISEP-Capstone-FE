"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flag, ShieldCheck, AlertTriangle } from "lucide-react";

const escalations = [
  { id: "ESC-41", subject: "Suspicious KYC profile", severity: "critical", owner: "ops@aisep.vn" },
  { id: "ESC-38", subject: "Unauthorized role change", severity: "high", owner: "security@aisep.vn" },
  { id: "ESC-35", subject: "Policy drift alert", severity: "medium", owner: "compliance@aisep.vn" },
];

function badgeClass(severity: string) {
  if (severity === "critical") return "bg-red-100 text-red-600";
  if (severity === "high") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-600";
}

export default function AdminEscalatedPage() {
  return (
    <AdminShell>
      <div className="px-8 py-7 space-y-6 pb-16 animate-in fade-in duration-400">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[13px] font-semibold text-amber-600 uppercase tracking-[0.24em]">Escalated Reports</p>
            <h1 className="text-3xl font-semibold text-slate-950">Governance Escalation</h1>
            <p className="max-w-2xl text-sm text-slate-500 mt-2">Xem các báo cáo leo thang và chuyển giao cho đội ngũ xử lý.</p>
          </div>
          <Button variant="secondary">Tạo báo cáo mới</Button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-slate-200">
            <CardHeader>
              <div className="flex items-center gap-3"><Flag className="w-5 h-5 text-red-600" /><CardTitle className="text-lg">Escalation queue</CardTitle></div>
              <CardDescription>Danh sách các báo cáo được đẩy lên để review nhanh.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {escalations.map((item) => (
                <div key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-500">{item.id}</p>
                      <p className="text-lg font-semibold text-slate-950 mt-1">{item.subject}</p>
                      <p className="text-sm text-slate-500 mt-1">Owner: {item.owner}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={badgeClass(item.severity)}>{item.severity}</Badge>
                      <Button variant="outline" size="sm">Review</Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <div className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-slate-700" /><CardTitle className="text-lg">Escalation policy</CardTitle></div>
              <CardDescription>Chính sách tiếp nhận và xử lý báo cáo quan trọng.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-700">Tự động chuyển những sự cố có mức độ từ high trở lên về ban quản trị.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Review SLA</p>
                <p className="text-lg font-semibold text-slate-900 mt-2">45 phút</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
