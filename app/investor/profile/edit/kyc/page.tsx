"use client";

import { useState } from "react";
import { 
  Building2, 
  FileText, 
  User, 
  Mail, 
  Globe, 
  CheckCircle2, 
  Upload,
  AlertCircle,
  FileCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

const roles = [
  { value: "PARTNER", label: "Đối tác (PARTNER)" },
  { value: "INVESTMENT_MANAGER", label: "Quản lý đầu tư (INVESTMENT_MANAGER)" },
  { value: "ANALYST", label: "Chuyên viên phân tích (ANALYST)" },
  { value: "LEGAL_REPRESENTATIVE", label: "Đại diện pháp luật (LEGAL_REPRESENTATIVE)" },
  { value: "AUTHORIZED_PERSON", label: "Người được ủy quyền (AUTHORIZED_PERSON)" },
];

export default function KYCPage() {
  const [role, setRole] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Introduction */}
      <div className="bg-gradient-to-br from-[#fefce8] to-white p-6 rounded-3xl border border-[#fef9c3] shadow-sm">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white border border-[#fef9c3] flex items-center justify-center shadow-sm flex-shrink-0">
            <FileCheck className="w-6 h-6 text-[#C8A000]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#171611]">Xác thực KYC Tổ chức</h2>
            <p className="text-sm text-[#878164] mt-1 leading-relaxed">
              Vui lòng cung cấp thông tin pháp lý chính xác của tổ chức để AISEP có thể xác thực và cấp dấu tín nhiệm (Verified Badge) cho hồ sơ của bạn.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Organization Info */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <Building2 className="w-5 h-5 text-slate-400" />
            <h3 className="font-bold text-[#171611] uppercase tracking-wider text-xs">Thông tin tổ chức</h3>
          </div>
          
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-5">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#171611] ml-1">Tên pháp lý tổ chức</label>
              <input 
                type="text" 
                placeholder="VD: Công ty TNHH AISEP Việt Nam"
                className="w-full px-5 py-3.5 bg-[#f8f8f6] border border-transparent focus:bg-white focus:border-[#e6cc4c] focus:ring-4 focus:ring-[#e6cc4c]/10 rounded-2xl outline-none transition-all text-sm font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#171611] ml-1">Mã số doanh nghiệp / mã số thuế</label>
              <input 
                type="text" 
                placeholder="Nhập mã số 10 hoặc 13 chữ số"
                className="w-full px-5 py-3.5 bg-[#f8f8f6] border border-transparent focus:bg-white focus:border-[#e6cc4c] focus:ring-4 focus:ring-[#e6cc4c]/10 rounded-2xl outline-none transition-all text-sm font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#171611] ml-1">File chứng minh tổ chức</label>
              <div className="relative group">
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="w-full px-5 py-8 bg-[#f8f8f6] border-2 border-dashed border-slate-200 group-hover:bg-white group-hover:border-[#e6cc4c]/50 rounded-2xl transition-all flex flex-col items-center justify-center gap-3 text-center">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-400 group-hover:text-[#e6cc4c] transition-colors">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#171611]">{fileName || "Tải lên tài liệu pháp lý"}</p>
                    <p className="text-[11px] text-slate-400 font-medium">Định dạng PDF, PNG, JPG (Max 5MB)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Representative Info */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <User className="w-5 h-5 text-slate-400" />
            <h3 className="font-bold text-[#171611] uppercase tracking-wider text-xs">Thông tin người đại diện</h3>
          </div>

          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-5">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#171611] ml-1">Họ tên người nộp hồ sơ</label>
              <input 
                type="text" 
                placeholder="Nhập đầy đủ họ tên như trên CCCD"
                className="w-full px-5 py-3.5 bg-[#f8f8f6] border border-transparent focus:bg-white focus:border-[#e6cc4c] focus:ring-4 focus:ring-[#e6cc4c]/10 rounded-2xl outline-none transition-all text-sm font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[#171611] ml-1">Vai trò người nộp hồ sơ</label>
              <div className="relative">
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-5 py-3.5 bg-[#f8f8f6] border border-transparent focus:bg-white focus:border-[#e6cc4c] focus:ring-4 focus:ring-[#e6cc4c]/10 rounded-2xl outline-none transition-all text-sm font-medium appearance-none"
                >
                  <option value="" disabled>Chọn vai trò của bạn</option>
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#171611] ml-1">Email công việc</label>
                <input 
                  type="email" 
                  placeholder="name@company.com"
                  className="w-full px-5 py-3.5 bg-[#f8f8f6] border border-transparent focus:bg-white focus:border-[#e6cc4c] focus:ring-4 focus:ring-[#e6cc4c]/10 rounded-2xl outline-none transition-all text-sm font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[13px] font-bold text-[#171611] ml-1">Website</label>
                <input 
                  type="url" 
                  placeholder="https://company.vn"
                  className="w-full px-5 py-3.5 bg-[#f8f8f6] border border-transparent focus:bg-white focus:border-[#e6cc4c] focus:ring-4 focus:ring-[#e6cc4c]/10 rounded-2xl outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Confirmation */}
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
        <label className="flex items-start gap-4 cursor-pointer group">
          <div className="relative flex items-center mt-1">
            <input 
              type="checkbox" 
              className="peer hidden" 
              checked={isAgreed}
              onChange={() => setIsAgreed(!isAgreed)}
            />
            <div className="w-6 h-6 rounded-lg border-2 border-slate-200 peer-checked:border-[#e6cc4c] peer-checked:bg-[#e6cc4c] transition-all flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
            </div>
          </div>
          <span className="text-sm font-medium text-slate-600 leading-relaxed group-hover:text-slate-900 transition-colors">
            Tôi cam kết rằng tất cả các thông tin được cung cấp ở trên là hoàn toàn trung thực và chính xác. Tôi chịu hoàn toàn trách nhiệm trước AISEP và pháp luật nếu có bất kỳ sự gian lận hoặc sai sót cố ý nào trong hồ sơ này.
          </span>
        </label>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-50">
          <div className="flex items-center gap-3 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100/50">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-bold tracking-tight">Hồ sơ sẽ được phê duyệt trong vòng 24-48 giờ làm việc.</span>
          </div>

          <button 
            disabled={!isAgreed}
            className={cn(
              "w-full sm:w-auto px-10 py-4 rounded-2xl font-bold text-[13px] transition-all duration-300",
              isAgreed 
                ? "bg-slate-100 text-slate-900 hover:bg-[#eec54e] hover:-translate-y-1 shadow-sm hover:shadow-[#eec54e]/20" 
                : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
            )}
          >
            Gửi yêu cầu xác thực
          </button>
        </div>
      </div>
    </div>
  );
}
