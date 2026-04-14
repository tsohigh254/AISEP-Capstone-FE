import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Building2, Target, Info, Loader2 } from "lucide-react";
import { CreateConnection } from "@/services/connection/connection.api";
import { toast } from "sonner";

const viMessages: Record<string, string> = {
  "An active or pending connection already exists.": "Đã tồn tại kết nối hoặc yêu cầu đang chờ xử lý với startup này.",
  "Connection not found.": "Không tìm thấy kết nối.",
  "You cannot connect to yourself.": "Không thể tự kết nối với chính mình.",
  "Startup not found.": "Không tìm thấy startup.",
  "Investor not found.": "Không tìm thấy nhà đầu tư.",
};

const translateError = (msg?: string) => {
  if (!msg) return "Gặp lỗi khi gửi yêu cầu kết nối";
  return viMessages[msg] ?? msg;
};

interface ConnectStartupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startup: any;
  onSuccess?: () => void;
}

export function ConnectStartupModal({
  open,
  onOpenChange,
  startup,
  onSuccess,
}: ConnectStartupModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  if (!startup) return null;

  const handleAdd = async () => {
    try {
      setLoading(true);
      const payload = {
        startupId: Number(startup.id),
        message: reason
      };
      const res = await CreateConnection(payload);
      const isSuccess = (res as any)?.isSuccess || (res as any)?.success || (res as any)?.statusCode === 201;

      // store debug info for troubleshooting
      try {
        const dbg = { timestamp: Date.now(), op: "create-connection", request: payload, response: res };
        localStorage.setItem("connection-debug", JSON.stringify(dbg));
      } catch (e) {}

      if (isSuccess) {
        // notify other tabs to refresh connection lists
        try {
          if ((window as any).BroadcastChannel) {
            const bc = new BroadcastChannel("connections-updates");
            bc.postMessage({ type: "refresh" });
            bc.close();
          } else {
            localStorage.setItem("connections-refresh", Date.now().toString());
          }
        } catch (e) {}

        toast.success("Đã gửi yêu cầu kết nối tới " + startup.name + " thành công!");
        onSuccess?.();
        onOpenChange(false);
        setReason("");
      } else {
        toast.error(translateError((res as any)?.message));
      }
    } catch (err: any) {
        // store error debug
        try { localStorage.setItem("connection-debug", JSON.stringify({ timestamp: Date.now(), op: "create-connection-error", error: err?.response?.data ?? err?.message ?? String(err) })); } catch (e) {}
        toast.error(translateError(err?.response?.data?.message));
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="p-0 sm:max-w-[520px] rounded-2xl border-none shadow-2xl overflow-hidden bg-white">
          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            <DialogHeader>
              <DialogTitle className="text-[20px] font-black text-[#171611] tracking-tight">Yêu cầu kết nối</DialogTitle>
              <p className="text-[13px] text-slate-400 font-medium mt-0.5">Gửi lời nhắn tới nhà sáng lập để mở ra cơ hội đầu tư.</p>
            </DialogHeader>
          </div>

          <div className="px-6 pb-2 space-y-5">
            {/* Startup info */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#f8f8f6] border border-slate-100">
              <div className="w-11 h-11 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-[#171611] text-sm overflow-hidden flex-shrink-0">
                  {startup.logo && startup.logo.length > 5 ? (
                      <img src={startup.logo} alt={startup.name} className="w-full h-full object-cover" />
                  ) : (startup.logo || startup.name.charAt(0))}
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-bold text-[#171611] leading-tight truncate">{startup.name}</p>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {startup.industry}</span>
                  <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {startup.stage}</span>
                </div>
              </div>
            </div>

            {/* Message input */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                      Lời nhắn mở đầu <span className="text-red-400">*</span>
                  </label>
                  <span className={`text-[11px] font-medium ${reason.length > 250 ? 'text-amber-500' : 'text-slate-300'}`}>
                      {reason.length}/300
                  </span>
              </div>
              <textarea
                className="w-full h-[120px] px-4 py-3 bg-[#f8f8f6] border border-slate-200/80 focus:bg-white focus:border-[#e6cc4c] focus:ring-2 focus:ring-[#e6cc4c]/10 rounded-xl outline-none transition-all text-[13px] font-medium resize-none placeholder:text-slate-300 leading-relaxed"
                placeholder="VD: Chào bạn, tôi quan tâm đến mô hình kinh doanh của startup và muốn trao đổi thêm về cơ hội hợp tác đầu tư."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={300}
              />
              <p className="text-[11px] text-slate-300 flex items-center gap-1">
                <Info className="w-3 h-3" /> Lời nhắn giúp startup hiểu rõ mục đích kết nối của bạn.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-5 border-t border-slate-100 flex gap-3 bg-white">
            <button
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1 h-11 border border-slate-200 text-slate-600 rounded-xl text-[13px] font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleAdd}
              disabled={!reason.trim() || loading}
              className="flex-[1.5] h-11 flex items-center justify-center gap-2 bg-[#e6cc4c] text-[#171611] rounded-xl text-[13px] font-black shadow-sm hover:bg-[#d8c040] transition-all disabled:opacity-40 disabled:shadow-none"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin"/>} Gửi yêu cầu
            </button>
          </div>
        </DialogContent>
    </Dialog>
  );
}
