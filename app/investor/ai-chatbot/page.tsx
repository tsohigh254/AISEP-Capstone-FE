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
  HelpCircle,
  ChevronDown,
  ChevronUp,
  BrainCircuit
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { InvestorAgentChatStreamEndpoint } from "@/services/ai/ai.api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// --- Types & Constants ---

type MessageType = "user" | "ai";

interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
  blocks?: any[];
  suggestions?: string[];
  thought?: string;
  isThinking?: boolean;
  metadata?: {
    references?: Array<{ title: string; url: string; source_domain: string }>;
    caveats?: string[];
    grounding_summary?: any;
  };
  steps?: string[];
}

const NODE_LABELS: Record<string, string> = {
  followup_resolver: "Đang hiểu ngữ cảnh...",
  router: "Đang xác định ý định...",
  planner: "Đang lập kế hoạch tìm kiếm...",
  search: "Đang tìm kiếm thông tin...",
  source_selection: "Đang chọn lọc nguồn tin...",
  extract: "Đang đọc nội dung bài viết...",
  fact_builder: "Đang trích xuất sự thật...",
  claim_verifier: "Đang đối chiếu bằng chứng...",
  writer: "Đang tổng hợp câu trả lời...",
  scope_guard: "Đang kiểm tra phạm vi...",
};

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

function ProgressTimeline({ steps, isThinking }: { steps: string[]; isThinking: boolean }) {
  const [expanded, setExpanded] = useState(true);
  
  if (!isThinking && (!steps || steps.length === 0)) return null;

  return (
    <div className="w-full flex flex-col pl-1 mb-2 animate-in fade-in duration-500">
      <button 
        onClick={() => setExpanded(!expanded)} 
        className="flex items-center gap-1.5 w-fit group py-1"
      >
        <div className="relative flex items-center justify-center w-4 h-4">
          {isThinking ? (
            <>
              <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-emerald-400 opacity-20"></span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            </>
          ) : (
            <BrainCircuit className="w-3.5 h-3.5 text-slate-400" />
          )}
        </div>
        <span className="text-[13px] font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">
          {isThinking ? "Đang phân tích và tổng hợp dữ liệu..." : "Quy trình phân tích của AI"}
        </span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />}
      </button>
      
      {expanded && (
        <div className="mt-1.5 mb-1.5 pl-3.5 border-l-2 border-slate-200 text-[13px] text-slate-500 leading-relaxed py-0.5">
          <div className="flex flex-col gap-1.5">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-1 duration-300">
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                {NODE_LABELS[step] || step}
              </div>
            ))}
            {isThinking && (
               <div className="flex items-center gap-2 animate-pulse mt-0.5">
                 <div className="flex items-center gap-1 ml-1.5">
                    <span className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce" />
                    <span className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                 </div>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AIChatbotPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    // Lock body scroll on this page
    document.body.style.overflow = "hidden";

    // Restore thread ID if exists
    const savedThreadId = sessionStorage.getItem("ai_investor_thread_id");
    if (savedThreadId) {
      setThreadId(savedThreadId);
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    // Maintain or generate thread_id
    let currentThreadId = threadId;
    if (!currentThreadId) {
      currentThreadId = `thread_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      setThreadId(currentThreadId);
      sessionStorage.setItem("ai_investor_thread_id", currentThreadId);
    }

    const correlationId = `corr_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    console.log(`[AI Chat] Correlation ID: ${correlationId}`);

    const userMsg: Message = {
      id: Date.now().toString(),
      type: "user",
      content: text,
      timestamp: new Date(),
    };

    const aiId = `ai_${Date.now()}`;
    const aiPlaceholder: Message = {
      id: aiId,
      type: "ai",
      content: "",
      isThinking: true,
      timestamp: new Date(),
      steps: [],
    };

    // Add user message and AI placeholder in one update
    setMessages(prev => [...prev, userMsg, aiPlaceholder]);
    setInputValue("");
    setIsLoading(true);

    // Build endpoint: prefer backend proxy so auth + session work
    const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/$/, "");
    const endpoint = `${backendBase}${InvestorAgentChatStreamEndpoint}`;

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      const headers: Record<string, string> = { 
        "Content-Type": "application/json",
        "X-Correlation-Id": correlationId
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const resp = await fetch(endpoint, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ 
          query: text,
          thread_id: currentThreadId 
        }),
      });

      if (!resp.ok) {
        // try to show backend error message
        let bodyText = await resp.text();
        try { bodyText = JSON.parse(bodyText).message ?? JSON.stringify(JSON.parse(bodyText)); } catch {}
        setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: `Lỗi server: ${resp.status} ${bodyText}`, isThinking: false } : m));
        setIsLoading(false);
        return;
      }

      const reader = resp.body?.getReader();
      if (!reader) {
        const textBody = await resp.text();
        setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: textBody, isThinking: false } : m));
        setIsLoading(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";
      let finished = false;

      while (!finished) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const line = part.split("\n").find(l => l.startsWith("data: "));
          if (!line) continue;
          
          const data = line.slice(6).trim();
          if (data === "[DONE]") {
            finished = true;
            break;
          }

          // Try parse JSON event
          let evt: any = null;
          try {
            evt = JSON.parse(data);
          } catch (e) {
            continue;
          }

          const type = evt?.type;
          if (type === "progress" && evt.node) {
            setMessages(prev => prev.map(m => m.id === aiId ? { 
              ...m, 
              steps: [...(m.steps || []), evt.node].filter((v, i, a) => a.indexOf(v) === i) 
            } : m));
          } else if (type === "answer_chunk" && evt.content) {
            setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: (m.content ?? "") + evt.content } : m));
          } else if (type === "final_answer" && evt.content) {
            setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: evt.content, isThinking: false } : m));
          } else if (type === "final_metadata") {
            setMessages(prev => prev.map(m => m.id === aiId ? { 
              ...m, 
              metadata: {
                references: evt.references,
                caveats: evt.caveats,
                grounding_summary: evt.grounding_summary
              },
              // Also update suggestions if available in references
              suggestions: (evt.references || []).slice(0, 3).map((r: any) => r.title).filter(Boolean)
            } : m));
          } else if (type === "error") {
            setMessages(prev => prev.map(m => m.id === aiId ? { 
              ...m, 
              content: (m.content ?? "") + `\n\n⚠️ Lỗi hệ thống: ${evt.content}`,
              isThinking: false 
            } : m));
          }
        }
        if (finished) break;
      }

    } catch (err: any) {
      setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: `Lỗi khi kết nối: ${err?.message ?? String(err)}`, isThinking: false } : m));
    } finally {
      setIsLoading(false);
    }
  };

  const handleIntentClick = (label: string) => {
    handleSend(label);
  };

  return (
    <div className="-mt-6 flex flex-col h-[calc(100vh-130px)] max-w-[1100px] w-full px-2 mx-auto animate-in fade-in duration-500 overflow-hidden">
      
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
          {messages.map((msg) => {
            // Tự động bóc tách thẻ <think> nếu có (đối với dòng model deepseek hoặc custom prompt)
            let displayContent = msg.content || "";
            let displayThought = msg.thought || "";
            let isThinking = msg.isThinking;

            if (msg.type === "ai" && !msg.thought && displayContent.includes("<think>")) {
              const thinkStart = displayContent.indexOf("<think>");
              const thinkEnd = displayContent.indexOf("</think>");
              if (thinkEnd !== -1) {
                displayThought = displayContent.substring(thinkStart + 7, thinkEnd).trim();
                displayContent = (displayContent.substring(0, thinkStart) + displayContent.substring(thinkEnd + 8)).trim();
                isThinking = false;
              } else {
                displayThought = displayContent.substring(thinkStart + 7).trim();
                displayContent = displayContent.substring(0, thinkStart).trim();
                isThinking = true;
              }
            }

            return (
              <div 
                key={msg.id}
                className={cn(
                  "flex w-full",
                  msg.type === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn(
                  "max-w-[90%] flex flex-col",
                  msg.type === "user" ? "items-end" : "items-start"
                )}>
                  {/* Pipeline Steps (AI Only) */}
                  {msg.type === "ai" && (msg.steps || msg.isThinking) && (
                    <ProgressTimeline steps={msg.steps || []} isThinking={msg.isThinking || false} />
                  )}

                  {/* Bubble containing main completion text */}
                  {(displayContent || (msg.content && !isThinking && msg.type === "user")) ? (
                    <div className={cn(
                      "rounded-3xl text-[15px] leading-relaxed shadow-sm w-fit max-w-full break-words mt-1 overflow-hidden",
                      msg.type === "user" 
                        ? "bg-[#0f172a] text-white rounded-tr-none px-6 py-4" 
                        : "bg-white text-slate-800 rounded-tl-none border border-slate-200 px-6 py-4"
                    )}>
                      <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:text-white prose-a:text-blue-600 dark:prose-invert">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {displayContent || msg.content || ""}
                        </ReactMarkdown>
                      </div>

                      {/* References (AI Only) */}
                      {msg.type === "ai" && msg.metadata?.references && msg.metadata.references.length > 0 && (
                        <div className="mt-6 pt-4 border-t border-slate-100">
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Nguồn tham khảo</p>
                          <div className="flex flex-col gap-2">
                            {msg.metadata.references.map((ref, idx) => (
                              <a 
                                key={idx} 
                                href={ref.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 group/ref"
                              >
                                <div className="w-5 h-5 rounded-md bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover/ref:bg-[#eec54e]/10 group-hover/ref:text-[#eec54e] transition-colors">
                                  {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[13px] font-semibold text-slate-700 truncate group-hover/ref:text-[#eec54e] transition-colors">{ref.title}</p>
                                  <p className="text-[11px] text-slate-400 truncate">{ref.source_domain}</p>
                                </div>
                                <ArrowRight className="w-3 h-3 text-slate-300 group-hover/ref:text-[#eec54e] group-hover/ref:translate-x-0.5 transition-all" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Caveats (AI Only) */}
                      {msg.type === "ai" && msg.metadata?.caveats && msg.metadata.caveats.length > 0 && (
                        <div className="mt-4 p-3 rounded-xl bg-amber-50/50 border border-amber-100/50">
                          <div className="flex items-start gap-2">
                            <HelpCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider mb-1">Lưu ý về dữ liệu</p>
                              <ul className="list-disc list-inside space-y-1">
                                {msg.metadata.caveats.map((caveat, idx) => (
                                  <li key={idx} className="text-[12px] text-amber-700/80 leading-snug">{caveat}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}

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
            );
          })}

          {/* Loading is represented inside the AI placeholder bubble; no separate loading bubble here. */}
        </div>

        {/* Bottom UI (Intents + Input) */}
        <div className="bg-white border-t border-slate-100">
          {/* Quick Intent Carousel */}
          <div className="px-6 py-3 bg-slate-50/30 border-b border-slate-100/50">
            <div className="flex flex-wrap gap-2">
              {QUICK_INTENTS.map((intent) => (
                <button
                  key={intent.id}
                  onClick={() => handleIntentClick(intent.label)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[12px] font-bold text-slate-600 hover:border-[#eec54e] hover:text-[#eec54e] hover:bg-[#eec54e]/5 transition-all shadow-sm"
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
