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

      if (isSuccess || res) {
        toast.success("Đã gửi yêu cầu kết nối tới " + startup.name + " thành công!");
        onSuccess?.();
        onOpenChange(false);
        setReason("");
      } else {
        toast.error((res as any)?.message || "Gặp lỗi khi gửi yêu cầu kết nối");
      }
    } catch (err: any) {
        toast.error(err?.response?.data?.message || "Gặp lỗi khi gửi yêu cầu kết nối");
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="p-0 sm:max-w-[480px] rounded-2xl border-none shadow-2xl overflow-hidden bg-white">
          <div className="bg-[#f8f8f6] px-6 py-8 border-b border-neutral-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#e6cc4c]/20 rounded-full blur-3xl -mr-16 -mt-16" />
            <DialogHeader className="relative z-10">
              <DialogTitle className="text-2xl font-bold text-[#171611]">Yêu cầu kết nối</DialogTitle>
              <p className="text-sm text-neutral-500 font-medium mt-1">Gửi lời nhắn tới nhà sáng lập để mở ra cơ hội đầu tư.</p>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6 bg-white">
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-neutral-100 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-black text-[#171611] text-lg overflow-hidden">
                  {startup.logo && startup.logo.length > 5 ? (
                      <img src={startup.logo} alt={startup.name} className="w-full h-full object-cover" />
                  ) : (startup.logo || startup.name.charAt(0))}
              </div>
              <div>
                <p className="text-sm font-bold text-[#171611] leading-tight">{startup.name}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-neutral-400 font-medium">
                  <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {startup.industry}</span>
                  <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {startup.stage}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                  <label className="text-[13px] font-bold text-[#171611] flex items-center gap-1.5 uppercase tracking-wider">
                      Lời nhắn mở đầu
                      <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-medium">
                      <Info className="w-3 h-3" />
                      Tối đa 300 ký tự
                  </div>
              </div>
              <textarea
                className="w-full h-32 px-4 py-3 bg-[#f8f8f6] border border-transparent focus:bg-white focus:border-[#e6cc4c] focus:ring-4 focus:ring-[#e6cc4c]/10 rounded-xl outline-none transition-all text-sm font-medium resize-none placeholder:text-neutral-400"
                placeholder="VD: Chào bạn, tôi đánh giá cao tiềm năng tăng trưởng của startup. Chúng ta kết nối nhé!"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={300}
              />
            </div>
          </div>

          <DialogFooter className="p-6 pt-0 flex gap-3 sm:gap-0 bg-white">
            <button
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-neutral-200 text-neutral-600 rounded-xl text-sm font-bold hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleAdd}
              disabled={!reason.trim() || loading}
              className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 bg-[#e6cc4c] text-[#171611] rounded-xl text-sm font-black shadow-lg shadow-[#e6cc4c]/20 hover:bg-[#d8c040] transition-all disabled:opacity-50 disabled:shadow-none"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin"/>} Gửi yêu cầu
            </button>
          </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}
