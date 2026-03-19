"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { InvestorShell } from "@/components/investor/investor-shell";
import {
  ChevronLeft,
  Loader2,
  ShieldCheck,
  Shield,
  Info,
  Clock,
  FileText,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  History,
  CheckCircle2,
  XCircle,
  HelpCircle,
  UserCheck,
  Building2,
  ShieldQuestion,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Mock Data for 10 States ── */
const MOCK_STATES: Record<string, IKYCStatus> = {
  "1": {
    status: "Not Submitted",
    verificationLabel: "None",
    explanation: "Your account is currently unverified. Submit your KYC documents to unlock full platform features and build trust with startups.",
    lastUpdated: "-",
  },
  "2": {
    status: "Pending",
    verificationLabel: "None",
    explanation: "We have received your documents. Our compliance team is currently reviewing your application.",
    lastUpdated: "2026-03-18 09:30 AM",
    submissionSummary: {
      investorTypePath: "Institutional > VC Fund",
      submittedName: "Sequoia Heritage Fund",
      submissionDate: "2026-03-18",
      documentCount: 4,
      version: 1,
    },
    reviewOutcome: {
      nextSteps: "No action required. We will notify you once the review is complete (usually within 2-3 business days).",
    },
  },
  "3": {
    status: "Approved",
    verificationLabel: "Verified Investor Entity",
    explanation: "Congratulations! Your entity has been fully verified. You now have the highest level of trust on the platform.",
    lastUpdated: "2026-03-15 02:45 PM",
    submissionSummary: {
      investorTypePath: "Institutional > Private Equity",
      submittedName: "Global Tech Partners",
      submissionDate: "2026-03-12",
      documentCount: 5,
      version: 1,
    },
    reviewOutcome: {
      nextSteps: "Your verification is valid for 12 months. Ensure your profile stays updated to maintain your status.",
    },
  },
  "4": {
    status: "Rejected",
    verificationLabel: "Verification Failed",
    explanation: "Your verification request could not be approved based on the documents provided.",
    lastUpdated: "2026-03-17 11:20 AM",
    submissionSummary: {
      investorTypePath: "Individual > Angel",
      submittedName: "John Doe Angel Profile",
      submissionDate: "2026-03-16",
      documentCount: 2,
      version: 1,
    },
    reviewOutcome: {
      rejectionReason: "ID Document Expired",
      correctionGuidance: "Selected identity document has expired. Please upload a valid, government-issued ID (Passport or Driver's License).",
      nextSteps: "Please update your documents and resubmit for review.",
    },
  },
  "5": {
    status: "Rejected",
    verificationLabel: "Pending More Info",
    explanation: "We need a few more details to complete your verification.",
    lastUpdated: "2026-03-19 08:00 AM",
    submissionSummary: {
      investorTypePath: "Institutional > Family Office",
      submittedName: "Walton Family Office",
      submissionDate: "2026-03-18",
      documentCount: 3,
      version: 2,
    },
    reviewOutcome: {
      rejectionReason: "Proof of Funds Clarification",
      correctionGuidance: "The submitted bank statement is over 6 months old. Please provide a statement from the last 90 days.",
      nextSteps: "Upload the requested document using the resubmit button below.",
    },
  },
  "6": {
    status: "Approved",
    verificationLabel: "Verified Investor Entity",
    explanation: "Verified as a certified Institutional Investor entity.",
    lastUpdated: "2026-03-10 04:00 PM",
    submissionSummary: {
      investorTypePath: "Institutional > Investment Bank",
      submittedName: "Goldman Sachs Tech Dev",
      submissionDate: "2026-03-08",
      documentCount: 6,
      version: 1,
    },
  },
  "7": {
    status: "Approved",
    verificationLabel: "Verified Angel Investor",
    explanation: "Verified as an individual Accredited/Angel Investor.",
    lastUpdated: "2026-03-14 10:30 AM",
    submissionSummary: {
      investorTypePath: "Individual > Angel",
      submittedName: "Sarah Chen",
      submissionDate: "2026-03-13",
      documentCount: 3,
      version: 1,
    },
  },
  "8": {
    status: "Approved",
    verificationLabel: "Basic Verified",
    explanation: "Identity verified. Strategic fund details are still under secondary review for 'Verified Entity' status.",
    lastUpdated: "2026-03-16 01:15 PM",
    submissionSummary: {
      investorTypePath: "Institutional > Other",
      submittedName: "Alpha Assets LLC",
      submissionDate: "2026-03-15",
      documentCount: 3,
      version: 1,
    },
  },
  "9": {
    status: "Pending",
    verificationLabel: "Pending More Info",
    explanation: "Your submission is being reviewed, but our team has flagged a request for additional data.",
    lastUpdated: "2026-03-19 10:45 AM",
    submissionSummary: {
      investorTypePath: "Individual > Angel",
      submittedName: "Alex Rivera",
      submissionDate: "2026-03-18",
      documentCount: 2,
      version: 1,
    },
  },
  "10": {
    status: "Rejected",
    verificationLabel: "Verification Failed",
    explanation: "The provided entity documents do not match the registered business name.",
    lastUpdated: "2026-03-12 09:00 AM",
    submissionSummary: {
      investorTypePath: "Institutional > VC Fund",
      submittedName: "Vortex Ventures",
      submissionDate: "2026-03-10",
      documentCount: 4,
      version: 1,
    },
  },
};

/* ── Components ── */
function StatusBadge({ status }: { status: IKYCStatus["status"] }) {
  const styles = {
    "Not Submitted": "bg-neutral-100 text-neutral-500 border-neutral-200",
    "Pending": "bg-blue-50 text-blue-600 border-blue-100",
    "Approved": "bg-emerald-50 text-emerald-600 border-emerald-100",
    "Rejected": "bg-red-50 text-red-600 border-red-100",
  };
  
  const icons = {
    "Not Submitted": ShieldQuestion,
    "Pending": Clock,
    "Approved": CheckCircle2,
    "Rejected": XCircle,
  };
  
  const Icon = icons[status];
  
  return (
    <div className={cn("px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 w-fit", styles[status])}>
      <Icon className="w-3.5 h-3.5" />
      {status}
    </div>
  );
}

function LabelBadge({ label }: { label: IKYCStatus["verificationLabel"] }) {
  if (label === "None") return null;

  const styles = {
    "Verified Investor Entity": "bg-[#171611] text-white",
    "Verified Angel Investor": "bg-[#e6cc4c] text-[#171611]",
    "Basic Verified": "bg-neutral-100 text-neutral-700",
    "Pending More Info": "bg-amber-100 text-amber-700",
    "Verification Failed": "bg-red-100 text-red-700",
  }[label] || "bg-neutral-100 text-neutral-700";

  return (
    <div className={cn("px-4 py-2 rounded-xl text-[14px] font-black tracking-tight flex items-center gap-2 shadow-sm", styles)}>
      {label === "Verified Investor Entity" && <Building2 className="w-4 h-4" />}
      {label === "Verified Angel Investor" && <UserCheck className="w-4 h-4" />}
      {label}
    </div>
  );
}

export default function KYCStatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [kycData, setKycData] = useState<IKYCStatus | null>(null);

  // For demonstration: Allow switching states via URL param ?state=1..10
  const stateParam = searchParams.get("state") || "2";

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setKycData(MOCK_STATES[stateParam] || MOCK_STATES["1"]);
      setLoading(false);
    }, 800);
  }, [stateParam]);

  if (loading) {
    return (
      <InvestorShell>
         <div className="flex flex-col items-center justify-center py-32 text-neutral-400">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#e6cc4c]" />
          <p className="text-[14px] font-bold tracking-tight">Loading Verification Status...</p>
        </div>
      </InvestorShell>
    );
  }

  if (!kycData) return null;

  return (
    <InvestorShell>
      <div className="max-w-[900px] mx-auto px-6 pb-24">
        
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-white border border-neutral-100 hover:shadow-lg transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-[#171611]" />
            </button>
            <div>
              <h1 className="text-[28px] font-black text-[#171611] tracking-tighter leading-none mb-1">KYC Verification Status</h1>
              <p className="text-[13px] text-neutral-400 font-medium">Track your investor verification result and next steps</p>
            </div>
          </div>
          
          {/* State Switcher (Demo Only) */}
          <div className="flex items-center gap-2 p-1 bg-neutral-100 rounded-xl">
             <span className="text-[9px] font-black text-neutral-400 uppercase px-2">Demo:</span>
             <select 
               className="bg-transparent text-[10px] font-bold text-[#171611] outline-none border-none"
               value={stateParam}
               onChange={(e) => router.push(`/investor/kyc?state=${e.target.value}`)}
             >
               {Object.keys(MOCK_STATES).map(k => <option key={k} value={k}>State {k}</option>)}
             </select>
          </div>
        </div>

        <div className="space-y-8">
          
          {/* ── Main Status Card ── */}
          <div className="bg-white rounded-[32px] p-10 border border-neutral-100 shadow-xl shadow-black/5 text-center flex flex-col items-center relative overflow-hidden">
            {/* Background Accent */}
            <div className={cn(
              "absolute top-0 left-0 w-full h-1.5",
              kycData.status === "Approved" ? "bg-emerald-500" : 
              kycData.status === "Rejected" ? "bg-red-500" : 
              kycData.status === "Pending" ? "bg-blue-500" : "bg-neutral-200"
            )} />

            <StatusBadge status={kycData.status} />
            
            <div className="mt-6 mb-4">
               {kycData.verificationLabel !== "None" ? (
                 <LabelBadge label={kycData.verificationLabel} />
               ) : (
                 <p className="text-[18px] font-black text-neutral-300 uppercase tracking-widest italic">No Label Issued</p>
               )}
            </div>

            <p className="max-w-[500px] text-[15px] text-[#171611] font-medium leading-relaxed mb-6">
              {kycData.explanation}
            </p>

            <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-bold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" />
              Last Updated: {kycData.lastUpdated}
            </div>
          </div>

          {/* ── Submission Summary ── */}
          {kycData.submissionSummary && (
            <div className="bg-white rounded-[24px] overflow-hidden border border-neutral-100 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="px-8 py-5 border-b border-neutral-50 bg-neutral-50/50 flex items-center justify-between">
                 <h3 className="text-[13px] font-black text-[#171611] uppercase tracking-wider flex items-center gap-2">
                   <FileText className="w-4 h-4 text-neutral-400" />
                   Latest Submission Summary
                 </h3>
                 <span className="px-2 py-0.5 rounded-md bg-white border border-neutral-100 text-[10px] font-black text-neutral-400">
                   V{kycData.submissionSummary.version}
                 </span>
              </div>
              <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
                <div>
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">Investor Type</p>
                  <p className="text-[13px] font-bold text-[#171611] truncate">{kycData.submissionSummary.investorTypePath}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">Submitted Name</p>
                  <p className="text-[13px] font-bold text-[#171611] truncate">{kycData.submissionSummary.submittedName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">Submitted Date</p>
                  <p className="text-[13px] font-bold text-[#171611]">{kycData.submissionSummary.submissionDate}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1.5">Documents</p>
                  <p className="text-[13px] font-bold text-[#171611]">{kycData.submissionSummary.documentCount} Files Attached</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Review Outcome Section ── */}
          <div className="bg-white rounded-[24px] p-8 border border-neutral-100 shadow-sm">
            {kycData.status === "Not Submitted" && (
              <div className="text-center py-6">
                <Info className="w-12 h-12 text-[#e6cc4c] mx-auto mb-4" />
                <h3 className="text-lg font-black text-[#171611] tracking-tight mb-3">Verification Not Started</h3>
                <p className="text-[13px] text-neutral-400 font-medium max-w-[400px] mx-auto mb-8">
                  Completing your KYC verification allows you to establish credibility with founders, access exclusive deals, and participate in high-value networking.
                </p>
                <div className="flex flex-col items-center gap-4">
                  <button className="px-10 py-3 bg-[#171611] text-white rounded-2xl text-[14px] font-black shadow-lg hover:shadow-black/20 hover:scale-[1.02] transition-all flex items-center gap-2">
                    Submit KYC Documents <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {kycData.status === "Pending" && (
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50 text-blue-800">
                  <Info className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-[14px] font-black">Submission Under Review</p>
                    <p className="text-[12px] opacity-80 mt-1 font-medium">Your application is in the queue. Our audit team performs manual verification on all fund structures and accredited individual statuses to maintain network quality.</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3 pt-4">
                  <button className="px-6 py-2.5 bg-white border border-neutral-100 rounded-xl text-[12px] font-black text-[#171611] flex items-center gap-2 hover:bg-neutral-50 transition-colors">
                    <ExternalLink className="w-4 h-4" /> View Submitted Details
                  </button>
                  <button onClick={() => router.push("/investor/profile")} className="px-6 py-2.5 text-[12px] font-black text-neutral-400 hover:text-[#171611] transition-colors">
                    Back to Profile
                  </button>
                </div>
              </div>
            )}

            {kycData.status === "Approved" && (
              <div className="space-y-6">
                <div className="flex items-start gap-4 p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 text-emerald-800">
                  <ShieldCheck className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="text-[14px] font-black">Account fully verified</p>
                    <p className="text-[12px] opacity-80 mt-1 font-medium">Your trust label is now active and will be displayed on your profile. This signature of credibility is visible to all startups in your matching list.</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3 pt-4">
                  <button className="px-6 py-2.5 bg-[#171611] text-white rounded-xl text-[12px] font-black flex items-center gap-2 shadow-md hover:bg-[#25241e] transition-colors">
                    <ExternalLink className="w-4 h-4" /> View Verification Record
                  </button>
                </div>
              </div>
            )}

            {kycData.status === "Rejected" && (
              <div className="space-y-8 animate-in shake-1 duration-500">
                <div className="flex items-start gap-4 p-6 bg-red-50/50 rounded-2xl border-2 border-red-100 text-red-800">
                  <AlertCircle className="w-6 h-6 shrink-0" />
                  <div>
                    <p className="text-[16px] font-black leading-tight">Action Required: Verification Rejection</p>
                    <p className="text-[13px] opacity-90 mt-2 font-medium">Your latest submission could not be verified due to specific inconsistencies or missing data.</p>
                  </div>
                </div>

                {kycData.reviewOutcome?.rejectionReason && (
                   <div className="bg-neutral-50 rounded-2xl p-6 border border-neutral-100">
                      <div className="flex items-center gap-2 mb-4">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <span className="text-[11px] font-black uppercase text-red-500 tracking-widest">Reason for Rejection</span>
                      </div>
                      <h4 className="text-[15px] font-black text-[#171611] mb-2">{kycData.reviewOutcome.rejectionReason}</h4>
                      <p className="text-[13px] text-neutral-500 font-medium leading-relaxed">
                        {kycData.reviewOutcome.correctionGuidance}
                      </p>
                   </div>
                )}

                <div className="flex flex-col items-center gap-4 pt-2">
                  <button className="px-10 py-3 bg-red-600 text-white rounded-2xl text-[14px] font-black shadow-lg shadow-red-100 hover:bg-red-700 hover:scale-[1.02] transition-all flex items-center gap-2">
                    Resubmit KYC Documents <ArrowRight className="w-4 h-4" />
                  </button>
                  <button className="text-[12px] font-bold text-neutral-400 hover:text-[#171611] transition-colors">
                    View Previous Submission
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Timeline Section ── */}
          {(kycData.status !== "Not Submitted") && (
             <div className="bg-white rounded-[24px] p-8 border border-neutral-100 shadow-sm">
                <h3 className="text-[13px] font-black text-neutral-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <History className="w-4 h-4" /> Verification Timeline
                </h3>
                <div className="space-y-8 pl-4 relative">
                  {/* Vertical Line */}
                  <div className="absolute left-[23px] top-2 bottom-2 w-px bg-neutral-100" />
                  
                  {[
                    { event: "Result Issued", date: kycData.lastUpdated, status: kycData.status, active: true },
                    { event: "Under Review", date: "2026-03-18 09:30 AM", status: "In Progress", active: false },
                    { event: "Documents Submitted", date: "2026-03-18 09:15 AM", status: "Success", active: false },
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-6 relative">
                      <div className={cn(
                        "w-[18px] h-[18px] rounded-full mt-0.5 border-4 border-white shadow-sm z-10",
                        step.active ? "bg-[#e6cc4c] ring-4 ring-[#e6cc4c]/10" : "bg-neutral-200"
                      )} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                           <p className={cn("text-[13px] font-black", step.active ? "text-[#171611]" : "text-neutral-400")}>{step.event}</p>
                           <p className="text-[11px] text-neutral-400 font-bold">{step.date}</p>
                        </div>
                        <p className="text-[11px] text-neutral-400 font-medium">{step.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          )}

          {/* ── Help / Policy Note ── */}
          <div className="flex items-start gap-4 p-6 bg-neutral-50 rounded-[24px] border border-neutral-100 opacity-60 hover:opacity-100 transition-opacity">
            <HelpCircle className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-[11px] text-[#171611] font-black uppercase tracking-wider">Verification Policy & Security</p>
              <p className="text-[11px] text-neutral-500 font-medium leading-relaxed">
                Verification checks focus on fund legitimacy and accredited investor status. This process does not guarantee investment activity or act as a platform endorsement. All KYC data is encrypted and handled according to our strict privacy protocols.
              </p>
            </div>
          </div>

        </div>
      </div>
    </InvestorShell>
  );
}
