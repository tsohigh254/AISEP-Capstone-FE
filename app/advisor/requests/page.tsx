"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Eye, Check, X, User, Calendar, Mail, FileText, Lightbulb } from "lucide-react";
import { AdvisorShell } from "@/components/advisor/advisor-shell";

type ConsultationRequest = {
  id: string;
  companyName: string;
  companyInitials: string;
  companyColor: string;
  representative: string;
  date: string;
  time: string;
  email: string;
  description: string;
  aiAssessment?: string;
  aiRating?: string;
  projectFile?: string;
};

const requests: ConsultationRequest[] = [
  {
    id: "1",
    companyName: "Tech ABC",
    companyInitials: "T",
    companyColor: "bg-gradient-to-br from-purple-500 to-blue-500",
    representative: "Nguyễn Văn A",
    date: "20/12/2024",
    time: "14:00",
    email: "contact@techabc.com",
    description: "Cần tư vấn về chiến lược phát triển AI cho sản phẩm. Chúng tôi đang gặp khó khăn trong việc scale hệ thống và cần lời khuyên từ chuyên gia.",
    aiAssessment: "Dự án có tiềm năng cao, công nghệ sử dụng phù hợp với thị trường. Rating: 8.5/10",
    projectFile: "tech-abc-proposal.pdf",
  },
  {
    id: "2",
    companyName: "AI Solutions",
    companyInitials: "A",
    companyColor: "bg-gradient-to-br from-purple-500 to-blue-500",
    representative: "Trần Thị B",
    date: "22/12/2024",
    time: "10:00",
    email: "hello@aisolutions.com",
    description: "Cần tư vấn về chiến lược marketing và mở rộng thị trường cho sản phẩm AI của chúng tôi.",
    aiAssessment: "Dự án có tiềm năng tốt, cần cải thiện một số điểm về marketing. Rating: 7.5/10",
    projectFile: "ai-solutions-proposal.pdf",
  },
];

export default function AdvisorRequestsPage() {
  const [selectedRequest, setSelectedRequest] = useState<ConsultationRequest | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  const handleViewDetails = (request: ConsultationRequest) => {
    setSelectedRequest(request);
    setShowDetailDialog(true);
  };

  const handleAcceptClick = (request: ConsultationRequest) => {
    setSelectedRequest(request);
    setShowAcceptDialog(true);
  };

  const handleDeclineClick = (request: ConsultationRequest) => {
    setSelectedRequest(request);
    setDeclineReason("");
    setShowDeclineDialog(true);
  };

  const handleAcceptConfirm = () => {
    if (selectedRequest) {
      console.log("Accept request:", selectedRequest.id);
      // TODO: Implement accept logic
      setShowAcceptDialog(false);
      setSelectedRequest(null);
    }
  };

  const handleDeclineConfirm = () => {
    if (selectedRequest) {
      console.log("Decline request:", selectedRequest.id, "Reason:", declineReason);
      // TODO: Implement decline logic
      setShowDeclineDialog(false);
      setSelectedRequest(null);
      setDeclineReason("");
    }
  };

  return (
    <AdvisorShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Yêu cầu Tư vấn</h1>
          <p className="text-slate-600 mt-1">Quản lý yêu cầu từ startup</p>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Avatar className={`${request.companyColor} h-16 w-16`}>
                    <AvatarFallback className={`${request.companyColor} text-white text-2xl font-semibold`}>
                      {request.companyInitials}
                    </AvatarFallback>
                  </Avatar>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    {/* Company Name */}
                    <h3 className="text-lg font-semibold text-slate-900">
                      {request.companyName}
                    </h3>

                    {/* Requester */}
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="w-4 h-4" />
                      <span className="text-sm">{request.representative}</span>
                    </div>

                    {/* Date and Time */}
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{request.date} lúc {request.time}</span>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{request.email}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(request)}
                        className="border-slate-300 hover:bg-slate-50"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Xem chi tiết
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAcceptClick(request)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Chấp nhận
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeclineClick(request)}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Hủy
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">Chi tiết yêu cầu tư vấn</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Representative */}
                <div>
                  <Label className="text-sm font-medium text-slate-600">Người đại diện</Label>
                  <p className="text-base font-semibold text-slate-900 mt-1">
                    {selectedRequest.representative}
                  </p>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Ngày</Label>
                    <p className="text-base font-semibold text-slate-900 mt-1">
                      {selectedRequest.date}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Giờ</Label>
                    <p className="text-base font-semibold text-slate-900 mt-1">
                      {selectedRequest.time}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <Label className="text-sm font-medium text-slate-600">Email</Label>
                  <p className="text-base font-semibold text-slate-900 mt-1">
                    {selectedRequest.email}
                  </p>
                </div>

                {/* Description */}
                <div>
                  <Label className="text-sm font-medium text-slate-600">Mô tả dự án</Label>
                  <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                    {selectedRequest.description}
                  </p>
                </div>

                {/* AI Assessment */}
                {selectedRequest.aiAssessment && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <Label className="text-sm font-medium text-blue-900">Đánh giá AI</Label>
                        <p className="text-sm text-blue-800 mt-1">
                          {selectedRequest.aiAssessment}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Project File */}
                {selectedRequest.projectFile && (
                  <div>
                    <Label className="text-sm font-medium text-slate-600">File dự án</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <FileText className="w-4 h-4 text-slate-600" />
                      <button
                        className="text-sm text-blue-600 hover:underline"
                        onClick={() => {
                          // TODO: Handle file download
                        }}
                      >
                        {selectedRequest.projectFile}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDetailDialog(false)}
                >
                  Đóng
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    setShowDetailDialog(false);
                    handleAcceptClick(selectedRequest);
                  }}
                >
                  Chấp nhận
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Accept Dialog */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent className="max-w-md">
          {selectedRequest && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">Chấp nhận yêu cầu tư vấn?</DialogTitle>
                    <DialogDescription className="mt-1">
                      Bạn đang chấp nhận yêu cầu tư vấn từ {selectedRequest.companyName}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="py-4">
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      Thời gian: {selectedRequest.date} lúc {selectedRequest.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <User className="w-4 h-4" />
                    <span className="text-sm">
                      Người liên hệ: {selectedRequest.representative}
                    </span>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowAcceptDialog(false)}
                >
                  Hủy
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleAcceptConfirm}
                >
                  Xác nhận
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Decline Dialog */}
      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent className="max-w-md">
          {selectedRequest && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <X className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">Hủy yêu cầu tư vấn?</DialogTitle>
                    <DialogDescription className="mt-1">
                      Bạn đang hủy yêu cầu tư vấn từ {selectedRequest.companyName}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="py-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700">
                    Lý do hủy (tùy chọn)
                  </Label>
                  <Textarea
                    placeholder="Ví dụ: Lịch đã kín, không phù hợp chuyên môn..."
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDeclineDialog(false)}
                >
                  Hủy
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleDeclineConfirm}
                >
                  Xác nhận hủy
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdvisorShell>
  );
}
