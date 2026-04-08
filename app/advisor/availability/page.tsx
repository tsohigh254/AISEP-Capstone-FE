"use client";

import { AdvisorShell } from "@/components/advisor/advisor-shell";
import { Save, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  GetAdvisorTimeSlots,
  UpsertAdvisorTimeSlots,
  type ITimeSlot,
} from "@/services/advisor/advisor.api";

// ─── Constants ────────────────────────────────────────────────

const DAY_LABELS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

const TIMES: string[] = [];
for (let h = 7; h < 22; h++) {
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

// ─── Page ─────────────────────────────────────────────────────

export default function AdvisorAvailabilityPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const dragging = useRef(false);
  const dragValue = useRef(true);

  useEffect(() => {
    setLoading(true);
    GetAdvisorTimeSlots()
      .then((res: any) => {
        const data: ITimeSlot[] = res?.data?.data ?? res?.data ?? [];
        setSelected(slotsToSelected(Array.isArray(data) ? data : []));
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

  const totalHours = (selected.size * 30) / 60;

  return (
    <AdvisorShell>
      <div className="space-y-4 select-none">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
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
            <div className="flex items-center gap-2">
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
                  {DAY_LABELS.map((_, i) => (
                    <col key={i} />
                  ))}
                </colgroup>

                {/* Sticky day header */}
                <thead className="sticky top-0 z-20 bg-white">
                  <tr>
                    <th className="border-b border-r border-slate-100 bg-white" />
                    {DAY_LABELS.map((label, i) => (
                      <th
                        key={i}
                        className="border-b border-r border-slate-100 bg-white py-3 text-[12px] font-semibold text-slate-600 text-center"
                      >
                        {label}
                      </th>
                    ))}
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
                          return (
                            <td
                              key={day}
                              onMouseDown={(e) => { e.preventDefault(); handleMouseDown(day, time); }}
                              onMouseEnter={() => handleMouseEnter(day, time)}
                              className={[
                                "border-r border-slate-100 cursor-pointer transition-colors duration-75",
                                isHour ? "border-t border-slate-200" : "border-t border-slate-100",
                                isSel
                                  ? "bg-indigo-500 hover:bg-indigo-600"
                                  : "hover:bg-indigo-50",
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
                      <span className="text-[10px] text-slate-400 font-medium relative -top-2 leading-none">22:00</span>
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
        <div className="flex items-center gap-5 text-[12px] text-slate-500 px-1 pb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-indigo-500" />
            Có thể tư vấn
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm border border-slate-200 bg-white" />
            Không sẵn sàng
          </div>
          <span className="text-slate-400">· Kéo chuột để chọn nhiều ô liên tiếp</span>
        </div>
      </div>
    </AdvisorShell>
  );
}