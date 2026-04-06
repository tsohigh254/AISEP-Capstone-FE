"use client";

import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Cpu, Link2, Database, Globe, AlertTriangle, ShieldCheck, Flame } from "lucide-react";

const services = [
  { name: "AI Service", status: "Healthy", uptime: "99.8%", icon: Cpu },
  { name: "Blockchain Node", status: "Online", uptime: "100%", icon: Link2 },
  { name: "Database", status: "Healthy", uptime: "99.9%", icon: Database },
  { name: "API Gateway", status: "Degraded", uptime: "97.2%", icon: Globe },
];

const timeline = [
  { time: "10:32", event: "AI scoring latency spike", severity: "warning" },
  { time: "09:15", event: "Blockchain sync completed", severity: "healthy" },
  { time: "08:47", event: "Role change audit recorded", severity: "healthy" },
  { time: "08:21", event: "Database replica lag detected", severity: "warning" },
];

function statusClass(status: string) {
  if (status === "Healthy") return "bg-emerald-100 text-emerald-700";
  if (status === "Online") return "bg-emerald-100 text-emerald-700";
  if (status === "Degraded") return "bg-amber-100 text-amber-700";
  if (status === "Critical") return "bg-red-100 text-red-600";
  return "bg-slate-100 text-slate-600";
}

export default function AdminMonitoringPage() {
  return (
    <AdminShell>
      <div className="px-8 py-7 space-y-6 pb-16 animate-in fade-in duration-400">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[13px] font-semibold text-amber-600 uppercase tracking-[0.24em]">System Health</p>
            <h1 className="text-3xl font-semibold text-slate-950">Monitoring & Observability</h1>
            <p className="max-w-2xl text-sm text-slate-500 mt-2">Theo dõi tình trạng AI, blockchain, API và báo cáo bất thường.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary">Reload metrics</Button>
            <Button>Open logs</Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Card key={service.name} className="border-slate-200">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="rounded-2xl bg-slate-50 p-2 text-slate-700"><Icon className="w-5 h-5" /></span>
                    <div>
                      <CardTitle className="text-base">{service.name}</CardTitle>
                      <CardDescription>{service.uptime} uptime</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500">Status</p>
                      <p className="text-lg font-semibold text-slate-900 mt-1">{service.status}</p>
                    </div>
                    <Badge className={statusClass(service.status)}>{service.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="space-y-4 border-slate-200">
            <CardHeader>
              <div className="flex items-center gap-3"><Activity className="w-5 h-5 text-slate-700" /><CardTitle className="text-lg">Recent Events</CardTitle></div>
              <CardDescription>Timeline các hoạt động và cảnh báo gần nhất.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {timeline.map((item) => (
                  <div key={item.time} className="flex items-start justify-between rounded-2xl border border-slate-200 bg-white p-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.event}</p>
                      <p className="text-xs text-slate-500 mt-1">{item.time}</p>
                    </div>
                    <span className={
                      item.severity === "warning"
                        ? "rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700"
                        : "rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700"
                    }>
                      {item.severity}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button variant="outline">View full incident history</Button>
            </CardFooter>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <div className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-slate-700" /><CardTitle className="text-lg">Health Score</CardTitle></div>
              <CardDescription>Đánh giá tổng quan trạng thái vận hành.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-3xl bg-amber-50 p-6 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Overall status</p>
                <p className="text-5xl font-semibold text-slate-950 mt-4">92</p>
                <p className="text-sm text-slate-500 mt-2">Thang điểm 100 với độ ổn định cao.</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm text-slate-600">AI alerts</p>
                  <p className="text-sm font-semibold text-slate-900">2</p>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm text-slate-600">Critical incidents</p>
                  <p className="text-sm font-semibold text-slate-900">1</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
