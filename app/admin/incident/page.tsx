"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, ArrowRight, ShieldCheck } from "lucide-react";

const incidents = [
  { id: "INC-181", title: "Blockchain node delay", severity: "critical", owner: "ops@aisep.vn", status: "Mitigating", updated: "10 phút trước" },
  { id: "INC-174", title: "Failed role assignment", severity: "high", owner: "admin@aisep.vn", status: "Investigating", updated: "1 giờ trước" },
  { id: "INC-162", title: "AI model timeout", severity: "medium", owner: "ml@aisep.vn", status: "Resolved", updated: "3 giờ trước" },
];

function severityClass(severity: string) {
  if (severity === "critical") return "bg-red-100 text-red-600";
  if (severity === "high") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-600";
}

export default function AdminIncidentPage() {
  return (
    <AdminShell>
      <div className="px-8 py-7 space-y-6 pb-16 animate-in fade-in duration-400">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[13px] font-semibold text-amber-600 uppercase tracking-[0.24em]">Incident Center</p>
            <h1 className="text-3xl font-semibold text-slate-950">Incident Response</h1>
            <p className="max-w-2xl text-sm text-slate-500 mt-2">Ghi nhận, theo dõi và rollback sự cố hệ thống trong thời gian thực.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary">Tạo incident</Button>
            <Button>Triển khai rollback</Button>
          </div>
        </div>

        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-3"><Flame className="w-5 h-5 text-red-600" /><CardTitle className="text-lg">Open incidents</CardTitle></div>
            <CardDescription>Danh sách sự cố đang xử lý kèm hành động khẩn cấp.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {incidents.map((incident) => (
              <div key={incident.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-500">{incident.id}</p>
                    <p className="text-lg font-semibold text-slate-950">{incident.title}</p>
                    <p className="text-sm text-slate-500">Owner: {incident.owner}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className={severityClass(incident.severity)}>{incident.severity}</Badge>
                    <Badge className="bg-slate-100 text-slate-600">{incident.status}</Badge>
                    <span className="text-sm text-slate-500">{incident.updated}</span>
                    <Button variant="outline" size="sm" className="shrink-0">
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-slate-200">
            <CardHeader>
              <div className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-slate-700" /><CardTitle className="text-lg">Rollback guidance</CardTitle></div>
              <CardDescription>Chuẩn bị các bước phục hồi và checkpoints.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-700">Roll back to last stable block or previous known-good configuration, then confirm audit entry.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Recovery point</p>
                  <p className="text-lg font-semibold text-slate-900 mt-3">2026-04-05 09:05</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Last audit</p>
                  <p className="text-lg font-semibold text-slate-900 mt-3">15 minutes ago</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button>Open rollback console</Button>
            </CardFooter>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <div className="flex items-center gap-3"><ArrowRight className="w-5 h-5 text-slate-700" /><CardTitle className="text-lg">Escalation queue</CardTitle></div>
              <CardDescription>Những sự cố cần thu hút sự chú ý của ban quản trị.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-amber-50 p-4">
                <p className="text-sm text-slate-700">Critical finance incident awaiting governance approval.</p>
              </div>
              <div className="rounded-2xl bg-white border border-slate-200 p-4">
                <p className="text-sm text-slate-700">Incident reports feed through to the audit and escalation center automatically.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
