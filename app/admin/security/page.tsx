"use client";

import { useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Lock, AlertTriangle, Settings, Key } from "lucide-react";

export default function AdminSecurityPage() {
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [passwordPolicy, setPasswordPolicy] = useState("strong");
  const [mfaEnforced, setMfaEnforced] = useState(true);
  const [ssoEnabled, setSsoEnabled] = useState(false);

  return (
    <AdminShell>
      <div className="px-8 py-7 space-y-6 pb-16 animate-in fade-in duration-400">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[13px] font-semibold text-amber-600 uppercase tracking-[0.24em]">Security Center</p>
            <h1 className="text-3xl font-semibold text-slate-950">Risk & Access Controls</h1>
            <p className="max-w-2xl text-sm text-slate-500 mt-2">Quản lý chính sách bảo mật, xác thực và truy cập hệ thống.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary">Xem báo cáo</Button>
            <Button>Áp dụng thay đổi</Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="space-y-6">
            <CardHeader>
              <div className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-amber-600" /><CardTitle className="text-lg">Access policy</CardTitle></div>
              <CardDescription>Lưu lại chính sách đăng nhập, MFA và session runtime.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="password-policy">Password policy</Label>
                  <Input
                    id="password-policy"
                    value={passwordPolicy}
                    onChange={(event) => setPasswordPolicy(event.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="session-timeout">Session timeout (min)</Label>
                  <Input
                    id="session-timeout"
                    value={sessionTimeout}
                    onChange={(event) => setSessionTimeout(event.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">MFA enforced</p>
                      <p className="text-sm text-slate-500 mt-1">Require two-factor for admin access.</p>
                    </div>
                    <Badge className={mfaEnforced ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600"}>
                      {mfaEnforced ? "On" : "Off"}
                    </Badge>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant={mfaEnforced ? "default" : "outline"} onClick={() => setMfaEnforced(true)}>
                      Enable
                    </Button>
                    <Button size="sm" variant={!mfaEnforced ? "default" : "outline"} onClick={() => setMfaEnforced(false)}>
                      Disable
                    </Button>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">SSO / SAML</p>
                      <p className="text-sm text-slate-500 mt-1">Single sign-on for enterprise users.</p>
                    </div>
                    <Badge className={ssoEnabled ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600"}>
                      {ssoEnabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant={ssoEnabled ? "default" : "outline"} onClick={() => setSsoEnabled(true)}>
                      Enable
                    </Button>
                    <Button size="sm" variant={!ssoEnabled ? "default" : "outline"} onClick={() => setSsoEnabled(false)}>
                      Disable
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end gap-3">
              <Button variant="outline">Reset</Button>
              <Button>Save policy</Button>
            </CardFooter>
          </Card>

          <div className="space-y-6">
            <Card className="border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-3"><AlertTriangle className="w-5 h-5 text-slate-700" /><CardTitle className="text-lg">Incident readiness</CardTitle></div>
                <CardDescription>Quy trình rollback và cảnh báo bảo mật.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Threat alerts</p>
                  <p className="text-sm text-slate-900 mt-2">12 active alerts, 3 critical.</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Password rotation</p>
                  <p className="text-sm text-slate-900 mt-2">Every 90 days for privileged users.</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-3"><Key className="w-5 h-5 text-slate-700" /><CardTitle className="text-lg">Security score</CardTitle></div>
                <CardDescription>Đo lường mức độ tuân thủ và rủi ro.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-2xl bg-white border border-slate-200 p-5 text-center">
                  <p className="text-sm text-slate-500 uppercase tracking-[0.2em]">Current</p>
                  <p className="text-4xl font-semibold text-slate-950 mt-3">87 / 100</p>
                  <p className="text-sm text-slate-500 mt-3">All critical guardrails are active.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
