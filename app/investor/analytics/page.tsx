"use client";

import { InvestorShell } from "@/components/investor/investor-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Send } from "lucide-react";
import { useState } from "react";

export default function InvestorAnalyticsPage() {
  const [message, setMessage] = useState("");

  const quickActions = [
    "Xu hướng AI tuần này",
    "Top ngành gọi vốn",
    "Tóm tắt theo khu vực",
    "Rủi ro & cơ hội",
  ];

  const handleSend = () => {
    if (message.trim()) {
      // Handle sending message to AI
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  const handleQuickAction = (action: string) => {
    setMessage(action);
  };

  return (
    <InvestorShell>
      <div className="h-[calc(100vh-200px)] flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">AI Investment Trends</h1>
          <p className="text-slate-600 mt-1">Hỏi AI về xu hướng đầu tư và cơ hội thị trường</p>
        </div>

        {/* Main Content - Centered */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-32">
          {/* AI Icon */}
          <div className="mb-8">
            <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-purple-600" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Chuyên gia Phân tích Đầu tư AI
          </h2>

          {/* Description */}
          <p className="text-center text-slate-600 max-w-2xl mb-8">
            Đặt câu hỏi về xu hướng đầu tư, tình hình thị trường, phân tích lĩnh vực,
            <br />
            và nhận thông tin chiến lược từ AI
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center max-w-2xl">
            {quickActions.map((action) => (
              <Button
                key={action}
                variant="outline"
                onClick={() => handleQuickAction(action)}
                className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400"
              >
                {action}
              </Button>
            ))}
          </div>
        </div>

        {/* Input Area - Fixed at Bottom */}
        <div className="-mx-6 border-t bg-white py-6 px-6">
          <div className="flex gap-3 items-center">
            <Input
              type="text"
              placeholder="Hỏi về xu hướng đầu tư, tình hình thị trường, lĩnh vực..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 h-12 px-4 border-slate-300 focus:ring-2 focus:ring-purple-500"
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim()}
              className="h-12 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5 mr-2" />
              Gửi
            </Button>
          </div>
        </div>
      </div>
    </InvestorShell>
  );
}


