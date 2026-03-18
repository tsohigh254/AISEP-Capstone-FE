"use client";

import { useState } from "react";
import { 
  ChevronRight, 
  Search, 
  Brain, 
  User, 
  Rocket, 
  ShieldAlert, 
  MoreVertical, 
  Paperclip, 
  Send, 
  Share2, 
  Plus, 
  DollarSign 
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type RoleBadge = "Cố vấn" | "Nhà đầu tư" | "Startup" | "Admin";

type Conversation = {
  id: number;
  name: string;
  avatar?: string;        // url — if omitted we use initials
  initials?: string;
  roleBadge: RoleBadge;
  lastMessage: string;
  timestamp: string;
  unread?: number;
  online?: boolean;
};

type Message = {
  id: number;
  sender: "me" | "them";
  content: string;
  timestamp: string;
};

/* ------------------------------------------------------------------ */
/*  Dummy data                                                         */
/* ------------------------------------------------------------------ */

const conversations: Conversation[] = [
  {
    id: 1,
    name: "Nguyễn Minh Quân",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBamSAgIdBhF59HFADawBPv60tsSfh8Sb6yw-5WfVZRQkTiSxgGvhcYG0UB_coZ2QIax8snICsFVk3ISQSkTQ1bhfKrNMOhQhz4DfFxddDzNrmbMa7JuZC76ce8mej04Q4QDiCEgqKxmz4mQHFNiUfVnTuQZw54IwqdsEwDGBdD6WDgGP1vDdLj6jkWCdfwB8uj9mQ2L4YaVfAXIgiG-ziorZYKUeZZzK722J1UbWx1S4IpDaeHsshbDdpX_2uDAQH1vPKII93P0Ns",
    roleBadge: "Cố vấn",
    lastMessage: "Cảm ơn bạn, tôi đã nhận được bản kế hoạch...",
    timestamp: "12:45",
    unread: 3,
    online: true,
  },
  {
    id: 2,
    name: "Trần Lê Hoàng",
    roleBadge: "Nhà đầu tư",
    lastMessage: "Chúng ta có thể hẹn lịch họp Zoom vào sáng...",
    timestamp: "Hôm qua",
    online: false,
  },
  {
    id: 3,
    name: "TechNext Startup",
    roleBadge: "Startup",
    lastMessage: "Tài liệu đánh giá AI v2.4 đã sẵn sàng...",
    timestamp: "2 ngày",
  },
  {
    id: 4,
    name: "Phạm Thùy Linh",
    initials: "PT",
    roleBadge: "Admin",
    lastMessage: "Hồ sơ của bạn đã được xác thực thành công.",
    timestamp: "24/05",
  },
];

const sampleMessages: Message[] = [
  {
    id: 1,
    sender: "them",
    content: "Chào bạn! Tôi đã xem qua bản pitch deck mới nhất. Nhìn chung rất ấn tượng, đặc biệt là phần phân tích thị trường.",
    timestamp: "12:30",
  },
  {
    id: 2,
    sender: "me",
    content: "Cảm ơn anh! Đội ngũ đã bỏ nhiều công sức vào phần đó. Anh có góp ý gì thêm không ạ?",
    timestamp: "12:32",
  },
  {
    id: 3,
    sender: "them",
    content: "Tôi nghĩ phần tài chính cần bổ sung thêm dự phóng cho 3 năm tới, và cần rõ ràng hơn về cơ cấu sử dụng vốn.",
    timestamp: "12:35",
  },
  {
    id: 4,
    sender: "me",
    content: "Noted ạ! Em sẽ cập nhật và gửi lại trong ngày mai. Cảm ơn anh đã review kỹ.",
    timestamp: "12:40",
  },
  {
    id: 5,
    sender: "them",
    content: "Cảm ơn bạn, tôi đã nhận được bản kế hoạch tài chính. Sẽ review trong tuần này nhé.",
    timestamp: "12:45",
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const badgeColors: Record<RoleBadge, string> = {
  "Cố vấn":     "bg-slate-100 text-slate-500",
  "Nhà đầu tư": "bg-blue-50 text-blue-600",
  "Startup":     "bg-purple-50 text-purple-600",
  "Admin":       "bg-amber-50 text-amber-600",
};

const avatarBg: Record<RoleBadge, string> = {
  "Cố vấn":     "bg-emerald-100 text-emerald-600",
  "Nhà đầu tư": "bg-blue-100 text-blue-600",
  "Startup":     "bg-purple-100 text-purple-600",
  "Admin":       "bg-amber-100 text-amber-600",
};

const avatarIcon: Record<RoleBadge, any> = {
  "Cố vấn":     Brain,
  "Nhà đầu tư": User,
  "Startup":     Rocket,
  "Admin":       ShieldAlert,
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function MessagingContent() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [search, setSearch] = useState("");
  const [messageInput, setMessageInput] = useState("");

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  const filtered = conversations.filter((c) => {
    if (filter === "unread" && !c.unread) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-4">
        <span className="hover:text-[#e6cc4c] transition-colors cursor-pointer">Workspace</span>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-600 font-semibold">Tin nhắn</span>
      </nav>

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
                onChange={(e) => setSearch(e.target.value)}
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

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent" }}>
            {filtered.map((conv) => {
              const isActive = selectedId === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={`p-3.5 flex gap-3 cursor-pointer rounded-2xl transition-all ${
                    isActive
                      ? "border-2 border-[#e6cc4c] bg-white shadow-sm ring-4 ring-[#e6cc4c]/5"
                      : "border border-transparent hover:bg-white hover:border-slate-200 hover:shadow-sm"
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {conv.avatar ? (
                      <img
                        alt={conv.name}
                        className="size-12 rounded-full object-cover border-2 border-white shadow-sm"
                        src={conv.avatar}
                      />
                    ) : conv.initials ? (
                      <div className={`size-12 rounded-full ${avatarBg[conv.roleBadge]} flex items-center justify-center font-bold text-sm`}>
                        {conv.initials}
                      </div>
                    ) : (
                      <div className={`size-12 rounded-full ${avatarBg[conv.roleBadge]} flex items-center justify-center`}>
                        {(() => {
                          const Icon = avatarIcon[conv.roleBadge];
                          return <Icon className="w-6 h-6" />;
                        })()}
                      </div>
                    )}
                    {conv.online !== undefined && (
                      <span className={`absolute bottom-0.5 right-0.5 size-3 border-2 border-white rounded-full ${conv.online ? "bg-emerald-500" : "bg-slate-300"}`} />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h4 className="font-bold text-sm text-slate-900 truncate">{conv.name}</h4>
                      <span className={`text-[10px] whitespace-nowrap ml-2 font-bold ${isActive ? "text-[#e6cc4c]" : "text-slate-400"}`}>
                        {conv.timestamp}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className={`text-[9px] px-1.5 py-0.5 font-bold rounded uppercase ${badgeColors[conv.roleBadge]}`}>
                        {conv.roleBadge}
                      </span>
                      {conv.online !== undefined && (
                        <>
                          <span className="size-1 bg-slate-300 rounded-full" />
                          <span className={`text-[10px] ${conv.online ? "text-emerald-600 font-medium" : "text-slate-400"}`}>
                            {conv.online ? "Đang hoạt động" : "Ngoại tuyến"}
                          </span>
                        </>
                      )}
                    </div>
                    <p className={`text-xs truncate ${conv.unread ? "text-slate-600 font-semibold" : "text-slate-500"}`}>
                      {conv.lastMessage}
                    </p>
                  </div>

                  {/* Unread badge */}
                  {conv.unread ? (
                    <div className="shrink-0 flex flex-col items-end justify-between">
                      <span className="size-5 bg-[#e6cc4c] flex items-center justify-center text-[10px] font-bold text-slate-900 rounded-full">
                        {conv.unread}
                      </span>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* ===== Right — Chat / Empty state ===== */}
        {selected ? (
          <div className="hidden md:flex flex-1 flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Chat header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selected.avatar ? (
                  <img alt={selected.name} className="size-10 rounded-full object-cover border-2 border-white shadow-sm" src={selected.avatar} />
                ) : (
                  <div className={`size-10 rounded-full ${avatarBg[selected.roleBadge]} flex items-center justify-center text-sm`}>
                    {selected.initials || (() => {
                      const Icon = avatarIcon[selected.roleBadge];
                      return <Icon className="w-5 h-5" />;
                    })()}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{selected.name}</h4>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] px-1.5 py-0.5 font-bold rounded uppercase ${badgeColors[selected.roleBadge]}`}>
                      {selected.roleBadge}
                    </span>
                    {selected.online && (
                      <>
                        <span className="size-1 bg-slate-300 rounded-full" />
                        <span className="text-[10px] text-emerald-600 font-medium">Đang hoạt động</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent" }}>
              {sampleMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] flex flex-col gap-1 ${msg.sender === "me" ? "items-end" : "items-start"}`}>
                    <div className={`rounded-2xl px-4 py-3 ${
                      msg.sender === "me"
                        ? "bg-[#e6cc4c] text-slate-900"
                        : "bg-slate-100 text-slate-900"
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 px-2">{msg.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#e6cc4c]/30 focus:border-[#e6cc4c]/30 transition-all"
                  placeholder="Nhập tin nhắn..."
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && messageInput.trim()) setMessageInput(""); }}
                />
                <button className="p-2.5 bg-[#e6cc4c] text-slate-900 rounded-xl hover:shadow-lg transition-all flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty state */
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
              <h3 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Trung tâm Kết nối AISEP</h3>
              <p className="text-slate-500 text-base leading-relaxed mb-10 max-w-md">
                Bạn muốn bắt đầu hành trình hôm nay như thế nào? Chọn một hành động nhanh để kết nối ngay với đối tác tiềm năng.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                <button className="group p-5 bg-white border border-slate-200 rounded-2xl hover:border-[#e6cc4c] hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col items-center gap-3">
                  <div className="size-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-slate-700">Chat với Nhà đầu tư</span>
                </button>
                <button className="group p-5 bg-white border border-slate-200 rounded-2xl hover:border-[#e6cc4c] hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col items-center gap-3">
                  <div className="size-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Rocket className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-slate-700">Kết nối Startup</span>
                </button>
                <button className="group p-5 bg-white border border-slate-200 rounded-2xl hover:border-[#e6cc4c] hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col items-center gap-3">
                  <div className="size-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Brain className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-slate-700">Nhắn tin Cố vấn</span>
                </button>
              </div>
              <div className="mt-12 flex items-center gap-2 text-slate-400">
                <div className="h-[1px] w-8 bg-slate-200" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Hoặc chọn từ danh sách bên trái</span>
                <div className="h-[1px] w-8 bg-slate-200" />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
