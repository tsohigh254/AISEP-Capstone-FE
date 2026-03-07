"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { InvestorShell } from "@/components/investor/investor-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { GetInvestorProfile, CreateInvestorProfile } from "@/services/investor/investor.api";

export default function InvestorProfilePage() {
  const router = useRouter();

  const [form, setForm] = useState<ICreateInvestor>({
    fullName: "",
    firmName: "",
    title: "",
    bio: "",
    investmentThesis: "",
    location: "",
    country: "",
    linkedInURL: "",
    website: "",
  });

  const [profilePhotoURL, setProfilePhotoURL] = useState<string>("");
  const [isExisting, setIsExisting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await GetInvestorProfile() as unknown as IBackendRes<IInvestorProfile>;
        if (res.success && res.data) {
          const d = res.data;
          setForm({
            fullName: d.fullName ?? "",
            firmName: d.firmName ?? "",
            title: d.title ?? "",
            bio: d.bio ?? "",
            investmentThesis: d.investmentThesis ?? "",
            location: d.location ?? "",
            country: d.country ?? "",
            linkedInURL: d.linkedInURL ?? "",
            website: d.website ?? "",
          });
          setProfilePhotoURL(d.profilePhotoURL ?? "");
          setIsExisting(true);
        }
      } catch {
        // Profile not found — user will create a new one
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (field: keyof ICreateInvestor, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await CreateInvestorProfile(form) as unknown as IBackendRes<IInvestorProfile>;
      if (res.success) {
        router.push("/investor");
      } else {
        setError(res.error?.message ?? res.message ?? "Đã xảy ra lỗi khi lưu hồ sơ.");
      }
    } catch {
      setError("Đã xảy ra lỗi khi lưu hồ sơ. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <InvestorShell>
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl px-8 py-12 text-center text-slate-600">
            Đang tải hồ sơ...
          </div>
        </div>
      </InvestorShell>
    );
  }

  return (
    <InvestorShell>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900">
              {isExisting ? "Chỉnh sửa hồ sơ Investor" : "Tạo hồ sơ Investor"}
            </h1>
            <button
              onClick={handleCancel}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-8 py-6">
            {error && (
              <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Avatar Section */}
              <div className="flex items-center gap-4 pb-2">
                {profilePhotoURL ? (
                  <img
                    src={profilePhotoURL}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                    {form.fullName?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 h-9"
                >
                  Thay đổi ảnh
                </Button>
              </div>

              {/* Họ và tên */}
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-sm font-medium text-slate-900">
                  Họ và tên
                </Label>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className="h-11 border-slate-300"
                  required
                />
              </div>

              {/* Tên công ty */}
              <div className="space-y-1.5">
                <Label htmlFor="firmName" className="text-sm font-medium text-slate-900">
                  Tên công ty / Quỹ đầu tư
                </Label>
                <Input
                  id="firmName"
                  value={form.firmName}
                  onChange={(e) => handleChange("firmName", e.target.value)}
                  className="h-11 border-slate-300"
                />
              </div>

              {/* Chức danh */}
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-sm font-medium text-slate-900">
                  Chức danh
                </Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="h-11 border-slate-300"
                />
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <Label htmlFor="bio" className="text-sm font-medium text-slate-900">
                  Giới thiệu bản thân
                </Label>
                <textarea
                  id="bio"
                  value={form.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  className="min-h-[90px] w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 resize-none"
                />
              </div>

              {/* Investment Thesis */}
              <div className="space-y-1.5">
                <Label htmlFor="investmentThesis" className="text-sm font-medium text-slate-900">
                  Luận điểm đầu tư
                </Label>
                <textarea
                  id="investmentThesis"
                  value={form.investmentThesis}
                  onChange={(e) => handleChange("investmentThesis", e.target.value)}
                  className="min-h-[90px] w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 resize-none"
                />
              </div>

              {/* Location & Country */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="location" className="text-sm font-medium text-slate-900">
                    Địa chỉ
                  </Label>
                  <Input
                    id="location"
                    value={form.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    className="h-11 border-slate-300"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="country" className="text-sm font-medium text-slate-900">
                    Quốc gia
                  </Label>
                  <Input
                    id="country"
                    value={form.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    className="h-11 border-slate-300"
                  />
                </div>
              </div>

              {/* LinkedIn */}
              <div className="space-y-1.5">
                <Label htmlFor="linkedInURL" className="text-sm font-medium text-slate-900">
                  LinkedIn URL
                </Label>
                <Input
                  id="linkedInURL"
                  type="url"
                  value={form.linkedInURL}
                  onChange={(e) => handleChange("linkedInURL", e.target.value)}
                  className="h-11 border-slate-300"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>

              {/* Website */}
              <div className="space-y-1.5">
                <Label htmlFor="website" className="text-sm font-medium text-slate-900">
                  Website
                </Label>
                <Input
                  id="website"
                  type="url"
                  value={form.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                  className="h-11 border-slate-300"
                  placeholder="https://..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={submitting}
                  className="flex-1 h-11 border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
                >
                  {submitting ? "Đang lưu..." : isExisting ? "Lưu thay đổi" : "Tạo hồ sơ"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </InvestorShell>
  );
}


