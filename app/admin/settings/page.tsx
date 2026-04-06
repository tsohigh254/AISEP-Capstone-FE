"use client";

import { useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Cpu, Link2, ShieldCheck, Settings, Server, Sparkles, Shield, Globe } from "lucide-react";

export default function AdminSettingsPage() {
  const [environment, setEnvironment] = useState("production");
  const [supportEmail, setSupportEmail] = useState("admin@aisep.vn");
  const [maintenance, setMaintenance] = useState(false);
  const [riskWindow, setRiskWindow] = useState("30");
  const [configNote, setConfigNote] = useState("Đang sử dụng chính sách mặc định cho AI và chuỗi khối.");

  return (
    <AdminShell>
      <div className="px-8 py-7 space-y-6 pb-16 animate-in fade-in duration-400">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[13px] font-semibold text-amber-600 uppercase tracking-[0.24em]">Cấu hình hệ thống</p>
            <h1 className="text-3xl font-semibold text-slate-950">System Control Center</h1>
            <p className="max-w-2xl text-sm text-slate-500 mt-2">Thiết lập chính sách AI, blockchain và bảo mật cho toàn bộ nền tảng.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary">Xuất cấu hình</Button>
            <Button>Áp dụng ngay</Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="space-y-6">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Toàn bộ cấu hình</CardTitle>
                  <CardDescription>Truy cập nhanh vào trạng thái, môi trường và các tuỳ chọn governance.</CardDescription>
                </div>
                <Badge className="bg-amber-100 text-amber-700 border-amber-200">Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="environment">Môi trường</Label>
                  <Select
                    id="environment"
                    value={environment}
                    onChange={(event) => setEnvironment(event.target.value)}
                    className="mt-2"
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="supportEmail">Email hỗ trợ</Label>
                  <Input
                    id="supportEmail"
                    value={supportEmail}
                    onChange={(event) => setSupportEmail(event.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="riskWindow">Risk Audit Window</Label>
                  <Input
                    id="riskWindow"
                    value={riskWindow}
                    onChange={(event) => setRiskWindow(event.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="maintenance">Chế độ bảo trì</Label>
                  <div className="mt-2 flex items-center gap-3">
                    <Button variant={maintenance ? "default" : "outline"} size="sm" onClick={() => setMaintenance(true)}>
                      Bật
                    </Button>
                    <Button variant={!maintenance ? "default" : "outline"} size="sm" onClick={() => setMaintenance(false)}>
                      Tắt
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="configNote">Ghi chú cấu hình</Label>
                <Textarea
                  id="configNote"
                  value={configNote}
                  onChange={(event) => setConfigNote(event.target.value)}
                  className="mt-2 min-h-[140px]"
                />
              </div>
            </CardContent>
            <CardFooter className="justify-end gap-3">
              <Button variant="outline">Hủy</Button>
              <Button>Save Settings</Button>
            </CardFooter>
          </Card>

          <div className="grid gap-6">
            <Card className="border-amber-200 bg-amber-50/80">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-amber-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">System snapshot</p>
                    <p className="text-sm text-slate-500">Cập nhật gần nhất: 2 phút trước</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="rounded-2xl bg-white border border-slate-200 p-4">
                  <p className="text-[13px] text-slate-500">AI config</p>
                  <p className="text-[17px] font-semibold text-slate-900 mt-2">GPT-4.1-turbo</p>
                </div>
                <div className="rounded-2xl bg-white border border-slate-200 p-4">
                  <p className="text-[13px] text-slate-500">Blockchain</p>
                  <p className="text-[17px] font-semibold text-slate-900 mt-2">Mainnet / RPC Online</p>
                </div>
                <div className="rounded-2xl bg-white border border-slate-200 p-4">
                  <p className="text-[13px] text-slate-500">Bảo mật</p>
                  <p className="text-[17px] font-semibold text-slate-900 mt-2">2FA enforced</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-slate-700" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">System policies</p>
                    <p className="text-sm text-slate-500">Thiết lập RBAC và audit từ dashboard.</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl bg-slate-950/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Security</p>
                  <p className="text-sm font-semibold text-slate-900 mt-2">Enforce MFA for all admin tiers.</p>
                </div>
                <div className="rounded-2xl bg-slate-950/5 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">AI</p>
                  <p className="text-sm font-semibold text-slate-900 mt-2">Monitor model drift and auto-rollback signals.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-amber-200">
            <CardHeader>
              <div className="flex items-center gap-3"><Cpu className="w-5 h-5 text-amber-600" /><CardTitle className="text-lg">AI Governance</CardTitle></div>
              <CardDescription>Điều chỉnh model, mức độ hiển thị và giám sát quy tắc.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Model</p>
                <p className="text-sm text-slate-800">gpt-4.1-turbo</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Timeout</p>
                <p className="text-sm text-slate-800">8s</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader>
              <div className="flex items-center gap-3"><Link2 className="w-5 h-5 text-slate-700" /><CardTitle className="text-lg">Blockchain</CardTitle></div>
              <CardDescription>Quản lý node, RPC và an toàn giao dịch.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Network</p>
                <p className="text-sm text-slate-800">Mainnet</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Sync status</p>
                <p className="text-sm text-slate-800">100% synced</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-200">
            <CardHeader>
              <div className="flex items-center gap-3"><Shield className="w-5 h-5 text-slate-700" /><CardTitle className="text-lg">Security</CardTitle></div>
              <CardDescription>Đặt chính sách bảo mật, audit và rollback.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">2FA</p>
                <p className="text-sm text-slate-800">Enforced for admin users</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Incident rollback</p>
                <p className="text-sm text-slate-800">Enabled for critical alerts</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
