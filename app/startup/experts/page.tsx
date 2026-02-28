"use client";

import { StartupShell } from "@/components/startup/startup-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Star, Search, Mail, Phone, DollarSign } from "lucide-react";
import { useState } from "react";

type Advisor = {
  id: number;
  name: string;
  initials: string;
  avatarColor: string;
  rating: number;
  reviews: number;
  expertise: string;
  expertiseColor: string;
  email: string;
  phone: string;
  pricePerHour: number;
  achievement: string;
  description: string;
};

const advisors: Advisor[] = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    initials: "NA",
    avatarColor: "bg-blue-500",
    rating: 4.8,
    reviews: 24,
    expertise: "AI & Technology",
    expertiseColor: "bg-blue-100 text-blue-700",
    email: "advisor1@example.com",
    phone: "0901234567",
    pricePerHour: 150,
    achievement: "Former CTO at Tech Giant, 15+ years in AI/ML",
    description: "Expert in AI strategy, product development, and scaling tech startups. Helped 20+ startups achieve Series A funding.",
  },
  {
    id: 2,
    name: "Trần Thị B",
    initials: "TB",
    avatarColor: "bg-purple-500",
    rating: 4.9,
    reviews: 35,
    expertise: "Marketing",
    expertiseColor: "bg-blue-100 text-blue-700",
    email: "advisor2@example.com",
    phone: "0909876543",
    pricePerHour: 120,
    achievement: "Former CMO at Fortune 500, 12+ years in Marketing",
    description: "Specializes in growth marketing, brand strategy, and go-to-market planning for tech startups.",
  },
  {
    id: 3,
    name: "Lê Văn C",
    initials: "LC",
    avatarColor: "bg-indigo-500",
    rating: 5,
    reviews: 18,
    expertise: "Fintech",
    expertiseColor: "bg-blue-100 text-blue-700",
    email: "advisor3@example.com",
    phone: "0905555666",
    pricePerHour: 200,
    achievement: "Co-founder of PayTech, 10+ years in Fintech",
    description: "Expert in fintech regulation, payment systems, and financial product development.",
  },
];

const industries = [
  "All Industries",
  "AI & Technology",
  "Marketing",
  "Fintech",
  "Healthcare",
];

export default function StartupAdvisorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("All Industries");
  const [viewDetailOpen, setViewDetailOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  
  // Request form state
  const [consultationTime, setConsultationTime] = useState("");
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("1");
  const [meetingLink, setMeetingLink] = useState("");

  const filteredAdvisors = advisors.filter((advisor) => {
    const matchesSearch = advisor.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = selectedIndustry === "All Industries" || advisor.expertise === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const handleViewDetail = (advisor: Advisor) => {
    setSelectedAdvisor(advisor);
    setViewDetailOpen(true);
  };

  const handleOpenRequest = (advisor: Advisor) => {
    setSelectedAdvisor(advisor);
    setRequestOpen(true);
  };

  const handleCloseViewDetail = () => {
    setViewDetailOpen(false);
    setSelectedAdvisor(null);
  };

  const handleCloseRequest = () => {
    setRequestOpen(false);
    setConsultationTime("");
    setTopic("");
    setDescription("");
    setDuration("1");
    setMeetingLink("");
  };

  const handleSendRequest = () => {
    // Handle send request logic here
    console.log({
      advisorId: selectedAdvisor?.id,
      consultationTime,
      topic,
      description,
      duration,
      meetingLink,
    });
    handleCloseRequest();
    setSelectedAdvisor(null);
  };

  return (
    <StartupShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Advisor</h1>
          <p className="text-slate-600">Tìm kiếm và kết nối với các chuyên gia</p>
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

        {/* Advisors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAdvisors.map((advisor) => (
            <Card key={advisor.id} className="border-slate-200 overflow-hidden">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Avatar and Info */}
                  <div className="flex items-start gap-3">
                    <div className={`w-14 h-14 rounded-full ${advisor.avatarColor} text-white flex items-center justify-center text-lg font-semibold shrink-0`}>
                      {advisor.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 mb-1">{advisor.name}</h3>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium text-slate-900">{advisor.rating}</span>
                        <span className="text-slate-500">({advisor.reviews})</span>
                      </div>
                    </div>
                  </div>

                  {/* Expertise Badge */}
                  <div>
                    <Badge className={`${advisor.expertiseColor} hover:${advisor.expertiseColor} border-0 font-normal`}>
                      {advisor.expertise}
                    </Badge>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 shrink-0" />
                      <span className="truncate">{advisor.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 shrink-0" />
                      <span>{advisor.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      <DollarSign className="w-4 h-4 shrink-0" />
                      <span>${advisor.pricePerHour}/hour</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
                      onClick={() => handleViewDetail(advisor)}
                    >
                      View Detail
                    </Button>
                    <Button 
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      onClick={() => handleOpenRequest(advisor)}
                    >
                      Request
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredAdvisors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">Không tìm thấy advisor phù hợp</p>
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
        {selectedAdvisor && (
          <>
            <DialogContent className="max-w-xl p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`w-20 h-20 rounded-full ${selectedAdvisor.avatarColor} text-white flex items-center justify-center text-2xl font-semibold shrink-0`}>
                    {selectedAdvisor.initials}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">{selectedAdvisor.name}</h2>
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.floor(selectedAdvisor.rating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-slate-300"
                          }`}
                        />
                      ))}
                      <span className="text-sm text-slate-600 ml-1">
                        {selectedAdvisor.rating} ({selectedAdvisor.reviews} reviews)
                      </span>
                    </div>
                    <Badge className={`${selectedAdvisor.expertiseColor} hover:${selectedAdvisor.expertiseColor} border-0 font-normal text-xs px-3 py-1`}>
                      {selectedAdvisor.expertise}
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
                  <p className="text-slate-900">{selectedAdvisor.email}</p>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4">
                  <label className="text-sm text-slate-500 block mb-1">Phone</label>
                  <p className="text-slate-900">{selectedAdvisor.phone}</p>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4">
                  <label className="text-sm text-slate-500 block mb-1">Hourly Rate</label>
                  <p className="text-slate-900 font-semibold">${selectedAdvisor.pricePerHour}/hour</p>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4">
                  <label className="text-sm text-slate-500 block mb-1">Achievement</label>
                  <p className="text-slate-900">{selectedAdvisor.achievement}</p>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-4">
                  <label className="text-sm text-slate-500 block mb-1">Description</label>
                  <p className="text-slate-900 leading-relaxed">{selectedAdvisor.description}</p>
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
                    handleOpenRequest(selectedAdvisor);
                  }}
                >
                  Request Consultation
                </Button>
              </div>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Request Consultation Modal */}
      <Dialog
        open={requestOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseRequest();
          }
        }}
      >
        {selectedAdvisor && (
          <>
            <DialogHeader>
              <DialogTitle>Request Consultation with {selectedAdvisor.name}</DialogTitle>
            </DialogHeader>
            
            <DialogContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-900 block mb-2">
                  Consultation Time
                </label>
                <Input
                  type="datetime-local"
                  value={consultationTime}
                  onChange={(e) => setConsultationTime(e.target.value)}
                  placeholder="mm/dd/yyyy --:-- --"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-900 block mb-2">
                  Topic
                </label>
                <Input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Product Strategy, Fundraising"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-900 block mb-2">
                  Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what you want to discuss..."
                  rows={4}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-900 block mb-2">
                  Duration (hours)
                </label>
                <Select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                >
                  <option value="1">1 hour</option>
                  <option value="2">2 hours</option>
                  <option value="3">3 hours</option>
                  <option value="4">4 hours</option>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-900 block mb-2">
                  Meeting Link (Optional)
                </label>
                <Input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  Estimated cost: <span className="font-semibold">${selectedAdvisor.pricePerHour * parseInt(duration)}/hour</span>. The advisor will confirm the consultation request.
                </p>
              </div>
            </DialogContent>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
                onClick={handleCloseRequest}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                onClick={handleSendRequest}
              >
                Send Request
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </StartupShell>
  );
}


