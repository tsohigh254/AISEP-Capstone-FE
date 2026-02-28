"use client";

import { StartupShell } from "@/components/startup/startup-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Eye, X, Trash2, Star, AlertCircle, Link as LinkIcon } from "lucide-react";
import { useState } from "react";

type ConsultationStatus = "confirmed" | "pending" | "done" | "rejected";

type Consultation = {
  id: number;
  advisorName: string;
  topic: string;
  date: string;
  time: string;
  duration: string;
  status: ConsultationStatus;
  description: string;
  meetingLink: string;
  requestedAt: string;
};

const consultations: Consultation[] = [
  {
    id: 1,
    advisorName: "Nguyễn Văn A",
    topic: "Product Strategy",
    date: "2026-02-06",
    time: "14:00",
    duration: "2h",
    status: "confirmed",
    description: "Discuss product roadmap and go-to-market strategy",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    requestedAt: "2026-02-01 10:30",
  },
  {
    id: 2,
    advisorName: "Trần Thị B",
    topic: "Marketing & Growth",
    date: "2026-02-08",
    time: "10:00",
    duration: "1h",
    status: "pending",
    description: "Marketing strategy and user acquisition channels",
    meetingLink: "https://meet.google.com/xyz-abcd-efg",
    requestedAt: "2026-02-03 14:20",
  },
  {
    id: 3,
    advisorName: "Lê Văn C",
    topic: "Fundraising",
    date: "2026-01-30",
    time: "16:00",
    duration: "1.5h",
    status: "done",
    description: "Pitch deck review and investor outreach strategy",
    meetingLink: "https://meet.google.com/lmn-opqr-stu",
    requestedAt: "2026-01-25 09:15",
  },
  {
    id: 4,
    advisorName: "Phạm Văn D",
    topic: "Technical Architecture",
    date: "2026-01-28",
    time: "11:00",
    duration: "1h",
    status: "rejected",
    description: "System design and scalability discussion",
    meetingLink: "https://meet.google.com/pqr-stuv-wxy",
    requestedAt: "2026-01-20 16:45",
  },
];

const getStatusBadge = (status: ConsultationStatus) => {
  switch (status) {
    case "confirmed":
      return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">Confirmed</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-0">Pending</Badge>;
    case "done":
      return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-0">Done</Badge>;
    case "rejected":
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0">Rejected</Badge>;
  }
};

export default function ConsultationSchedulePage() {
  const [viewDetailOpen, setViewDetailOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleViewDetail = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setViewDetailOpen(true);
  };

  const handleCancelClick = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setCancelDialogOpen(true);
  };

  const handleDeleteClick = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setDeleteDialogOpen(true);
  };

  const handleFeedbackClick = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setFeedbackOpen(true);
  };

  const handleCancelConsultation = () => {
    console.log("Cancelling consultation:", selectedConsultation?.id);
    setCancelDialogOpen(false);
    setSelectedConsultation(null);
  };

  const handleDeleteConsultation = () => {
    console.log("Deleting consultation:", selectedConsultation?.id);
    setDeleteDialogOpen(false);
    setSelectedConsultation(null);
  };

  const handleSubmitFeedback = () => {
    console.log("Submitting feedback for:", selectedConsultation?.id, "Rating:", rating, "Comment:", comment);
    setFeedbackOpen(false);
    setSelectedConsultation(null);
    setRating(0);
    setComment("");
  };

  return (
    <StartupShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Consultation Schedule</h1>
          <p className="text-slate-600">Quản lý lịch tư vấn với advisor</p>
        </div>

        <div className="space-y-4">
          {consultations.map((consultation) => (
            <Card key={consultation.id} className="border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900 text-lg">{consultation.advisorName}</h3>
                      {getStatusBadge(consultation.status)}
                    </div>
                    <p className="text-slate-700 mb-3">{consultation.topic}</p>
                    <div className="flex items-center gap-6 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{consultation.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{consultation.time}</span>
                      </div>
                      <span>{consultation.duration}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleViewDetail(consultation)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    {consultation.status === "pending" && (
                      <button
                        onClick={() => handleCancelClick(consultation)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                    {(consultation.status === "rejected" || consultation.status === "pending") && (
                      <button
                        onClick={() => handleDeleteClick(consultation)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                    {consultation.status === "done" && (
                      <button
                        onClick={() => handleFeedbackClick(consultation)}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Star className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* View Detail Modal */}
      <Dialog
        open={viewDetailOpen}
        onOpenChange={(open) => {
          if (!open) {
            setViewDetailOpen(false);
          }
        }}
      >
        {selectedConsultation && (
          <>
            <DialogContent className="max-w-xl p-6">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Consultation Details</h2>
                <button
                  onClick={() => setViewDetailOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <label className="text-sm text-slate-500 block mb-1">Advisor</label>
                  <p className="text-slate-900 font-semibold">{selectedConsultation.advisorName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <label className="text-sm text-slate-500 block mb-1">Date</label>
                    <p className="text-slate-900">{selectedConsultation.date}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <label className="text-sm text-slate-500 block mb-1">Time</label>
                    <p className="text-slate-900">{selectedConsultation.time}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <label className="text-sm text-slate-500 block mb-1">Duration</label>
                    <p className="text-slate-900">{selectedConsultation.duration === "2h" ? "2 hours" : selectedConsultation.duration === "1h" ? "1 hour" : "1.5 hours"}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <label className="text-sm text-slate-500 block mb-1">Status</label>
                    <div>{getStatusBadge(selectedConsultation.status)}</div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <label className="text-sm text-slate-500 block mb-1">Topic</label>
                  <p className="text-slate-900">{selectedConsultation.topic}</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <label className="text-sm text-slate-500 block mb-1">Description</label>
                  <p className="text-slate-900">{selectedConsultation.description}</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <label className="text-sm text-slate-500 block mb-1">Meeting Link</label>
                  <a 
                    href={selectedConsultation.meetingLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <LinkIcon className="w-4 h-4" />
                    {selectedConsultation.meetingLink}
                  </a>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <label className="text-sm text-slate-500 block mb-1">Requested At</label>
                  <p className="text-slate-900">{selectedConsultation.requestedAt}</p>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  variant="outline"
                  className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
                  onClick={() => setViewDetailOpen(false)}
                >
                  Close
                </Button>
              </div>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setCancelDialogOpen(false);
          }
        }}
      >
        {selectedConsultation && (
          <>
            <DialogContent className="max-w-md p-6">
              <div className="flex flex-col items-center text-center">
                <button
                  onClick={() => setCancelDialogOpen(false)}
                  className="self-end text-slate-400 hover:text-slate-600 transition-colors mb-4"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-orange-600" />
                </div>

                <h2 className="text-xl font-semibold text-slate-900 mb-2">Cancel Consultation</h2>
                <p className="text-slate-600 mb-6">
                  Are you sure you want to cancel the consultation with <span className="font-semibold">{selectedConsultation.advisorName}</span>?
                </p>

                <div className="grid grid-cols-2 gap-3 w-full">
                  <Button
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                    onClick={() => setCancelDialogOpen(false)}
                  >
                    No, Keep It
                  </Button>
                  <Button
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={handleCancelConsultation}
                  >
                    Yes, Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteDialogOpen(false);
          }
        }}
      >
        {selectedConsultation && (
          <>
            <DialogContent className="max-w-md p-6">
              <div className="flex flex-col items-center text-center">
                <button
                  onClick={() => setDeleteDialogOpen(false)}
                  className="self-end text-slate-400 hover:text-slate-600 transition-colors mb-4"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>

                <h2 className="text-xl font-semibold text-slate-900 mb-2">Delete Consultation</h2>
                <p className="text-slate-600 mb-6">
                  Are you sure you want to delete this consultation? This action cannot be undone.
                </p>

                <div className="grid grid-cols-2 gap-3 w-full">
                  <Button
                    variant="outline"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                    onClick={() => setDeleteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleDeleteConsultation}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* Feedback Modal */}
      <Dialog
        open={feedbackOpen}
        onOpenChange={(open) => {
          if (!open) {
            setFeedbackOpen(false);
          }
        }}
      >
        {selectedConsultation && (
          <>
            <DialogContent className="max-w-xl p-6">
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-lg font-semibold text-slate-900">Feedback for {selectedConsultation.advisorName}</h2>
                <button
                  onClick={() => setFeedbackOpen(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm text-slate-700 font-medium block mb-3 text-center">Rating</label>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="transition-colors"
                      >
                        <Star
                          className={`w-12 h-12 ${
                            star <= (hoveredRating || rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-700 font-medium block mb-2">Comment</label>
                  <Textarea
                    placeholder="Share your experience with this consultation..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={5}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-6">
                <Button
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                  onClick={() => setFeedbackOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  onClick={handleSubmitFeedback}
                  disabled={rating === 0}
                >
                  Submit Feedback
                </Button>
              </div>
            </DialogContent>
          </>
        )}
      </Dialog>
    </StartupShell>
  );
}

