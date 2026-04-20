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

function ThoughtBlock({ thought, isThinking }: { thought: string; isThinking?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [simulatedSteps, setSimulatedSteps] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isThinking) {
      // Delay showing the thinking block by 800ms to simulate "reading" the user's message
      timeout = setTimeout(() => {
        setIsVisible(true);
        setExpanded(true); // Auto-expand when it finally appears
      }, 800);
    } else {
      setIsVisible(false); // Instantly hide when thinking is done
    }
    return () => clearTimeout(timeout);
  }, [isThinking]);

  useEffect(() => {
    if (isVisible && isThinking && !thought) {
      const steps = [
        "Đang phân tích ngữ nghĩa yêu cầu...",
        "Tra cứu biểu đồ xu hướng thị trường...",
        "Truy xuất dữ liệu dự án Startup...",
        "Đối chiếu các tiêu chí đầu tư...",
        "Định dạng kết quả đầu ra..."
      ];
      let currentStep = 0;
      setSimulatedSteps([steps[0]]);
      
      const interval = setInterval(() => {
        currentStep++;
        if (currentStep < steps.length) {
          setSimulatedSteps(prev => [...prev, steps[currentStep]]);
        }
      }, 4000); // Add a new step every 4s to simulate very deep pondering
      
      return () => clearInterval(interval);
    } else if (!isThinking) {
      setSimulatedSteps([]);
    }
  }, [isVisible, isThinking, thought]);

  if (!isThinking || !isVisible) return null;

  return (
    <div className="w-full flex flex-col pl-1 mb-1 animate-in fade-in duration-500">
      <button 
        onClick={() => setExpanded(!expanded)} 
        className="flex items-center gap-1.5 w-fit group py-1"
      >
        {isThinking ? (
          <div className="relative flex items-center justify-center w-4 h-4">
            <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-emerald-400 opacity-20"></span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          </div>
        ) : (
          <BrainCircuit className="w-3.5 h-3.5 text-slate-400" />
        )}
        <span className="text-[13px] font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">
          {isThinking ? "Đang phân tích và tổng hợp dữ liệu..." : "Quá trình tư duy của AI"}
        </span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400 ml-0.5" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />}
      </button>
      
      {expanded && (thought || isThinking) && (
        <div className="mt-1.5 mb-1.5 pl-3.5 border-l-2 border-slate-200 text-[13px] text-slate-500 font-mono whitespace-pre-wrap leading-relaxed py-0.5 break-words">
          {thought ? thought : (
            <div className="flex flex-col gap-1.5">
              {simulatedSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-1 duration-300">
                  <span className="w-1 h-1 rounded-full bg-slate-400" />
                  {step}
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
          )}
        </div>
      )}
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

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

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
    };

    // Add user message and AI placeholder in one update
    setMessages(prev => [...prev, userMsg, aiPlaceholder]);
    setInputValue("");
    setIsLoading(true);

    // Build endpoint: prefer backend proxy so auth + session work
    const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_AI_SERVICE_URL || "").replace(/\/$/, "");
    const endpoint = `${backendBase}/api/ai/investor-agent/chat/stream`;

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const resp = await fetch(endpoint, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ query: text }),
      });

      if (!resp.ok) {
        // try to show backend error message
        let bodyText = await resp.text();
        try { bodyText = JSON.parse(bodyText).message ?? JSON.stringify(JSON.parse(bodyText)); } catch {}
        setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: `Lỗi server: ${resp.status} ${bodyText}` } : m));
        setIsLoading(false);
        return;
      }

      const reader = resp.body?.getReader();
      if (!reader) {
        const textBody = await resp.text();
        setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: textBody } : m));
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

        const parts = buffer.split(/\r?\n\r?\n/);
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const lines = part.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
          for (const line of lines) {
            if (!line.startsWith("data:")) continue;
            const data = line.replace(/^data:\s?/, "").trim();
            if (data === "[DONE]") {
              finished = true;
              break;
            }

            // Try parse JSON event, otherwise append raw
            let evt: any = null;
            try {
              evt = JSON.parse(data);
            } catch (e) {
              setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: (m.content ?? "") + data } : m));
              continue;
            }

            const type = evt?.type;
            if (type === "thought_chunk" && evt.content) {
              setMessages(prev => prev.map(m => m.id === aiId ? { ...m, thought: (m.thought ?? "") + evt.content, isThinking: true } : m));
            } else if (type === "answer_chunk" && evt.content) {
              // Ensure we only set isThinking to false if it's the actual answer stream 
              // Wait, deepseek streams <think> block as answer_chunk initially!
              setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: (m.content ?? "") + evt.content } : m));
            } else if (type === "final_answer" && evt.content) {
              setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: (m.content ?? "") + evt.content, isThinking: false } : m));
            } else if (type === "final_metadata") {
              // attach simple suggestions from references (titles)
              const refs = evt.references ?? [];
              const suggestions = refs.map((r: any) => r.title).filter(Boolean);
              if (suggestions.length) {
                setMessages(prev => prev.map(m => m.id === aiId ? { ...m, suggestions } : m));
              }
            } else if (type === "error") {
              setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: (m.content ?? "") + `\n\nError: ${evt.content}` } : m));
            }
          }
          if (finished) break;
        }
      }

    } catch (err: any) {
      setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: `Lỗi khi kết nối: ${err?.message ?? String(err)}` } : m));
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
                  {/* Thought Block MUST be outside the chat bubble to float completely seamlessly */}
                  {msg.type === "ai" && (displayThought || isThinking) && (
                    <ThoughtBlock thought={displayThought} isThinking={isThinking} />
                  )}

                  {/* Bubble containing main completion text */}
                  {(displayContent || (msg.content && !isThinking && msg.type === "user")) ? (
                    <div className={cn(
                      "rounded-3xl text-[15px] leading-relaxed shadow-sm w-fit max-w-full break-words mt-1",
                      msg.type === "user" 
                        ? "bg-[#0f172a] text-white rounded-tr-none px-6 py-4" 
                        : "bg-white text-slate-800 rounded-tl-none border border-slate-200 px-6 py-4"
                    )}>
                      <div className="whitespace-pre-wrap">
                        {displayContent || msg.content}
                      </div>
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
