"use client";

import { AdvisorShell } from "@/components/advisor/advisor-shell";
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Save, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Check
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TimeSlot {
  id: string;
  dayOfWeek: number; // 0-6, starting Sunday
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const DAYS = [
  "Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"
];

export default function AdvisorAvailabilityPage() {
  const [slots, setSlots] = useState<TimeSlot[]>([
    { id: "1", dayOfWeek: 1, startTime: "09:00", endTime: "11:00", isActive: true },
    { id: "2", dayOfWeek: 1, startTime: "14:00", endTime: "17:00", isActive: true },
    { id: "3", dayOfWeek: 3, startTime: "09:00", endTime: "12:00", isActive: true },
    { id: "4", dayOfWeek: 5, startTime: "13:30", endTime: "16:30", isActive: true },
  ]);

  const [saving, setSaving] = useState(false);

  const handleAddSlot = (dayIdx: number) => {
    const newSlot: TimeSlot = {
      id: Math.random().toString(36).substr(2, 9),
      dayOfWeek: dayIdx,
      startTime: "09:00",
      endTime: "10:00",
      isActive: true,
    };
    setSlots([...slots, newSlot]);
  };

  const handleRemoveSlot = (id: string) => {
    setSlots(slots.filter(s => s.id !== id));
  };

  const handleUpdateSlot = (id: string, updates: Partial<TimeSlot>) => {
    setSlots(slots.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleSave = () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      toast.success("Cập nhật lịch rảnh thành công");
    }, 1000);
  };

  return (
    <AdvisorShell>
      <div className="max-w-5xl mx-auto space-y-7 animate-in fade-in duration-500">
        
        {/* Header Section */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#0f172a] flex items-center justify-center text-white shadow-sm">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-[20px] font-bold text-slate-900 tracking-tight">Thiết lập Lịch rảnh</h1>
                <p className="text-[13px] text-slate-500 mt-1 max-w-md">
                  Quản lý các khoảng thời gian bạn sẵn sàng để tư vấn. Startup sẽ dựa vào đây để đề xuất lịch họp.
                </p>
              </div>
            </div>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f172a] text-white text-[13px] font-medium hover:bg-[#1e293b] transition-colors shadow-sm disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Lưu thay đổi
            </button>
          </div>

          <div className="mt-8 p-4 rounded-2xl bg-amber-50 border border-amber-100/60 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[12px] text-amber-700 leading-relaxed">
              Các khung giờ này sẽ được lặp lại hàng tuần. Bạn có thể tạm thời vô hiệu hóa hoặc xóa các khung giờ không còn phù hợp. Múi giờ mặc định của bạn là <span className="font-bold">Asia/Ho_Chi_Minh (GMT+7)</span>.
            </p>
          </div>
        </div>

        {/* Weekly Schedule Grid */}
        <div className="grid grid-cols-1 gap-4">
          {DAYS.map((dayName, idx) => {
            const daySlots = slots.filter(s => s.dayOfWeek === idx).sort((a,b) => a.startTime.localeCompare(b.startTime));
            return (
              <div key={idx} className="group bg-white rounded-2xl border border-slate-200/80 hover:border-[#eec54e]/30 hover:shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center gap-4 p-5 md:p-6">
                  {/* Day Indicator */}
                  <div className="w-full md:w-40 shrink-0">
                    <h3 className={cn(
                      "text-[15px] font-bold tracking-tight",
                      idx === 0 || idx === 6 ? "text-slate-400" : "text-slate-800"
                    )}>
                      {dayName}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 uppercase tracking-wider font-bold">
                      {daySlots.length} khoảng giờ
                    </p>
                  </div>

                  {/* Slots Area */}
                  <div className="flex-1 flex flex-wrap gap-3">
                    {daySlots.map(slot => (
                      <div key={slot.id} className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 group/slot hover:bg-white hover:border-slate-200 transition-all focus-within:ring-2 focus-within:ring-[#eec54e]/20">
                        <div className="flex items-center gap-1.5">
                          <input 
                            type="time" 
                            value={slot.startTime}
                            onChange={(e) => handleUpdateSlot(slot.id, { startTime: e.target.value })}
                            className="bg-transparent text-[13px] font-semibold text-slate-700 focus:outline-none focus:text-[#0f172a]"
                          />
                          <span className="text-slate-300 text-[12px]">—</span>
                          <input 
                            type="time" 
                            value={slot.endTime}
                            onChange={(e) => handleUpdateSlot(slot.id, { endTime: e.target.value })}
                            className="bg-transparent text-[13px] font-semibold text-slate-700 focus:outline-none focus:text-[#0f172a]"
                          />
                        </div>
                        <div className="w-px h-4 bg-slate-200 mx-1" />
                        <button 
                          onClick={() => handleRemoveSlot(slot.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover/slot:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    <button 
                      onClick={() => handleAddSlot(idx)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-dashed border-slate-300 text-slate-500 hover:border-[#eec54e] hover:text-[#0f172a] hover:bg-[#eec54e]/5 text-[12px] font-medium transition-all active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Thêm khung giờ
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="pb-10 pt-4 flex items-center justify-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-[12px] text-slate-400 italic">Hệ thống sẽ đồng bộ lịch rảnh của bạn với ứng dụng ngay lập tức sau khi lưu.</p>
        </div>
      </div>
    </AdvisorShell>
  );
}

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={cn("animate-spin", className)} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
