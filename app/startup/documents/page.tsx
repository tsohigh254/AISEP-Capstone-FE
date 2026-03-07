"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StartupShell } from "@/components/startup/startup-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { UploadDocumentModal } from "@/components/startup/upload-document-modal";
import {
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Upload,
  Eye,
  Shield,
  RefreshCcw,
  Info,
  FileText,
  FileSpreadsheet,
  FileArchive,
  Award,
  MoreHorizontal,
  FolderOpen,
  ShieldCheck,
  HardDrive
} from "lucide-react";

const documents = [
  {
    id: "1",
    name: "Pitch_Deck_NextGen_v2.pdf",
    size: "2.4 MB",
    owner: "Admin",
    category: "Pitch Deck",
    uploadDate: "12/02/2026",
    status: "Protected",
    icon: FileText,
    iconColor: "text-red-500 bg-red-50",
  },
  {
    id: "2",
    name: "Financial_Report_Q4.xlsx",
    size: "1.1 MB",
    owner: "Tài chính",
    category: "Tài chính",
    uploadDate: "10/02/2026",
    status: "Pending",
    icon: FileSpreadsheet,
    iconColor: "text-blue-500 bg-blue-50",
  },
  {
    id: "3",
    name: "Algorithm_Core_Specs.txt",
    size: "0.5 MB",
    owner: "Kỹ thuật",
    category: "Kỹ thuật",
    uploadDate: "08/02/2026",
    status: "Not Protected",
    icon: FileText,
    iconColor: "text-purple-500 bg-purple-50",
  },
  {
    id: "4",
    name: "Trade_Secrets_V1.zip",
    size: "15.8 MB",
    owner: "Pháp lý",
    category: "Pháp lý",
    uploadDate: "05/02/2026",
    status: "Failed",
    icon: FileArchive,
    iconColor: "text-orange-500 bg-orange-50",
  },
];

const statusStyles = {
  Protected: "ip-badge-protected",
  Pending: "ip-badge-pending",
  "Not Protected": "ip-badge-not-protected",
  Failed: "ip-badge-failed",
};

const statusIcons = {
  Protected: "verified",
  Pending: "hourglass_empty",
  "Not Protected": "lock_open",
  Failed: "error",
};

export default function StartupDocumentsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  return (
    <StartupShell>
      <main className={cn(
        "flex-1 max-w-[1440px] mx-auto w-full p-6 md:p-8 space-y-8 animate-in fade-in duration-500",
        isUploadModalOpen && "blur-sm pointer-events-none select-none transition-all duration-300"
      )}>
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[13px] font-medium text-slate-400 mb-6">
          <Link href="/startup" className="hover:text-slate-600 transition-colors">Workspace</Link>
          <ChevronRight className="size-4 text-slate-300" />
          <span className="text-slate-600 font-semibold">Tài liệu & IP</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-1.5">
            <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Thư viện Tài liệu & IP</h1>
            <p className="text-slate-500 text-[15px] font-medium leading-relaxed">Giao diện quản lý danh sách tập trung và bảo vệ tài sản trí tuệ.</p>
          </div>
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-[#eec54e] hover:bg-[#dab13b] text-slate-900 font-bold h-11 px-7 rounded-xl shadow-sm border-none flex items-center gap-2.5 transition-all active:scale-[0.98]"
          >
            <div className="size-6 bg-slate-900/10 rounded-md flex items-center justify-center">
              <Upload className="size-3.5 text-slate-900" />
            </div>
            + Tải lên tài liệu
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-[24px] p-4 shadow-sm border border-slate-100 flex flex-col lg:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
            <Input
              placeholder="Tìm kiếm tài liệu, phân loại hoặc trạng thái IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-14 h-12 bg-[#f8fafc]/50 border-none rounded-2xl font-bold text-sm focus:ring-1 focus:ring-yellow-400/30 transition-all placeholder:text-slate-400"
            />
          </div>
          <div className="flex items-center gap-6 w-full lg:w-auto px-4">
            <div className="flex items-center gap-3 cursor-pointer group">
              <span className="text-[11px] font-bold text-slate-900 uppercase tracking-widest whitespace-nowrap">Loại tài liệu</span>
              <ChevronDown className="size-4 text-slate-900 transition-transform group-hover:translate-y-0.5" />
            </div>
            <div className="w-px h-5 bg-slate-200"></div>
            <div className="flex items-center gap-3 cursor-pointer group">
              <span className="text-[11px] font-bold text-slate-900 uppercase tracking-widest whitespace-nowrap">Trạng thái IP</span>
              <ChevronDown className="size-4 text-slate-900 transition-transform group-hover:translate-y-0.5" />
            </div>
          </div>
        </div>

        {/* Document Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/30 border-b border-slate-100/80">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">Tên tài liệu</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left whitespace-nowrap">Phân loại</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Ngày tải lên</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center whitespace-nowrap">Trạng thái IP</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={cn("size-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white", doc.iconColor)}>
                        <doc.icon className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-bold text-slate-900 truncate mb-0.5 tracking-tight">{doc.name}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{doc.size} • {doc.owner}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold border border-slate-100/50">
                      {doc.category}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center text-[13px] font-medium text-slate-500 whitespace-nowrap">
                    {doc.uploadDate}
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border transition-all",
                      doc.status === "Protected" && "bg-emerald-50 text-emerald-600 border-emerald-100",
                      doc.status === "Pending" && "bg-amber-50 text-amber-600 border-amber-100",
                      doc.status === "Not Protected" && "bg-slate-100 text-slate-500 border-slate-200",
                      doc.status === "Failed" && "bg-rose-50 text-rose-600 border-rose-100"
                    )}>
                      {doc.status === "Protected" && <Shield className="size-3" fill="currentColor" />}
                      {doc.status === "Pending" && <RefreshCcw className="size-3" />}
                      {doc.status === "Not Protected" && <Shield className="size-3" />}
                      {doc.status === "Failed" && <Info className="size-3" fill="currentColor" />}
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                        <Eye className="size-4" />
                      </button>
                      {doc.status === "Protected" && (
                        <button className="p-2 text-emerald-500 hover:text-emerald-700 transition-colors">
                          <Award className="size-4" />
                        </button>
                      )}
                      {doc.status === "Not Protected" && (
                        <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#eec54e] text-slate-900 rounded-lg hover:bg-[#dab13b] shadow-sm transition-all active:scale-[0.98]">
                          <Shield className="size-3.5" fill="currentColor" />
                          <span className="text-[10px] font-bold uppercase">Protect IP</span>
                        </button>
                      )}
                      {doc.status === "Failed" && (
                        <button className="p-2 text-rose-500 hover:text-rose-700 transition-colors">
                          <RefreshCcw className="size-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-8 py-5 bg-white border-t border-slate-100 flex items-center justify-between">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Hiển thị 1 - 4 trong tổng số 24 tài liệu</p>
            <div className="flex items-center gap-1.5">
              <button className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all">
                <ChevronLeft className="size-4" />
              </button>
              <button className="size-8 rounded-lg flex items-center justify-center bg-[#eec54e] text-slate-900 text-[11px] font-bold shadow-sm transition-all">1</button>
              <button className="size-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-50 text-[11px] font-bold transition-all">2</button>
              <button className="size-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-50 text-[11px] font-bold transition-all">3</button>
              <button className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all">
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 bg-white rounded-[20px] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-6 right-6 text-slate-100 group-hover:text-slate-200 transition-colors">
              <FolderOpen className="size-8" />
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] mb-4">Tổng số tài liệu</p>
            <div className="flex items-end justify-between relative z-10">
              <h4 className="text-[32px] font-bold text-slate-900 leading-none">24</h4>
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg uppercase tracking-wider border border-emerald-100/50">+2 tuần này</span>
            </div>
          </div>
          <div className="p-7 bg-white rounded-[20px] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-6 right-6 text-slate-100 group-hover:text-slate-200 transition-colors">
              <ShieldCheck className="size-8" />
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] mb-4">Xác thực IP (Protected)</p>
            <div className="flex items-end justify-between relative z-10">
              <h4 className="text-[32px] font-bold text-slate-900 leading-none">18</h4>
              <div className="flex flex-col items-end gap-1.5">
                <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg uppercase tracking-wider border border-slate-200/50">75% hoàn thành</span>
              </div>
            </div>
          </div>
          <div className="p-7 bg-white rounded-[20px] border border-slate-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-6 right-6 text-slate-100 group-hover:text-slate-200 transition-colors">
              <HardDrive className="size-8" />
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em] mb-4">Dung lượng sử dụng</p>
            <div className="flex items-end justify-between relative z-10">
              <h4 className="text-[32px] font-bold text-slate-900 leading-none">2.4 <span className="text-sm text-slate-400 font-medium">GB</span></h4>
              <div className="w-20 bg-slate-100 rounded-full h-1 mb-1.5 overflow-hidden">
                <div className="bg-slate-900 h-full w-[45%]"></div>
              </div>
            </div>
          </div>
        </div>

        <footer className="pt-16 pb-8 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.35em] leading-relaxed opacity-80">
            © 2026 AISEP STARTUP WORKSPACE • HỆ THỐNG QUẢN TRỊ TÀI LIỆU & BẢO VỆ TÀI SẢN TRÍ TUỆ
          </p>
        </footer>
      </main>

      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </StartupShell>
  );
}
