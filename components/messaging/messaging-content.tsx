"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    Search,
    Brain,
    User,
    Rocket,
    MoreVertical,
    Send,
    Share2,
    Plus,
    MessageSquare,
    AlertTriangle,
    RefreshCw,
    Loader2,
    ChevronUp,
    Lock,
    Paperclip,
    File as FileIcon,
    Database,
    Download,
    RefreshCcw,
    Check,
    CheckCheck,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/context";
import { useChat } from "@/hooks/useChat";
import { openDocumentInTab } from "@/lib/document-viewer";
import {
    GetConversations,
    CreateConversation,
    GetMessages,
    MarkConversationRead,
} from "@/services/messaging/messaging.api";
import { UploadChatAttachment } from "@/services/files/files.api";
import { PickDocumentModal } from "./pick-document-modal";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

type ParticipantRole = IConversation["participantRole"];

const roleLabel: Record<ParticipantRole, string> = {
    Investor: "Nhà đầu tư",
    Startup:  "Startup",
    Advisor:  "Cố vấn",
};

const badgeColors: Record<ParticipantRole, string> = {
    Advisor:  "bg-slate-100 text-slate-500",
    Investor: "bg-blue-50 text-blue-600",
    Startup:  "bg-purple-50 text-purple-600",
};

const avatarBg: Record<ParticipantRole, string> = {
    Advisor:  "bg-emerald-100 text-emerald-600",
    Investor: "bg-blue-100 text-blue-600",
    Startup:  "bg-purple-100 text-purple-600",
};

const avatarIcon: Record<ParticipantRole, React.FC<{ className?: string }>> = {
    Advisor:  Brain,
    Investor: User,
    Startup:  Rocket,
};

/** Relative time for conversation list */
function formatRelative(iso: string | null): string {
    if (!iso) return "";
    const date = new Date(iso);
    const now  = new Date();
    const days = Math.floor((now.getTime() - date.getTime()) / 86_400_000);
    if (days === 0) return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    if (days === 1) return "Hôm qua";
    if (days < 7)  return `${days} ngày trước`;
    return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
}

/** Exact time for message detail */
function formatExact(iso: string | null): string {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function getInitials(name: string) {
    return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

const MAX_MESSAGE_LENGTH = 2000;

function getConversationCreationErrorCode(payload: any) {
    return payload?.error?.code ?? payload?.code ?? null;
}

function getConversationCreationErrorMessage(payload: any) {
    const code = getConversationCreationErrorCode(payload);
    if (code === "MENTORSHIP_CHAT_NOT_AVAILABLE") {
        return "Chưa thể mở chat cho yêu cầu tư vấn này ở trạng thái hiện tại.";
    }

    return payload?.message || "Không thể mở cuộc trò chuyện. Vui lòng thử lại.";
}

/* ------------------------------------------------------------------ */
/*  Message bubble with retry                                          */
/* ------------------------------------------------------------------ */

function MessageBubble({ msg, onRetry }: { msg: IMessage & { _failed?: boolean }; onRetry?: () => void }) {
    const getFileName = (url: string) => {
        try {
            const parts = url.split("/");
            return decodeURIComponent(parts[parts.length - 1]);
        } catch {
            return "Attachment";
        }
    };

    const isImage = (url: string) => {
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
    };

    // Document proxy URL pattern: /api/documents/{id}/content
    // These need authenticated fetch (JWT in header) — direct <a href> won't work.
    const proxyDocumentMatch = (url: string): string | null => {
        const m = url.match(/^\/api\/documents\/(\d+)\/content$/);
        return m ? m[1] : null;
    };

    return (
        <div className={cn("flex w-full mb-2", msg.isMine ? "justify-end" : "justify-start")}>
            <div className={cn("flex flex-col max-w-[85%] md:max-w-[70%] min-w-0", msg.isMine ? "items-end" : "items-start")}>
                <div className={cn(
                    "px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed relative group max-w-full min-w-0",
                    msg.isMine 
                        ? "bg-[#0f172a] text-white rounded-tr-none" 
                        : "bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-sm"
                )}>
                    {msg.attachmentUrls && (() => {
                        const proxyDocId = proxyDocumentMatch(msg.attachmentUrls);
                        const attachmentClass = cn(
                            "flex w-full max-w-full min-w-0 items-center gap-3 p-2.5 rounded-xl border transition-all overflow-hidden cursor-pointer text-left",
                            msg.isMine
                                ? "bg-white/10 border-white/20 hover:bg-white/20"
                                : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                        );
                        const fileBubble = (
                            <>
                                <div className={cn(
                                    "size-9 rounded-lg flex items-center justify-center shrink-0",
                                    msg.isMine ? "bg-white/20" : "bg-white shadow-sm border border-slate-200"
                                )}>
                                    <FileIcon className={cn("size-4", msg.isMine ? "text-white" : "text-slate-500")} />
                                </div>
                                <div className="flex-1 min-w-0 pr-2">
                                    <p className={cn("block max-w-full text-[13px] font-medium truncate", msg.isMine ? "text-white" : "text-slate-900")}>
                                        {proxyDocId ? (msg.content || "Tài liệu") : getFileName(msg.attachmentUrls)}
                                    </p>
                                    <p className={cn("text-[10px] mt-0.5", msg.isMine ? "text-white/60" : "text-slate-400")}>
                                        Tài liệu đính kèm
                                    </p>
                                </div>
                                <Download className={cn("size-4 shrink-0", msg.isMine ? "text-white/60" : "text-slate-400")} />
                            </>
                        );

                        return (
                            <div className="mb-2 space-y-2 max-w-full min-w-0">
                                {isImage(msg.attachmentUrls) ? (
                                    <div className="relative rounded-lg overflow-hidden border border-slate-200/20 max-w-sm">
                                        <img
                                            src={msg.attachmentUrls}
                                            alt="Attachment"
                                            className="max-h-60 w-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => window.open(msg.attachmentUrls!, "_blank")}
                                        />
                                    </div>
                                ) : proxyDocId ? (
                                    <button
                                        type="button"
                                        onClick={() => openDocumentInTab(proxyDocId).catch(() => toast.error("Không mở được tài liệu — bạn có thể không có quyền truy cập."))}
                                        className={attachmentClass}
                                    >
                                        {fileBubble}
                                    </button>
                                ) : (
                                    <a
                                        href={msg.attachmentUrls}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={attachmentClass}
                                    >
                                        {fileBubble}
                                    </a>
                                )}
                            </div>
                        );
                    })()}
                    <div className="w-full max-w-full whitespace-pre-wrap break-all">{msg.content}</div>
                    {msg._failed && (
                        <button 
                            onClick={onRetry}
                            className="absolute -left-12 top-1/2 -translate-y-1/2 p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                            <RefreshCcw className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <div className="flex items-center gap-2 mt-1 px-1">
                    <span className="text-[10px] text-slate-400">
                        {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.isMine && (
                        <div className="flex items-center">
                            {msg.isRead ? (
                                <CheckCheck className="w-3 h-3 text-emerald-500" />
                            ) : (
                                <Check className="w-3 h-3 text-slate-300" />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Skeleton loaders                                                   */
/* ------------------------------------------------------------------ */

function ConversationSkeleton() {
    return (
        <div className="flex flex-col gap-2">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="p-3.5 rounded-2xl border border-slate-100 animate-pulse flex gap-3">
                    <div className="size-12 rounded-full bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                        <div className="h-3 bg-slate-200 rounded w-2/3" />
                        <div className="h-2.5 bg-slate-100 rounded w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function MessageSkeleton() {
    return (
        <div className="flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}>
                    <div className={`h-10 rounded-2xl animate-pulse bg-slate-100 ${i % 3 === 0 ? "w-56" : "w-40"}`} />
                </div>
            ))}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Role-aware empty states                                            */
/* ------------------------------------------------------------------ */

function EmptyConversationList({ userRole }: { userRole?: string }) {
    const isInvestor = userRole === "Investor";
    const isStartup  = userRole === "Startup";
    return (
        <div className="flex flex-col items-center justify-center pt-16 px-4 text-center">
            <div className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                <MessageSquare className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-[14px] font-bold text-slate-500 mb-1">
                {isInvestor ? "Chưa có hội thoại nào" : isStartup ? "Chưa có tin nhắn từ nhà đầu tư" : "Chưa có hội thoại nào"}
            </p>
            <p className="text-[12px] text-slate-400 leading-relaxed max-w-xs">
                {isInvestor
                    ? "Bắt đầu cuộc hội thoại từ trang hồ sơ startup."
                    : isStartup
                    ? "Tin nhắn từ nhà đầu tư sẽ hiển thị tại đây khi họ liên hệ startup của bạn."
                    : "Hội thoại sẽ hiển thị tại đây."}
            </p>
        </div>
    );
}

function EmptyChat() {
    return (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center relative px-6">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#e6cc4c]/5 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
                <div className="size-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-8 rotate-3 relative">
                    <Share2 className="w-12 h-12 text-[#e6cc4c]" />
                    <div className="absolute -top-3 -right-3 size-10 bg-[#e6cc4c] rounded-full shadow-lg flex items-center justify-center -rotate-3 border-4 border-[#fcfcf7]">
                        <Plus className="w-5 h-5 text-slate-900" />
                    </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Chọn một hội thoại</h3>
                <p className="text-slate-500 text-[14px] leading-relaxed max-w-md">
                    Chọn một hội thoại từ danh sách bên trái để bắt đầu trao đổi.
                </p>
                <div className="mt-8 flex items-center gap-2 text-slate-400">
                    <div className="h-[1px] w-8 bg-slate-200" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Chọn từ danh sách bên trái</span>
                    <div className="h-[1px] w-8 bg-slate-200" />
                </div>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Error state                                                        */
/* ------------------------------------------------------------------ */

function ErrorState({ onRetry }: { onRetry: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center pt-16 px-4 text-center">
            <div className="size-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                <AlertTriangle className="w-7 h-7 text-red-400" />
            </div>
            <p className="text-[14px] font-bold text-slate-600 mb-1">Không thể tải hội thoại</p>
            <p className="text-[12px] text-slate-400 mb-4">Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại.</p>
            <button
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-[13px] font-semibold hover:bg-slate-200 transition-all"
            >
                <RefreshCw className="w-3.5 h-3.5" /> Thử lại
            </button>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function MessagingContent() {
    const searchParams = useSearchParams();
    const connectionIdStr = searchParams.get("connectionId");
    const mentorshipIdStr = searchParams.get("mentorshipId");
    const conversationIdStr = searchParams.get("conversationId");
    const { user } = useAuth();

    const [conversations, setConversations] = useState<IConversation[]>([]);
    const [messages,      setMessages]      = useState<(IMessage & { _failed?: boolean })[]>([]);
    const [selectedId,    setSelectedId]    = useState<number | null>(null);
    const [filter,        setFilter]        = useState<"all" | "unread">("all");
    const [search,        setSearch]        = useState("");
    const [input,         setInput]         = useState("");
    const [loadingConvs,  setLoadingConvs]  = useState(true);
    const [convError,     setConvError]     = useState(false);
    const [loadingMsgs,   setLoadingMsgs]   = useState(false);
    const [msgError,      setMsgError]      = useState(false);
    const [sending,       setSending]       = useState(false);
    const [uploading,     setUploading]     = useState(false);
    const [showDocModal,  setShowDocModal]  = useState(false);

    // Pagination for older messages
    const [msgPage,       setMsgPage]       = useState(1);
    const [hasOlderMsgs,  setHasOlderMsgs] = useState(false);
    const [loadingOlder,  setLoadingOlder]  = useState(false);

    const bottomRef    = useRef<HTMLDivElement>(null);
    const messagesRef  = useRef<HTMLDivElement>(null);
    const textareaRef  = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const selected = (conversations ?? []).find(c => c.conversationId === selectedId) ?? null;

    /* ── Fetch conversations ── */
    const fetchConversations = useCallback(() => {
        setLoadingConvs(true);
        setConvError(false);
        GetConversations()
            .then(res => {
                if (res.success && res.data) {
                    const raw: IConversation[] = (res.data as any).data || res.data.items || [];
                    const seen = new Map<number, IConversation>();
                    for (const conv of raw) {
                        const key = conv.participantId ?? conv.conversationId;
                        const existing = seen.get(key);
                        if (!existing) {
                            seen.set(key, conv);
                        } else {
                            const existingTime = new Date(existing.lastMessageAt ?? existing.createdAt ?? 0).getTime();
                            const newTime = new Date(conv.lastMessageAt ?? conv.createdAt ?? 0).getTime();
                            if (newTime > existingTime) seen.set(key, conv);
                        }
                    }
                    setConversations(Array.from(seen.values()));
                } else {
                    setConvError(true);
                }
            })
            .catch(() => setConvError(true))
            .finally(() => setLoadingConvs(false));
    }, []);

    useEffect(() => {
        const handleAutoCreate = async () => {
            let createdId = null;
            try {
                if (conversationIdStr) {
                    createdId = parseInt(conversationIdStr);
                } else if (connectionIdStr) {
                    const res = await CreateConversation({ connectionId: parseInt(connectionIdStr) });
                    if ((res.success || res.isSuccess) && res.data) {
                        createdId = res.data.conversationId;
                    } else {
                        toast.error(getConversationCreationErrorMessage(res));
                    }
                } else if (mentorshipIdStr) {
                    const res = await CreateConversation({ mentorshipId: parseInt(mentorshipIdStr) });
                    if ((res.success || res.isSuccess) && res.data) {
                        createdId = res.data.conversationId;
                    } else {
                        toast.error(getConversationCreationErrorMessage(res));
                    }
                }
            } catch (error: any) {
                toast.error(getConversationCreationErrorMessage(error?.response?.data));
            }
            if (createdId) setSelectedId(createdId);
            fetchConversations();
        };

        if (connectionIdStr || mentorshipIdStr || conversationIdStr) {
            handleAutoCreate();
        } else {
            fetchConversations();
        }
    }, [connectionIdStr, mentorshipIdStr, conversationIdStr, fetchConversations]);

    /* ── Fetch messages when conversation changes ── */
    useEffect(() => {
        if (selectedId == null) { setMessages([]); setMsgPage(1); setHasOlderMsgs(false); return; }
        setLoadingMsgs(true);
        setMsgError(false);
        setMsgPage(1);
        GetMessages(selectedId, 1, 50)
            .then(res => {
                if (res.success && res.data) {
                    setMessages([...((res.data as any).data || res.data.items || [])].reverse());
                    setHasOlderMsgs(((res.data as any).total ? Math.ceil((res.data as any).total / 50) : (res.data.paging?.totalPages ?? 1)) > 1);
                } else {
                    setMsgError(true);
                }
            })
            .catch(() => setMsgError(true))
            .finally(() => setLoadingMsgs(false));
        MarkConversationRead(selectedId).catch(() => {});
        setConversations(prev =>
            prev.map(c => c.conversationId === selectedId ? { ...c, unreadCount: 0 } : c)
        );
    }, [selectedId]);

    /* ── Load older messages ── */
    const loadOlderMessages = useCallback(() => {
        if (!selectedId || loadingOlder || !hasOlderMsgs) return;
        const nextPage = msgPage + 1;
        setLoadingOlder(true);
        const prevScrollHeight = messagesRef.current?.scrollHeight ?? 0;
        GetMessages(selectedId, nextPage, 50)
            .then(res => {
                if (res.success && res.data) {
                    const older = [...((res.data as any).data || res.data.items || [])].reverse();
                    setMessages(prev => [...older, ...prev]);
                    setMsgPage(nextPage);
                    setHasOlderMsgs(((res.data as any).total ? Math.ceil((res.data as any).total / 50) : (res.data.paging?.totalPages ?? 1)) > nextPage);
                    requestAnimationFrame(() => {
                        if (messagesRef.current) {
                            messagesRef.current.scrollTop = messagesRef.current.scrollHeight - prevScrollHeight;
                        }
                    });
                }
            })
            .catch(() => {})
            .finally(() => setLoadingOlder(false));
    }, [selectedId, msgPage, loadingOlder, hasOlderMsgs]);

    /* ── Auto-scroll on new messages ── */
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    /* ── SignalR real-time ── */
    const { sendMessage, connectionState } = useChat({
        conversationId: selectedId,
        onMessage: (incoming: IIncomingMessage) => {
            if (incoming.conversationId === selectedId) {
                setMessages(prev => {
                    const tempIndex = prev.findIndex(m =>
                        m.isMine &&
                        m.content === incoming.content &&
                        m.messageId > 1000000000000
                    );

                    const isMine = tempIndex !== -1 ||
                                   String(incoming.senderId) === String(user?.userId) ||
                                   String(incoming.senderId) === String((user as any)?.id) ||
                                   String(incoming.senderId) === String((user as any)?.data?.userId);

                    if (isMine && tempIndex !== -1) {
                        const newMsgs = [...prev];
                        newMsgs[tempIndex] = {
                            ...newMsgs[tempIndex],
                            messageId: incoming.messageId,
                            sentAt: incoming.createdAt
                        };
                        return newMsgs;
                    }

                    return [
                        ...prev,
                        {
                            messageId:         incoming.messageId,
                            conversationId:    incoming.conversationId,
                            senderUserId:      incoming.senderId,
                            senderDisplayName: "",
                            isMine:            isMine,
                            content:           incoming.content,
                            attachmentUrls:    incoming.attachmentUrl,
                            isRead:            false,
                            sentAt:            incoming.createdAt,
                            readAt:            null,
                        } as IMessage,
                    ];
                });
            } else {
                setConversations(prev =>
                    prev.map(c =>
                        c.conversationId === incoming.conversationId
                            ? { ...c, unreadCount: (c.unreadCount ?? 0) + 1, lastMessagePreview: incoming.content, lastMessageAt: incoming.createdAt  }
                            : c
                    )
                );
            }
        },
    });

    /* ── Send message ── */
    const handleSend = async (content?: string, attachmentUrl?: string) => {
        const finalContent = content ?? input;
        if (!finalContent.trim() && !attachmentUrl) return;

        const tempId = Date.now();
        const optimisticMsg: IMessage & { _failed?: boolean } = {
            messageId:         tempId,
            conversationId:    selectedId!,
            senderUserId:      user?.userId ?? 0,
            senderDisplayName: user?.email ?? "",
            isMine:            true,
            content:           finalContent,
            attachmentUrls:    attachmentUrl ?? null,
            isRead:            false,
            sentAt:            new Date().toISOString(),
            readAt:            null,
        };

        setMessages(prev => [...prev, optimisticMsg]);
        setInput("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";

        try {
            await sendMessage(finalContent, attachmentUrl);
            setConversations(prev =>
                prev.map(c => c.conversationId === selectedId
                    ? { ...c, lastMessagePreview: finalContent, lastMessageAt: new Date().toISOString() }
                    : c
                )
            );
        } catch {
            setMessages(prev => prev.map(m => m.messageId === tempId ? { ...m, _failed: true } : m));
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        e.target.value = "";
        setUploading(true);
        try {
            const res = await UploadChatAttachment(file);
            if (res.isSuccess && res.data) {
                handleSend(undefined, res.data);
            } else {
                toast.error(res.message || "Tải lên thất bại");
            }
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Lỗi khi tải lên file");
        } finally {
            setUploading(false);
        }
    };

    /* ── Retry failed message ── */
    const retryMessage = useCallback((msg: IMessage & { _failed?: boolean }) => {
        setMessages(prev => prev.filter(m => m.messageId !== msg.messageId));
        setInput(msg.content);
    }, []);

    /* ── Filter & sort ── */
    const filtered = conversations
        .filter(c => {
            if (filter === "unread" && !c.unreadCount) return false;
            if (search && !c.participantName?.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        })
        .sort((a, b) => {
            const ta = a.lastMessageAt ?? a.createdAt;
            const tb = b.lastMessageAt ?? b.createdAt;
            return new Date(tb).getTime() - new Date(ta).getTime();
        });

    const inputTooLong = input.length > MAX_MESSAGE_LENGTH;
    const conversationClosed = selected?.status === "Closed";

    /* ---------------------------------------------------------------- */
    /*  Render                                                           */
    /* ---------------------------------------------------------------- */

    return (
        <div className="flex-1 flex gap-6 lg:gap-10 h-[calc(100vh-140px)] min-h-[500px]">

            {/* ===== Left — conversation list ===== */}
            <div className="w-full md:w-[360px] flex flex-col shrink-0">
                <div className="mb-6">
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#e6cc4c]/30 focus:border-[#e6cc4c]/30 transition-all shadow-sm"
                            placeholder="Tìm kiếm hội thoại..."
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setFilter("all")}
                            className={`px-5 py-2 text-xs font-bold rounded-full shadow-sm transition-colors ${
                                filter === "all"
                                    ? "bg-[#e6cc4c] text-slate-900"
                                    : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                            }`}
                        >
                            Tất cả
                        </button>
                        <button
                            onClick={() => setFilter("unread")}
                            className={`px-5 py-2 text-xs font-bold rounded-full transition-colors ${
                                filter === "unread"
                                    ? "bg-[#e6cc4c] text-slate-900 shadow-sm"
                                    : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                            }`}
                        >
                            Chưa đọc
                        </button>
                    </div>
                </div>

                <div
                    className="flex-1 overflow-y-auto space-y-2 pr-1"
                    style={{ scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent" }}
                >
                    {loadingConvs ? (
                        <ConversationSkeleton />
                    ) : convError ? (
                        <ErrorState onRetry={fetchConversations} />
                    ) : filtered.length === 0 ? (
                        search || filter === "unread"
                            ? <p className="text-center text-sm text-slate-400 pt-10">Không tìm thấy kết quả</p>
                            : <EmptyConversationList userRole={user?.userType} />
                    ) : (
                        filtered.map(conv => {
                            const isActive = selectedId === conv.conversationId;
                            const Icon = avatarIcon[conv.participantRole];
                            return (
                                <div
                                    key={conv.conversationId}
                                    onClick={() => setSelectedId(conv.conversationId)}
                                    className={`p-3.5 flex gap-3 cursor-pointer rounded-2xl transition-all ${
                                        isActive
                                            ? "border-2 border-[#e6cc4c] bg-white shadow-sm ring-4 ring-[#e6cc4c]/5"
                                            : "border border-transparent hover:bg-white hover:border-slate-200 hover:shadow-sm"
                                    }`}
                                >
                                    <div className="relative shrink-0">
                                        {conv.participantAvatarUrl ? (
                                            <img
                                                alt={conv.participantName}
                                                className="size-12 rounded-full object-cover border-2 border-white shadow-sm"
                                                src={conv.participantAvatarUrl}
                                            />
                                        ) : (
                                            <div className={`size-12 rounded-full ${avatarBg[conv.participantRole]} flex items-center justify-center font-bold text-sm`}>
                                                {getInitials(conv.participantName ?? "") || <Icon className="w-6 h-6" />}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <h4 className="font-bold text-sm text-slate-900 truncate">{conv.participantName ?? ""}</h4>
                                            <span className={`text-[10px] whitespace-nowrap ml-2 font-bold ${isActive ? "text-[#e6cc4c]" : "text-slate-400"}`}>
                                                {formatRelative(conv.lastMessageAt ?? "")}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span className={`text-[9px] px-1.5 py-0.5 font-bold rounded uppercase ${badgeColors[conv.participantRole]}`}>
                                                {roleLabel[conv.participantRole]}
                                            </span>
                                            {conv.status === "Closed" && (
                                                <span className="text-[9px] px-1.5 py-0.5 font-bold rounded bg-slate-100 text-slate-400">Đã đóng</span>
                                            )}
                                        </div>
                                        <p className={`text-xs truncate ${conv.unreadCount ? "text-slate-600 font-semibold" : "text-slate-500"}`}>
                                            {conv.lastMessagePreview ?? "Chưa có tin nhắn"}
                                        </p>
                                    </div>

                                    {(conv.unreadCount ?? 0) > 0 && (
                                        <div className="shrink-0 flex flex-col items-end justify-between">
                                            <span className="size-5 bg-[#e6cc4c] flex items-center justify-center text-[10px] font-bold text-slate-900 rounded-full">
                                                {conv.unreadCount}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* ===== Right — Chat / Empty state ===== */}
            {selected ? (
                <div className="hidden md:flex flex-1 flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {selected.participantAvatarUrl ? (
                                <img
                                    alt={selected.participantName ?? ""}
                                    className="size-10 rounded-full object-cover border-2 border-white shadow-sm"
                                    src={selected.participantAvatarUrl}
                                />
                            ) : (
                                <div className={`size-10 rounded-full ${avatarBg[selected.participantRole]} flex items-center justify-center text-sm font-bold`}>
                                    {getInitials(selected.participantName ?? "")}
                                </div>
                            )}
                            <div>
                                <h4 className="font-bold text-sm text-slate-900">{selected.participantName}</h4>
                                <span className={`text-[9px] px-1.5 py-0.5 font-bold rounded uppercase ${badgeColors[selected.participantRole]}`}>
                                    {roleLabel[selected.participantRole]}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {connectionState === "connected" && (
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    <span className="text-[10px] font-semibold text-emerald-600">Trực tuyến</span>
                                </div>
                            )}
                            {connectionState === "reconnecting" && (
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-50">
                                    <Loader2 className="w-3 h-3 text-amber-500 animate-spin" />
                                    <span className="text-[10px] font-semibold text-amber-600">Đang kết nối lại...</span>
                                </div>
                            )}
                            <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div
                        ref={messagesRef}
                        className="flex-1 overflow-y-auto p-6 space-y-4"
                        style={{ scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent" }}
                    >
                        {hasOlderMsgs && (
                            <div className="flex justify-center mb-2">
                                <button
                                    onClick={loadOlderMessages}
                                    disabled={loadingOlder}
                                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[12px] font-semibold text-slate-500 hover:bg-slate-100 transition-all disabled:opacity-50"
                                >
                                    {loadingOlder ? <Loader2 className="w-3 h-3 animate-spin" /> : <ChevronUp className="w-3 h-3" />}
                                    Tải tin nhắn cũ hơn
                                </button>
                            </div>
                        )}

                        {loadingMsgs ? (
                            <MessageSkeleton />
                        ) : msgError ? (
                            <ErrorState onRetry={() => setSelectedId(prev => { setSelectedId(null); setTimeout(() => setSelectedId(prev), 0); return prev; })} />
                        ) : messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <MessageSquare className="w-8 h-8 text-slate-200 mb-3" />
                                <p className="text-[13px] text-slate-400">Chưa có tin nhắn nào trong cuộc hội thoại này.</p>
                                <p className="text-[12px] text-slate-300 mt-1">Hãy gửi tin nhắn đầu tiên.</p>
                            </div>
                        ) : (
                            messages.map(msg => (
                                <MessageBubble
                                    key={msg.messageId}
                                    msg={msg}
                                    onRetry={msg._failed ? () => retryMessage(msg) : undefined}
                                />
                            ))
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {conversationClosed ? (
                        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
                            <div className="flex items-center justify-center gap-2 text-slate-400">
                                <Lock className="w-4 h-4" />
                                <p className="text-[13px] font-medium">Cuộc hội thoại này đã được đóng.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-end gap-3 p-4 bg-white border-t border-slate-100">
                                <div className="flex items-center gap-1 mb-1">
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        ref={fileInputRef} 
                                        onChange={handleFileSelect}
                                    />
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className={cn(
                                            "p-2 text-slate-400 hover:text-[#0f172a] hover:bg-slate-50 rounded-xl transition-all",
                                            uploading && "animate-pulse"
                                        )}
                                        title="Đính kèm file từ máy"
                                    >
                                        <Paperclip className="w-5 h-5" />
                                    </button>

                                    {user?.userType === "Startup" && (
                                        <button 
                                            onClick={() => setShowDocModal(true)}
                                            className="p-2 text-slate-400 hover:text-[#0f172a] hover:bg-slate-50 rounded-xl transition-all"
                                            title="Chọn tài liệu hệ thống"
                                        >
                                            <Database className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                                <div className="flex-1 relative">
                                    <textarea 
                                        ref={textareaRef}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                        placeholder="Viết tin nhắn..."
                                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0f172a]/5 focus:border-[#0f172a]/20 transition-all resize-none max-h-32"
                                        rows={1}
                                    />
                                </div>
                                <button 
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() || sending}
                                    className="p-2.5 bg-[#0f172a] text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-[#0f172a] transition-all shadow-sm mb-1"
                                >
                                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                </button>
                            </div>

                            <PickDocumentModal 
                                isOpen={showDocModal}
                                onClose={() => setShowDocModal(false)}
                                onSelect={(url, name) => {
                                    setShowDocModal(false);
                                    handleSend(`Tôi xin gửi file: ${name}`, url);
                                }}
                            />
                        </>
                    )}
                </div>
            ) : (
                <EmptyChat />
            )}
        </div>
    );
}
