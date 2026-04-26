"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StartupShell } from "@/components/startup/startup-shell";
import {
  Sparkles, CheckCircle2, XCircle, Layout, BookOpen,
  ShieldCheck, Loader2, Clock, Users, Briefcase, ArrowLeft,
  AlertTriangle, Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { GetStartupProfile, GetMembers } from "@/services/startup/startup.api";
import { calcProfileCompleteness } from "@/lib/profile-completeness";
import { getStartupIndustryDisplay } from "@/lib/startup-industry-display";
import { SubmitEvaluation } from "@/services/ai/ai.api";

/* ─── Submission states ────────────────────────────────────── */

type SubmitState = "idle" | "validating" | "submitting" | "queued" | "failed";

const SUBMIT_LABELS: Record<SubmitState, string> = {
  idle: "Gửi yêu cầu đánh giá AI",
  validating: "Đang xác thực...",
  submitting: "Đang gửi yêu cầu...",
  queued: "Yêu cầu đã được chấp nhận!",
  failed: "Gửi thất bại — Thử lại",
};

/* ─── Page ─────────────────────────────────────────────────── */

export default function RequestAIEvaluationPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>({ ready: false, completionPercent: 0, items: [] });
  const [documents, setDocuments] = useState<any>({ ready: false, items: [], eligibleDocs: [] });
  const [profileSnapshot, setProfileSnapshot] = useState<any | null>(null);
  const allReady = profile.ready && documents.ready;

  // Map type to string for robust comparison (accept both number and string)
  const mapType = (t: any) => {
    if (typeof t === 'number') {
      if (t === 0) return 'PITCH_DECK';
      if (t === 1) return 'BUSINESS_PLAN';
    }
    const s = t?.toString().toUpperCase();
    if (s === '0') return 'PITCH_DECK';
    if (s === '1') return 'BUSINESS_PLAN';
    if (s === 'PITCH_DECK') return 'PITCH_DECK';
    if (s === 'BUSINESS_PLAN' || s === 'BUSSINESS_PLAN') return 'BUSINESS_PLAN';
    return '';
  };
  // Only show Pitch Deck and Business Plan from Documents & IP
  // and require that the document has been anchored on-chain (proofStatus === 'Anchored')
  const aiEligibleDocs = (documents?.eligibleDocs ?? []).filter((d: any) => {
    // Chỉ cần đúng loại và đã ghi nhận blockchain
    const t = mapType(d.type ?? d.Type);
    const typeOk = t === 'PITCH_DECK' || t === 'BUSINESS_PLAN';
    const proof = (d.proofStatus ?? d.proofstatus ?? d.ProofStatus ?? d.proof ?? d.blockchainStatus ?? '').toString().toLowerCase();
    const anchored = [
      'anchored', 'recorded', 'verified', 'submitted', '0'
    ].includes(proof);
    return typeOk && anchored;
  });

  const [selectedDocs, setSelectedDocs] = useState<Set<string>>(new Set());

  // Initialize selected docs from API when available
  useEffect(() => {
    if (Array.isArray(documents?.eligibleDocs) && selectedDocs.size === 0) {
      const initial = new Set<string>((documents.eligibleDocs ?? [])
        .filter((d: any) => d.recommended)
        .map((d: any) => String(d.id)));
      if (initial.size > 0) setSelectedDocs(initial);
    }
  }, [documents]);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [confirmed, setConfirmed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedPitchDeck = aiEligibleDocs.find((d: any) => selectedDocs.has(d.id) && d.type === "PITCH_DECK");
  const selectedBPlan = aiEligibleDocs.find((d: any) => selectedDocs.has(d.id) && d.type === "BUSINESS_PLAN");
  const canSubmit = allReady && confirmed && (selectedPitchDeck || selectedBPlan) && submitState === "idle";

  const toggleDoc = (id: string) => {
    setSelectedDocs(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Load startup profile & documents from backend
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await GetStartupProfile() as unknown as any;
        const pdata = res?.data ?? res ?? {};
        let members: any[] = [];
        try {
          const mres = await GetMembers();
          members = mres?.data ?? [];
        } catch {}
        const completeness = calcProfileCompleteness(pdata, members);
        const prof = {
          ready: completeness === 100,
          completionPercent: completeness,
          items: pdata?.items ?? pdata?.checks ?? [],
        };
        const docs = {
          ready: Boolean(pdata?.hasDocuments ?? (Array.isArray(pdata?.documents) && pdata.documents.length > 0)),
          items: pdata?.documents ?? [],
          eligibleDocs: pdata?.eligibleDocs ?? pdata?.documents ?? [],
        };
        if (!cancelled) {
          setProfile(prof);
          setDocuments(docs);
          setProfileSnapshot(pdata ?? null);
        }
      } catch (err) {
        if (!cancelled) {
          setProfile({ ready: false, completionPercent: 0, items: [] });
          setDocuments({ ready: false, items: [], eligibleDocs: [] });
          setProfileSnapshot(null);
        }
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setErrorMessage(null);
    try {
      setSubmitState("validating");
      const profileRes = (await GetStartupProfile()) as unknown as IBackendRes<IStartupProfile | null>;
      const startupId = profileRes?.data?.startupID;
      if (!startupId) throw new Error("Startup not found");
      setSubmitState("submitting");
      const payload = { 
        startupId, 
        documentIds: Array.from(selectedDocs).map(id => Number(id)) 
      };
      const res = (await SubmitEvaluation(payload)) as unknown as IBackendRes<any>;
      console.debug("SubmitEvaluation response:", res);
      if (res && (res.success || res.isSuccess)) {
        setSubmitState("queued");
        setTimeout(() => router.push("/startup/ai-evaluation"), 2000);
      } else {
        const msg = res?.message ?? res?.error?.message ?? "Gửi thất bại";
        setErrorMessage(String(msg));
        setSubmitState("failed");
      }
    } catch (err: any) {
      console.error("Submit evaluation failed", err);
      const msg = err?.response?.data?.message ?? err?.message ?? "Mạng hoặc lỗi máy chủ";
      setErrorMessage(String(msg));
      setSubmitState("failed");
    }
  };

  const saveRequestToQueue = async () => {
    setErrorMessage(null);
    try {
      setSubmitState("submitting");
      const profileRes = (await GetStartupProfile()) as unknown as IBackendRes<IStartupProfile | null>;
      const startupId = profileRes?.data?.startupID;
      if (!startupId) throw new Error("Startup not found");

      if (typeof window === "undefined") throw new Error("No localStorage available");

      const queuedRaw = localStorage.getItem("aiEvaluationQueue") || "[]";
      const queued = JSON.parse(queuedRaw) as any[];
      const docIds = Array.from(selectedDocs);
      queued.push({ startupId, documentIds: docIds, createdAt: new Date().toISOString() });
      localStorage.setItem("aiEvaluationQueue", JSON.stringify(queued));

      setErrorMessage("Yêu cầu đã được lưu cục bộ. Bạn có thể gửi lại khi dịch vụ hoạt động.");
      setSubmitState("idle");
    } catch (err: any) {
      console.error("Save to queue failed", err);
      setErrorMessage(err?.message ?? "Không thể lưu yêu cầu");
      setSubmitState("failed");
    }
  };

  return (
    <StartupShell>
      <div className="max-w-[1100px] mx-auto pb-20 animate-in fade-in duration-500">

        {/* Back */}
        <button
          onClick={() => router.push("/startup/ai-evaluation")}
          className="flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-slate-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Quay lại
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#eec54e]/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#eec54e]" />
            </div>
            <h1 className="text-[22px] font-bold text-slate-900">Yêu cầu đánh giá AI</h1>
          </div>
          <p className="text-[13px] text-slate-400">
            Xem lại các điều kiện và xác nhận gửi yêu cầu. Quá trình xử lý diễn ra bất đồng bộ.
          </p>
        </div>

        {/* 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left (2/3) ─────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Readiness Summary */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
              <p className="text-[14px] font-bold text-slate-800 mb-4">Kiểm tra điều kiện</p>

              <div className="space-y-3">
                {/* Profile */}
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
                  {profile.ready
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-700">Hồ sơ Startup</p>
                    <p className="text-[11px] text-slate-400">
                      {profile.completionPercent}% hoàn thành
                      {Array.isArray(profile.items) && profile.items.length > 0
                        ? ` — ${profile.items.filter((i: any) => i.ready).length}/${profile.items.length} mục đạt yêu cầu`
                        : ""}
                    </p>
                  </div>
                  <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-bold", profile.ready ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500")}>
                    {profile.ready ? "Đạt" : "Chưa đạt"}
                  </span>
                </div>

                {/* Documents */}
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
                  {documents.ready
                    ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-700">Tài liệu kinh doanh</p>
                    <p className="text-[11px] text-slate-400">{aiEligibleDocs.length} tài liệu Pitch Deck / Business Plan</p>
                  </div>
                  <span className={cn("px-2.5 py-1 rounded-full text-[11px] font-bold", documents.ready ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500")}>
                    {documents.ready ? "Đạt" : "Chưa đạt"}
                  </span>
                </div>

                {/* Auth */}
                <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-700">Xác thực & quyền truy cập</p>
                    <p className="text-[11px] text-slate-400">Tài khoản Startup Owner đã xác thực</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600">Đạt</span>
                </div>
              </div>
            </div>

            {/* Eligible Documents — selectable */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
              <p className="text-[14px] font-bold text-slate-800 mb-1">Tài liệu đầu vào cho AI</p>
              <p className="text-[12px] text-slate-400 mb-4">Chọn tài liệu từ mục Tài liệu & IP. Chỉ hỗ trợ Pitch Deck và Business Plan. (Chỉ hiển thị tài liệu đã đưa lên blockchain)</p>

              <div className="space-y-2.5">
                {aiEligibleDocs.map((doc: any) => {
                  const selected = selectedDocs.has(doc.id);
                  return (
                    <button
                      key={doc.id}
                      onClick={() => toggleDoc(doc.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left",
                        selected ? "border-[#eec54e] bg-[#fdf8e6]" : "border-slate-200 bg-white hover:border-slate-300"
                      )}
                    >
                      <div className={cn("w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all",
                        selected ? "border-[#eec54e] bg-[#eec54e]" : "border-slate-300")}>
                        {selected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                      {doc.type === "PITCH_DECK" ? <Layout className="w-4 h-4 text-blue-400 flex-shrink-0" /> : <BookOpen className="w-4 h-4 text-violet-400 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-slate-700 truncate">{doc.name}</p>
                        <p className="text-[11px] text-slate-400">Cập nhật: {doc.updatedAt}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold flex-shrink-0">
                        {doc.type === "PITCH_DECK" ? "Pitch Deck" : "Business Plan"}
                      </span>
                    </button>
                  );
                })}
                {Array.isArray(documents?.items) && documents.items.length > 0 && aiEligibleDocs.length === 0 && (
                  <div className="mt-3 px-4 py-3 bg-amber-50 rounded-xl text-[12px] text-amber-700">
                    Hiện có {documents.items.length} tài liệu nhưng chưa có tài liệu nào được đưa lên blockchain. Vui lòng gửi tài liệu lên blockchain (Verify / Anchor) trước khi gửi yêu cầu AI.
                  </div>
                )}
              </div>
            </div>

            {/* Evaluation Scope */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
              <p className="text-[14px] font-bold text-slate-800 mb-4">Phạm vi đánh giá</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: <Users className="w-4 h-4 text-blue-400" />, label: "Đội ngũ sáng lập", desc: "Kinh nghiệm, cam kết, đa dạng kỹ năng" },
                  { icon: <Briefcase className="w-4 h-4 text-violet-400" />, label: "Thị trường & Cạnh tranh", desc: "Quy mô, tốc độ tăng trưởng, timing" },
                  { icon: <Layout className="w-4 h-4 text-emerald-400" />, label: "Sản phẩm & Giải pháp", desc: "MVP, feedback, kiến trúc kỹ thuật" },
                  { icon: <Sparkles className="w-4 h-4 text-amber-400" />, label: "Traction & Tài chính", desc: "Doanh thu, tăng trưởng, unit economics" },
                ].map((item: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center flex-shrink-0">{item.icon}</div>
                    <div>
                      <p className="text-[12px] font-bold text-slate-700">{item.label}</p>
                      <p className="text-[11px] text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right (1/3) ────────────────────────────────── */}
          <div className="space-y-5">

            {/* Profile Snapshot */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5">
              <p className="text-[13px] font-bold text-slate-800 mb-3">Snapshot hồ sơ</p>
              {(() => {
                const industryDisplay = getStartupIndustryDisplay(profileSnapshot);
                return (
              <div className="space-y-2.5">
                {[
                  { label: "Tên startup", value: profileSnapshot?.companyName ?? profileSnapshot?.name ?? "—" },
                  { label: "Giai đoạn", value: profileSnapshot?.stageName ?? String(profileSnapshot?.stage ?? "—") },
                  { label: "Ngành", value: industryDisplay },
                  { label: "Năm thành lập", value: profileSnapshot?.foundedYear ?? profileSnapshot?.foundedDate ?? "—" },
                  { label: "Quy mô đội ngũ", value: profileSnapshot?.teamSize ? `${profileSnapshot.teamSize} thành viên` : "—" },
                  { label: "Cập nhật gần nhất", value: profileSnapshot?.lastUpdated ?? profileSnapshot?.updatedAt ?? "—" },
                ].map((row: any, i: number) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[12px] text-slate-400">{row.label}</span>
                    <span className="text-[12px] font-semibold text-slate-700">{row.value}</span>
                  </div>
                ))}
              </div>
                );
              })()}
            </div>

            {/* Submit Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5 sticky top-24">
              <p className="text-[13px] font-bold text-slate-800 mb-3">Xác nhận & Gửi</p>

              {/* Confirmation checkbox */}
              <label className="flex items-start gap-2.5 mb-4 cursor-pointer group">
                <div className={cn("w-5 h-5 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                  confirmed ? "border-[#eec54e] bg-[#eec54e]" : "border-slate-300 group-hover:border-slate-400")}>
                  {confirmed && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
                <input type="checkbox" className="sr-only" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />
                <span className="text-[12px] text-slate-500 leading-relaxed">
                  Tôi xác nhận dữ liệu đã sẵn sàng và hiểu rằng kết quả AI chỉ mang tính hỗ trợ quyết định, không phải lời khuyên đầu tư.
                </span>
              </label>

              {/* Async notice */}
              <div className="flex items-start gap-2 px-3 py-2.5 bg-blue-50/50 rounded-xl mb-4">
                <Clock className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-blue-600 leading-relaxed">
                  Quá trình xử lý có thể mất vài phút. Bạn sẽ nhận được thông báo khi hoàn tất.
                </p>
              </div>

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit && submitState === "idle"}
                className={cn(
                  "w-full flex items-center justify-center gap-2 h-11 rounded-xl text-[13px] font-bold transition-all",
                  submitState === "queued"
                    ? "bg-emerald-500 text-white"
                    : submitState === "failed"
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : canSubmit
                    ? "bg-[#0f172a] text-white hover:bg-slate-700"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                )}
              >
                {(submitState === "validating" || submitState === "submitting") && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitState === "queued" && <CheckCircle2 className="w-4 h-4" />}
                {submitState === "idle" && <Send className="w-4 h-4" />}
                {submitState === "failed" && <AlertTriangle className="w-4 h-4" />}
                {SUBMIT_LABELS[submitState]}
              </button>

              {!allReady && submitState === "idle" && (
                <div className="flex items-start gap-2 mt-3 px-3 py-2 bg-amber-50 rounded-xl">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] text-amber-700">Vui lòng hoàn thiện hồ sơ và tải lên tài liệu trước khi gửi yêu cầu.</p>
                </div>
              )}
              {submitState === "failed" && errorMessage && (
                <div>
                  <div className="flex items-start gap-2 mt-3 px-3 py-2 bg-red-50 rounded-xl">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-red-700">{errorMessage}</p>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => handleSubmit()}
                      className="inline-flex items-center gap-2 h-9 px-3 rounded-xl bg-[#0f172a] text-white text-[13px] font-bold hover:opacity-90"
                    >
                      Thử lại
                    </button>

                    <button
                      onClick={() => saveRequestToQueue()}
                      className="inline-flex items-center gap-2 h-9 px-3 rounded-xl bg-amber-50 text-amber-700 text-[13px] font-bold hover:opacity-90 border border-amber-100"
                    >
                      Lưu và gửi sau
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </StartupShell>
  );
}
