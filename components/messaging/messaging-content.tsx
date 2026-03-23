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
} from "lucide-react";
import { useAuth } from "@/context/context";
import { useChat } from "@/hooks/useChat";
import {
    GetConversations,
    GetMessages,
    MarkConversationRead,
} from "@/services/messaging/messaging.api";

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

/* ------------------------------------------------------------------ */
/*  Message bubble with retry                                          */
/* ------------------------------------------------------------------ */

function MessageBubble({ msg, onRetry }: { msg: IMessage & { _failed?: boolean }; onRetry?: () => void }) {
    return (
        <div className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] flex flex-col gap-1 ${msg.isMine ? "items-end" : "items-start"}`}>
                <div className={`rounded-2xl px-4 py-3 ${
                    msg.isMine
                        ? msg._failed ? "bg-red-100 text-red-800" : "bg-[#e6cc4c] text-slate-900"
                        : "bg-slate-100 text-slate-900"
                }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                </div>
                <div className="flex items-center gap-1.5 px-2">
                    <span className="text-[10px] text-slate-400">{formatExact(msg.sentAt)}</span>
                    {msg._failed && onRetry && (
                        <button onClick={onRetry} className="flex items-center gap-1 text-[10px] text-red-500 hover:text-red-700 font-semibold">
                            <RefreshCw className="w-3 h-3" /> Thử lại
                        </button>
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
    const { user } = useAuth();

    const [conversations, setConversations] = useState<IConversation[]>([]);
    const [messages,      setMessages]      = useState<(IMessage & { _failed?: boolean })[]>([]);
    const [selectedId,    setSelectedId]    = useState<number | null>(null);
    const [filter,        setFilter]        = useState<"all" | "unread">("all");
    const [search,        setSearch]        = useState("");
    const [messageInput,  setMessageInput]  = useState("");
    const [loadingConvs,  setLoadingConvs]  = useState(true);
    const [convError,     setConvError]     = useState(false);
    const [loadingMsgs,   setLoadingMsgs]   = useState(false);
    const [msgError,      setMsgError]      = useState(false);
    const [sending,       setSending]       = useState(false);

    // Pagination for older messages
    const [msgPage,       setMsgPage]       = useState(1);
    const [hasOlderMsgs,  setHasOlderMsgs] = useState(false);
    const [loadingOlder,  setLoadingOlder]  = useState(false);

    const bottomRef    = useRef<HTMLDivElement>(null);
    const messagesRef  = useRef<HTMLDivElement>(null);

    const selected = (conversations ?? []).find(c => c.conversationId === selectedId) ?? null;

    /* ── Fetch conversations ── */
    const fetchConversations = useCallback(() => {
        setLoadingConvs(true);
        setConvError(false);
        GetConversations()
            .then(res => {
                if (res.success && res.data) {
                    setConversations(res.data.items ?? []);
                } else {
                    setConvError(true);
                }
            })
            .catch(() => setConvError(true))
            .finally(() => setLoadingConvs(false));
    }, []);

    useEffect(() => { fetchConversations(); }, [fetchConversations]);

    /* ── Fetch messages when conversation changes ── */
    useEffect(() => {
        if (selectedId == null) { setMessages([]); setMsgPage(1); setHasOlderMsgs(false); return; }
        setLoadingMsgs(true);
        setMsgError(false);
        setMsgPage(1);
        GetMessages(selectedId, 1, 50)
            .then(res => {
                if (res.success && res.data) {
                    setMessages([...res.data.items].reverse());
                    setHasOlderMsgs(res.data.paging.totalPages > 1);
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
                    const older = [...res.data.items].reverse();
                    setMessages(prev => [...older, ...prev]);
                    setMsgPage(nextPage);
                    setHasOlderMsgs(res.data.paging.totalPages > nextPage);
                    // Keep scroll position stable
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
                setMessages(prev => [
                    ...prev,
                    {
                        messageId:         incoming.messageId,
                        conversationId:    incoming.conversationId,
                        senderUserId:      incoming.senderId,
                        senderDisplayName: "",
                        isMine:            incoming.senderId === user?.userID,
                        content:           incoming.content,
                        attachmentUrls:    incoming.attachmentUrl,
                        isRead:            false,
                        sentAt:            incoming.createdAt,
                        readAt:            null,
                    },
                ]);
            } else {
                setConversations(prev =>
                    prev.map(c =>
                        c.conversationId === incoming.conversationId
                            ? { ...c, unreadCount: c.unreadCount + 1, lastMessagePreview: incoming.content, lastMessageAt: incoming.createdAt }
                            : c
                    )
                );
            }
        },
    });

    /* ── Send message ── */
    const handleSend = useCallback(() => {
        const text = messageInput.trim();
        if (!text || selectedId == null || sending) return;
        if (text.length > MAX_MESSAGE_LENGTH) return;

        const tempId = Date.now();
        const optimisticMsg: IMessage & { _failed?: boolean } = {
            messageId:         tempId,
            conversationId:    selectedId,
            senderUserId:      user?.userID ?? 0,
            senderDisplayName: user?.email ?? "",
            isMine:            true,
            content:           text,
            attachmentUrls:    null,
            isRead:            false,
            sentAt:            new Date().toISOString(),
            readAt:            null,
        };

        setMessages(prev => [...prev, optimisticMsg]);
        setMessageInput("");
        setSending(true);

        try {
            sendMessage(text);
        } catch {
            setMessages(prev => prev.map(m => m.messageId === tempId ? { ...m, _failed: true } : m));
        }
        setSending(false);

        // Update conversation preview
        setConversations(prev =>
            prev.map(c => c.conversationId === selectedId
                ? { ...c, lastMessagePreview: text, lastMessageAt: new Date().toISOString() }
                : c
            )
        );
    }, [messageInput, selectedId, sending, sendMessage, user]);

    /* ── Retry failed message ── */
    const retryMessage = useCallback((msg: IMessage & { _failed?: boolean }) => {
        setMessages(prev => prev.filter(m => m.messageId !== msg.messageId));
        setMessageInput(msg.content);
    }, []);

    /* ── Filter & sort ── */
    const filtered = conversations
        .filter(c => {
            if (filter === "unread" && !c.unreadCount) return false;
            if (search && !c.participantName.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        })
        .sort((a, b) => {
            const ta = a.lastMessageAt ?? a.createdAt;
            const tb = b.lastMessageAt ?? b.createdAt;
            return new Date(tb).getTime() - new Date(ta).getTime();
        });

    const inputTooLong = messageInput.length > MAX_MESSAGE_LENGTH;
    const conversationClosed = selected?.status === "Closed";

    /* ---------------------------------------------------------------- */
    /*  Render                                                           */
    /* ---------------------------------------------------------------- */

    return (
        <div className="flex-1 flex gap-6 lg:gap-10 min-h-[calc(100vh-220px)]">

            {/* ===== Left — conversation list ===== */}
            <div className="w-full md:w-[360px] flex flex-col shrink-0">
                {/* Search */}
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

                {/* List */}
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
                                    {/* Avatar */}
                                    <div className="relative shrink-0">
                                        {conv.participantAvatarUrl ? (
                                            <img
                                                alt={conv.participantName}
                                                className="size-12 rounded-full object-cover border-2 border-white shadow-sm"
                                                src={conv.participantAvatarUrl}
                                            />
                                        ) : (
                                            <div className={`size-12 rounded-full ${avatarBg[conv.participantRole]} flex items-center justify-center font-bold text-sm`}>
                                                {getInitials(conv.participantName) || <Icon className="w-6 h-6" />}
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <h4 className="font-bold text-sm text-slate-900 truncate">{conv.participantName}</h4>
                                            <span className={`text-[10px] whitespace-nowrap ml-2 font-bold ${isActive ? "text-[#e6cc4c]" : "text-slate-400"}`}>
                                                {formatRelative(conv.lastMessageAt)}
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

                                    {/* Unread badge */}
                                    {conv.unreadCount > 0 && (
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
                    {/* Chat header */}
                    <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {selected.participantAvatarUrl ? (
                                <img
                                    alt={selected.participantName}
                                    className="size-10 rounded-full object-cover border-2 border-white shadow-sm"
                                    src={selected.participantAvatarUrl}
                                />
                            ) : (
                                <div className={`size-10 rounded-full ${avatarBg[selected.participantRole]} flex items-center justify-center text-sm font-bold`}>
                                    {getInitials(selected.participantName)}
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
                            {/* Connection state indicator */}
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

                    {/* Messages */}
                    <div
                        ref={messagesRef}
                        className="flex-1 overflow-y-auto p-6 space-y-4"
                        style={{ scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent" }}
                    >
                        {/* Load older messages */}
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

                    {/* Input */}
                    {conversationClosed ? (
                        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
                            <div className="flex items-center justify-center gap-2 text-slate-400">
                                <Lock className="w-4 h-4" />
                                <p className="text-[13px] font-medium">Cuộc hội thoại này đã được đóng.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="px-6 py-4 border-t border-slate-200">
                            {inputTooLong && (
                                <p className="text-[11px] text-red-500 font-medium mb-2">
                                    Tin nhắn quá dài ({messageInput.length}/{MAX_MESSAGE_LENGTH} ký tự)
                                </p>
                            )}
                            <div className="flex items-center gap-2">
                                <input
                                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#e6cc4c]/30 focus:border-[#e6cc4c]/30 transition-all"
                                    placeholder="Nhập tin nhắn..."
                                    type="text"
                                    value={messageInput}
                                    onChange={e => setMessageInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                                    maxLength={MAX_MESSAGE_LENGTH + 100}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!messageInput.trim() || inputTooLong || sending}
                                    className="p-2.5 bg-[#e6cc4c] text-slate-900 rounded-xl hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <EmptyChat />
            )}
        </div>
    );
}
