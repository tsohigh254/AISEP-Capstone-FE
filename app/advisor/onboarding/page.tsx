"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  Briefcase, 
  Globe, 
  Linkedin, 
  FileText, 
  Camera, 
  Plus, 
  X, 
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ChevronRight
} from "lucide-react";
import { CreateAdvisorProfile, GetAdvisorProfile } from "@/services/advisor/advisor.api";
import { cn } from "@/lib/utils";

export default function AdvisorOnboardingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1: Info, 2: Expertise & Bio

  // Form states
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedInURL, setLinkedInURL] = useState("");
  const [mentorshipPhilosophy, setMentorshipPhilosophy] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [expertise, setExpertise] = useState<string[]>([]);
  const [experienceYears, setExperienceYears] = useState<number>(0);
  const [newExpertise, setNewExpertise] = useState("");

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addExpertise = () => {
    if (newExpertise.trim() && !expertise.includes(newExpertise.trim())) {
      setExpertise([...expertise, newExpertise.trim()]);
      setNewExpertise("");
    }
  };

  const removeExpertise = (tag: string) => {
    setExpertise(expertise.filter(t => t !== tag));
  };

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      setError("Vui lòng nhập họ và tên.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("FullName", fullName);
    
    if (title) {
        formData.append("title", title);
        formData.append("Title", title);
    }
    if (company) {
        formData.append("company", company);
        formData.append("Company", company);
    }
    if (bio) {
        formData.append("bio", bio);
        formData.append("Bio", bio);
    }
    if (website) {
        formData.append("website", website);
        formData.append("Website", website);
    }
    if (linkedInURL) {
        formData.append("linkedInURL", linkedInURL);
        formData.append("LinkedInURL", linkedInURL);
    }
    if (mentorshipPhilosophy) {
        formData.append("mentorshipPhilosophy", mentorshipPhilosophy);
        formData.append("MentorshipPhilosophy", mentorshipPhilosophy);
    }
    
    if (profilePhoto) {
      // Try multiple common names
      formData.append("profilePhotoURL", profilePhoto);
      formData.append("ProfilePhotoURL", profilePhoto);
      formData.append("profilePhoto", profilePhoto);
      formData.append("ProfilePhoto", profilePhoto);
      formData.append("file", profilePhoto);
      formData.append("File", profilePhoto);
    }
    
    formData.append("experienceYears", experienceYears.toString());
    formData.append("ExperienceYears", experienceYears.toString());
    
    if (expertise.length > 0) {
      expertise.forEach(item => {
        formData.append("items", item);
        formData.append("Items", item);
      });
    }

    try {
      const res = await CreateAdvisorProfile(formData);
      if (res.success || (res as any).isSuccess) {
        router.push("/advisor");
      } else {
        setError(res.message || "Không thể tạo hồ sơ. Vui lòng thử lại.");
      }
    } catch (err: any) {
      console.error("CREATE_ADVISOR_ERROR_FULL:", err);
      const backendError = err?.response?.data;
      
      if (backendError) {
        const errorContent = JSON.stringify(backendError, null, 2);
        setError(`Lỗi từ Server: ${errorContent}`);
      } else {
        setError("Có lỗi hệ thống. Vui lòng kiểm tra tab Network trong F12.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f8f6] py-12 px-4 flex flex-col items-center">
      {/* Header Info */}
      <div className="max-w-2xl w-full text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-neutral-200 rounded-full shadow-sm mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Hoàn thiện hồ sơ Advisor</span>
        </div>
        <h1 className="text-3xl font-black text-neutral-900 mb-3 tracking-tight">Trở thành Cố vấn trên AISEP</h1>
        <p className="text-neutral-500 text-sm font-medium">Chia sẻ kinh nghiệm của bạn để giúp các Startup phát triển vượt bậc.</p>
      </div>

      {/* Progress Bar */}
      <div className="max-w-2xl w-full flex items-center justify-between mb-8 px-4">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all",
              step >= i ? "bg-[#f0f042] text-neutral-900" : "bg-neutral-200 text-neutral-400"
            )}>
              {step > i ? <CheckCircle2 className="w-4 h-4" /> : i}
            </div>
            <span className={cn(
              "text-xs font-bold uppercase tracking-widest",
              step >= i ? "text-neutral-900" : "text-neutral-400"
            )}>
              {i === 1 ? "Thông tin cơ bản" : "Chuyên môn & Bio"}
            </span>
            {i === 1 && <div className="w-12 h-px bg-neutral-200 mx-2" />}
          </div>
        ))}
      </div>

      {/* Main Form Card */}
      <div className="max-w-2xl w-full bg-white rounded-[2rem] shadow-xl shadow-black/5 border border-neutral-100 p-8 md:p-10">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-bold flex items-center gap-2">
            <X className="w-4 h-4 cursor-pointer" onClick={() => setError(null)} />
            {error}
          </div>
        )}

        {step === 1 ? (
          <div className="space-y-6">
            {/* Photo Upload */}
            <div className="flex flex-col items-center gap-4 mb-8">
              <div 
                className="relative w-24 h-24 rounded-2xl bg-neutral-50 border-2 border-dashed border-neutral-200 flex items-center justify-center cursor-pointer hover:bg-neutral-100 transition-colors group overflow-hidden"
                onClick={() => fileInputRef.current?.click()}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-neutral-400 group-hover:scale-110 transition-transform" />
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Ảnh đại diện</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Họ và tên *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-11 pr-4 py-3.5 bg-neutral-50 border-none rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#f0f042] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Chức vụ</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="CEO, Founder, Expert..."
                    className="w-full pl-11 pr-4 py-3.5 bg-neutral-50 border-none rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#f0f042] transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Công ty / Tổ chức</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input 
                    type="text" 
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="AI Tech Ventures"
                    className="w-full pl-11 pr-4 py-3.5 bg-neutral-50 border-none rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#f0f042] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Số năm kinh nghiệm</label>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input 
                    type="number" 
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                    placeholder="5"
                    min="0"
                    className="w-full pl-11 pr-4 py-3.5 bg-neutral-50 border-none rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#f0f042] transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Website</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input 
                    type="text" 
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-neutral-50 border-none rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#f0f042] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">LinkedIn URL</label>
                <div className="relative">
                  <Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input 
                    type="text" 
                    value={linkedInURL}
                    onChange={(e) => setLinkedInURL(e.target.value)}
                    placeholder="linkedin.com/in/username"
                    className="w-full pl-11 pr-4 py-3.5 bg-neutral-50 border-none rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#f0f042] transition-all"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              className="w-full bg-neutral-900 text-white rounded-2xl py-4 font-black flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all mt-4"
            >
              TIẾP TỤC <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Expertise Tags */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Lĩnh vực chuyên môn</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {expertise.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-100 text-amber-900 text-[10px] font-black rounded-lg">
                    {tag}
                    <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeExpertise(tag)} />
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newExpertise}
                  onChange={(e) => setNewExpertise(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addExpertise()}
                  placeholder="Nhập chuyên môn (VD: AI, Marketing...)"
                  className="flex-1 px-4 py-3.5 bg-neutral-50 border-none rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#f0f042] transition-all"
                />
                <button 
                  onClick={addExpertise}
                  className="px-4 bg-[#f0f042] text-neutral-900 rounded-2xl font-black hover:bg-[#e6e632] transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Giới thiệu bản thân (Bio)</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-4 h-4 text-neutral-400" />
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tóm tắt kinh nghiệm và giá trị bạn mang lại cho Startup..."
                  rows={4}
                  className="w-full pl-11 pr-4 py-4 bg-neutral-50 border-none rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#f0f042] transition-all resize-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 ml-1">Triết lý cố vấn (Mentorship Philosophy)</label>
              <div className="relative">
                <Sparkles className="absolute left-4 top-4 w-4 h-4 text-neutral-400" />
                <textarea 
                  value={mentorshipPhilosophy}
                  onChange={(e) => setMentorshipPhilosophy(e.target.value)}
                  placeholder="Bạn mong muốn hỗ trợ Startup như thế nào? Cách làm việc của bạn ra sao?"
                  rows={4}
                  className="w-full pl-11 pr-4 py-4 bg-neutral-50 border-none rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-[#f0f042] transition-all resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <button 
                onClick={() => setStep(1)}
                className="w-full border-2 border-neutral-100 text-neutral-500 rounded-2xl py-4 font-black hover:bg-neutral-50 transition-all"
              >
                QUAY LẠI
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-[#f0f042] text-neutral-900 rounded-2xl py-4 font-black flex items-center justify-center gap-2 hover:bg-[#e6e632] transition-all shadow-lg shadow-[#f0f042]/20 disabled:opacity-50"
              >
                {isLoading ? "ĐANG LƯU..." : "HOÀN TẤT HỒ SƠ"}
                {!isLoading && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
            
            <button 
              onClick={() => router.push("/advisor")}
              className="w-full text-neutral-400 text-[10px] font-black uppercase tracking-widest hover:text-neutral-600 transition-colors pt-2"
            >
              Bỏ qua lúc này & vào Dashboard →
            </button>
          </div>
        )}
      </div>

      {/* Footer support */}
      <p className="mt-8 text-neutral-400 text-xs font-bold uppercase tracking-widest text-center">
        Powered by AISEP Pipeline • Secure Profile Verification
      </p>
    </div>
  );
}
