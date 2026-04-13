"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  Bookmark,
  Brain,
  Building2,
  FileText,
  FolderOpen,
  Handshake,
  Loader2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  AddToWatchlist,
  GetInvestorProfile,
  GetInvestorWatchlist,
  GetStartupById,
  RemoveFromWatchlist,
} from "@/services/investor/investor.api";
import { CreateConnection, GetSentConnections } from "@/services/connection/connection.api";

const TEXT = {
  unknown: "Kh\u00f4ng x\u00e1c \u0111\u1ecbnh",
  startup: "Startup",
  notUpdated: "Ch\u01b0a c\u1eadp nh\u1eadt",
  noDescription: "Ch\u01b0a c\u00f3 th\u00f4ng tin m\u00f4 t\u1ea3",
  member: "Th\u00e0nh vi\u00ean",
  loading: "\u0110ang t\u1ea3i th\u00f4ng tin startup...",
  notFoundTitle: "Kh\u00f4ng t\u00ecm th\u1ea5y startup",
  notFoundDesc: "Startup n\u00e0y kh\u00f4ng t\u1ed3n t\u1ea1i ho\u1eb7c hi\u1ec7n kh\u00f4ng kh\u1ea3 d\u1ee5ng.",
  notFoundShort: "Kh\u00f4ng t\u00ecm th\u1ea5y startup.",
  loadFailed: "Kh\u00f4ng t\u1ea3i \u0111\u01b0\u1ee3c th\u00f4ng tin startup.",
  backToList: "Quay l\u1ea1i danh s\u00e1ch",
  verified: "\u0110\u00e3 verified",
  investorOnly:
    "Ch\u1ec9 Nh\u00e0 \u0111\u1ea7u t\u01b0 m\u1edbi c\u00f3 th\u1ec3 theo d\u00f5i startup. Vui l\u00f2ng chuy\u1ec3n t\u00e0i kho\u1ea3n ho\u1eb7c t\u1ea1o h\u1ed3 s\u01a1 Nh\u00e0 \u0111\u1ea7u t\u01b0.",
  investorOnlyShort: "Ch\u1ec9 Nh\u00e0 \u0111\u1ea7u t\u01b0",
  addedWatchlist: "\u0110\u00e3 th\u00eam v\u00e0o danh s\u00e1ch theo d\u00f5i",
  removedWatchlist: "\u0110\u00e3 g\u1ee1 kh\u1ecfi danh s\u00e1ch theo d\u00f5i",
  addWatchlistFailed: "Kh\u00f4ng th\u1ec3 th\u00eam theo d\u00f5i",
  removeWatchlistFailed: "Kh\u00f4ng th\u1ec3 b\u1ecf theo d\u00f5i",
  watchlistUpdateFailed: "L\u1ed7i khi c\u1eadp nh\u1eadt danh s\u00e1ch theo d\u00f5i",
  unknownStartupId: "Kh\u00f4ng x\u00e1c \u0111\u1ecbnh \u0111\u01b0\u1ee3c ID startup.",
  alreadySentConnection: "B\u1ea1n \u0111\u00e3 g\u1eedi \u0111\u1ec1 ngh\u1ecb k\u1ebft n\u1ed1i \u0111\u1ebfn startup n\u00e0y r\u1ed3i.",
  connectionSent: "\u0110\u00e3 g\u1eedi \u0111\u1ec1 ngh\u1ecb k\u1ebft n\u1ed1i th\u00e0nh c\u00f4ng!",
  connectionFailed: "G\u1eedi \u0111\u1ec1 ngh\u1ecb th\u1ea5t b\u1ea1i.",
  startupNotAccepting: "Startup kh\u00f4ng nh\u1eadn k\u1ebft n\u1ed1i m\u1edbi",
  unfollowTitle: "X\u00e1c nh\u1eadn h\u1ee7y theo d\u00f5i",
  unfollowDescPrefix: "B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n b\u1ecf theo d\u00f5i \"",
  unfollowDescSuffix: "\" kh\u00f4ng? Thao t\u00e1c n\u00e0y s\u1ebd g\u1ee1 startup kh\u1ecfi danh s\u00e1ch theo d\u00f5i c\u1ee7a b\u1ea1n.",
  cancel: "H\u1ee7y",
  unfollow: "B\u1ecf theo d\u00f5i",
  following: "\u0110\u00e3 theo d\u00f5i",
  follow: "Theo d\u00f5i",
  requestConnection: "\u0110\u1ec1 ngh\u1ecb k\u1ebft n\u1ed1i",
  sentConnection: "\u0110\u00e3 g\u1eedi k\u1ebft n\u1ed1i",
  about: "V\u1ec1 Startup",
  noExtraInfo: "Ch\u01b0a c\u00f3 th\u00f4ng tin b\u1ed5 sung.",
  foundingTeam: "\u0110\u1ed9i ng\u0169 s\u00e1ng l\u1eadp",
  noTeam: "Ch\u01b0a c\u00f3 th\u00f4ng tin \u0111\u1ed9i ng\u0169.",
  targetFunding: "M\u1ee5c ti\u00eau g\u1ecdi v\u1ed1n",
  aiScore: "\u0110i\u1ec3m \u0111\u00e1nh gi\u00e1 AI",
  highFit: "\u0110\u1ed9 ph\u00f9 h\u1ee3p r\u1ea5t cao",
  dataRoom: "T\u00e0i li\u1ec7u Data Room",
  uploadedDocs: "3 t\u00e0i li\u1ec7u t\u1ea3i l\u00ean",
  pitchDeck: "Pitch Deck",
  finance: "T\u00e0i ch\u00ednh",
  legal: "Ph\u00e1p l\u00fd",
  uploadedAt: "T\u1ea3i l\u00ean",
  aiAutoReview: "\u0110\u00e1nh gi\u00e1 AI t\u1ef1 \u0111\u1ed9ng",
  standoutStrengths: "\u0110i\u1ec3m m\u1ea1nh n\u1ed5i b\u1eadt",
  riskNotes: "\u0110i\u1ec1u ki\u1ec7n c\u1ea7n l\u01b0u \u00fd",
  strength1: "Th\u00f4ng tin startup \u0111\u00e3 \u0111\u01b0\u1ee3c t\u1ea3i v\u00e0 \u0111\u1ed9i ng\u0169 c\u01a1 b\u1ea3n hi\u1ec3n th\u1ecb \u1ed5n \u0111\u1ecbnh.",
  strength2: "Trang detail \u0111\u00e3 b\u1ecf fallback mock n\u00ean ch\u1ec9 ph\u1ea3n \u00e1nh d\u1eef li\u1ec7u th\u1eadt t\u1eeb BE.",
  risk1: "N\u1ebfu startup b\u1ecb hidden v\u00e0 b\u1ea1n kh\u00f4ng \u0111\u1ee7 quy\u1ec1n, endpoint detail s\u1ebd tr\u1ea3 not found.",
  risk2: "Data room v\u00e0 ph\u00e2n t\u00edch AI hi\u1ec7n v\u1eabn l\u00e0 ph\u1ea7n hi\u1ec3n th\u1ecb m\u00f4 ph\u1ecfng \u1edf FE.",
} as const;

const AVATAR_COLORS = [
  "from-violet-500 to-violet-600",
  "from-blue-500 to-blue-600",
  "from-emerald-500 to-emerald-600",
  "from-rose-500 to-rose-600",
  "from-amber-500 to-amber-600",
  "from-cyan-500 to-cyan-600",
  "from-pink-500 to-pink-600",
  "from-indigo-500 to-indigo-600",
];

type StartupTeamMember = {
  name: string;
  role: string;
};

type StartupDetailView = {
  id: number;
  name: string;
  industry: string;
  stage: string;
  location: string;
  country?: string;
  target: string;
  score: number;
  desc: string;
  tags: string[];
  team: StartupTeamMember[];
  logo: string;
  enterpriseCode?: string | null;
};

function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function hasImageSource(value?: string | null) {
  return Boolean(value && (/^https?:\/\//i.test(value) || value.startsWith("/")));
}

function getErrorCode(source: any): string | undefined {
  return (
    source?.errorCode ??
    source?.error?.code ??
    source?.data?.errorCode ??
    source?.data?.error?.code ??
    source?.response?.data?.errorCode ??
    source?.response?.data?.error?.code
  );
}

function getErrorMessage(source: any): string | undefined {
  return (
    source?.message ??
    source?.error?.message ??
    source?.data?.message ??
    source?.response?.data?.message
  );
}

function normalizeStartupDetail(raw: any, fallbackId: number): StartupDetailView {
  const team = Array.isArray(raw?.teamMembers)
    ? raw.teamMembers
    : Array.isArray(raw?.team)
      ? raw.team
      : [];
  const tags = Array.isArray(raw?.tags)
    ? raw.tags
    : Array.isArray(raw?.currentNeeds)
      ? raw.currentNeeds
      : [];

  return {
    id: Number(raw?.startupID ?? raw?.startupId ?? raw?.id ?? fallbackId),
    name: raw?.companyName ?? raw?.CompanyName ?? raw?.name ?? raw?.startupName ?? TEXT.startup,
    industry: raw?.industryName ?? raw?.industry ?? raw?.Industry ?? TEXT.notUpdated,
    stage: raw?.stage ?? raw?.Stage ?? raw?.fundingStage ?? TEXT.notUpdated,
    location: raw?.location ?? raw?.Location ?? raw?.city ?? raw?.country ?? TEXT.notUpdated,
    country: raw?.country ?? raw?.Country ?? undefined,
    target:
      raw?.target ??
      raw?.Target ??
      (raw?.fundingAmountSought ? `$${Number(raw.fundingAmountSought).toLocaleString()}` : "N/A"),
    score: Number(raw?.score ?? raw?.Score ?? raw?.aiScore ?? 0),
    desc: raw?.description ?? raw?.desc ?? raw?.Description ?? raw?.oneLiner ?? TEXT.noDescription,
    tags: tags.filter((tag: unknown): tag is string => typeof tag === "string"),
    team: team.map((member: any) => ({
      name: member?.fullName ?? member?.name ?? TEXT.member,
      role: member?.role ?? member?.title ?? TEXT.notUpdated,
    })),
    logo: raw?.logoURL ?? raw?.logo ?? raw?.profilePhotoURL ?? "",
    enterpriseCode: raw?.enterpriseCode ?? null,
  };
}

export default function StartupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const startupId = Number(id);

  const [startupData, setStartupData] = useState<StartupDetailView | null>(null);
  const [startupError, setStartupError] = useState<string | null>(null);
  const [isStartupLoading, setIsStartupLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isInvestor, setIsInvestor] = useState<boolean | null>(null);
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionSent, setConnectionSent] = useState(false);

  const startup = startupData;
  const avatarGradient = getAvatarColor(String(startup?.id ?? startupId));

  const notifyWatchlistUpdated = () => {
    if (typeof window === "undefined") return;
    try {
      if ((window as any).BroadcastChannel) {
        const bc = new BroadcastChannel("watchlist-updates");
        bc.postMessage({ type: "refresh" });
        bc.close();
      } else {
        localStorage.setItem("watchlist-refresh", Date.now().toString());
      }
    } catch {
      // ignore local sync errors
    }
  };

  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await GetInvestorProfile();
        setIsInvestor(Boolean(res?.isSuccess));
      } catch {
        setIsInvestor(false);
      }
    };

    const checkExistingConnection = async () => {
      if (!Number.isFinite(startupId) || startupId <= 0) return;
      try {
        const res = await GetSentConnections(1, 100);
        if (!res?.isSuccess) return;

        const data = res.data as any;
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.items)
              ? data.items
              : [];

        const found = items.some((connection: any) => {
          const connectedStartupId = Number(
            connection?.startupID ??
              connection?.startupId ??
              connection?.StartupID ??
              connection?.StartupId ??
              null,
          );
          return connectedStartupId === startupId;
        });

        if (found) setConnectionSent(true);
      } catch {
        // connection state is non-blocking here
      }
    };

    void checkRole();
    void checkExistingConnection();
  }, [startupId]);

  useEffect(() => {
    const fetchStartup = async () => {
      if (!Number.isFinite(startupId) || startupId <= 0) {
        setStartupData(null);
        setStartupError(TEXT.notFoundShort);
        setIsStartupLoading(false);
        return;
      }

      setIsStartupLoading(true);
      setStartupError(null);

      try {
        const res = await GetStartupById(startupId);
        if (res?.isSuccess && res.data) {
          setStartupData(normalizeStartupDetail(res.data, startupId));
          return;
        }

        const code = getErrorCode(res);
        if (code === "STARTUP_NOT_FOUND" || res?.statusCode === 404) {
          setStartupData(null);
          setStartupError(TEXT.notFoundShort);
          return;
        }

        setStartupData(null);
        setStartupError(getErrorMessage(res) || TEXT.loadFailed);
      } catch (error: any) {
        const code = getErrorCode(error);
        if (code === "STARTUP_NOT_FOUND" || error?.response?.status === 404) {
          setStartupData(null);
          setStartupError(TEXT.notFoundShort);
        } else {
          setStartupData(null);
          setStartupError(getErrorMessage(error) || TEXT.loadFailed);
        }
      } finally {
        setIsStartupLoading(false);
      }
    };

    void fetchStartup();
  }, [startupId]);

  useEffect(() => {
    const checkFollowing = async () => {
      if (!Number.isFinite(startupId) || startupId <= 0) return;
      try {
        const res = await GetInvestorWatchlist(1, 200);
        if (!res?.isSuccess) return;

        const data = res.data as any;
        const rawItems = Array.isArray(res.data)
          ? (res.data as any[])
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.items)
              ? data.items
              : Array.isArray((res as any)?.items)
                ? (res as any).items
                : [];

        const found = rawItems.some((raw: any) => {
          const watchedId = Number(raw?.startupID ?? raw?.startupId ?? raw?.StartupID ?? raw?.StartupId ?? null);
          return watchedId === startupId;
        });

        setIsFollowing(found);
      } catch {
        // watchlist is non-blocking
      }
    };

    void checkFollowing();
  }, [startupId]);

  const handleFollowClick = async () => {
    if (isProcessing || !Number.isFinite(startupId) || startupId <= 0) return;
    setIsProcessing(true);

    try {
      if (!isFollowing) {
        const res = await AddToWatchlist({ startupID: startupId });
        if (res?.isSuccess) {
          setIsFollowing(true);
          notifyWatchlistUpdated();
          toast.success(TEXT.addedWatchlist);
        } else {
          toast.error(getErrorMessage(res) || TEXT.addWatchlistFailed);
        }
      } else {
        const res = await RemoveFromWatchlist(startupId);
        if (res?.isSuccess) {
          setIsFollowing(false);
          notifyWatchlistUpdated();
          toast.success(TEXT.removedWatchlist);
        } else {
          toast.error(getErrorMessage(res) || TEXT.removeWatchlistFailed);
        }
      }
    } catch (error: any) {
      toast.error(getErrorMessage(error) || TEXT.watchlistUpdateFailed);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConnectClick = async () => {
    if (!Number.isFinite(startupId) || startupId <= 0) {
      toast.error(TEXT.unknownStartupId);
      return;
    }
    if (connectionSent) {
      toast.info(TEXT.alreadySentConnection);
      return;
    }

    setIsConnecting(true);
    try {
      const res = await CreateConnection({ startupId, message: "" });
      if (res?.isSuccess) {
        setConnectionSent(true);
        toast.success(TEXT.connectionSent);
        return;
      }

      const code = getErrorCode(res);
      if (code === "STARTUP_NOT_ACCEPTING_CONNECTIONS") {
        toast.error(TEXT.startupNotAccepting);
      } else {
        toast.error(getErrorMessage(res) || TEXT.connectionFailed);
      }
    } catch (error: any) {
      const code = getErrorCode(error);
      if (code === "STARTUP_NOT_ACCEPTING_CONNECTIONS") {
        toast.error(TEXT.startupNotAccepting);
      } else {
        toast.error(getErrorMessage(error) || TEXT.connectionFailed);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  if (isStartupLoading) {
    return (
      <div className="mx-auto flex min-h-[420px] max-w-6xl items-center justify-center px-6">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="h-7 w-7 animate-spin" />
          <p className="text-[14px] font-medium">{TEXT.loading}</p>
        </div>
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="mx-auto flex min-h-[420px] max-w-3xl items-center justify-center px-6">
        <div className="rounded-3xl border border-slate-200 bg-white px-10 py-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <h1 className="text-[20px] font-bold text-slate-900">{TEXT.notFoundTitle}</h1>
          <p className="mt-2 text-[13px] text-slate-500">{startupError || TEXT.notFoundDesc}</p>
          <Link
            href="/investor/startups"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-slate-800"
          >
            <Building2 className="h-4 w-4" />
            {TEXT.backToList}
          </Link>
        </div>
      </div>
    );
  }

  const docs = [
    {
      name: `Pitch_Deck_${startup.name.replace(/\s+/g, "_")}.pdf`,
      type: TEXT.pitchDeck,
      date: "12/05/2024",
      icon: FileText,
      color: "text-red-500",
    },
    {
      name: "Financial_Projections_2024.xlsx",
      type: TEXT.finance,
      date: "10/05/2024",
      icon: FileText,
      color: "text-green-500",
    },
    {
      name: "Legal_Documents.pdf",
      type: TEXT.legal,
      date: "05/05/2024",
      icon: FileText,
      color: "text-blue-500",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 animate-in fade-in duration-500">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-40 bg-gradient-to-r from-slate-900 to-slate-800" />
        <div className="relative px-6 pb-6">
          <div className="relative z-10 -mt-12 mb-8 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:gap-6">
              <div
                className={cn(
                  "flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-gradient-to-br text-[32px] font-black text-white shadow-xl transition-transform duration-300 hover:scale-105 md:h-32 md:w-32 md:text-[40px]",
                  avatarGradient,
                )}
              >
                {hasImageSource(startup.logo) ? (
                  <img src={startup.logo} alt={startup.name} className="h-full w-full rounded-2xl object-cover" />
                ) : (
                  startup.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="md:pb-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-black leading-tight text-[#171611] md:text-3xl">{startup.name}</h1>
                  {startup.enterpriseCode && (
                    <span className="rounded-full border border-green-200 bg-green-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-green-700">
                      {TEXT.verified}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-sm font-bold uppercase tracking-wide text-slate-500 opacity-80 md:text-base">
                  {startup.industry} • {startup.location}
                </p>
              </div>
            </div>

            <div className="flex w-full items-center gap-3 md:w-auto">
              {isInvestor === false ? (
                <button
                  onClick={() => toast.error(TEXT.investorOnly)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-[#f3f3f3] px-6 py-2.5 font-bold text-neutral-500 md:flex-none"
                >
                  <Bookmark className="h-5 w-5" />
                  {TEXT.investorOnlyShort}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      if (isFollowing) setShowUnfollowConfirm(true);
                      else void handleFollowClick();
                    }}
                    disabled={isProcessing}
                    className={cn(
                      "relative flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-2.5 font-bold transition-all disabled:opacity-60 md:flex-none",
                      isFollowing
                        ? "border border-emerald-100 bg-white text-emerald-700"
                        : "border border-slate-200 bg-[#f8f8f6] text-[#171611]",
                    )}
                  >
                    <Bookmark className="h-5 w-5" />
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin text-[#171611]" /> : isFollowing ? TEXT.following : TEXT.follow}
                  </button>

                  <Dialog open={showUnfollowConfirm} onOpenChange={setShowUnfollowConfirm}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{TEXT.unfollowTitle}</DialogTitle>
                      </DialogHeader>
                      <DialogDescription>
                        {TEXT.unfollowDescPrefix}
                        {startup.name}
                        {TEXT.unfollowDescSuffix}
                      </DialogDescription>
                      <DialogFooter>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setShowUnfollowConfirm(false)}
                            disabled={isProcessing}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-bold text-slate-600 transition-all hover:bg-slate-50"
                          >
                            {TEXT.cancel}
                          </button>
                          <button
                            onClick={async () => {
                              setShowUnfollowConfirm(false);
                              await handleFollowClick();
                            }}
                            disabled={isProcessing}
                            className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white transition-all hover:bg-red-700"
                          >
                            {isProcessing ? <Loader2 className="inline-block h-4 w-4 animate-spin" /> : TEXT.unfollow}
                          </button>
                        </div>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </>
              )}

              <button
                onClick={() => void handleConnectClick()}
                disabled={isConnecting || connectionSent}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-2.5 font-bold transition-all disabled:opacity-60 md:flex-none",
                  connectionSent
                    ? "border border-emerald-200 bg-white text-emerald-700"
                    : "bg-[#e6cc4c] text-[#171611] hover:shadow-lg",
                )}
              >
                {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Handshake className="h-5 w-5" />}
                {connectionSent ? TEXT.sentConnection : TEXT.requestConnection}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div className="col-span-1 space-y-8 md:col-span-3">
              <div>
                <h4 className="mb-3 text-[13px] font-bold text-slate-800">{TEXT.about}</h4>
                <p className="max-w-3xl text-[14px] leading-relaxed text-slate-600">{startup.desc}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {startup.tags.length > 0 ? (
                    startup.tags.map((tag) => (
                      <span
                        key={tag}
                        className="cursor-default rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-[13px] text-slate-400">{TEXT.noExtraInfo}</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="mb-4 text-[13px] font-bold text-slate-800">{TEXT.foundingTeam}</h4>
                <div className="flex flex-wrap gap-4">
                  {startup.team.length > 0 ? (
                    startup.team.map((member, idx) => (
                      <div
                        key={`${member.name}-${idx}`}
                        className="group flex min-w-[240px] items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-4 transition-all hover:border-slate-300"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-200 text-sm font-black text-slate-500 transition-all group-hover:bg-[#e6cc4c] group-hover:text-white">
                          {(member.name ?? "?").split(" ").pop()?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-[#171611]">{member.name}</p>
                          <p className="text-[11px] font-medium uppercase tracking-tight text-slate-400">{member.role}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-[13px] text-slate-400">{TEXT.noTeam}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 shadow-sm">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">{TEXT.targetFunding}</p>
                <p className="mb-1 text-[28px] font-black leading-none text-[#171611]">{startup.target}</p>
                <p className="mt-2 inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[13px] font-bold text-emerald-600">
                  {startup.stage}
                </p>
              </div>

              <div className="group flex items-start gap-4 rounded-2xl border border-[#e6cc4c]/20 bg-[#e6cc4c]/5 p-5 shadow-sm transition-colors hover:bg-[#e6cc4c]/10">
                <Sparkles className="h-7 w-7 shrink-0 text-[#e6cc4c]" />
                <div>
                  <p className="mb-1.5 text-[11px] font-bold uppercase tracking-widest text-[#C8A000]">{TEXT.aiScore}</p>
                  <p className="text-[28px] font-black leading-none text-[#171611]">
                    {startup.score} <span className="text-[14px] font-bold text-slate-400">/100</span>
                  </p>
                  <p className="mt-2 inline-block rounded-md bg-white/60 px-2 py-0.5 text-[11px] font-bold text-[#C8A000]">
                    {TEXT.highFit}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="col-span-1 space-y-6 lg:col-span-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-[#171611]">{TEXT.dataRoom}</h3>
              <span className="text-[12px] font-medium text-slate-400">{TEXT.uploadedDocs}</span>
            </div>
            <div className="space-y-3">
              {docs.map((doc, idx) => (
                <div
                  key={`${doc.name}-${idx}`}
                  className="group flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 p-4 transition-all hover:border-[#e6cc4c]/40 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-100 bg-white shadow-sm transition-colors group-hover:bg-[#e6cc4c]/10">
                      <doc.icon className={cn("h-5 w-5", doc.color)} />
                    </div>
                    <div>
                      <p className="text-[14px] font-bold text-slate-700 transition-colors group-hover:text-[#171611]">{doc.name}</p>
                      <p className="mt-0.5 text-[11px] font-medium text-slate-400">
                        {doc.type} • {TEXT.uploadedAt}: {doc.date}
                      </p>
                    </div>
                  </div>
                  <FolderOpen className="h-5 w-5 text-slate-300 transition-colors group-hover:text-[#e6cc4c]" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-1 space-y-6 lg:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-2">
              <Brain className="h-5 w-5 text-[#e6cc4c]" />
              <h3 className="text-[16px] font-bold text-[#171611]">{TEXT.aiAutoReview}</h3>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-100/50 bg-emerald-50/50 p-5">
                <p className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-tight text-emerald-800">
                  <TrendingUp className="h-4 w-4" /> {TEXT.standoutStrengths}
                </p>
                <ul className="ml-4 list-disc space-y-2 text-[13px] font-medium leading-relaxed text-emerald-700">
                  <li>{TEXT.strength1}</li>
                  <li>{TEXT.strength2}</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-amber-100/50 bg-amber-50/50 p-5">
                <p className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-tight text-amber-800">
                  <AlertTriangle className="h-4 w-4" /> {TEXT.riskNotes}
                </p>
                <ul className="ml-4 list-disc space-y-2 text-[13px] font-medium leading-relaxed text-amber-700">
                  <li>{TEXT.risk1}</li>
                  <li>{TEXT.risk2}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
