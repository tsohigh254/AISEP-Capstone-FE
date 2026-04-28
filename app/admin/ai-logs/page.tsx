"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronRight, FileText, Loader2, RefreshCw, Search } from "lucide-react";
import { GetAiLogs, type AiLogEntryRes, type AiLogFileInfoRes } from "@/services/admin/admin.api";

const TAIL_OPTIONS = [
  { value: 100, label: "Last 100" },
  { value: 200, label: "Last 200" },
  { value: 500, label: "Last 500" },
  { value: 1000, label: "Last 1000" },
];

const LEVEL_OPTIONS = [
  { value: "", label: "All levels" },
  { value: "INFO", label: "INFO" },
  { value: "WARNING", label: "WARNING" },
  { value: "ERROR", label: "ERROR" },
  { value: "DEBUG", label: "DEBUG" },
];

function levelClass(level: string) {
  const lv = (level || "").toUpperCase();
  if (lv === "ERROR" || lv === "CRITICAL") return "bg-rose-100 text-rose-700";
  if (lv === "WARNING" || lv === "WARN") return "bg-amber-100 text-amber-700";
  if (lv === "DEBUG") return "bg-slate-100 text-slate-500";
  return "bg-emerald-100 text-emerald-700"; // INFO
}

function sourceClass(src: string) {
  return src === "worker" ? "bg-violet-100 text-violet-700" : "bg-sky-100 text-sky-700";
}

function formatTime(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function formatBytes(n: number) {
  if (!n) return "0 B";
  const u = ["B", "KB", "MB", "GB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(1)} ${u[i]}`;
}

export default function AdminAiLogsPage() {
  const [tail, setTail] = useState(200);
  const [level, setLevel] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [correlationId, setCorrelationId] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);

  const [entries, setEntries] = useState<AiLogEntryRes[]>([]);
  const [sources, setSources] = useState<AiLogFileInfoRes[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleSearchChange = (v: string) => {
    setSearchInput(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(v), 400);
  };

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await GetAiLogs({
        tail,
        level: level || undefined,
        search: search || undefined,
        correlationId: correlationId || undefined,
      }) as unknown as IBackendRes<{ entries: AiLogEntryRes[]; totalReturned: number; sources: AiLogFileInfoRes[] }>;

      if ((res.success || res.isSuccess) && res.data) {
        setEntries(res.data.entries ?? []);
        setSources(res.data.sources ?? []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [tail, level, search, correlationId]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => fetchLogs(), 5000);
    return () => clearInterval(id);
  }, [autoRefresh, fetchLogs]);

  const toggleRow = (idx: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  };

  return (
    <AdminShell>
      <div className="px-8 py-7 space-y-6 pb-16 animate-in fade-in duration-400">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[13px] font-semibold text-amber-600 uppercase tracking-[0.24em]">AI Logs</p>
            <h1 className="text-3xl font-semibold text-slate-950">AI Service Activity</h1>
            <p className="max-w-2xl text-sm text-slate-500 mt-2">
              Theo dõi log của AI service (FastAPI + Celery worker) qua shared volume.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-slate-300"
              />
              Auto refresh 5s
            </label>
            <Button onClick={() => fetchLogs()} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Refresh
            </Button>
          </div>
        </div>

        {/* Source files info */}
        {sources.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {sources.map((s) => (
              <span
                key={s.fileName}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-medium ${
                  s.exists ? "bg-slate-100 text-slate-700" : "bg-rose-50 text-rose-600"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                {s.fileName}
                {s.exists ? (
                  <>
                    <span className="text-slate-400">·</span>
                    <span>{formatBytes(s.sizeBytes)}</span>
                    {s.lastModifiedUtc && (
                      <>
                        <span className="text-slate-400">·</span>
                        <span>{formatTime(s.lastModifiedUtc)}</span>
                      </>
                    )}
                  </>
                ) : (
                  <span className="text-rose-500">missing</span>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Filters */}
        <Card className="border-slate-200">
          <CardContent>
            <div className="grid gap-4 xl:grid-cols-[1.5fr_0.7fr_0.8fr_0.7fr_0.5fr] items-end">
              <div>
                <Label htmlFor="search">Search message / logger</Label>
                <div className="mt-2 relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="search"
                    value={searchInput}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="e.g. gemini, evaluation, error..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="level">Level</Label>
                <Select id="level" value={level} onChange={(e) => setLevel(e.target.value)} className="mt-2">
                  {LEVEL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="correlationId">Correlation ID</Label>
                <Input
                  id="correlationId"
                  value={correlationId}
                  onChange={(e) => setCorrelationId(e.target.value)}
                  placeholder="uuid..."
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="tail">Tail</Label>
                <Select id="tail" value={tail} onChange={(e) => setTail(Number(e.target.value))} className="mt-2">
                  {TAIL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label className="opacity-0">Clear</Label>
                <Button
                  className="w-full"
                  onClick={() => {
                    setSearch(""); setSearchInput(""); setLevel(""); setCorrelationId("");
                  }}
                >
                  Clear
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
              <CardTitle className="text-lg">Log entries</CardTitle>
              <span className="text-sm text-slate-400 ml-auto">{entries.length} entries (newest first)</span>
            </div>
            <CardDescription>JSON-structured log lines from AI api + worker, merged.</CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-3 py-2 w-8"></th>
                  <th className="px-3 py-2">Time</th>
                  <th className="px-3 py-2">Level</th>
                  <th className="px-3 py-2">Source</th>
                  <th className="px-3 py-2">Logger</th>
                  <th className="px-3 py-2">Message</th>
                  <th className="px-3 py-2">Correlation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loading && entries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin inline-block mr-2" /> Loading...
                    </td>
                  </tr>
                ) : entries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">No log entries match the filter.</td>
                  </tr>
                ) : (
                  entries.map((e, idx) => {
                    const open = expanded.has(idx);
                    return (
                      <Fragment key={idx}>
                        <tr className="hover:bg-slate-50 cursor-pointer" onClick={() => toggleRow(idx)}>
                          <td className="px-3 py-2 text-slate-400">
                            {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap font-mono text-xs text-slate-700">{formatTime(e.timestamp)}</td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${levelClass(e.level)}`}>
                              {e.level}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${sourceClass(e.source)}`}>
                              {e.source}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-mono text-xs text-slate-500 max-w-[180px] truncate">{e.logger}</td>
                          <td className="px-3 py-2 max-w-[480px] truncate">{e.message}</td>
                          <td className="px-3 py-2 font-mono text-[11px] text-slate-400 max-w-[160px] truncate">
                            {e.correlationId ?? "—"}
                          </td>
                        </tr>
                        {open && (
                          <tr className="bg-slate-50">
                            <td colSpan={7} className="px-6 py-4">
                              <pre className="text-xs text-slate-700 whitespace-pre-wrap break-all bg-white border border-slate-200 rounded p-3">
{JSON.stringify(e, null, 2)}
                              </pre>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
