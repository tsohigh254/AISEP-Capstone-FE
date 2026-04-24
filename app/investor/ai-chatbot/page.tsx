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
    content: "Xin chào! Tôi là **AISEP Chatbot Assistant** - trợ lý trí tuệ nhân tạo thế hệ mới của bạn. Tôi được tích hợp trực tiếp với Google Gemini 2.5 để mang đến cho bạn những phân tích đầu tư và startup chính xác nhất. Hôm nay tôi có thể giúp gì cho bạn?",
    timestamp: new Date(),
    suggestions: [
      "Phân tích xu hướng thị trường",
      "Tìm kiếm Startup tiềm năng",
      "So sánh các dự án đầu tư"
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
    // We've removed simulated steps as requested.
    // The thinking block will only show if there's real content to show or during active thinking.
    if (!isThinking) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, [isThinking]);

  if (!isThinking || !isVisible || thought) return null; // Only show if we have something or during actual thinking (though user asked to remove loading lines)

  // Actually, the user asked to "xóa các dòng loading này đi" (remove these loading lines).
  // So I will just return null for the entire ThoughtBlock if it's just doing simulated loading.
  if (!thought) return null;

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
        <span className="text-[13px] font-semibold text-emerald-600 group-hover:text-emerald-700 transition-colors">
          {isThinking ? "AISEP Gemini đang xử lý..." : "Chi tiết phân tích"}
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

function FormattedMessage({ content }: { content: string }) {
  const lines = content.split('\n');
  
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        // Handle Bullet points
        if (line.trim().startsWith('* ')) {
          const text = line.trim().substring(2);
          return (
            <div key={i} className="flex gap-2 pl-2">
              <span className="text-emerald-500 font-bold">•</span>
              <span>{renderText(text)}</span>
            </div>
          );
        }
        
        // Handle numbered lists (simple 1. 2. etc)
        const numMatch = line.trim().match(/^(\d+\.)\s+(.*)/);
        if (numMatch) {
          return (
            <div key={i} className="flex gap-2 pl-2">
              <span className="text-slate-400 font-bold min-w-[20px]">{numMatch[1]}</span>
              <span>{renderText(numMatch[2])}</span>
            </div>
          );
        }

        return <p key={i} className="min-h-[1em]">{renderText(line)}</p>;
      })}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-6 py-4 bg-white border border-slate-200 rounded-3xl rounded-tl-none shadow-sm w-fit animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
      </div>
      <span className="text-[13px] font-medium text-slate-400 ml-1">AISEP đang suy nghĩ...</span>
    </div>
  );
}

function renderText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
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
        try { bodyText = JSON.parse(bodyText).message ?? JSON.stringify(JSON.parse(bodyText)); } catch { }
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
    <div className="flex flex-col h-[calc(100vh-115px)] max-w-[1400px] w-full px-2 mx-auto animate-in fade-in duration-500 overflow-hidden">

      {/* Header - Compacted */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-slate-900 leading-tight">AISEP Chatbot Assistant</h1>
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
                  {msg.type === "ai" && isThinking && !displayContent && !displayThought ? (
                    <TypingIndicator />
                  ) : (displayContent || (msg.content && !isThinking && msg.type === "user")) ? (
                    <div className={cn(
                      "rounded-3xl text-[15px] leading-relaxed shadow-sm w-fit max-w-full break-words mt-1",
                      msg.type === "user"
                        ? "bg-[#0f172a] text-white px-6 py-4"
                        : "bg-white text-slate-800 border border-slate-200 px-6 py-4"
                    )}>
                      <div className="whitespace-pre-wrap">
                        <FormattedMessage content={displayContent || msg.content} />
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

        {/* Bottom UI (Input Area Only) */}
        <div className="bg-white border-t border-slate-100">
          {/* Input Area */}
          <div className="p-6 pt-4">
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
