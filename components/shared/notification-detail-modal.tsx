"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Bell, Calendar, ExternalLink, Loader2, Trash2, Clock, X } from "lucide-react";
import { GetNotificationById, DeleteNotification } from "@/services/notification/notification.api";
import { cn } from "@/lib/utils";

interface NotificationDetailModalProps {
  notificationId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleteSuccess?: (id: number) => void;
}

export function NotificationDetailModal({
  notificationId,
  isOpen,
  onClose,
  onDeleteSuccess,
}: NotificationDetailModalProps) {
  const [noti, setNoti] = useState<INotificationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isOpen && notificationId) {
      fetchDetail();
    } else {
      setNoti(null);
    }
  }, [isOpen, notificationId]);

  const fetchDetail = async () => {
    if (!notificationId) return;
    setLoading(true);
    try {
      const res = await GetNotificationById(notificationId);
      if (res.data) {
        setNoti(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch notification detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!notificationId) return;
    setDeleting(true);
    try {
      await DeleteNotification(notificationId);
      if (onDeleteSuccess) onDeleteSuccess(notificationId);
      onClose();
    } catch (error) {
      console.error("Failed to delete notification:", error);
    } finally {
      setDeleting(false);
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#eec54e]/10 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4 text-[#eec54e]" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 uppercase tracking-wide font-semibold">Thông báo hệ thống</p>
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                {noti ? new Date(noti.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "--:--"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 transition-colors shrink-0 ml-3 mt-0.5"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-[20px] font-bold text-slate-900 leading-tight mb-4">
          {loading ? "Đang tải..." : noti?.title || "Chi tiết thông báo"}
        </h3>

        {/* Body */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : noti ? (
          <div className="animate-in fade-in duration-300 space-y-4">

            {/* Message */}
            <div className="px-4 py-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">
                {noti.message}
              </p>
            </div>

            {/* Meta */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Ngày tạo:</span>
                </div>
                <span className="text-slate-700 font-semibold">
                  {new Date(noti.createdAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              {noti.readAt && (
                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Đã xem lúc:</span>
                  </div>
                  <span className="text-slate-700 font-semibold">
                    {new Date(noti.readAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                    {" — "}
                    {new Date(noti.readAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-200 text-red-600 text-[13px] font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Xóa thông báo
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="inline-flex items-center px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-[13px] font-medium hover:bg-slate-50 transition-colors"
                >
                  Đóng
                </button>
                {noti.actionUrl && (
                  <button
                    onClick={() => { window.location.href = noti.actionUrl!; onClose(); }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0f172a] text-white text-[13px] font-medium hover:bg-[#1e293b] transition-colors shadow-sm"
                  >
                    Chi tiết
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 space-y-2">
            <p className="text-[13px] text-slate-400 font-medium">Không tìm thấy nội dung thông báo.</p>
            <button onClick={onClose} className="text-[13px] text-[#eec54e] font-medium hover:underline">
              Quay lại
            </button>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
}
