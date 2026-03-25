"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Bell, CheckCheck, Trash2, Loader2,
  Check, Eye, Clock, ChevronLeft, ChevronRight,
  ShieldCheck, Brain, Star, AlertTriangle,
  Zap, MessageSquare, UserCircle
} from "lucide-react";

/* ─── Helper: Get Icon by Type ─────────────────────────────── */
const getNotificationIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case "kyc": return <ShieldCheck className="w-4 h-4 text-[#eec54e]" />;
    case "alert": return <AlertTriangle className="w-4 h-4 text-rose-500" />;
    case "system": return <Zap className="w-4 h-4 text-blue-500" />;
    case "task": return <Brain className="w-4 h-4 text-purple-500" />;
    case "message": return <MessageSquare className="w-4 h-4 text-emerald-500" />;
    default: return <Bell className="w-4 h-4 text-slate-400" />;
  }
};

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "Yêu cầu KYC mới",
    content: "Startup 'Green Energy' vừa gửi hồ sơ xác thực định danh. Vui lòng kiểm tra và xét duyệt.",
    type: "kyc",
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Cảnh báo hệ thống",
    content: "Phát hiện lưu lượng truy cập bất thường từ dải IP 192.168.1.xxx. Đã tạm thời chặn yêu cầu.",
    type: "alert",
    isRead: true,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 3,
    title: "Nhiệm vụ mới được giao",
    content: "Bạn được chỉ định xử lý khiếu nại #CMP-882 liên quan đến tranh chấp thanh toán.",
    type: "task",
    isRead: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

export default function StaffNotificationsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [loading, setLoading] = useState(false);

  const filtered = notifications.filter(n => activeTab === "all" || !n.isRead);

  const handleToggleRead = (id: number, currentStatus: boolean) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: !currentStatus } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleDelete = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl mx-auto pb-20">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[26px] font-black tracking-tight text-[#171611]">Thông báo</h1>
          <p className="text-[14px] text-slate-500 font-medium mt-1">Quản lý các thông báo hệ thống và yêu cầu vận hành.</p>
        </div>
        <button 
          onClick={handleMarkAllRead}
          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-[#171611] hover:bg-slate-50 transition-all shadow-sm group cursor-pointer"
        >
          <CheckCheck className="w-4 h-4 text-[#eec54e]" />
          Đánh dấu tất cả đã đọc
        </button>
      </div>

      {/* Filters & Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden mb-6">
        <div className="flex items-center justify-between border-b border-slate-100 px-2">
          <div className="flex">
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                "px-8 py-4 text-[13px] font-bold transition-all relative cursor-pointer",
                activeTab === "all" ? "text-[#171611]" : "text-slate-400 hover:text-[#171611]"
              )}
            >
              Tất cả
              {activeTab === "all" && <div className="absolute bottom-0 left-6 right-6 h-[3px] bg-[#eec54e] rounded-full"></div>}
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={cn(
                "px-8 py-4 text-[13px] font-bold transition-all relative cursor-pointer",
                activeTab === "unread" ? "text-[#171611]" : "text-slate-400 hover:text-[#171611]"
              )}
            >
              Chưa đọc
              {activeTab === "unread" && <div className="absolute bottom-0 left-6 right-6 h-[3px] bg-[#eec54e] rounded-full"></div>}
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-slate-50">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
              <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-slate-200" />
              </div>
              <h3 className="text-base font-bold text-[#171611] tracking-tight">Không có thông báo</h3>
              <p className="text-[13px] text-slate-400 mt-2 max-w-xs mx-auto">Tất cả đều ổn! Bạn đã xử lý hết các thông báo mới.</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div 
                key={item.id}
                className={cn(
                  "group flex items-start gap-4 p-5 transition-all hover:bg-slate-50/50 cursor-pointer relative overflow-hidden",
                  !item.isRead ? "bg-white" : "bg-white/40"
                )}
                onClick={() => handleToggleRead(item.id, item.isRead)}
              >
                {!item.isRead && (
                  <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#eec54e]"></div>
                )}
                
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all border border-transparent shadow-sm",
                  !item.isRead ? "bg-white text-[#eec54e] border-slate-100" : "bg-slate-50 text-slate-400 opacity-60"
                )}>
                  {getNotificationIcon(item.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className={cn(
                      "text-[15px] tracking-tight",
                      !item.isRead ? "font-bold text-[#171611]" : "font-semibold text-slate-500"
                    )}>
                      {item.title}
                    </h3>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      {new Date(item.createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={cn(
                    "text-[13px] leading-relaxed font-medium line-clamp-2",
                    !item.isRead ? "text-slate-600" : "text-slate-400"
                  )}>
                    {item.content}
                  </p>
                  <div className="flex items-center gap-4 mt-3.5">
                    {!item.isRead ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleRead(item.id, false); }}
                        className="text-[11px] font-bold text-[#eec54e] hover:underline uppercase tracking-widest cursor-pointer"
                      >
                        Đánh dấu đã đọc
                      </button>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleRead(item.id, true); }}
                        className="text-[11px] font-bold text-slate-400 hover:underline uppercase tracking-widest cursor-pointer"
                      >
                        Đánh dấu chưa đọc
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      className="text-[11px] font-bold text-slate-300 hover:text-rose-500 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
