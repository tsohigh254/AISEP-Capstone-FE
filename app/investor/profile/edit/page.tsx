"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { InvestorShell } from "@/components/investor/investor-shell";
import {
  ChevronLeft,
  Loader2,
  Save,
  User,
  Target,
  Globe,
  MapPin,
  Link2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Eye,
  Settings2,
  Info,
  Plus,
  TrendingUp,
} from "lucide-react";
import { GetInvestorProfile, CreateInvestorProfile } from "@/services/investor/investor.api";
import { cn } from "@/lib/utils";

/* ── Options ── */
const INDUSTRIES = ["Fintech", "Healthtech", "Edtech", "E-commerce", "Agri/Foodtech", "AI/ML", "SaaS", "Cleantech", "Logistics", "Consumer"];
const STAGES = ["Pre-Seed", "Seed", "Series A", "Series B", "Series C+"];
const GEOGRAPHIES = ["Vietnam", "Southeast Asia", "East Asia", "North America", "Europe", "Global"];
const SUPPORT_OFFERED = ["Mentorship", "Network Access", "Technical Support", "Hiring", "Legal/Compliance", "Strategic Planning"];
const PRODUCT_MATURITY = ["Idea", "MVP", "Initial Traction", "Product-Market Fit", "Scaling"];
const VALIDATION_LEVELS = ["Self-verified", "Pilot/POC", "Revenue-generating", "Audit-verified"];
const STRENGTHS = ["Team", "Technology", "Market Opportunity", "Business Model", "Financial Performance", "User Growth"];

/* ── Field Components ── */
function FieldLabel({ htmlFor, children, required, hint }: { htmlFor: string; children: React.ReactNode; required?: boolean; hint?: string }) {
  return (
    <div className="flex flex-col gap-1 mb-2">
      <label htmlFor={htmlFor} className="flex items-center gap-1.5 text-[13px] font-bold text-[#171611]">
        {children}
        {required && <span className="text-red-500">*</span>}
      </label>
      {hint && <p className="text-[11px] text-neutral-400 font-medium leading-tight">{hint}</p>}
    </div>
  );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full h-11 px-4 rounded-xl border border-neutral-100 bg-neutral-50/50 text-[14px] text-[#171611] font-medium transition-all placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#e6cc4c]/20 focus:border-[#e6cc4c] focus:bg-white",
        props.className
      )}
    />
  );
}

function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full px-4 py-3 rounded-xl border border-neutral-100 bg-neutral-50/50 text-[14px] text-[#171611] font-medium transition-all placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#e6cc4c]/20 focus:border-[#e6cc4c] focus:bg-white resize-none",
        props.className
      )}
    />
  );
}

function MultiSelect({ selected, options, onChange }: { selected: string[]; options: string[]; onChange: (vals: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => {
              if (isSelected) onChange(selected.filter((s) => s !== opt));
              else onChange([...selected, opt]);
            }}
            className={cn(
              "px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all uppercase tracking-tight",
              isSelected
                ? "bg-[#e6cc4c] border-[#e6cc4c] text-[#171611] shadow-sm"
                : "bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300"
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function SegmentedControl({ value, options, onChange }: { value: string; options: { label: string; value: string }[]; onChange: (v: any) => void }) {
  return (
    <div className="flex p-1 bg-neutral-100 rounded-xl w-fit">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all",
            value === opt.value ? "bg-white text-[#171611] shadow-sm" : "text-neutral-500 hover:text-neutral-700"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   Page Component
   ════════════════════════════════════════════════════════════════════ */
export default function EditProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"basic" | "thesis" | "settings">("basic");
  
  // Data Loading
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [isDirty, setIsDirty] = useState(false);

  // Form State
  const [form, setForm] = useState<ICreateInvestor>({
    fullName: "",
    firmName: "",
    investorType: "Institutional",
    organization: "",
    title: "",
    bio: "",
    investmentThesis: "",
    preferredIndustries: [],
    preferredStages: [],
    preferredGeographies: [],
    preferredMarketScopes: [],
    supportOffered: [],
    preferredProductMaturity: [],
    preferredValidationLevel: [],
    preferredAIScoreRange: "75-100",
    aiScoreImportance: "Medium",
    preferredStrengths: [],
    acceptingConnections: true,
    publicProfileVisibility: true,
    recentlyActiveDisplay: true,
    connectionGuidance: "",
    location: "",
    country: "",
    linkedInURL: "",
    website: "",
  });

  const [profilePhotoURL, setProfilePhotoURL] = useState("");

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    (async () => {
      try {
        const res = (await GetInvestorProfile()) as unknown as IBackendRes<IInvestorProfile>;
        if (res.success && res.data) {
          const d = res.data;
          setForm({
            fullName: d.fullName || "",
            firmName: d.firmName || "",
            investorType: d.investorType || "Institutional",
            organization: d.organization || "",
            title: d.title || "",
            bio: d.bio || "",
            investmentThesis: d.investmentThesis || "",
            preferredIndustries: d.preferredIndustries || [],
            preferredStages: d.preferredStages || [],
            preferredGeographies: d.preferredGeographies || [],
            preferredMarketScopes: d.preferredMarketScopes || [],
            supportOffered: d.supportOffered || [],
            preferredProductMaturity: d.preferredProductMaturity || [],
            preferredValidationLevel: d.preferredValidationLevel || [],
            preferredAIScoreRange: d.preferredAIScoreRange || "75-100",
            aiScoreImportance: d.aiScoreImportance || "Medium",
            preferredStrengths: d.preferredStrengths || [],
            acceptingConnections: d.acceptingConnections ?? true,
            publicProfileVisibility: d.publicProfileVisibility ?? true,
            recentlyActiveDisplay: d.recentlyActiveDisplay ?? true,
            connectionGuidance: d.connectionGuidance || "",
            location: d.location || "",
            country: d.country || "",
            linkedInURL: d.linkedInURL || "",
            website: d.website || "",
          });
          setProfilePhotoURL(d.profilePhotoURL || "");
        }
      } catch {
        // Initial setup mode
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Warning for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const setField = (field: keyof ICreateInvestor, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSubmitting(true);
    setSaveStatus("idle");
    
    // Simple Validation
    const newErrors: Record<string, string> = {};
    if (!form.fullName) newErrors.fullName = "Họ và tên là bắt buộc";
    if (!form.firmName) newErrors.firmName = "Tên quỹ/nhà đầu tư là bắt buộc";
    if (form.website && !form.website.startsWith("http")) newErrors.website = "Phải là URL hợp lệ bắt đầu bằng http/https";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setSubmitting(false);
      return;
    }

    try {
      const res = await CreateInvestorProfile(form) as unknown as IBackendRes<IInvestorProfile>;
      if (res.success) {
        setSaveStatus("success");
        setIsDirty(false);
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  const calculateCompleteness = () => {
    const fields = [
      form.fullName, form.firmName, form.bio, form.investmentThesis,
      form.preferredIndustries.length > 0,
      form.preferredStages.length > 0,
      form.location, form.website
    ];
    const filled = fields.filter(f => !!f).length;
    return Math.round((filled / fields.length) * 100);
  };

  const completeness = calculateCompleteness();

  if (loading) {
    return (
      <InvestorShell>
        <div className="flex flex-col items-center justify-center py-32 text-neutral-400">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#e6cc4c]" />
          <p className="text-[14px] font-bold tracking-tight">Đang tải hồ sơ nhà đầu tư...</p>
        </div>
      </InvestorShell>
    );
  }

  return (
    <InvestorShell>
      <div className="max-w-[1440px] mx-auto px-6 pb-24">
        
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (isDirty && !window.confirm("Bạn có thay đổi chưa lưu. Bạn có muốn rời đi không?")) return;
                router.back();
              }}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-neutral-100 hover:shadow-lg transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-[#171611]" />
            </button>
            <div>
              <h1 className="text-[28px] font-black text-[#171611] tracking-tighter leading-none mb-1">Chỉnh sửa Hồ sơ Nhà đầu tư</h1>
              <p className="text-[13px] text-neutral-400 font-medium">Cập nhật danh tính, luận điểm và sở thích gợi ý của bạn</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="px-6 py-2.5 rounded-xl text-[13px] font-bold text-neutral-500 hover:text-[#171611] transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={() => handleSave()}
              disabled={submitting}
              className={cn(
                "px-8 py-2.5 rounded-xl text-[13px] font-black transition-all flex items-center gap-2 shadow-lg",
                saveStatus === "success" ? "bg-emerald-500 text-white" : "bg-[#171611] text-white hover:bg-[#25241e]"
              )}
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Đang lưu...</>
              ) : saveStatus === "success" ? (
                <><CheckCircle2 className="w-4 h-4" /> Đã lưu</>
              ) : (
                <><Save className="w-4 h-4" /> Lưu thay đổi</>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          
          {/* ── Main Form (8 cols) ── */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            
            {/* Tab Navigation */}
            <div className="flex gap-1 bg-white p-1 rounded-2xl border border-neutral-100 shadow-sm w-fit">
              {[
                { id: "basic", label: "Hồ sơ cơ bản", icon: User },
                { id: "thesis", label: "Luận điểm & Sở thích", icon: Target },
                { id: "settings", label: "Hiển thị", icon: Settings2 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-tight transition-all",
                    activeTab === tab.id
                      ? "bg-[#171611] text-white shadow-md shadow-black/10"
                      : "text-neutral-500 hover:bg-neutral-50"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Error Summary */}
            {Object.keys(errors).length > 0 && (
              <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-4 flex items-start gap-4 animate-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-bold text-red-800">Vui lòng sửa các lỗi sau:</p>
                  <ul className="mt-1 list-disc list-inside text-[12px] text-red-600 font-medium">
                    {Object.values(errors).map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              </div>
            )}

            {/* Success Notification */}
            {saveStatus === "success" && (
              <div className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-4 flex items-center gap-4 animate-in slide-in-from-top-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-[13px] font-bold text-emerald-800">Hồ sơ của bạn đã được cập nhật thành công!</p>
              </div>
            )}

            {/* TAB CONTENT: BASIC PROFILE */}
            {activeTab === "basic" && (
              <div className="bg-white rounded-[32px] p-8 border border-neutral-100 shadow-sm space-y-8">
                <div className="flex items-center gap-6 pb-8 border-b border-neutral-50">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-[32px] bg-neutral-100 border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
                      {profilePhotoURL ? (
                        <img src={profilePhotoURL} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl font-black text-neutral-300">
                          {form.fullName?.charAt(0) || "?"}
                        </span>
                      )}
                    </div>
                    <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-[#e6cc4c] border-4 border-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                      <Plus className="w-5 h-5 text-[#171611]" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#171611] tracking-tight">Danh tính & Thương hiệu</h3>
                    <p className="text-[12px] text-neutral-400 font-medium mt-1">Tải lên logo hoặc ảnh chất lượng cao (PNG/JPG, tối đa 5MB)</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 md:col-span-1">
                    <FieldLabel htmlFor="investorType" required hint="Ảnh hưởng đến bố cục hồ sơ và logic matching">Loại nhà đầu tư</FieldLabel>
                    <SegmentedControl
                      value={form.investorType}
                      options={[
                        { label: "Tổ chức / Quỹ đầu tư", value: "Institutional" },
                        { label: "Cá nhân / Angel", value: "Individual" }
                      ]}
                      onChange={(v) => setField("investorType", v)}
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <FieldLabel htmlFor="fullName" required>Họ và tên đại diện</FieldLabel>
                    <Input
                      id="fullName"
                      value={form.fullName}
                      onChange={(e) => setField("fullName", e.target.value)}
                      placeholder="VD: Nguyễn Văn A"
                      className={cn(errors.fullName && "border-red-500 ring-red-50")}
                    />
                  </div>
                  
                  <div className="col-span-2 md:col-span-1">
                    <FieldLabel htmlFor="firmName" required>
                      {form.investorType === "Institutional" ? "Tên quỹ / Tổ chức" : "Tên đầu tư cá nhân"}
                    </FieldLabel>
                    <Input
                      id="firmName"
                      value={form.firmName}
                      onChange={(e) => setField("firmName", e.target.value)}
                      placeholder={form.investorType === "Institutional" ? "VD: Mekong Capital" : "VD: Nguyễn A Angel Investments"}
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <FieldLabel htmlFor="title">Chức danh / Vai trò</FieldLabel>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) => setField("title", e.target.value)}
                      placeholder="VD: Managing Partner"
                    />
                  </div>

                  {form.investorType === "Institutional" && (
                    <div className="col-span-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <FieldLabel htmlFor="organization" hint="Tên pháp nhân của tổ chức">Tổ chức mẹ</FieldLabel>
                      <Input
                        id="organization"
                        value={form.organization}
                        onChange={(e) => setField("organization", e.target.value)}
                        placeholder="VD: Mekong Capital Holdings"
                      />
                    </div>
                  )}

                  <div className="col-span-2 md:col-span-1">
                    <FieldLabel htmlFor="location">Thành phố hoạt động chính</FieldLabel>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input
                        id="location"
                        value={form.location}
                        onChange={(e) => setField("location", e.target.value)}
                        placeholder="VD: TP. Hồ Chí Minh"
                        className="pl-11"
                      />
                    </div>
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <FieldLabel htmlFor="country">Quốc gia hoạt động</FieldLabel>
                    <Input
                      id="country"
                      value={form.country}
                      onChange={(e) => setField("country", e.target.value)}
                      placeholder="VD: Việt Nam"
                    />
                  </div>

                  <div className="col-span-2">
                    <FieldLabel htmlFor="bio" hint="Tóm tắt ngắn về kinh nghiệm và thành tích đầu tư">Giới thiệu chuyên môn</FieldLabel>
                    <Textarea
                      id="bio"
                      value={form.bio}
                      onChange={(e) => setField("bio", e.target.value)}
                      placeholder="Chia sẻ kinh nghiệm, các thương vụ thoái vốn, hoặc các công ty nổi bật trong danh mục đầu tư..."
                      rows={5}
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <FieldLabel htmlFor="website">Website / Danh mục đầu tư</FieldLabel>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input
                        id="website"
                        value={form.website}
                        onChange={(e) => setField("website", e.target.value)}
                        placeholder="https://..."
                        className={cn("pl-11", errors.website && "border-red-500 ring-red-50")}
                      />
                    </div>
                  </div>

                  <div className="col-span-2 md:col-span-1">
                    <FieldLabel htmlFor="linkedInURL">Đường dẫn LinkedIn</FieldLabel>
                    <div className="relative">
                      <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                      <Input
                        id="linkedInURL"
                        value={form.linkedInURL}
                        onChange={(e) => setField("linkedInURL", e.target.value)}
                        placeholder="https://linkedin.com/in/..."
                        className="pl-11"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: THESIS & PREFERENCES */}
            {activeTab === "thesis" && (
              <div className="bg-white rounded-[32px] p-8 border border-neutral-100 shadow-sm space-y-8 animate-in fade-in duration-300">
                <div className="pb-6 border-b border-neutral-50 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-[#171611] tracking-tight">Luận điểm & Tiêu chí Đầu tư</h3>
                    <p className="text-[12px] text-neutral-400 font-medium mt-1">Các sở thích này ảnh hưởng trực tiếp đến gợi ý AI và kết quả matching.</p>
                  </div>
                  <div className="px-3 py-1.5 bg-[#e6cc4c]/10 text-[#e6cc4c] rounded-lg flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Ảnh hưởng cao</span>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <FieldLabel
                      htmlFor="investmentThesis"
                      hint="Tóm tắt ngắn gọn 2-4 câu về định hướng chiến lược. Startup dùng để xác định sự phù hợp nhanh."
                    >
                      Tóm tắt Luận điểm Chiến lược
                    </FieldLabel>
                    <Textarea
                      id="investmentThesis"
                      value={form.investmentThesis}
                      onChange={(e) => setField("investmentThesis", e.target.value)}
                      placeholder="VD: Chúng tôi tập trung vào fintech giai đoạn đầu tại Đông Nam Á, ưu tiên các đội ngũ có chuyên môn kỹ thuật sâu..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="col-span-2 md:col-span-1">
                      <FieldLabel htmlFor="preferredIndustries">Lĩnh vực ưu tiên</FieldLabel>
                      <MultiSelect 
                        selected={form.preferredIndustries}
                        options={INDUSTRIES}
                        onChange={(v) => setField("preferredIndustries", v)}
                      />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <FieldLabel htmlFor="preferredStages">Giai đoạn đầu tư</FieldLabel>
                      <MultiSelect 
                        selected={form.preferredStages}
                        options={STAGES}
                        onChange={(v) => setField("preferredStages", v)}
                      />
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <FieldLabel htmlFor="preferredGeographies">Khu vực địa lý mục tiêu</FieldLabel>
                      <MultiSelect 
                        selected={form.preferredGeographies}
                        options={GEOGRAPHIES}
                        onChange={(v) => setField("preferredGeographies", v)}
                      />
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <FieldLabel htmlFor="supportOffered">Giá trị gia tăng / Hỗ trợ cung cấp</FieldLabel>
                      <MultiSelect 
                        selected={form.supportOffered}
                        options={SUPPORT_OFFERED}
                        onChange={(v) => setField("supportOffered", v)}
                      />
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <FieldLabel htmlFor="preferredProductMaturity">Sở thích độ trưởng thành sản phẩm</FieldLabel>
                      <MultiSelect 
                        selected={form.preferredProductMaturity}
                        options={PRODUCT_MATURITY}
                        onChange={(v) => setField("preferredProductMaturity", v)}
                      />
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <FieldLabel htmlFor="preferredValidationLevel">Mức độ xác thực yêu cầu</FieldLabel>
                      <MultiSelect 
                        selected={form.preferredValidationLevel}
                        options={VALIDATION_LEVELS}
                        onChange={(v) => setField("preferredValidationLevel", v)}
                      />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                      <FieldLabel htmlFor="aiScoreImportance" hint="Điểm AI ảnh hưởng bao nhiêu đến kết quả matching?">Tầm quan trọng điểm AI</FieldLabel>
                      <SegmentedControl
                        value={form.aiScoreImportance}
                        options={[
                          { label: "Thấp", value: "Low" },
                          { label: "Trung bình", value: "Medium" },
                          { label: "Cao", value: "High" }
                        ]}
                        onChange={(v) => setField("aiScoreImportance", v)}
                      />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                      <FieldLabel htmlFor="preferredAIScoreRange" hint="Chỉ gợi ý startup có điểm trên ngưỡng này">Điểm gợi ý tối thiểu</FieldLabel>
                      <SegmentedControl
                        value={form.preferredAIScoreRange}
                        options={[
                          { label: "50+", value: "50-100" },
                          { label: "75+", value: "75-100" },
                          { label: "85+", value: "85-100" }
                        ]}
                        onChange={(v) => setField("preferredAIScoreRange", v)}
                      />
                    </div>

                    <div className="col-span-2">
                      <FieldLabel htmlFor="preferredStrengths">Điểm mạnh startup mong muốn</FieldLabel>
                      <MultiSelect 
                        selected={form.preferredStrengths}
                        options={STRENGTHS}
                        onChange={(v) => setField("preferredStrengths", v)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: VISIBILITY & SETTINGS */}
            {activeTab === "settings" && (
              <div className="bg-white rounded-[32px] p-8 border border-neutral-100 shadow-sm space-y-8 animate-in fade-in duration-300">
                <div className="pb-6 border-b border-neutral-50">
                  <h3 className="text-xl font-black text-[#171611] tracking-tight">Hiển thị & Kết nối</h3>
                  <p className="text-[12px] text-neutral-400 font-medium mt-1">Kiểm soát cách bạn xuất hiện và tương tác trong mạng AISEP.</p>
                </div>

                <div className="space-y-6">
                  {/* Connection Status */}
                  <div className="flex items-center justify-between p-6 bg-neutral-50 rounded-[24px] border border-transparent hover:border-neutral-100 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-neutral-100 flex items-center justify-center shadow-sm">
                        <Link2 className="w-6 h-6 text-[#e6cc4c]" />
                      </div>
                      <div>
                        <p className="text-[14px] font-black text-[#171611]">Nhận yêu cầu kết nối</p>
                        <p className="text-[11px] text-neutral-400 font-medium">Cho phép startup gửi yêu cầu kết nối đến bạn.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setField("acceptingConnections", !form.acceptingConnections)}
                      className={cn(
                        "w-14 h-8 rounded-full relative transition-all duration-300",
                        form.acceptingConnections ? "bg-[#e6cc4c]" : "bg-neutral-200"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-300",
                        form.acceptingConnections ? "right-1" : "left-1"
                      )} />
                    </button>
                  </div>

                  {/* Public Visibility */}
                  <div className="flex items-center justify-between p-6 bg-neutral-50 rounded-[24px] border border-transparent hover:border-neutral-100 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-neutral-100 flex items-center justify-center shadow-sm">
                        <Eye className="w-6 h-6 text-neutral-400" />
                      </div>
                      <div>
                        <p className="text-[14px] font-black text-[#171611]">Hiển thị hồ sơ công khai</p>
                        <p className="text-[11px] text-neutral-400 font-medium">Cho phép người dùng tìm kiếm luận điểm và hồ sơ cơ bản của bạn.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setField("publicProfileVisibility", !form.publicProfileVisibility)}
                      className={cn(
                        "w-14 h-8 rounded-full relative transition-all duration-300",
                        form.publicProfileVisibility ? "bg-[#e6cc4c]" : "bg-neutral-200"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-300",
                        form.publicProfileVisibility ? "right-1" : "left-1"
                      )} />
                    </button>
                  </div>

                  {/* Recently Active */}
                  <div className="flex items-center justify-between p-6 bg-neutral-50 rounded-[24px] border border-transparent hover:border-neutral-100 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-neutral-100 flex items-center justify-center shadow-sm">
                        <TrendingUp className="w-6 h-6 text-neutral-400" />
                      </div>
                      <div>
                        <p className="text-[14px] font-black text-[#171611]">Hiển thị huy hiệu "Hoạt động gần đây"</p>
                        <p className="text-[11px] text-neutral-400 font-medium">Hiển thị thời điểm bạn tương tác gần nhất với nền tảng.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setField("recentlyActiveDisplay", !form.recentlyActiveDisplay)}
                      className={cn(
                        "w-14 h-8 rounded-full relative transition-all duration-300",
                        form.recentlyActiveDisplay ? "bg-[#e6cc4c]" : "bg-neutral-200"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-6 h-6 rounded-full bg-white shadow-sm transition-all duration-300",
                        form.recentlyActiveDisplay ? "right-1" : "left-1"
                      )} />
                    </button>
                  </div>

                  {form.acceptingConnections && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                      <FieldLabel
                        htmlFor="connectionGuidance"
                        hint="Ghi chú riêng tư cho startup khi họ kết nối với bạn. Họ nên đề cập điều gì trong tin nhắn?"
                      >
                        Hướng dẫn & Ghi chú kết nối
                      </FieldLabel>
                      <Textarea
                        id="connectionGuidance"
                        value={form.connectionGuidance}
                        onChange={(e) => setField("connectionGuidance", e.target.value)}
                        placeholder="VD: Vui lòng cung cấp doanh thu định kỳ hàng tháng (MRR) và lộ trình kỹ thuật 12 tháng tới..."
                        rows={3}
                      />
                    </div>
                  )}

                  {!form.fullName || !form.firmName || form.preferredIndustries.length === 0 ? (
                    <div className="mt-4 p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 items-start">
                      <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                      <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                        <strong>Khuyến nghị mạnh:</strong> Hồ sơ của bạn chưa hoàn chỉnh. Bật nhận kết nối khi hồ sơ chưa đầy đủ có thể làm giảm độ tin cậy với các startup chất lượng cao. Hãy hoàn thiện tất cả thông tin trước khi mở yêu cầu.
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          {/* ── Summary Side Panel (4 cols) ── */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[32px] p-6 border border-neutral-100 shadow-sm sticky top-24">
              <h3 className="text-lg font-black text-[#171611] tracking-tight mb-6">Tình trạng Hồ sơ</h3>
              
              <div className="space-y-6">
                {/* Completeness Section */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[11px] font-black uppercase text-neutral-400 tracking-wider">Hoàn thiện</span>
                    <span className="text-xl font-black text-[#171611]">{completeness}%</span>
                  </div>
                  <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#e6cc4c] rounded-full transition-all duration-1000"
                      style={{ width: `${completeness}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-neutral-400 font-medium leading-relaxed">
                   {completeness < 100
                    ? `Bổ sung thêm thông tin để đạt 100%.`
                    : "Hồ sơ của bạn đã tối ưu hoàn toàn cho matching!"}
                  </p>
                </div>

                <div className="h-px bg-neutral-50" />

                {/* Status Badges */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-neutral-500">Trạng thái danh tính</span>
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-green-100">
                      <ShieldCheck className="w-3 h-3" /> Đã xác minh
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-neutral-500">Trạng thái KYC</span>
                    <button
                      type="button"
                      className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 transition-colors"
                    >
                      Xem chi tiết KYC
                    </button>
                  </div>
                </div>

                <div className="h-px bg-neutral-50" />

                {/* Live Preview Snippet */}
                <div>
                  <span className="text-[11px] font-black uppercase text-neutral-400 tracking-wider block mb-4">Xem trước hồ sơ</span>
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="size-8 rounded-xl bg-white flex items-center justify-center font-black text-[10px] text-neutral-300">
                        {form.fullName?.charAt(0) || "?" }
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-[#171611] truncate max-w-[150px]">{form.firmName || "Tên quỹ chưa đặt"}</p>
                        <p className="text-[10px] text-neutral-400 font-medium capitalize">{form.investorType}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-neutral-500 font-medium italic line-clamp-2 leading-relaxed">
                      "{form.investmentThesis || "Chưa có luận điểm..."}"
                    </p>
                  </div>
                  <Link href="/investor/profile" className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-[11px] font-black uppercase text-neutral-400 hover:text-[#171611] transition-colors border border-transparent hover:border-neutral-100">
                    <Eye className="w-4 h-4" />
                    Xem hồ sơ đầy đủ
                  </Link>
                </div>

                {/* Match Hint */}
                <div className="p-4 bg-[#171611] rounded-2xl text-white shadow-xl shadow-black/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-[#e6cc4c]" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#e6cc4c]">Gợi ý AI</span>
                  </div>
                  <p className="text-[11px] font-medium leading-relaxed opacity-80">
                    Nhà đầu tư hoàn thiện đầy đủ lĩnh vực và giai đoạn ưu tiên nhận được gợi ý startup phù hợp hơn 4 lần.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Sticky Bottom Action Bar (Mobile only) ── */}
      <div className="lg:hidden fixed bottom-16 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-neutral-100 flex items-center gap-3 z-50">
        <button
          onClick={() => router.back()}
          className="flex-1 py-3 rounded-xl text-[13px] font-bold text-neutral-500 bg-neutral-50"
        >
          Hủy
        </button>
        <button
          onClick={() => handleSave()}
          disabled={submitting}
          className="flex-1 py-3 bg-[#171611] text-white rounded-xl text-[13px] font-black flex items-center justify-center gap-2 shadow-lg"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Lưu thay đổi
        </button>
      </div>
    </InvestorShell>
  );
}
