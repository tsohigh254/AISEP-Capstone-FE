"use client";

import { StartupShell } from "@/components/startup/startup-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, Mail, Phone, MessageCircle, Send } from "lucide-react";
import { useState } from "react";

type Investor = {
  id: number;
  name: string;
  initials: string;
  avatarColor: string;
  industry: string;
  industryColor: string;
  email: string;
  phone: string;
  investmentFocus: string;
  description: string;
};

const investors: Investor[] = [
  {
    id: 1,
    name: "ABC Ventures",
    initials: "AV",
    avatarColor: "bg-red-500",
    industry: "AI & Technology",
    industryColor: "bg-orange-100 text-orange-700",
    email: "contact@abcventures.com",
    phone: "0901111222",
    investmentFocus: "AI & Technology",
    description: "Leading VC firm focused on early-stage AI and SaaS startups. Portfolio includes 50+ companies with 8 unicorns.",
  },
  {
    id: 2,
    name: "Tech Capital Partners",
    initials: "TC",
    avatarColor: "bg-red-500",
    industry: "Fintech",
    industryColor: "bg-orange-100 text-orange-700",
    email: "info@techcapital.com",
    phone: "0902222333",
    investmentFocus: "Fintech",
    description: "Specialized fintech investment firm with focus on payment solutions and financial infrastructure.",
  },
  {
    id: 3,
    name: "Innovation Fund",
    initials: "IF",
    avatarColor: "bg-red-500",
    industry: "Healthcare",
    industryColor: "bg-orange-100 text-orange-700",
    email: "hello@innovationfund.com",
    phone: "0903333444",
    investmentFocus: "Healthcare",
    description: "Healthcare-focused venture capital firm investing in digital health and biotech startups.",
  },
];

const industries = [
  "All Industries",
  "AI & Technology",
  "Marketing",
  "Fintech",
  "Healthcare",
];

export default function InvestorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All Industries");
  const [viewDetailOpen, setViewDetailOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const [message, setMessage] = useState("");

  const filteredInvestors = investors.filter((investor) => {
    const matchesSearch = investor.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = selectedIndustry === "All Industries" || investor.industry === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const handleViewDetail = (investor: Investor) => {
    setSelectedInvestor(investor);
    setViewDetailOpen(true);
  };

  const handleOpenMessage = (investor: Investor) => {
    setSelectedInvestor(investor);
    setMessageOpen(true);
  };

  const handleCloseViewDetail = () => {
    setViewDetailOpen(false);
    setSelectedInvestor(null);
  };

  const handleCloseMessage = () => {
    setMessageOpen(false);
    setMessage("");
  };

  const handleSendMessage = () => {
    console.log("Sending message to:", selectedInvestor?.name, "Message:", message);
    handleCloseMessage();
    setSelectedInvestor(null);
  };

  return (
    <StartupShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Investor</h1>
          <p className="text-slate-600">Kết nối với các nhà đầu tư tiềm năng</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by name..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="w-full sm:w-64"
          >
            {industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </Select>
        </div>

        {/* Investors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvestors.map((investor) => (
            <Card key={investor.id} className="border-slate-200 overflow-hidden">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Avatar and Info */}
                  <div className="flex items-start gap-3">
                    <div className={`w-14 h-14 rounded-full ${investor.avatarColor} text-white flex items-center justify-center text-lg font-semibold shrink-0`}>
                      {investor.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 mb-2">{investor.name}</h3>
                      <Badge className={`${investor.industryColor} hover:${investor.industryColor} border-0 font-normal text-xs`}>
                        {investor.industry}
                      </Badge>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 shrink-0" />
                      <span className="truncate">{investor.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 shrink-0" />
                      <span>{investor.phone}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
                      onClick={() => handleViewDetail(investor)}
                    >
                      View Detail
                    </Button>
                    <Button 
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      onClick={() => handleOpenMessage(investor)}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Message
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredInvestors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">Không tìm thấy investor phù hợp</p>
          </div>
        )}
      </div>

      {/* View Detail Modal */}
      <Dialog
        open={viewDetailOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseViewDetail();
          }
        }}
      >
        {selectedInvestor && (
          <>
            <DialogContent className="max-w-xl p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-20 h-20 rounded-full ${selectedInvestor.avatarColor} text-white flex items-center justify-center text-2xl font-semibold shrink-0`}>
                    {selectedInvestor.initials}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">{selectedInvestor.name}</h2>
                    <Badge className={`${selectedInvestor.industryColor} hover:${selectedInvestor.industryColor} border-0 font-normal text-xs px-3 py-1`}>
                      {selectedInvestor.industry}
                    </Badge>
                  </div>
                </div>
                <button
                  onClick={handleCloseViewDetail}
                  className="text-slate-400 hover:text-slate-600 transition-colors -mt-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <label className="text-sm text-slate-500 block mb-1">Email</label>
                  <p className="text-slate-900">{selectedInvestor.email}</p>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4">
                  <label className="text-sm text-slate-500 block mb-1">Phone</label>
                  <p className="text-slate-900">{selectedInvestor.phone}</p>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4">
                  <label className="text-sm text-slate-500 block mb-1">Investment Focus</label>
                  <p className="text-slate-900">{selectedInvestor.investmentFocus}</p>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4">
                  <label className="text-sm text-slate-500 block mb-1">Description</label>
                  <p className="text-slate-900 leading-relaxed">{selectedInvestor.description}</p>
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
                  onClick={handleCloseViewDetail}
                >
                  Close
                </Button>
                <Button 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  onClick={() => {
                    handleCloseViewDetail();
                    handleOpenMessage(selectedInvestor);
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Message Modal */}
      <Dialog
        open={messageOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseMessage();
          }
        }}
      >
        {selectedInvestor && (
          <>
            <DialogContent className="max-w-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Message {selectedInvestor.name}</h2>
                <button
                  onClick={handleCloseMessage}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-slate-50 rounded-lg text-center py-8 text-slate-400 text-sm mb-4">
                No messages yet
              </div>

              <div className="flex gap-2 mb-4">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && message.trim()) {
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 rounded-lg shrink-0"
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>

              <Button 
                variant="outline" 
                className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
                onClick={handleCloseMessage}
              >
                Close
              </Button>
            </DialogContent>
          </>
        )}
      </Dialog>
    </StartupShell>
  );
}

