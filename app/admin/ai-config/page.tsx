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
import { Cpu, Sparkles, ShieldCheck, Activity, CheckCircle2 } from "lucide-react";

export default function AdminAIConfigPage() {
  const [model, setModel] = useState("gpt-4.1-turbo");
  const [safety, setSafety] = useState("standard");
  const [prompt, setPrompt] = useState("Hướng dẫn AI đánh giá rủi ro KYC và phân loại độ tin cậy.");
  const [enableAudit, setEnableAudit] = useState(true);

  return (
    <AdminShell>
      <div className="px-8 py-7 space-y-6 pb-16 animate-in fade-in duration-400">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[13px] font-semibold text-amber-600 uppercase tracking-[0.24em]">AI Configuration</p>
            <h1 className="text-3xl font-semibold text-slate-950">AI Governance</h1>
            <p className="max-w-2xl text-sm text-slate-500 mt-2">Cấu hình model AI, an toàn và cách hệ thống xử lý dữ liệu nhạy cảm.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary">Lưu nháp</Button>
            <Button>Áp dụng</Button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_0.85fr]">
          <Card className="space-y-6">
            <CardHeader>
              <div className="flex items-center gap-3"><Cpu className="w-5 h-5 text-amber-600" /><CardTitle className="text-lg">AI Control Panel</CardTitle></div>
              <CardDescription>Giám sát cấu hình model và chính sách đánh giá tự động.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="ai-model">Model</Label>
                  <Select id="ai-model" value={model} onChange={(event) => setModel(event.target.value)} className="mt-2">
                    <option value="gpt-4.1-turbo">gpt-4.1-turbo</option>
                    <option value="gpt-4.1-mini">gpt-4.1-mini</option>
                    <option value="gpt-4.1-vision">gpt-4.1-vision</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="safety">Safety level</Label>
                  <Select id="safety" value={safety} onChange={(event) => setSafety(event.target.value)} className="mt-2">
                    <option value="standard">Standard</option>
                    <option value="strict">Strict</option>
                    <option value="custom">Custom</option>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="prompt">Prompt template</Label>
                <Textarea
                  id="prompt"
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  className="mt-2 min-h-[160px]"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Audit</p>
                  <div className="mt-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-900 font-semibold">Auto audit</p>
                      <p className="text-sm text-slate-500">Tự động ghi lại các lần gọi AI nhạy cảm.</p>
                    </div>
                    <Badge variant={enableAudit ? "default" : "outline"} className={enableAudit ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}>
                      {enableAudit ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Latency policy</p>
                  <p className="text-sm text-slate-900 font-semibold mt-2">Soft timeout 8s / hard timeout 12s</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end gap-3">
              <Button variant="outline">Discard</Button>
              <Button>Run test</Button>
            </CardFooter>
          </Card>

          <div className="grid gap-6">
            <Card className="border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-3"><Sparkles className="w-5 h-5 text-slate-700" /><CardTitle className="text-lg">AI Score</CardTitle></div>
                <CardDescription>Kiểm tra mức độ an toàn và độ tin cậy.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Rủi ro</p>
                  <p className="text-3xl font-semibold text-slate-900 mt-2">Low</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Mức độ mô hình</p>
                  <p className="text-sm text-slate-900 mt-2">Phiên bản mới nhất, không gian token 64k.</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-slate-700" /><CardTitle className="text-lg">Compliance</CardTitle></div>
                <CardDescription>Thông tin audit và dữ liệu nhạy cảm được giám sát.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl bg-white border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Checkpoint</p>
                  <p className="text-sm text-slate-900 mt-2">Audit events are stored for 90 days.</p>
                </div>
                <div className="rounded-2xl bg-white border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Data protection</p>
                  <p className="text-sm text-slate-900 mt-2">Masked PII for all AI requests.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
