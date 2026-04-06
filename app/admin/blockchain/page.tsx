"use client";

import { useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Link2, Database, Globe, RefreshCw, ShieldCheck } from "lucide-react";

export default function AdminBlockchainPage() {
  const [rpcUrl, setRpcUrl] = useState("https://mainnet.rpc.aisep.vn");
  const [network, setNetwork] = useState("mainnet");
  const [syncStatus, setSyncStatus] = useState("100%");

  return (
    <AdminShell>
      <div className="px-8 py-7 space-y-6 pb-16 animate-in fade-in duration-400">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[13px] font-semibold text-amber-600 uppercase tracking-[0.24em]">Blockchain Operations</p>
            <h1 className="text-3xl font-semibold text-slate-950">Ledger & Node Management</h1>
            <p className="max-w-2xl text-sm text-slate-500 mt-2">Giám sát node, cấu hình RPC và rollback transaction khi cần.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary">Kiểm tra node</Button>
            <Button>Ghi nhận thay đổi</Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="space-y-6">
            <CardHeader>
              <div className="flex items-center gap-3"><Link2 className="w-5 h-5 text-amber-600" /><CardTitle className="text-lg">Node Control</CardTitle></div>
              <CardDescription>Thiết lập các endpoint RPC và trạng thái sync cho hệ thống blockchain.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="network">Network</Label>
                  <div className="mt-2 flex gap-2">
                    {[
                      { id: "mainnet", label: "Mainnet" },
                      { id: "testnet", label: "Testnet" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setNetwork(item.id)}
                        className={
                          `rounded-2xl border px-3 py-2 text-sm font-semibold transition-colors ${
                            network === item.id
                              ? "border-amber-200 bg-amber-50 text-amber-800"
                              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                          }`
                        }
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="sync-status">Sync status</Label>
                  <Input id="sync-status" value={syncStatus} readOnly className="mt-2" />
                </div>
              </div>
              <div>
                <Label htmlFor="rpc-url">RPC Endpoint</Label>
                <Input
                  id="rpc-url"
                  value={rpcUrl}
                  onChange={(event) => setRpcUrl(event.target.value)}
                  className="mt-2"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Current block</p>
                  <p className="text-3xl font-semibold text-slate-900 mt-2">#198432</p>
                </div>
                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Gas estimate</p>
                  <p className="text-3xl font-semibold text-slate-900 mt-2">31 Gwei</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between gap-3 flex-wrap">
              <Button variant="outline">Rollback queue</Button>
              <Button>Sync now</Button>
            </CardFooter>
          </Card>

          <div className="grid gap-6">
            <Card className="border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-3"><Database className="w-5 h-5 text-slate-700" /><CardTitle className="text-lg">Node health</CardTitle></div>
                <CardDescription>Kiểm tra tính khả dụng của node và thời gian phản hồi.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Latency</p>
                      <p className="text-sm font-semibold text-slate-900 mt-2">38ms</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Online</Badge>
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Block finality</p>
                      <p className="text-sm font-semibold text-slate-900 mt-2">Fast</p>
                    </div>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200">Stable</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardHeader>
                <div className="flex items-center gap-3"><ShieldCheck className="w-5 h-5 text-slate-700" /><CardTitle className="text-lg">Audit hooks</CardTitle></div>
                <CardDescription>Phân quyền đọc/ghi và rollback được ghi vào log.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-900">Any blockchain action is stored and can be rolled back from the incident center.</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 flex items-center justify-between">
                  <p className="text-sm text-slate-700">Last rollback</p>
                  <span className="text-sm font-semibold text-slate-900">1 hour ago</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
