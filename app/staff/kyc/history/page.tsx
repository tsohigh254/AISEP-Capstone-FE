"use client";

import { cn } from "@/lib/utils";
import { 
  History, 
  ArrowLeft,
  Search,
  Filter,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import Link from "next/link";

export default function KYCHistoryPage() {
  const HISTORY_DATA = [
    { id: "KYC-2024-001", applicant: "Nguyễn Văn A", result: "APPROVED", processedAt: "2024-03-24T10:00:00Z", actor: "Admin" },
    { id: "KYC-2024-002", applicant: "Lê Thị B", result: "REJECTED", processedAt: "2024-03-23T15:30:00Z", actor: "Staff_01" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <Link 
          href="/staff/kyc"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors text-[13px] font-medium group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Quay lại danh sách
        </Link>
      </div>

      <div>
        <h1 className="text-[20px] font-bold text-slate-900 tracking-tight font-plus-jakarta-sans flex items-center gap-2.5">
          <History className="w-5 h-5 text-[#eec54e]" />
          Lịch sử thẩm định KYC
        </h1>
        <p className="text-[13px] text-slate-500 mt-1">Xem lại các quyết định thẩm định đã thực hiện trong quá khứ.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Mã hồ sơ</th>
              <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Đối tượng</th>
              <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Kết quả</th>
              <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Người xử lý</th>
              <th className="px-6 py-4 text-[11px] font-semibold text-slate-400 uppercase tracking-wide text-right">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {HISTORY_DATA.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-[13px] font-mono text-slate-500 uppercase">{item.id}</td>
                <td className="px-6 py-4 text-[13px] font-bold text-slate-900">{item.applicant}</td>
                <td className="px-6 py-4">
                  <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold border", 
                    item.result === "APPROVED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
                  )}>
                    {item.result === "APPROVED" ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {item.result === "APPROVED" ? "Đã duyệt" : "Từ chối"}
                  </span>
                </td>
                <td className="px-6 py-4 text-[13px] text-slate-600 font-medium">{item.actor}</td>
                <td className="px-6 py-4 text-right">
                   <div className="flex items-center justify-end gap-2 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[12px] font-medium">{new Date(item.processedAt).toLocaleString("vi-VN")}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
