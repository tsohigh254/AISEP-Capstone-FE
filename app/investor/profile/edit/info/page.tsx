"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Building2, Camera, ChevronDown, Loader2, ShieldCheck } from "lucide-react";
import { getNames } from "country-list";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { buildInvestorProfilePresentation } from "@/lib/investor-profile-presenter";
import { useInvestorEdit } from "@/context/investor-edit-context";
import { GetInvestorProfile, UpdateInvestorProfile, UploadInvestorPhoto } from "@/services/investor/investor.api";
import { GetInvestorKYCStatus } from "@/services/investor/investor-kyc";
import type { IInvestorKYCStatus } from "@/types/investor-kyc";

const COUNTRIES = ["Viet Nam", ...getNames().filter((name) => name !== "Viet Nam").sort((a, b) => a.localeCompare(b))];

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-[13px] text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-900/10";
const readonlyCls = cn(inputCls, "cursor-not-allowed bg-slate-100 text-slate-500");
const labelCls = "mb-1.5 block text-[12px] font-medium text-slate-500";

function CountrySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = search.trim()
    ? COUNTRIES.filter((country) => country.toLowerCase().includes(search.toLowerCase()))
    : COUNTRIES;

  const handleSelect = (country: string) => {
    onChange(country);
    setOpen(false);
    setSearch("");
  };

  const handleOpen = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      });
    }
    setOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setSearch("");
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleOpen}
        className={cn(inputCls, "flex items-center justify-between text-left", !value && "text-slate-400")}
      >
        <span>{value || "Chọn quốc gia"}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>
      {open &&
        createPortal(
          <div ref={dropdownRef} style={dropdownStyle} className="overflow-hidden rounded-[14px] border border-slate-200 bg-white shadow-xl">
            <div className="border-b border-slate-100 p-2">
              <input
                autoFocus
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm quốc gia..."
                className="w-full rounded-[10px] border border-slate-200/80 bg-slate-50 px-3 py-2 text-[13px] text-slate-700 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>
            <ul className="max-h-52 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <li className="px-4 py-2 text-[13px] text-slate-400">Không tìm thấy</li>
              ) : (
                filtered.map((country) => (
                  <li
                    key={country}
                    onMouseDown={() => handleSelect(country)}
                    className={cn(
                      "cursor-pointer px-4 py-2 text-[13px] transition-colors hover:bg-slate-50",
                      value === country ? "bg-slate-50 font-semibold text-slate-900" : "text-slate-700",
                    )}
                  >
                    {country}
                  </li>
                ))
              )}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="border-b border-slate-100 px-6 py-4">
        <h3 className="text-[13px] font-semibold text-slate-700">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function ReadonlyField({
  label,
  value,
  hint,
}: {
  label: string;
  value?: string | null;
  hint?: string;
}) {
  if (!value) return null;

  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className={readonlyCls}>{value}</div>
      {hint && <p className="mt-1.5 text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

export default function InfoEditPage() {
  const { setSaveHandler, setIsSaving } = useInvestorEdit();

  const [isLoading, setIsLoading] = useState(true);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [profile, setProfile] = useState<IInvestorProfile | null>(null);
  const [kycStatus, setKycStatus] = useState<IInvestorKYCStatus | null>(null);
  const [form, setForm] = useState<IUpdateInvestorProfile>({});

  useEffect(() => {
    Promise.allSettled([GetInvestorProfile(), GetInvestorKYCStatus()])
      .then(([profileRes, kycRes]) => {
        if (profileRes.status === "fulfilled") {
          const data = profileRes.value as unknown as IBackendRes<IInvestorProfile>;
          if (data.isSuccess && data.data) {
            const investorProfile = data.data;
            setProfile(investorProfile);
            setForm({
              fullName: investorProfile.fullName || "",
              firmName: investorProfile.firmName || investorProfile.organization || "",
              title: investorProfile.title || "",
              country: investorProfile.country || "",
              location: investorProfile.location || "",
              website: investorProfile.website || "",
              linkedInURL: investorProfile.linkedInURL || "",
            });
            if (investorProfile.profilePhotoURL) {
              setPhotoPreview(investorProfile.profilePhotoURL);
            }
          }
        }

        if (kycRes.status === "fulfilled") {
          const data = kycRes.value as unknown as IBackendRes<IInvestorKYCStatus>;
          if (data.isSuccess && data.data) {
            setKycStatus(data.data);
          }
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const presentation = profile ? buildInvestorProfilePresentation(profile, kycStatus) : null;
  const investorTypeDisplay = presentation?.categoryLabel || "Chưa xác định";
  const primaryFieldKey = presentation?.primaryField.key || "fullName";

  const set = (key: keyof IUpdateInvestorProfile, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const tasks: Promise<unknown>[] = [UpdateInvestorProfile(form) as unknown as Promise<unknown>];
      if (photoFile) {
        tasks.push(UploadInvestorPhoto(photoFile) as unknown as Promise<unknown>);
      }

      const [profileRes] = await Promise.all(tasks);
      const data = profileRes as IBackendRes<IInvestorProfile>;
      if (data.isSuccess) {
        if (data.data) {
          setProfile(data.data);
        }
        toast.success("Đã cập nhật thông tin hồ sơ");
        setPhotoFile(null);
      } else {
        toast.error(data.message || "Cập nhật thất bại");
      }
    } catch {
      toast.error("Gặp lỗi khi cập nhật");
    } finally {
      setIsSaving(false);
    }
  }, [form, photoFile, setIsSaving]);

  useEffect(() => {
    setSaveHandler(handleSave);
  }, [handleSave, setSaveHandler]);

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#e6cc4c]" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-400">
      <FormSection title={presentation?.avatarSectionTitle || "Ảnh hồ sơ"}>
        <div className="flex items-center gap-6">
          <label className="group relative h-20 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-100 transition-all hover:border-slate-400">
            {photoPreview ? (
              <Image src={photoPreview} alt={presentation?.primaryName || "profile"} fill sizes="80px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Building2 className="h-7 w-7 text-slate-300 transition-colors group-hover:text-slate-400" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="h-5 w-5 text-white" />
            </div>
            <input
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  setPhotoFile(file);
                  setPhotoPreview(URL.createObjectURL(file));
                }
              }}
            />
          </label>

          <div>
            <p className="text-[13px] font-medium text-slate-700">{presentation?.avatarSectionDescription || "Ảnh hồ sơ công khai"}</p>
            <p className="mt-1 text-[11px] text-slate-400">PNG, JPG · Tối đa 5MB</p>
            {photoFile && <p className="mt-1.5 text-[11px] font-medium text-amber-600">Ảnh mới chờ lưu: {photoFile.name}</p>}
          </div>
        </div>
      </FormSection>

      {presentation && (
        <FormSection title="Ranh giới với KYC">
          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
              <div className="mb-1 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-amber-700" />
                <p className="text-[13px] font-semibold text-amber-900">Các field pháp lý không sửa ở màn này</p>
              </div>
              <p className="text-[12px] leading-relaxed text-amber-800">{presentation.lockedFieldsNote}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {presentation.isInstitutional && (
                <>
                  <ReadonlyField
                    label="Người đại diện"
                    value={presentation.representativeName || form.fullName || null}
                    hint="Nếu cần đổi danh tính người đại diện, hãy cập nhật lại tại luồng KYC."
                  />
                  <ReadonlyField
                    label="Vai trò nộp hồ sơ"
                    value={presentation.representativeRole}
                    hint="Thông tin này đi theo hồ sơ xác minh, không chỉnh trực tiếp ở profile."
                  />
                </>
              )}
              <ReadonlyField
                label="Email xác minh"
                value={presentation.contactEmail}
                hint="Email KYC dùng cho xác minh và trao đổi với staff."
              />
            </div>

            <div>
              <Link
                href="/investor/kyc"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50"
              >
                <ShieldCheck className="h-4 w-4" />
                Mở luồng KYC
              </Link>
            </div>
          </div>
        </FormSection>
      )}

      <FormSection title={presentation?.infoSectionTitle || "Thông tin hồ sơ"}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelCls}>
              {presentation?.primaryField.label || "Tên hiển thị"} <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form[primaryFieldKey] || ""}
              onChange={(event) => set(primaryFieldKey, event.target.value)}
              className={inputCls}
              placeholder={presentation?.primaryField.placeholder || "Tên chính thức"}
            />
          </div>

          <div>
            <label className={labelCls}>Loại hình đầu tư</label>
            <div className={cn(readonlyCls, "flex items-center justify-between")}>
              <span>{investorTypeDisplay}</span>
              <span className="rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-400">Quản lý qua KYC</span>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-400">Nếu cần đổi loại investor, bạn phải cập nhật lại quy trình xác minh.</p>
          </div>

          {presentation?.affiliationField && (
            <div>
              <label className={labelCls}>{presentation.affiliationField.label}</label>
              <input
                type="text"
                value={form[presentation.affiliationField.key] || ""}
                onChange={(event) => set(presentation.affiliationField!.key, event.target.value)}
                className={inputCls}
                placeholder={presentation.affiliationField.placeholder}
              />
            </div>
          )}

          <div>
            <label className={labelCls}>{presentation?.titleField.label || "Chức danh"}</label>
            <input
              type="text"
              value={form.title || ""}
              onChange={(event) => set("title", event.target.value)}
              className={inputCls}
              placeholder={presentation?.titleField.placeholder || "Vd: Partner, Director..."}
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Liên hệ & khu vực">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelCls}>Quốc gia</label>
            <CountrySelect value={form.country || ""} onChange={(value) => set("country", value)} />
          </div>

          <div>
            <label className={labelCls}>{presentation?.locationLabel || "Tỉnh / Thành phố"}</label>
            <input
              type="text"
              value={form.location || ""}
              onChange={(event) => set("location", event.target.value)}
              className={inputCls}
              placeholder="Ví dụ: TP. Hồ Chí Minh"
            />
          </div>

          <div>
            <label className={labelCls}>{presentation?.websiteLabel || "Website"}</label>
            <input
              type="url"
              value={form.website || ""}
              onChange={(event) => set("website", event.target.value)}
              className={inputCls}
              placeholder={presentation?.websitePlaceholder || "https://..."}
            />
          </div>

          <div>
            <label className={labelCls}>{presentation?.linkedInLabel || "LinkedIn"}</label>
            <input
              type="url"
              value={form.linkedInURL || ""}
              onChange={(event) => set("linkedInURL", event.target.value)}
              className={inputCls}
              placeholder={presentation?.linkedInPlaceholder || "https://linkedin.com/in/..."}
            />
          </div>
        </div>
      </FormSection>
    </div>
  );
}
