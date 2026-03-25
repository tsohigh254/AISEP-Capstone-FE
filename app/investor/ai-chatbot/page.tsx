"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Brain, 
  Send, 
  Sparkles, 
  TrendingUp, 
  Target, 
  Search, 
  Handshake, 
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  RefreshCcw,
  MessageSquare,
  Building2,
  Trash2,
  History,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// --- Types & Constants ---

type MessageType = "user" | "ai";

interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  blocks?: any[];
  suggestions?: string[];
}

const QUICK_INTENTS = [
  { id: "trends", label: "Tôi muốn tìm hiểu xu hướng đầu tư", icon: TrendingUp },
  { id: "recommend", label: "Tôi muốn khám phá startup phù hợp", icon: Target },
  { id: "analyze", label: "Tôi muốn tìm hiểu về một startup", icon: Search },
  { id: "compare", label: "Tôi muốn so sánh các startup", icon: RefreshCcw },
  { id: "why", label: "Tôi muốn biết vì sao startup này được đề xuất", icon: Brain },
  { id: "trust", label: "Tôi muốn xem startup đáng tin cậy hơn", icon: ShieldCheck },
];

// --- Mock Data ---

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome",
    type: "ai",
    content: "Chào mừng! Tôi là AI Investment Assistant. Tôi có thể giúp bạn phân tích thị trường, tìm kiếm Startup phù hợp và đưa ra các insight đầu tư chuẩn xác. Bạn muốn bắt đầu với chủ đề nào?",
    timestamp: new Date(),
    suggestions: [
      "Xu hướng nào nổi bật nhất?",
      "Tôi nên chú ý lĩnh vực nào?",
      "Có startup nào đáng xem không?"
    ]
  }
];

// --- Components ---

function InsightBlock({ title, description, badge }: { title: string; description: string; badge: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] px-5 py-4 mb-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase border border-emerald-100">{badge}</span>
      </div>
      <h4 className="text-[14px] font-bold text-slate-900 mb-1">{title}</h4>
      <p className="text-[13px] text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}

function StartupCard({ name, industry, stage, matchScore }: { name: string; industry: string; stage: string; matchScore: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden group hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all mb-3">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-lg">{name[0]}</div>
          <div className="flex-1">
            <h4 className="text-[14px] font-bold text-slate-900">{name}</h4>
            <p className="text-[12px] text-slate-400">{industry} • {stage}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-[#eec54e] uppercase tracking-wider mb-0.5">AI SCORE</p>
            <p className="text-[15px] font-bold text-slate-900">{matchScore}%</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 py-1.5 rounded-lg bg-slate-50 text-[12px] font-bold text-slate-600 hover:bg-slate-100 transition-colors">Xem Profile</button>
          <button className="flex-1 py-1.5 rounded-lg bg-[#0f172a] text-[12px] font-bold text-white hover:bg-[#1e293b] transition-colors">Kết nối</button>
        </div>
      </div>
    </div>
  );
}

export default function AIChatbotPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    // Lock body scroll on this page
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    // Mock AI Response
    setTimeout(() => {
      let aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: `Tôi đã ghi nhận mong muốn của bạn về: "${text}". Dưới đây là một số thông tin và phân tích AI liên quan.`,
        timestamp: new Date(),
        suggestions: ["Tìm hiểu sâu hơn", "So sánh với startup khác", "Tải báo cáo chi tiết"]
      };

      // Add conditional rich content based on keywords
      if (text.includes("xu hướng")) {
        aiResponse.blocks = [
          { type: 'insight', title: 'SaaS B2B tăng trưởng mạnh', description: 'Các startup trong mảng SaaS B2B tại Đông Nam Á đang nhận được sự quan tâm lớn nhờ dòng tiền ổn định và khả năng mở rộng nhanh.', badge: 'HOT TREND' },
          { type: 'insight', title: 'AI & Machine Learning', description: 'Ứng dụng AI vào quy trình sản xuất truyền thống đang là "đại dương xanh" mới cho các quỹ đầu tư mạo hiểm.', badge: 'EMERGING' }
        ];
      } else if (text.includes("phù hợp") || text.includes("khám phá")) {
        aiResponse.blocks = [
          { type: 'startup', name: 'TechAlpha', industry: 'Fintech', stage: 'Seed', matchScore: 92 },
          { type: 'startup', name: 'EcoFlow', industry: 'GreenTech', stage: 'Series A', matchScore: 88 }
        ];
      }

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const handleIntentClick = (label: string) => {
    handleSend(label);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-[950px] mx-auto animate-in fade-in duration-500 overflow-hidden">
      
      {/* Header - Compacted */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#eec54e] to-[#F0A500] flex items-center justify-center shadow-md shadow-[#eec54e]/20 flex-shrink-0">
            <Brain className="w-6 h-6 text-slate-900" />
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-slate-900 leading-tight">AI Investment Assistant</h1>
            <p className="text-[12px] text-slate-500">Hỏi về Startup, AI Insights, AI Recommend và cơ hội đầu tư</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-white rounded-3xl border border-slate-200/80 shadow-[0_1px_6px_rgba(0,0,0,0.03)] overflow-hidden relative">
        
        {/* Chat Thread */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-6 py-8 space-y-8 scroll-smooth no-scrollbar"
        >
          {messages.map((msg) => (
            <div 
              key={msg.id}
              className={cn(
                "flex w-full",
                msg.type === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn(
                "max-w-[85%] flex flex-col",
                msg.type === "user" ? "items-end" : "items-start"
              )}>
                {/* Bubble */}
                <div className={cn(
                  "px-5 py-4 rounded-3xl text-[14px] leading-relaxed shadow-sm",
                  msg.type === "user" 
                    ? "bg-[#0f172a] text-white rounded-tr-none" 
                    : "bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100"
                )}>
                  {msg.content}
                </div>

                {/* Rich Blocks (AI Only) */}
                {msg.blocks && msg.blocks.length > 0 && (
                  <div className="mt-4 w-full">
                    {msg.blocks.map((block, idx) => (
                      block.type === 'insight' ? (
                        <InsightBlock key={idx} {...block} />
                      ) : (
                        <StartupCard key={idx} {...block} />
                      )
                    ))}
                  </div>
                )}

                {/* Suggestions (AI Only, Last Message) */}
                {msg.type === "ai" && msg.suggestions && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {msg.suggestions.map((s, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleSend(s)}
                        className="px-3 py-1.5 rounded-full border border-slate-200 bg-white text-[12px] font-bold text-slate-500 hover:border-[#eec54e] hover:text-[#eec54e] transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-slate-400 mt-2 font-medium">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-50 border border-slate-100 px-5 py-4 rounded-3xl rounded-tl-none shadow-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        {/* Bottom UI (Intents + Input) */}
        <div className="bg-white border-t border-slate-100">
          {/* Quick Intent Carousel - MOVED HERE */}
          <div className="px-6 py-4 overflow-x-auto scrollbar-hide no-scrollbar whitespace-nowrap bg-slate-50/30">
            <div className="flex gap-2">
              {QUICK_INTENTS.map((intent) => (
                <button
                  key={intent.id}
                  onClick={() => handleIntentClick(intent.label)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-[13px] font-bold text-slate-700 hover:border-[#eec54e] hover:text-[#eec54e] hover:bg-[#eec54e]/5 transition-all shadow-sm"
                >
                  <intent.icon className="w-3.5 h-3.5" />
                  {intent.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-6 pt-2">
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend(inputValue)}
                placeholder="Hỏi về Startup, AI Insights, AI Recommend..."
                className="w-full pl-6 pr-14 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#eec54e]/20 focus:border-[#eec54e] focus:bg-white transition-all shadow-inner"
              />
              <button 
                onClick={() => handleSend(inputValue)}
                className="absolute right-2 w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-[#eec54e] hover:text-white hover:border-[#eec54e] active:scale-95 transition-all shadow-sm"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
