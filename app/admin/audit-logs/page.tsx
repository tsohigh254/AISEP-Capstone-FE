"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FileText, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { GetAuditLogs } from "@/services/admin/admin.api";

const PAGE_SIZE = 20;

const ACTION_TYPE_OPTIONS = [
  { value: "", label: "All events" },
  { value: "LOCK_USER", label: "Lock user" },
  { value: "UNLOCK_USER", label: "Unlock user" },
  { value: "CREATE_ROLE", label: "Create role" },
  { value: "UPDATE_ROLE", label: "Update role" },
  { value: "DELETE_ROLE", label: "Delete role" },
  { value: "ASSIGN_ROLE", label: "Assign role" },
  { value: "REMOVE_ROLE", label: "Remove role" },
  { value: "ASSIGN_PERMISSION_TO_ROLE", label: "Assign permission" },
  { value: "REMOVE_PERMISSION_FROM_ROLE", label: "Remove permission" },
  { value: "CREATE_PERMISSION", label: "Create permission" },
  { value: "UPDATE_PERMISSION", label: "Update permission" },
  { value: "DELETE_PERMISSION", label: "Delete permission" },
  { value: "UPDATE_PROFILE", label: "Update profile" },
];

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminAuditLogsPage() {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [actionType, setActionType] = useState("");
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState<IAuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleSearchChange = (v: string) => {
    setSearchInput(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setSearch(v); setPage(1); }, 400);
  };

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await GetAuditLogs({
        key: search || undefined,
        actionType: actionType || undefined,
        page,
        pageSize: PAGE_SIZE,
      }) as unknown as IBackendRes<any>;

      if ((res.success || res.isSuccess) && res.data) {
        const raw = res.data;
        setLogs(raw.items ?? raw.data ?? []);
        const t = raw.paging?.totalItems ?? raw.total ?? 0;
        setTotal(t);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [search, actionType, page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AdminShell>
      <div className="px-8 py-7 space-y-6 pb-16 animate-in fade-in duration-400">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[13px] font-semibold text-amber-600 uppercase tracking-[0.24em]">Audit Logs</p>
            <h1 className="text-3xl font-semibold text-slate-950">Activity & Compliance</h1>
            <p className="max-w-2xl text-sm text-slate-500 mt-2">
              Duyệt lịch sử thay đổi và kiểm tra audit trail cho toàn bộ hệ thống.
            </p>
          </div>
          <Button onClick={() => fetchLogs()} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Refresh logs
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-slate-200">
          <CardContent>
            <div className="grid gap-4 xl:grid-cols-[1.5fr_0.8fr_0.8fr] items-end">
              <div>
                <Label htmlFor="search">Search audit</Label>
                <div className="mt-2 relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="search"
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search by actor email, action or entity..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="actionType">Action type</Label>
                <Select
                  id="actionType"
                  value={actionType}
                  onChange={(e) => { setActionType(e.target.value); setPage(1); }}
                  className="mt-2"
                >
                  {ACTION_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label className="opacity-0">Action</Label>
                <Button className="w-full" onClick={() => { setSearch(""); setSearchInput(""); setActionType(""); setPage(1); }}>
                  Clear filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-slate-200 overflow-hidden">
          <CardHeader>
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-slate-700" />
              <CardTitle className="text-lg">Audit entries</CardTitle>
              <span className="text-sm text-slate-400 ml-auto">{total} records</span>
            </div>
            <CardDescription>Hiển thị lịch sử hành động với phân trang.</CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading && logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" /> Loading...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-slate-400">No audit logs found.</td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.logId}>
                      <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{formatTime(log.createdAt)}</td>
                      <td className="px-4 py-3">{log.userEmail ?? "system"}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                          {log.actionType}
                        </span>
                      </td>
                      <td className="px-4 py-3">{log.entityType}{log.entityId ? ` #${log.entityId}` : ""}</td>
                      <td className="px-4 py-3 text-slate-400 max-w-[240px] truncate">{log.actionDetails ?? "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
              <span className="text-sm text-slate-500">
                Page {page} / {totalPages}
              </span>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </AdminShell>
  );
}
