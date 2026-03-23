"use client";

import React, { useState, useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import { StartupShell } from "@/components/startup/startup-shell";
import {
  Edit3, Video, Clock, MessageSquare,
  CheckCircle2, AlertCircle, Calendar, CalendarCheck,
  FileText, Star, Ban, X, BadgeCheck, ExternalLink,
  History as LucideHistory, Loader2, Info,
  CreditCard, ShieldCheck, RotateCcw, DollarSign, Lock,
  ShieldAlert, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { IssueReportModal } from "@/components/shared/issue-report-modal";

const formatVND = (n: number) => n.toLocaleString('vi-VN') + '₫';

// ─── Shared Mock Data ─────────────────────────────────────────────────────────

const AVATARS = {
  1: "https://lh3.googleusercontent.com/aida-public/AB6AXuDhY2B_40T_b8ifCFhZYE9RUfdodTMIq4hkMeAvPfCxdek8AhcikuKD11XDhYpXmtyvdSlnne2UWZDbdEO4TMXf17yrSsltdyX2-bBHPjbzbTxFQNPTgQkflvmeFd6QdGRvx0WBDDS0vnBvv-defpdnEB2zPF8-sAiLMhhfWCHe6M2UpyMAwTRdjcu8xSEmKOJ3aGlWMMK40SM6ThVvCpVFz_jvRfcX6dDBi4rDUGiVvfrUIHpezyewWd_4dYD9EbKusdQxomMZQhk",
  2: "https://lh3.googleusercontent.com/aida-public/AB6AXuCkeJpKLH89dtH6jy4p8OtegH6mL83JYobMLHvAQeMV-R-JV6ohyzLx5hQ2sZ387P-fztgR4sHa7EhmwJgbBTLxFVFskQsJI0Gohh4EB7LYt7pPNPIzVeMrNhIypAV8fJEz96dPqr4r8kUGO2XeJO1lDMfCEq0VHu2jl5963wBzE9lbl2WoMzmqdPjjGz-t_FAE1IFgbbvm8uMyf_V-UtsjIaqHKgVh5bF0DB5TQdrgyJ8kdtGF1397AobYsJYg8zAxOXwFyWtd32Q",
  3: "https://lh3.googleusercontent.com/aida-public/AB6AXuBd7t5ciDWV2eTaJsfniBll5lOH1FpM75D-rNgvvVbqucB9qLvuvCqdD2n7NevngnBF0iNuRrvyppt6TSVePvhTgOoUFPXs3COh1SFpjFFfpRM7AvqpVQYWIKMeh8ZaAHBQXX7A9LfSgc9hJLF86zECFTAuBW7cVPKthlob2LHXSFNJoAt5LewaefZBVBDzh253xnffFoI4o3adtsf5g77DpJi4MsoGYiv14LMA-ivJZaM5n2tz_QhJaAEUCzsxPuiFm3f6b9lC-GA",
};

type RequestStatus = "Requested" | "Accepted" | "Rejected" | "Scheduled" | "Completed" | "Cancelled";
type PaymentStatus = "UNPAID" | "CHECKOUT_PENDING" | "PAYMENT_FAILED" | "PAID_HELD" | "RELEASE_READY" | "RELEASED" | "REFUND_PENDING" | "REFUNDED" | "DISPUTED";

interface MockRequest {
  id: string;
  requestNo: string;
  status: RequestStatus;
  advisor: { id: number; name: string; title: string; avatar: string; rating: number; isVerified: boolean };
  topic: string;
  challenge: string;
  questions: string[];
  tags: string[];
  format: string;
  duration: string;
  sessionPrice?: number;
  paymentStatus?: PaymentStatus;
  paymentReference?: string;
  paidAt?: string;
  createdAt: string;
  rejectionReason?: string;
  proposedSlots?: { date: string; time: string }[];
  agreedTime?: { date: string; time: string; link: string; timezone: string };
  startupScheduleConfirmed?: boolean;
  advisorScheduleConfirmed?: boolean;
  conductedAt?: string;
  reportAvailable?: boolean;
  feedbackSubmitted?: boolean;
  timeline: { label: string; note: string; time: string; done: boolean; current?: boolean; failed?: boolean }[];
}

const MOCK_REQUESTS: MockRequest[] = [
  {
    id: "1",
    requestNo: "REQ-0001",
    status: "Requested",
    advisor: { id: 1, name: "Nguyễn Minh Quân", title: "Head of Product · TechGlobal", avatar: AVATARS[1], rating: 4.9, isVerified: true },
    topic: "Chiến lược tối ưu Product-Market Fit cho SaaS",
    challenge: "Chúng tôi đang gặp khó khăn trong việc tối ưu hóa tỷ lệ chuyển đổi (Conversion Rate) từ người dùng dùng thử nghiệm sang thuê bao trả phí. Dù lượng traffic hàng tháng tăng trưởng 20%, tỷ lệ chuyển đổi vẫn dậm chân ở mức 1.5%.",
    questions: [
      "Làm thế nào để xác định được 'Aha moment' thực sự của người dùng trong giai đoạn Trial?",
      "Chiến lược giá Tiered Pricing hiện tại có đang quá phức tạp cho người dùng mới không?",
      "Cách thiết lập hệ thống email automation hiệu quả để thúc đẩy nâng cấp tài khoản?",
    ],
    tags: ["SaaS Product", "Growth Strategy", "Monetization"],
    format: "Google Meet",
    duration: "60 phút",
    sessionPrice: 2000000,
    paymentStatus: "UNPAID",
    createdAt: "09:15 • 24/03/2024",
    timeline: [
      { label: "Yêu cầu đã gửi", note: "Yêu cầu tư vấn đã được tạo và gửi đến cố vấn.", time: "09:15 • 24/03/2024", done: true, current: true },
      { label: "Cố vấn phản hồi", note: "Đang chờ cố vấn xem xét và phản hồi.", time: "", done: false },
      { label: "Lịch xác nhận", note: "", time: "", done: false },
      { label: "Phiên diễn ra", note: "", time: "", done: false },
      { label: "Báo cáo có sẵn", note: "", time: "", done: false },
      { label: "Đã đánh giá", note: "", time: "", done: false },
    ],
  },
  {
    id: "2",
    requestNo: "REQ-0002",
    status: "Accepted",
    advisor: { id: 2, name: "Trần Thu Hà", title: "Investment Director · VCFund", avatar: AVATARS[2], rating: 5.0, isVerified: true },
    topic: "Gọi vốn Series A – Pitch Deck & Term Sheet",
    challenge: "Startup chúng tôi đang chuẩn bị cho vòng gọi vốn Series A. Cần được tư vấn cách hoàn thiện Pitch Deck, financial model, và cách thương lượng Term Sheet với nhà đầu tư.",
    questions: [
      "Những điểm yếu phổ biến trong Pitch Deck mà nhà đầu tư thường phàn nàn?",
      "Cách xây dựng financial model thuyết phục cho giai đoạn Series A?",
    ],
    tags: ["Fundraising", "Series A", "Pitch Deck"],
    format: "Google Meet",
    duration: "90 phút",
    sessionPrice: 3750000,
    paymentStatus: "UNPAID",
    createdAt: "09:00 • 12/03/2024",
    proposedSlots: [
      { date: "28 Tháng 3, 2024", time: "10:00 SA" },
      { date: "29 Tháng 3, 2024", time: "14:00 CH" },
      { date: "30 Tháng 3, 2024", time: "16:00 CH" },
    ],
    timeline: [
      { label: "Yêu cầu đã gửi", note: "Yêu cầu tư vấn đã được gửi thành công.", time: "09:00 • 12/03/2024", done: true },
      { label: "Cố vấn phản hồi", note: "Cố vấn đã chấp nhận yêu cầu và đề xuất các khung giờ.", time: "14:30 • 13/03/2024", done: true, current: true },
      { label: "Lịch xác nhận", note: "Đang chờ bạn xác nhận khung giờ phù hợp.", time: "", done: false },
      { label: "Phiên diễn ra", note: "", time: "", done: false },
      { label: "Báo cáo có sẵn", note: "", time: "", done: false },
      { label: "Đã đánh giá", note: "", time: "", done: false },
    ],
  },
  {
    id: "3",
    requestNo: "REQ-0003",
    status: "Scheduled",
    advisor: { id: 3, name: "Phạm Thành Long", title: "CTO & Co-founder · AI-Soft", avatar: AVATARS[3], rating: 4.8, isVerified: true },
    topic: "Xây dựng đội kỹ thuật cho giai đoạn scale",
    challenge: "Cần lời khuyên về cấu trúc team engineering khi scaling từ 5 lên 20+ người, quy trình tuyển dụng và on-boarding kỹ sư cấp senior.",
    questions: [
      "Cấu trúc team nào phù hợp khi scale từ startup đến growth stage?",
      "Quy trình tuyển dụng senior engineer hiệu quả?",
    ],
    tags: ["Engineering", "Team Building", "Scaling"],
    format: "Google Meet",
    duration: "60 phút",
    sessionPrice: 3000000,
    paymentStatus: "CHECKOUT_PENDING",
    createdAt: "09:00 • 10/03/2024",
    agreedTime: { date: "Thứ Ba, 26 Tháng 3, 2024", time: "14:00 – 15:00 CH (GMT+7)", link: "https://meet.google.com/abc-defg-hij", timezone: "GMT+7 (Ho Chi Minh)" },
    startupScheduleConfirmed: true,
    advisorScheduleConfirmed: true,
    timeline: [
      { label: "Yêu cầu đã gửi", note: "Yêu cầu tư vấn đã được gửi.", time: "09:00 • 10/03/2024", done: true },
      { label: "Cố vấn phản hồi", note: "Cố vấn chấp nhận yêu cầu.", time: "11:20 • 11/03/2024", done: true },
      { label: "Lịch xác nhận", note: "Cả hai bên đã xác nhận lịch hẹn.", time: "08:00 • 20/03/2024", done: true, current: true },
      { label: "Phiên diễn ra", note: "Đang chờ phiên tư vấn diễn ra.", time: "26/03/2024 14:00", done: false },
      { label: "Báo cáo có sẵn", note: "", time: "", done: false },
      { label: "Đã đánh giá", note: "", time: "", done: false },
    ],
  },
  {
    id: "4",
    requestNo: "REQ-0004",
    status: "Completed",
    advisor: { id: 1, name: "Nguyễn Minh Quân", title: "Head of Product · TechGlobal", avatar: AVATARS[1], rating: 4.9, isVerified: true },
    topic: "Chiến lược tăng trưởng người dùng Q2/2024",
    challenge: "Sau khi đạt Product-Market Fit, startup cần chiến lược cụ thể để scale người dùng từ 10K lên 100K MAU trong 2 quý.",
    questions: ["Kênh tăng trưởng nào phù hợp nhất cho SaaS B2B?"],
    tags: ["Growth", "B2B SaaS", "Marketing"],
    format: "Google Meet",
    duration: "60 phút",
    sessionPrice: 2000000,
    paymentStatus: "RELEASED",
    paymentReference: "PAY-20240315-0004",
    paidAt: "08:30 • 20/03/2024",
    createdAt: "09:00 • 05/03/2024",
    conductedAt: "15/03/2024",
    reportAvailable: true,
    feedbackSubmitted: false,
    timeline: [
      { label: "Yêu cầu đã gửi", note: "Yêu cầu đã được gửi.", time: "09:00 • 05/03/2024", done: true },
      { label: "Cố vấn phản hồi", note: "Cố vấn chấp nhận.", time: "10:00 • 06/03/2024", done: true },
      { label: "Lịch xác nhận", note: "Lịch hẹn đã được xác nhận.", time: "08:00 • 10/03/2024", done: true },
      { label: "Phiên diễn ra", note: "Phiên tư vấn đã hoàn thành.", time: "15:00 • 15/03/2024", done: true },
      { label: "Báo cáo có sẵn", note: "Cố vấn đã gửi báo cáo chi tiết.", time: "18:00 • 15/03/2024", done: true, current: true },
      { label: "Đã đánh giá", note: "Bạn chưa gửi đánh giá.", time: "", done: false },
    ],
  },
  {
    id: "5",
    requestNo: "REQ-0005",
    status: "Rejected",
    advisor: { id: 2, name: "Trần Thu Hà", title: "Investment Director · VCFund", avatar: AVATARS[2], rating: 5.0, isVerified: true },
    topic: "Tư vấn pháp lý cơ cấu công ty trước gọi vốn",
    challenge: "Cần tư vấn về cấu trúc pháp lý, cap table, và điều khoản shareholder agreement trước khi gọi vốn.",
    questions: ["Điều khoản nào trong SHA cần chú ý nhất?"],
    tags: ["Legal", "Cap Table", "SHA"],
    format: "Microsoft Teams",
    duration: "60 phút",
    createdAt: "09:00 • 01/03/2024",
    rejectionReason: "Xin lỗi, trong giai đoạn này tôi không có chuyên môn phù hợp để tư vấn về các vấn đề pháp lý cụ thể. Tôi khuyên bạn nên tìm một chuyên gia luật startup hoặc cố vấn pháp lý chuyên biệt.",
    timeline: [
      { label: "Yêu cầu đã gửi", note: "Yêu cầu đã được gửi.", time: "09:00 • 01/03/2024", done: true },
      { label: "Cố vấn phản hồi", note: "Cố vấn đã từ chối yêu cầu.", time: "16:00 • 02/03/2024", done: true, failed: true, current: true },
      { label: "Lịch xác nhận", note: "", time: "", done: false },
      { label: "Phiên diễn ra", note: "", time: "", done: false },
      { label: "Báo cáo có sẵn", note: "", time: "", done: false },
      { label: "Đã đánh giá", note: "", time: "", done: false },
    ],
  },
  {
    id: "6",
    requestNo: "REQ-0006",
    status: "Cancelled",
    advisor: { id: 3, name: "Phạm Thành Long", title: "CTO & Co-founder · AI-Soft", avatar: AVATARS[3], rating: 4.8, isVerified: true },
    topic: "Xây dựng OKR framework cho team vận hành",
    challenge: "Thiếu alignment giữa các team về mục tiêu hàng quý.",
    questions: [],
    tags: ["Operations", "OKR"],
    format: "Google Meet",
    duration: "60 phút",
    createdAt: "09:00 • 25/02/2024",
    timeline: [
      { label: "Yêu cầu đã gửi", note: "Yêu cầu đã được gửi.", time: "09:00 • 25/02/2024", done: true },
      { label: "Cố vấn phản hồi", note: "", time: "", done: false },
      { label: "Lịch xác nhận", note: "", time: "", done: false },
      { label: "Phiên diễn ra", note: "", time: "", done: false },
      { label: "Báo cáo có sẵn", note: "", time: "", done: false },
      { label: "Đã đánh giá", note: "", time: "", done: false },
    ],
  },
  {
    id: "7",
    requestNo: "REQ-0007",
    status: "Scheduled",
    advisor: { id: 2, name: "Trần Thu Hà", title: "Investment Director · VCFund", avatar: AVATARS[2], rating: 5.0, isVerified: true },
    topic: "Gọi vốn Seed – Investor Targeting",
    challenge: "Cần chiến lược tiếp cận danh sách nhà đầu tư Seed phù hợp với ngành và giai đoạn hiện tại của startup.",
    questions: ["Tiêu chí nào để lọc nhà đầu tư Seed phù hợp?", "Cách tiếp cận cold outreach hiệu quả với VC?"],
    tags: ["Fundraising", "Seed", "Investor Relations"],
    format: "Google Meet",
    duration: "90 phút",
    sessionPrice: 3750000,
    paymentStatus: "PAID_HELD",
    paymentReference: "PAY-20240312-0007",
    paidAt: "09:00 • 12/03/2024",
    createdAt: "08:00 • 10/03/2024",
    agreedTime: { date: "Thứ Năm, 13 Tháng 3, 2024", time: "10:00 – 11:30 SA (GMT+7)", link: "https://meet.google.com/xyz-abcd-efg", timezone: "GMT+7 (Ho Chi Minh)" },
    startupScheduleConfirmed: true,
    advisorScheduleConfirmed: true,
    timeline: [
      { label: "Yêu cầu đã gửi", note: "Yêu cầu đã được gửi.", time: "08:00 • 10/03/2024", done: true },
      { label: "Cố vấn phản hồi", note: "Cố vấn chấp nhận yêu cầu.", time: "10:00 • 11/03/2024", done: true },
      { label: "Lịch xác nhận", note: "Lịch hẹn đã được xác nhận.", time: "09:00 • 12/03/2024", done: true },
      { label: "Phiên diễn ra", note: "Đang chờ phiên tư vấn diễn ra.", time: "13/03/2024 10:00", done: false, current: true },
      { label: "Báo cáo có sẵn", note: "", time: "", done: false },
      { label: "Đã đánh giá", note: "", time: "", done: false },
    ],
  },
  {
    id: "8",
    requestNo: "REQ-0008",
    status: "Completed",
    advisor: { id: 3, name: "Phạm Thành Long", title: "CTO & Co-founder · AI-Soft", avatar: AVATARS[3], rating: 4.8, isVerified: true },
    topic: "Code review kiến trúc microservices",
    challenge: "Cần review toàn bộ kiến trúc microservices hiện tại để phát hiện bottleneck và rủi ro khi scale.",
    questions: ["Kiến trúc hiện tại có phù hợp để scale lên 1M request/ngày?"],
    tags: ["Engineering", "Architecture", "Microservices"],
    format: "Google Meet",
    duration: "60 phút",
    sessionPrice: 1500000,
    paymentStatus: "REFUNDED",
    paymentReference: "REF-20240310-0008",
    paidAt: "08:00 • 08/03/2024",
    createdAt: "09:00 • 06/03/2024",
    conductedAt: "10/03/2024",
    reportAvailable: true,
    feedbackSubmitted: true,
    timeline: [
      { label: "Yêu cầu đã gửi", note: "Yêu cầu đã được gửi.", time: "09:00 • 06/03/2024", done: true },
      { label: "Cố vấn phản hồi", note: "Cố vấn chấp nhận.", time: "14:00 • 07/03/2024", done: true },
      { label: "Lịch xác nhận", note: "Lịch hẹn đã xác nhận.", time: "08:00 • 08/03/2024", done: true },
      { label: "Phiên diễn ra", note: "Phiên tư vấn đã hoàn thành.", time: "10:00 • 10/03/2024", done: true },
      { label: "Báo cáo có sẵn", note: "Báo cáo đã được gửi.", time: "17:00 • 10/03/2024", done: true },
      { label: "Đã đánh giá", note: "Bạn đã gửi đánh giá.", time: "18:00 • 10/03/2024", done: true, current: true },
    ],
  },
  {
    id: "9",
    requestNo: "REQ-0009",
    status: "Scheduled",
    advisor: { id: 1, name: "Nguyễn Minh Quân", title: "Head of Product · TechGlobal", avatar: AVATARS[1], rating: 4.9, isVerified: true },
    topic: "Tối ưu hoá onboarding flow",
    challenge: "Churn rate ở tuần đầu tiên cao bất thường, cần tư vấn cải thiện onboarding để người dùng đạt Aha moment sớm hơn.",
    questions: ["Mô hình onboarding nào phù hợp với SaaS B2B?", "Cách đo lường hiệu quả onboarding?"],
    tags: ["Product", "Onboarding", "Retention"],
    format: "Google Meet",
    duration: "60 phút",
    sessionPrice: 2000000,
    paymentStatus: "PAYMENT_FAILED",
    createdAt: "08:30 • 05/03/2024",
    agreedTime: { date: "Thứ Tư, 06 Tháng 3, 2024", time: "14:00 – 15:00 CH (GMT+7)", link: "https://meet.google.com/pqr-stuv-wxy", timezone: "GMT+7 (Ho Chi Minh)" },
    startupScheduleConfirmed: true,
    advisorScheduleConfirmed: true,
    timeline: [
      { label: "Yêu cầu đã gửi", note: "Yêu cầu đã được gửi.", time: "08:30 • 05/03/2024", done: true },
      { label: "Cố vấn phản hồi", note: "Cố vấn chấp nhận.", time: "10:00 • 05/03/2024", done: true },
      { label: "Lịch xác nhận", note: "Lịch hẹn đã được xác nhận.", time: "08:00 • 06/03/2024", done: true, current: true },
      { label: "Phiên diễn ra", note: "Chờ thanh toán để xem lịch.", time: "", done: false },
      { label: "Báo cáo có sẵn", note: "", time: "", done: false },
      { label: "Đã đánh giá", note: "", time: "", done: false },
    ],
  },
];

// ─── Status Config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<RequestStatus, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  Requested:  { label: "Chờ phản hồi", color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-100",   icon: <Loader2 className="w-3.5 h-3.5 animate-spin" /> },
  Accepted:   { label: "Đã chấp nhận", color: "text-teal-700",   bg: "bg-teal-50",   border: "border-teal-100",   icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  Rejected:   { label: "Từ chối",      color: "text-red-600",    bg: "bg-red-50",    border: "border-red-100",    icon: <Ban className="w-3.5 h-3.5" /> },
  Scheduled:  { label: "Đã lên lịch",  color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-100", icon: <Calendar className="w-3.5 h-3.5" /> },
  Completed:  { label: "Hoàn thành",   color: "text-green-700",  bg: "bg-green-50",  border: "border-green-100",  icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  Cancelled:  { label: "Đã hủy",       color: "text-slate-500",  bg: "bg-slate-50",  border: "border-slate-200",  icon: <X className="w-3.5 h-3.5" /> },
};

// ─── Progress Stepper ──────────────────────────────────────────────────────────

function ProgressStepper({ steps }: { steps: MockRequest["timeline"] }) {
  return (
    <div className="flex items-start gap-0 w-full overflow-x-auto pb-1">
      {steps.map((step, i) => (
        <div key={i} className="flex-1 flex flex-col items-center min-w-[80px]">
          <div className="flex items-center w-full">
            {i > 0 && (
              <div className={cn("flex-1 h-0.5 -mr-0.5 mt-[-16px]", step.done ? "bg-[#eec54e]" : "bg-slate-200")} />
            )}
            <div className={cn(
              "w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10 transition-all",
              step.failed ? "bg-red-50 border-red-300 text-red-500" :
              step.done && step.current ? "bg-[#eec54e] border-[#eec54e] text-white shadow-[0_0_0_4px_rgba(238,197,78,0.15)]" :
              step.done ? "bg-[#eec54e] border-[#eec54e] text-white" :
              "bg-white border-slate-200 text-slate-300"
            )}>
              {step.failed
                ? <X className="w-3.5 h-3.5" />
                : step.done
                  ? <CheckCircle2 className="w-3.5 h-3.5" />
                  : <div className="w-2 h-2 rounded-full bg-current" />
              }
            </div>
            {i < steps.length - 1 && (
              <div className={cn("flex-1 h-0.5 -ml-0.5 mt-[-16px]", steps[i + 1]?.done ? "bg-[#eec54e]" : "bg-slate-200")} />
            )}
          </div>
          <p className={cn(
            "text-[10px] font-semibold mt-2 text-center leading-tight",
            step.failed ? "text-red-500" :
            step.done && step.current ? "text-[#b8902e]" :
            step.done ? "text-slate-600" : "text-slate-300"
          )}>
            {step.label}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function MentorshipRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();

  const request = MOCK_REQUESTS.find(r => r.id === id);
  if (!request) notFound();

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [localStatus, setLocalStatus] = useState<RequestStatus>(request.status);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleCancel = () => {
    setIsCancelling(true);
    setTimeout(() => {
      setIsCancelling(false);
      setIsCancelled(true);
      setLocalStatus("Cancelled");
      setShowCancelConfirm(false);
      setToast("Yêu cầu đã được hủy thành công.");
    }, 1200);
  };

  const cfg = STATUS_CONFIG[localStatus];

  return (
    <StartupShell>
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] px-5 py-3 bg-[#0f172a] text-white text-[13px] font-medium rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      <div className="max-w-[1280px] mx-auto space-y-6 pb-20 animate-in fade-in duration-500">

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[22px] font-bold text-slate-900 leading-none">{request.requestNo}</h1>
              <span className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border", cfg.color, cfg.bg, cfg.border)}>
                {cfg.icon}
                {cfg.label}
              </span>
            </div>
          </div>
          {(localStatus === "Requested") && !isCancelled && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setToast("Chức năng chỉnh sửa sẽ sớm được mở.")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-[13px] font-medium hover:bg-slate-50 transition-all"
              >
                <Edit3 className="w-4 h-4" />
                Chỉnh sửa
              </button>
              {showCancelConfirm ? (
                <div className="flex items-center gap-2">
                  <button onClick={handleCancel} disabled={isCancelling} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500 text-white text-[13px] font-semibold hover:bg-red-600 transition-all">
                    {isCancelling ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <X className="w-4 h-4" />}
                    Xác nhận hủy
                  </button>
                  <button onClick={() => setShowCancelConfirm(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-[13px] font-medium hover:bg-slate-50 transition-all">
                    Không
                  </button>
                </div>
              ) : (
                <button onClick={() => setShowCancelConfirm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-100 bg-red-50 text-red-600 text-[13px] font-medium hover:bg-red-100 transition-all">
                  <X className="w-4 h-4" />
                  Hủy yêu cầu
                </button>
              )}
            </div>
          )}
        </div>

        {/* Progress Stepper */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
          <div className="flex items-center gap-2 mb-5">
            <CalendarCheck className="w-4 h-4 text-amber-500" />
            <span className="text-[13px] font-bold text-slate-700">Tiến trình yêu cầu</span>
          </div>
          <ProgressStepper steps={request.timeline} />
        </div>

        {/* Rejection Banner */}
        {localStatus === "Rejected" && request.rejectionReason && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex gap-4">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-bold text-red-700 mb-1">Lý do từ chối</p>
              <p className="text-[13px] text-red-600 leading-relaxed">{request.rejectionReason}</p>
              <button
                onClick={() => router.push("/startup/experts")}
                className="mt-3 text-[12px] font-semibold text-red-700 underline underline-offset-2 hover:text-red-900 transition-colors"
              >
                Tìm cố vấn phù hợp hơn →
              </button>
            </div>
          </div>
        )}

        {/* Accepted: Proposed Slots Banner */}
        {localStatus === "Accepted" && request.proposedSlots && (
          <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5 flex gap-4 items-start">
            <Calendar className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[13px] font-bold text-teal-800 mb-2">Cố vấn đề xuất {request.proposedSlots.length} khung giờ</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {request.proposedSlots.map((slot, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white border border-teal-100 rounded-xl text-[12px] font-semibold text-teal-700">
                    {slot.date} · {slot.time}
                  </span>
                ))}
              </div>
              <div className="flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-100 rounded-xl mb-3">
                <Info className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11.5px] text-amber-700 leading-relaxed">
                  Sau khi xác nhận khung giờ, bạn sẽ được chuyển đến trang <span className="font-bold">thanh toán bắt buộc</span>. Phiên tư vấn chỉ được đặt chỗ sau khi thanh toán thành công.
                </p>
              </div>
              <button
                onClick={() => router.push(`/startup/mentorship-requests/${request.id}/confirm-schedule`)}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-[13px] font-semibold hover:bg-teal-700 transition-all shadow-sm"
              >
                <CalendarCheck className="w-4 h-4" />
                Chọn khung giờ & Thanh toán
              </button>
            </div>
          </div>
        )}

        {/* Scheduled: Session Card — LOCKED until payment confirmed */}
        {localStatus === "Scheduled" && request.agreedTime && (
          request.paymentStatus === "CHECKOUT_PENDING" || request.paymentStatus === "PAYMENT_FAILED" ? (
            // Payment not done yet — show schedule info WITHOUT meeting link
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-5 flex gap-4 items-start">
              <Calendar className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[13px] font-bold text-indigo-700 mb-1">Lịch hẹn đã xác nhận · Chờ thanh toán</p>
                <p className="text-[14px] font-semibold text-indigo-600">{request.agreedTime.date}</p>
                <p className="text-[12px] text-indigo-500 mt-0.5">{request.agreedTime.time}</p>
                <div className="flex items-center gap-2 mt-3 px-3.5 py-2.5 bg-white/70 border border-indigo-100 rounded-xl">
                  <Lock className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                  <p className="text-[12px] text-indigo-600 font-medium">Link tham gia phiên sẽ hiển thị sau khi bạn hoàn tất thanh toán.</p>
                </div>
              </div>
            </div>
          ) : (
            // Payment confirmed — show full session card with meeting link
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 flex gap-4 items-start">
              <Calendar className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-[13px] font-bold text-indigo-800 mb-1">Phiên tư vấn đã được lên lịch</p>
                <p className="text-[14px] font-semibold text-indigo-700">{request.agreedTime.date}</p>
                <p className="text-[12px] text-indigo-600 mt-0.5">{request.agreedTime.time}</p>
                <div className="flex items-center gap-3 mt-3">
                  <a href={request.agreedTime.link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-[12px] font-semibold hover:bg-indigo-700 transition-all shadow-sm">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Tham gia phiên
                  </a>
                  <div className={cn("flex items-center gap-1.5 text-[12px] font-medium", request.startupScheduleConfirmed ? "text-green-600" : "text-amber-600")}>
                    {request.startupScheduleConfirmed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    {request.startupScheduleConfirmed ? "Bạn đã xác nhận" : "Chờ bạn xác nhận"}
                  </div>
                  <div className={cn("flex items-center gap-1.5 text-[12px] font-medium", request.advisorScheduleConfirmed ? "text-green-600" : "text-amber-600")}>
                    {request.advisorScheduleConfirmed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                    {request.advisorScheduleConfirmed ? "Cố vấn đã xác nhận" : "Chờ cố vấn xác nhận"}
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        {/* Payment Status Card */}
        {request.sessionPrice && request.paymentStatus && request.paymentStatus !== "UNPAID" && (
          <>
            {request.paymentStatus === "CHECKOUT_PENDING" && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4 items-start">
                <CreditCard className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[13px] font-bold text-amber-800">Thanh toán đang chờ xử lý</p>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-wide">Chờ thanh toán</span>
                  </div>
                  <p className="text-[12px] text-amber-700 mb-4 leading-relaxed">
                    Lịch hẹn đã được xác nhận. Vui lòng hoàn tất thanh toán để giữ chỗ phiên tư vấn. Phiên sẽ bị huỷ nếu không thanh toán trong <span className="font-bold">24 giờ</span>.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-end gap-1">
                      <span className="text-[30px] font-black text-amber-700 leading-none">{formatVND(request.sessionPrice!)}</span>
                    </div>
                    <button
                      onClick={() => router.push(`/startup/mentorship-requests/${request.id}/checkout`)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl text-[13px] font-semibold hover:bg-amber-600 transition-all shadow-sm"
                    >
                      <CreditCard className="w-4 h-4" />
                      Thanh toán ngay
                    </button>
                  </div>
                </div>
              </div>
            )}

            {request.paymentStatus === "PAID_HELD" && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex gap-4 items-start">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[13px] font-bold text-emerald-800">Thanh toán đã được bảo đảm</p>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wide">Đang giữ</span>
                  </div>
                  <p className="text-[12px] text-emerald-700 leading-relaxed">
                    <span className="font-bold">{formatVND(request.sessionPrice!)}</span> đang được giữ an toàn bởi AISEP. Khoản thanh toán sẽ được giải phóng cho cố vấn sau khi phiên hoàn tất và bạn xác nhận.
                  </p>
                </div>
              </div>
            )}

            {request.paymentStatus === "RELEASE_READY" && (
              <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 flex gap-4 items-start">
                <DollarSign className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[13px] font-bold text-teal-800">Sẵn sàng giải phóng thanh toán</p>
                    <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-[10px] font-bold uppercase tracking-wide">Chờ xác nhận</span>
                  </div>
                  <p className="text-[12px] text-teal-700 mb-3 leading-relaxed">
                    Phiên tư vấn đã hoàn thành. Xác nhận để giải phóng <span className="font-bold">{formatVND(request.sessionPrice!)}</span> cho cố vấn.
                  </p>
                  <button
                    onClick={() => {}}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl text-[12px] font-semibold hover:bg-teal-700 transition-all shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Xác nhận & giải phóng thanh toán
                  </button>
                </div>
              </div>
            )}

            {request.paymentStatus === "RELEASED" && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex gap-4 items-start">
                <CheckCircle2 className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[13px] font-bold text-slate-600">Thanh toán hoàn tất</p>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-wide">Hoàn thành</span>
                  </div>
                  <p className="text-[12px] text-slate-500">
                    <span className="font-bold">{formatVND(request.sessionPrice!)}</span> đã được giải phóng cho cố vấn.
                  </p>
                  {request.paymentReference && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      Mã giao dịch: <span className="font-mono font-semibold">{request.paymentReference}</span>
                      {request.paidAt && <span className="ml-2">· {request.paidAt}</span>}
                    </p>
                  )}
                </div>
              </div>
            )}

            {request.paymentStatus === "REFUND_PENDING" && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 flex gap-4 items-start">
                <RotateCcw className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[13px] font-bold text-orange-700">Đang xử lý hoàn tiền</p>
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-[10px] font-bold uppercase tracking-wide">Chờ hoàn tiền</span>
                  </div>
                  <p className="text-[12px] text-orange-600 leading-relaxed">
                    Yêu cầu hoàn tiền <span className="font-bold">{formatVND(request.sessionPrice!)}</span> đang được xử lý. Thường mất 3–5 ngày làm việc.
                  </p>
                </div>
              </div>
            )}

            {request.paymentStatus === "REFUNDED" && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-4 items-start">
                <RotateCcw className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[13px] font-bold text-blue-700">Đã hoàn tiền</p>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wide">Hoàn tiền</span>
                  </div>
                  <p className="text-[12px] text-blue-600">
                    <span className="font-bold">{formatVND(request.sessionPrice!)}</span> đã được hoàn lại vào phương thức thanh toán của bạn.
                  </p>
                </div>
              </div>
            )}

            {request.paymentStatus === "DISPUTED" && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex gap-4 items-start">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[13px] font-bold text-red-700">Đang xử lý tranh chấp</p>
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-bold uppercase tracking-wide">Tranh chấp</span>
                  </div>
                  <p className="text-[12px] text-red-600 leading-relaxed">
                    Thanh toán <span className="font-bold">{formatVND(request.sessionPrice!)}</span> đang trong quá trình tranh chấp. Đội ngũ AISEP sẽ liên hệ trong vòng <span className="font-bold">48 giờ</span>.
                  </p>
                </div>
              </div>
            )}

            {request.paymentStatus === "PAYMENT_FAILED" && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex gap-4 items-start">
                <CreditCard className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[13px] font-bold text-red-700">Thanh toán thất bại</p>
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-bold uppercase tracking-wide">Thất bại</span>
                  </div>
                  <p className="text-[12px] text-red-600 mb-3">Giao dịch <span className="font-bold">{formatVND(request.sessionPrice!)}</span> không thành công. Vui lòng thử lại.</p>
                  <button
                    onClick={() => router.push(`/startup/mentorship-requests/${request.id}/checkout`)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-[12px] font-semibold hover:bg-red-600 transition-all shadow-sm"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Thử lại thanh toán
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Completed: Report & Feedback Banner */}
        {localStatus === "Completed" && request.reportAvailable && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-5 flex gap-4 items-start">
            <FileText className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-[13px] font-bold text-green-800 mb-1">Báo cáo tư vấn đã có sẵn</p>
              <p className="text-[12px] text-green-700 mb-3">Cố vấn đã hoàn thành và gửi báo cáo chi tiết sau phiên tư vấn.</p>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => router.push(`/startup/mentorship-requests/${request.id}/report`)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-[12px] font-semibold hover:bg-green-700 transition-all shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Xem báo cáo
                </button>
                {!request.feedbackSubmitted && (
                  <button
                    onClick={() => router.push(`/startup/mentorship-requests/${request.id}/feedback`)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-green-200 text-green-700 rounded-xl text-[12px] font-semibold hover:bg-green-50 transition-all"
                  >
                    <Star className="w-3.5 h-3.5" />
                    Gửi đánh giá
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left: Challenge Details */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-amber-500" />
                  </div>
                  <h2 className="text-[17px] font-bold text-slate-900">Nội dung yêu cầu tư vấn</h2>
                </div>
                {localStatus === "Requested" && !isCancelled && (
                  <button
                    onClick={() => setToast("Chức năng chỉnh sửa sẽ sớm được mở.")}
                    className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Chỉnh sửa
                  </button>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Thách thức</p>
                  <p className="text-[14px] text-slate-600 leading-relaxed">{request.challenge}</p>
                </div>

                {request.questions.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Câu hỏi cụ thể</p>
                    <div className="space-y-2.5">
                      {request.questions.map((q, i) => (
                        <div key={i} className="flex gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <span className="w-5 h-5 rounded-full bg-amber-400 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                          <p className="text-[13px] text-slate-700 leading-relaxed">{q}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                  {request.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[12px] font-medium text-slate-500">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                  <LucideHistory className="w-4 h-4 text-amber-500" />
                </div>
                <h2 className="text-[17px] font-bold text-slate-900">Lịch sử cập nhật</h2>
              </div>

              <div className="space-y-8 pl-3">
                {request.timeline.filter(t => t.done || t.current || (t.label === "Cố vấn phản hồi" && localStatus === "Requested")).map((item, i, arr) => (
                  <div key={i} className="relative pl-8">
                    {i < arr.length - 1 && (
                      <div className="absolute left-2.5 top-5 bottom-[-20px] w-px bg-slate-100" />
                    )}
                    <div className={cn(
                      "absolute left-0 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center",
                      item.failed ? "bg-red-50 border-red-300" :
                      item.current ? "bg-amber-400 border-amber-400" :
                      item.done ? "bg-amber-100 border-amber-300" :
                      "bg-slate-50 border-slate-200"
                    )}>
                      {item.failed
                        ? <X className="w-2.5 h-2.5 text-red-500" />
                        : item.done
                          ? <CheckCircle2 className="w-2.5 h-2.5 text-amber-600" />
                          : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      }
                    </div>
                    <div>
                      <p className={cn("text-[13px] font-bold leading-none mb-1", item.failed ? "text-red-600" : item.current ? "text-slate-900" : "text-slate-600")}>{item.label}</p>
                      {item.note && <p className="text-[12px] text-slate-400 leading-relaxed">{item.note}</p>}
                      {item.time && <p className="text-[11px] text-slate-300 font-medium mt-1 uppercase tracking-wide">{item.time}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Hub Support / Report Action - Prominent */}
            <div className="bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-700">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center mb-4 text-amber-500 shadow-sm border border-amber-100">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-[15px] font-bold text-slate-800 mb-1 leading-none">Gặp sự cố với yêu cầu này?</h3>
              <p className="text-[12px] text-slate-500 text-center mb-5 mt-2 max-w-[360px] leading-relaxed">
                Chúng tôi đảm bảo quyền lợi cho cả Startup và Cố vấn. Nếu có bất kỳ vấn đề gì, hãy báo cáo để đội ngũ AISEP can thiệp xử lý kịp thời.
              </p>
              <button 
                onClick={() => setIsReportModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-bold text-slate-700 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 hover:shadow-md transition-all group"
              >
                Báo cáo sự cố ngay
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -ml-1 group-hover:ml-0 transition-all" />
              </button>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-5">
            {/* Advisor Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Cố vấn tiếp nhận</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <img src={request.advisor.avatar} alt={request.advisor.name} className="w-12 h-12 rounded-xl object-cover border border-slate-100" />
                  {request.advisor.isVerified && (
                    <BadgeCheck className="absolute -bottom-1 -right-1 w-5 h-5 text-amber-500 bg-white rounded-full" />
                  )}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-slate-900 leading-none">{request.advisor.name}</p>
                  <p className="text-[12px] text-slate-500 mt-1 leading-snug">{request.advisor.title}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-[12px] font-bold text-slate-700">{request.advisor.rating}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push("/startup/messaging")}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-slate-200 rounded-xl text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Nhắn tin
                </button>
                <button
                  onClick={() => router.push(`/startup/experts/${request.advisor.id}`)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-slate-200 rounded-xl text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Xem hồ sơ
                </button>
              </div>
            </div>

            {/* Session Info Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-6">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Thông tin phiên</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-50">
                  <div className="flex items-center gap-2 text-[12px] text-slate-500">
                    <Video className="w-3.5 h-3.5" />
                    Hình thức
                  </div>
                  <span className="text-[12px] font-semibold text-slate-700">{request.format}</span>
                </div>
                <div className={cn("flex items-center justify-between py-2", request.sessionPrice ? "border-b border-slate-50" : "")}>
                  <div className="flex items-center gap-2 text-[12px] text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    Thời lượng
                  </div>
                  <span className="text-[12px] font-semibold text-slate-700">{request.duration}</span>
                </div>
                {request.sessionPrice && (
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2 text-[12px] text-slate-500">
                      <CreditCard className="w-3.5 h-3.5" />
                      Phí phiên
                    </div>
                    <span className="text-[13px] font-black text-amber-600">{formatVND(request.sessionPrice!)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Help */}
            <div className="bg-[#0f172a] rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-amber-400" />
                <span className="text-[13px] font-bold">Cần hỗ trợ?</span>
              </div>
              <p className="text-[12px] text-white/60 leading-relaxed italic">Cố vấn thường phản hồi trong 24–48h. Nếu có thắc mắc hoặc gặp sự cố, vui lòng báo cáo cho chúng tôi.</p>
              <button 
                onClick={() => setIsReportModalOpen(true)}
                className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-amber-400 hover:text-amber-300 transition-colors group"
              >
                <ShieldAlert className="w-3.5 h-3.5 group-hover:animate-pulse" />
                Báo cáo sự cố
              </button>
            </div>
          </div>
        </div>
      </div>
      <IssueReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        context={{
          entityType: "CONSULTING_REQUEST",
          entityId: request.id,
          entityTitle: `Yêu cầu tư vấn: ${request.topic}`,
          otherPartyName: request.advisor.name
        }}
      />
    </StartupShell>
  );
}
