"use client";

import { AdvisorShell } from "@/components/advisor/advisor-shell";
import { Save, RefreshCw, Eye, EyeOff } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  GetAdvisorTimeSlots,
  UpsertAdvisorTimeSlots,
  GetAdvisorSessions,
  type ITimeSlot,
} from "@/services/advisor/advisor.api";

// ─── Constants ────────────────────────────────────────────────

const DAY_LABELS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

const TIMES: string[] = [];
for (let h = 7; h < 24; h++) {
  TIMES.push(`${String(h).padStart(2, "0")}:00`);
  TIMES.push(`${String(h).padStart(2, "0")}:30`);
}

// ─── Helpers ──────────────────────────────────────────────────

function cellKey(day: number, time: string) {
  return `${day}-${time}`;
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function slotsToSelected(slots: ITimeSlot[]): Set<string> {
  const selected = new Set<string>();
  slots.forEach(({ dayOfWeek, startTime, endTime }) => {
    let current = startTime;
    while (current < endTime) {
      selected.add(cellKey(dayOfWeek, current));
      current = addMinutes(current, 30);
    }
  });
  return selected;
}

function selectedToSlots(selected: Set<string>) {
  const byDay: Record<number, string[]> = {};
  selected.forEach((key) => {
    const dash = key.indexOf("-");
    const day = Number(key.slice(0, dash));
    const time = key.slice(dash + 1);
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(time);
  });

  const result: { dayOfWeek: number; startTime: string; endTime: string }[] = [];
  Object.entries(byDay).forEach(([dayStr, times]) => {
    const day = Number(dayStr);
    const sorted = [...times].sort();
    let start = sorted[0];
    let prev = sorted[0];
    for (let i = 1; i < sorted.length; i++) {
      const curr = sorted[i];
      if (curr === addMinutes(prev, 30)) {
        prev = curr;
      } else {
        result.push({ dayOfWeek: day, startTime: start, endTime: addMinutes(prev, 30) });
        start = curr;
        prev = curr;
      }
    }
    result.push({ dayOfWeek: day, startTime: start, endTime: addMinutes(prev, 30) });
  });
  return result;
}

// JS getDay(): 0=Sun,1=Mon..6=Sat → grid index: 0=Mon..5=Sat,6=Sun
function jsToGridDay(jsDay: number) {
  return jsDay === 0 ? 6 : jsDay - 1;
}

interface ISessionInfo {
  startupName: string;
  scheduledStartAt: string;
  scheduledEndAt?: string;
  durationMinutes?: number;
  status: string;
}

function sessionToBusyCells(session: any): string[] {
  if (!session.scheduledStartAt) return [];
  const start = new Date(session.scheduledStartAt);
  const gridDay = jsToGridDay(start.getDay());
  const endAt = session.scheduledEndAt
    ? new Date(session.scheduledEndAt)
    : new Date(start.getTime() + (session.durationMinutes || 60) * 60000);

  const cells: string[] = [];
  const rounded = new Date(start);
  rounded.setMinutes(rounded.getMinutes() < 30 ? 0 : 30, 0, 0);

  let cur = rounded;
  while (cur < endAt) {
    const t = `${String(cur.getHours()).padStart(2, "0")}:${String(cur.getMinutes()).padStart(2, "0")}`;
    if (TIMES.includes(t)) cells.push(cellKey(gridDay, t));
    cur = new Date(cur.getTime() + 30 * 60000);
  }
  return cells;
}

// ─── Templates ────────────────────────────────────────────────

function buildTemplateCells(timeStart: string, timeEnd: string, days: number[]): Set<string> {
  const cells = new Set<string>();
  for (const day of days) {
    for (const t of TIMES) {
      if (t >= timeStart && t < timeEnd) cells.add(cellKey(day, t));
    }
  }
  return cells;
}

const TEMPLATES = [
  { label: "Buổi sáng", desc: "7:00–12:00, tất cả ngày",      cells: () => buildTemplateCells("07:00", "12:00", [0,1,2,3,4,5,6]) },
  { label: "Buổi chiều", desc: "13:00–18:00, tất cả ngày",     cells: () => buildTemplateCells("13:00", "18:00", [0,1,2,3,4,5,6]) },
  { label: "Ngày làm việc", desc: "9:00–17:30, Thứ 2 – Thứ 6", cells: () => buildTemplateCells("09:00", "17:30", [0,1,2,3,4]) },
];

// ─── Page ─────────────────────────────────────────────────────

export default function AdvisorAvailabilityPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busyCells, setBusyCells] = useState<Map<string, ISessionInfo>>(new Map());
  const [hoveredBusy, setHoveredBusy] = useState<{ key: string; x: number; y: number } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const dragging = useRef(false);
  const dragValue = useRef(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      GetAdvisorTimeSlots() as Promise<any>,
      GetAdvisorSessions({ pageSize: 100 }) as Promise<any>,
    ])
      .then(([slotsRes, sessionsRes]) => {
        const data: ITimeSlot[] = slotsRes?.data?.data ?? slotsRes?.data ?? [];
        setSelected(slotsToSelected(Array.isArray(data) ? data : []));

        const sessions: any[] = sessionsRes?.data?.items ?? sessionsRes?.data?.data ?? sessionsRes?.data ?? [];
        const busy = new Map<string, ISessionInfo>();
        (Array.isArray(sessions) ? sessions : [])
          .filter((s: any) => s.status !== "Cancelled" && s.status !== "Completed")
          .forEach((s: any) => {
            const info: ISessionInfo = {
              startupName: s.startupName || s.startup?.name || s.startup?.startupName || "Startup",
              scheduledStartAt: s.scheduledStartAt,
              scheduledEndAt: s.scheduledEndAt,
              durationMinutes: s.durationMinutes,
              status: s.status,
            };
            sessionToBusyCells(s).forEach(c => busy.set(c, info));
          });
        setBusyCells(busy);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleMouseDown = useCallback((day: number, time: string) => {
    const key = cellKey(day, time);
    dragging.current = true;
    setSelected((prev) => {
      dragValue.current = !prev.has(key);
      const next = new Set(prev);
      if (dragValue.current) next.add(key);
      else next.delete(key);
      return next;
    });
  }, []);

  const handleMouseEnter = useCallback((day: number, time: string) => {
    if (!dragging.current) return;
    const key = cellKey(day, time);
    setSelected((prev) => {
      const next = new Set(prev);
      if (dragValue.current) next.add(key);
      else next.delete(key);
      return next;
    });
  }, []);

  useEffect(() => {
    const stop = () => { dragging.current = false; };
    window.addEventListener("mouseup", stop);
    return () => window.removeEventListener("mouseup", stop);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await UpsertAdvisorTimeSlots(selectedToSlots(selected));
      toast.success("Đã lưu lịch trống");
    } catch {
      toast.error("Lưu thất bại, vui lòng thử lại");
    } finally {
      setSaving(false);
    }
  };

  const applyTemplate = (cells: Set<string>) => {
    setSelected(prev => {
      const next = new Set(prev);
      cells.forEach(c => next.add(c));
      return next;
    });
  };

  // Preview computation
  const previewSlots = selectedToSlots(selected);
  const previewByDay = Array.from({ length: 7 }, (_, i) => ({
    label: DAY_LABELS[i],
    ranges: previewSlots.filter(s => s.dayOfWeek === i),
  })).filter(d => d.ranges.length > 0);

  const totalHours = (selected.size * 30) / 60;

  return (
    <AdvisorShell>
      <div className="space-y-4 select-none">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Lịch trống hằng tuần</h1>
              <p className="text-[13px] text-slate-500 mt-1">
                Click hoặc kéo để chọn khung giờ bạn sẵn sàng tư vấn.
                {!loading && selected.size > 0 && (
                  <span className="ml-2 text-indigo-600 font-semibold">
                    {totalHours % 1 === 0 ? totalHours : totalHours.toFixed(1)} giờ / tuần
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setShowPreview(v => !v)}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-[12px] font-medium text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-40"
              >
                {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPreview ? "Ẩn preview" : "Xem preview"}
              </button>
              <button
                onClick={() => setSelected(new Set())}
                disabled={loading || selected.size === 0}
                className="px-4 py-2 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40"
              >
                Xóa tất cả
              </button>
              <button
                onClick={handleSave}
                disabled={saving || loading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f172a] text-white text-[13px] font-medium hover:bg-[#1e293b] transition-colors shadow-sm disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Lưu lịch
              </button>
            </div>
          </div>

          {/* Quick fill templates */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 flex-wrap">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Điền nhanh:</span>
            {TEMPLATES.map(tpl => (
              <button
                key={tpl.label}
                onClick={() => applyTemplate(tpl.cells())}
                disabled={loading}
                title={tpl.desc}
                className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-[12px] font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors disabled:opacity-40"
              >
                + {tpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar grid */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
          {loading ? (
            <div className="p-16 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-slate-400 animate-spin" />
            </div>
          ) : (
            <div className="overflow-auto" style={{ maxHeight: "68vh" }}>
              <table className="w-full border-collapse" style={{ tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: "56px" }} />
                  {DAY_LABELS.map((_, i) => <col key={i} />)}
                </colgroup>

                {/* Sticky day header */}
                <thead className="sticky top-0 z-20 bg-white">
                  <tr>
                    <th className="border-b border-r border-slate-100 bg-white" />
                    {DAY_LABELS.map((label, i) => {
                      const daySel = [...selected].filter(k => k.startsWith(`${i}-`) && !busyCells.has(k)).length;
                      const dayBusy = [...busyCells.keys()].filter(k => k.startsWith(`${i}-`) && selected.has(k)).length;
                      return (
                        <th key={i} className="border-b border-r border-slate-100 bg-white py-2.5 text-center">
                          <p className="text-[12px] font-semibold text-slate-600">{label}</p>
                          {daySel > 0 && (
                            <p className="text-[10px] font-medium mt-0.5 space-x-1">
                              <span className="text-indigo-500">
                                {(daySel * 0.5) % 1 === 0 ? daySel * 0.5 : (daySel * 0.5).toFixed(1)}h
                              </span>
                              {dayBusy > 0 && (
                                <span className="text-amber-500">· {dayBusy * 0.5 % 1 === 0 ? dayBusy * 0.5 : (dayBusy * 0.5).toFixed(1)}h đặt</span>
                              )}
                            </p>
                          )}
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody>
                  {TIMES.map((time) => {
                    const isHour = time.endsWith(":00");
                    return (
                      <tr key={time}>
                        {/* Time label */}
                        <td
                          className="border-r border-slate-100 text-right align-top pr-2"
                          style={{ height: "22px" }}
                        >
                          {isHour && (
                            <span className="text-[10px] text-slate-400 font-medium relative -top-2 leading-none">
                              {time}
                            </span>
                          )}
                        </td>

                        {/* Day cells */}
                        {Array.from({ length: 7 }, (_, day) => {
                          const key = cellKey(day, time);
                          const isSel = selected.has(key);
                          const isBusy = busyCells.has(key);
                          return (
                            <td
                              key={day}
                              onMouseDown={(e) => { e.preventDefault(); if (!isBusy) handleMouseDown(day, time); }}
                              onMouseEnter={(e) => {
                                if (isBusy) {
                                  setHoveredBusy({ key, x: e.clientX, y: e.clientY });
                                } else {
                                  setHoveredBusy(null);
                                  handleMouseEnter(day, time);
                                }
                              }}
                              onMouseLeave={() => isBusy && setHoveredBusy(null)}
                              className={[
                                "border-r border-slate-100 transition-colors duration-75",
                                isHour ? "border-t border-slate-200" : "border-t border-slate-100",
                                isBusy
                                  ? "bg-amber-400 hover:bg-amber-500 cursor-default"
                                  : isSel
                                  ? "bg-indigo-500 hover:bg-indigo-600 cursor-pointer"
                                  : "hover:bg-indigo-50 cursor-pointer",
                              ].join(" ")}
                              style={{ height: "22px" }}
                            />
                          );
                        })}
                      </tr>
                    );
                  })}
                  {/* Bottom border row */}
                  <tr>
                    <td className="border-r border-t border-slate-200 text-right align-top pr-2 h-3">
                      <span className="text-[10px] text-slate-400 font-medium relative -top-2 leading-none">00:00</span>
                    </td>
                    {Array.from({ length: 7 }, (_, i) => (
                      <td key={i} className="border-r border-t border-slate-200 h-3" />
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 text-[12px] text-slate-500 px-1 pb-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-indigo-500" />
            Có thể tư vấn
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-amber-400" />
            Đã có lịch hẹn
          </div>
<div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm border border-slate-200 bg-white" />
            Không sẵn sàng
          </div>
          <span className="text-slate-400">· Kéo chuột để chọn nhiều ô liên tiếp</span>
        </div>

        {/* Preview panel */}
        {showPreview && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              Preview — Startup sẽ thấy lịch rảnh của bạn như sau
            </h3>
            {previewByDay.length === 0 ? (
              <p className="text-[13px] text-slate-400 italic">Chưa có khung giờ nào được chọn.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {previewByDay.map(({ label, ranges }) => (
                  <div key={label} className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 space-y-1.5">
                    <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">{label}</p>
                    {ranges.map((r, i) => (
                      <p key={i} className="text-[12px] font-semibold text-slate-700">
                        {r.startTime}–{r.endTime}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Busy cell tooltip */}
      {hoveredBusy && (() => {
        const info = busyCells.get(hoveredBusy.key);
        if (!info) return null;
        const startDate = new Date(info.scheduledStartAt);
        const timeStr = startDate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
        const dateStr = startDate.toLocaleDateString("vi-VN", { day: "numeric", month: "numeric", year: "numeric" });
        const endStr = info.scheduledEndAt
          ? new Date(info.scheduledEndAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
          : info.durationMinutes
          ? new Date(startDate.getTime() + info.durationMinutes * 60000).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
          : null;
        return (
          <div
            className="fixed z-50 pointer-events-none bg-[#0f172a] text-white text-[12px] rounded-xl px-3 py-2.5 shadow-xl space-y-1 max-w-[200px]"
            style={{ left: hoveredBusy.x + 12, top: hoveredBusy.y - 8 }}
          >
            <p className="font-bold text-white leading-snug">{info.startupName}</p>
            <p className="text-white/60">{dateStr}</p>
            <p className="text-amber-300 font-semibold">
              {timeStr}{endStr ? ` – ${endStr}` : ""}
            </p>
          </div>
        );
      })()}

    </AdvisorShell>
  );
}
