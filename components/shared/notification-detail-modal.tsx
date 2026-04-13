"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bell, Calendar, ExternalLink, Loader2, Trash2, Clock } from "lucide-react";
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none rounded-[32px] shadow-2xl">
        <DialogHeader className="px-8 pt-8 pb-6 bg-[#fdfdfb]">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-2xl bg-[#e6cc4c]/10 flex items-center justify-center text-[#e6cc4c]">
                <Bell className="w-5 h-5" />
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#b0ad98] uppercase tracking-[0.15em] font-be-vietnam-pro">Thông báo hệ thống</span>
                <span className="text-[11px] font-semibold text-slate-400 font-be-vietnam-pro flex items-center gap-1.5">
                   <Clock className="w-3.5 h-3.5" /> {noti ? new Date(noti.createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                </span>
             </div>
          </div>
          <DialogTitle className="text-[20px] font-bold text-[#171611] leading-tight font-be-vietnam-pro">
            {loading ? "Đang tải..." : noti?.title || "Chi tiết thông báo"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-8 pb-8 pt-2">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#e6cc4c]" />
              <p className="text-sm font-medium text-slate-400 font-be-vietnam-pro">Vui lòng đợi trong giây lát...</p>
            </div>
          ) : noti ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100/50 mb-6">
                <p className="text-[15px] text-[#3a3935] leading-relaxed font-be-vietnam-pro whitespace-pre-wrap">
                  {noti.message}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between text-[12px] font-medium text-slate-500 font-be-vietnam-pro border-b border-slate-50 pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-300" />
                    <span>Ngày tạo:</span>
                  </div>
                  <span className="text-slate-900 font-bold">
                    {new Date(noti.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric"
                    })}
                  </span>
                </div>

                {noti.readAt && (
                   <div className="flex items-center justify-between text-[12px] font-medium text-slate-500 font-be-vietnam-pro border-b border-slate-50 pb-3">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-300" />
                        <span>Đã xem lúc:</span>
                    </div>
                    <span className="text-slate-900 font-bold">
                        {new Date(noti.readAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })} - {new Date(noti.readAt).toLocaleDateString("vi-VN")}
                    </span>
                   </div>
                )}
              </div>

              <div className="mt-8 flex items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 font-bold text-[12px] uppercase tracking-wide font-be-vietnam-pro gap-2"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Xóa thông báo
                </Button>

                <div className="flex items-center gap-3">
                   <Button
                    variant="outline"
                    className="rounded-xl font-bold text-[13px] font-be-vietnam-pro border-slate-200"
                    onClick={onClose}
                    >
                    Đóng
                    </Button>
                    {noti.actionUrl && (
                    <Button
                        className="bg-[#e6cc4c] hover:bg-[#d4ba3d] text-[#171611] font-bold rounded-xl text-[13px] font-be-vietnam-pro gap-2 shadow-lg shadow-[#e6cc4c]/20"
                        onClick={() => {
                        window.location.href = noti.actionUrl!;
                        onClose();
                        }}
                    >
                        Chi tiết <ExternalLink className="w-4 h-4" />
                    </Button>
                    )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
               <p className="text-sm font-medium text-slate-400 font-be-vietnam-pro">Không tìm thấy nội dung thông báo.</p>
               <Button variant="link" onClick={onClose} className="mt-2 text-[#e6cc4c]">Quay lại</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
