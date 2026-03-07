"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StartupShell } from "@/components/startup/startup-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function PersonalProfilePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: "Nguyễn Văn Alpha",
    contact_email: "alpha.nguyen@techalpha.io",
    phone_number: "+84 90 123 4567",
    position: "Founder"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle save logic
    console.log("Saving profile:", formData);
  };

  return (
    <StartupShell>
      <main className="flex-1 max-w-[900px] mx-auto w-full p-6 space-y-8 animate-in fade-in duration-500">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-neutral-muted">
          <button onClick={() => router.push("/startup")} className="hover:text-[#e6cc4c] transition-colors">Workspace</button>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-[#171611] font-bold">Chỉnh sửa hồ sơ cá nhân</span>
        </nav>

        {/* Profile Header Card */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-neutral-surface">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-[#fdfbe9]">
                <img
                  alt="Profile Avatar"
                  className="w-full h-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjzC7CoRfCe8M-_znRX9XUAau9pbCP3v7oCfUXQjfnXPYgidsvY_po_j5Fd6kfJPcZsbjS0DZnOdyJNi5XLu7Nkp0gVy4nzXT9rlO66SbMaDnIB6hJrk9g50fi9r_qIybSqzeZgEPgyRxdXku7uuelbI-i63vbQ34qdf3h074GkFdgtkBY6aFESlTBQke6B7Y5No2DIyWID-SgrcBUe7omoOQokhf7HyqmhFOevL66ApDBkAXteq5gjkmiN7HkNs0Ts-EJEuZUJLk"
                />
              </div>
              <button className="absolute bottom-0 right-1 bg-[#e6cc4c] text-[#171611] w-9 h-9 rounded-full shadow-lg border-2 border-white hover:scale-110 transition-transform flex items-center justify-center">
                <span className="material-symbols-outlined text-sm font-black">photo_camera</span>
              </button>
            </div>
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-2xl font-black text-[#171611] tracking-tight">{formData.full_name}</h1>
              <p className="text-neutral-muted text-sm font-bold flex items-center justify-center md:justify-start gap-2">
                <span className="material-symbols-outlined text-lg">mail</span>
                {formData.contact_email}
              </p>
              <div className="pt-2">
                <button className="text-xs font-black text-[#e6cc4c] hover:text-[#171611] transition-colors flex items-center gap-2 mx-auto md:mx-0 uppercase tracking-widest">
                  <span className="material-symbols-outlined text-lg">image_search</span>
                  Thay đổi ảnh đại diện
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Information Form */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-neutral-surface">
          <h3 className="text-lg font-black text-[#171611] mb-8 flex items-center gap-3">
            <span className="material-symbols-outlined text-[#e6cc4c] font-black">person_edit</span>
            Thông tin cá nhân
          </h3>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-[11px] font-black text-neutral-muted uppercase tracking-widest pl-1">Họ và tên</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="h-12 bg-[#f8f8f6] border-none rounded-2xl px-5 font-bold focus:ring-2 focus:ring-[#e6cc4c]/30 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_email" className="text-[11px] font-black text-neutral-muted uppercase tracking-widest pl-1">Email liên hệ</Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  className="h-12 bg-[#f8f8f6] border-none rounded-2xl px-5 font-bold focus:ring-2 focus:ring-[#e6cc4c]/30 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone_number" className="text-[11px] font-black text-neutral-muted uppercase tracking-widest pl-1">Số điện thoại</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="h-12 bg-[#f8f8f6] border-none rounded-2xl px-5 font-bold focus:ring-2 focus:ring-[#e6cc4c]/30 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position" className="text-[11px] font-black text-neutral-muted uppercase tracking-widest pl-1">Chức vụ</Label>
                <div className="relative">
                  <select
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full h-12 bg-[#f8f8f6] border-none rounded-2xl px-5 font-bold text-sm focus:ring-2 focus:ring-[#e6cc4c]/30 outline-none appearance-none"
                  >
                    <option value="Founder">Founder</option>
                    <option value="Co-Founder">Co-Founder</option>
                    <option value="CEO">CEO</option>
                    <option value="CTO">CTO</option>
                    <option value="Other">Khác</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-muted">expand_more</span>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-neutral-surface flex flex-col sm:flex-row items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                className="w-full sm:w-auto px-8 h-12 rounded-2xl font-black text-neutral-muted hover:bg-neutral-surface transition-all"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-auto px-10 h-12 rounded-2xl font-black bg-[#e6cc4c] text-[#171611] hover:bg-[#d4ba3d] shadow-lg shadow-[#e6cc4c]/20 flex items-center gap-2 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined font-black">save</span>
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </div>

        {/* Info Alert */}
        <div className="flex items-start gap-4 p-5 bg-[#fdfbe9] rounded-2xl border border-[#e6cc4c]/20">
          <span className="material-symbols-outlined text-[#e6cc4c] font-black">info</span>
          <p className="text-sm text-neutral-muted font-bold italic leading-relaxed">
            Thông tin cá nhân được sử dụng để định danh trong các hồ sơ gửi tới nhà đầu tư và mentor. Vui lòng đảm bảo thông tin chính xác.
          </p>
        </div>

        <footer className="py-12 text-center">
          <p className="text-xs text-neutral-muted font-bold opacity-60">© 2024 AISEP Platform. Tất cả quyền được bảo lưu.</p>
        </footer>
      </main>
    </StartupShell>
  );
}
