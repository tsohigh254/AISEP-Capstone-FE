"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Clock,
  TrendingUp,
  Star,
  MoreVertical,
  ChevronDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { AdvisorShell } from "@/components/advisor/advisor-shell";
import { useCountUp } from "@/lib/useCountUp";

type ConsultationRequest = {
  id: string;
  status: "URGENT" | "NEW";
  company: string;
  stage: string;
  category: string;
  description: string;
  duration: string;
  date?: string;
  requester: string;
  timeAgo: string;
  rate: string;
};

type WeeklyMetric = {
  label: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative";
  subtitle?: string;
};

type Review = {
  id: string;
  rating: number;
  comment: string;
  reviewer: string;
  timeAgo: string;
};

const consultationRequests: ConsultationRequest[] = [
  {
    id: "1",
    status: "URGENT",
    company: "FinTech AI",
    stage: "Seed",
    category: "FinTech",
    description: "Initial consultation on fundraising strategy",
    duration: "1-hour consultation",
    date: "Feb 2, 2PM",
    requester: "Sarah Johnson",
    timeAgo: "2 hours ago",
    rate: "$250/hr",
  },
  {
    id: "2",
    status: "NEW",
    company: "HealthTech Solutions",
    stage: "Pre-seed",
    category: "HealthTech",
    description: "Product-market fit guidance for our healthcare app",
    duration: "3-month mentorship",
    requester: "Mike Rodriguez",
    timeAgo: "5 hours ago",
    rate: "$200/hr",
  },
  {
    id: "3",
    status: "NEW",
    company: "EduPlatform",
    stage: "Series A",
    category: "EdTech",
    description: "Scaling strategy consultation",
    duration: "2-hour consultation",
    requester: "David Chen",
    timeAgo: "1 day ago",
    rate: "$300/hr",
  },
];

const weeklyData = [
  { day: "Mon", value: 4 },
  { day: "Tue", value: 5 },
  { day: "Wed", value: 2 },
  { day: "Thu", value: 1 },
  { day: "Fri", value: 0 },
  { day: "Sat", value: 0 },
  { day: "Sun", value: 0 },
];

const latestReviews: Review[] = [
  {
    id: "1",
    rating: 5,
    comment: "Excellent guidance on our fundraising strategy. Dr. Chen's insights were invaluable!",
    reviewer: "Sarah Johnson",
    timeAgo: "2 days ago",
  },
  {
    id: "2",
    rating: 5,
    comment: "Very professional and helpful. Highly recommend!",
    reviewer: "Mike Rodriguez",
    timeAgo: "3 days ago",
  },
];

function getCurrentDate() {
  const today = new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"];
  
  const dayName = days[today.getDay()];
  const month = months[today.getMonth()];
  const date = today.getDate();
  const year = today.getFullYear();
  
  return `${dayName}, ${month} ${date}, ${year}`;
}

export default function AdvisorDashboardPage() {
  const [selectedWeek, setSelectedWeek] = useState("Jan 22-28");
  
  // Top metrics - staggered top-to-bottom
  const earnings = useCountUp(12450, 1400, 0);
  const clients = useCountUp(23, 800, 150);
  const sessions = useCountUp(156, 1200, 300);
  const pending = useCountUp(7, 600, 450);
  
  // Weekly summary - staggered
  const weeklySessions = useCountUp(12, 800, 0);
  const weeklyHours = useCountUp(18, 800, 150);
  const weeklyRating = useCountUp(49, 800, 300); // 4.9 * 10
  const weeklyEarned = useCountUp(3200, 1000, 450);

  return (
    <AdvisorShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-600 mt-1">{getCurrentDate()}</p>
          </div>          
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Monthly Earnings */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-600">Monthly Earnings</p>
                  <DollarSign className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p ref={earnings.ref} className="text-3xl font-bold text-slate-900">${earnings.count.toLocaleString()}</p>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <ArrowUp className="w-4 h-4" />
                    <span>+18%</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500">vs last month</p>
                <button className="text-sm text-blue-600 hover:underline">
                  View details →
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Active Clients */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-600">Active Clients</p>
                  <Users className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p ref={clients.ref} className="text-3xl font-bold text-slate-900">{clients.count}</p>
                  <p className="text-sm text-green-600">+3 new this week</p>
                </div>
                <button className="text-sm text-blue-600 hover:underline">
                  View all →
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Completed Sessions */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-600">Completed Sessions</p>
                  <CheckCircle2 className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p ref={sessions.ref} className="text-3xl font-bold text-slate-900">{sessions.count}</p>
                  <div className="flex items-center gap-1 text-sm text-yellow-600">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>94% satisfaction</span>
                  </div>
                </div>
                <button className="text-sm text-blue-600 hover:underline">
                  View history →
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Pending Requests */}
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-600">Pending Requests</p>
                  <Clock className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p ref={pending.ref} className="text-3xl font-bold text-slate-900">{pending.count}</p>
                  <p className="text-sm text-red-600">3 urgent</p>
                </div>
                <Button size="sm" className="w-full mt-2">
                  Review requests
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Consultation Requests - Left Side (2 columns) */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">Consultation Requests</CardTitle>
                  <button className="text-sm text-blue-600 hover:underline">
                    View All ({consultationRequests.length})
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {consultationRequests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={request.status === "URGENT" ? "destructive" : "default"}
                          className="text-xs"
                        >
                          {request.status}
                        </Badge>
                      </div>
                      <button className="text-slate-400 hover:text-slate-600">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <h3 className="font-semibold text-slate-900">{request.company}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {request.stage}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {request.category}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-sm text-slate-600">{request.description}</p>

                      <div className="flex items-center justify-between text-sm text-slate-500">
                        <div className="flex items-center gap-4">
                          <span>{request.duration}</span>
                          {request.date && <span>{request.date}</span>}
                        </div>
                        <span className="font-medium text-slate-900">{request.rate}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <p className="text-sm text-slate-500">
                          {request.requester} • {request.timeAgo}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="default">
                            Accept
                          </Button>
                          <Button size="sm" variant="outline">
                            Decline
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Side (1 column) */}
          <div className="space-y-6">
            {/* This Week */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">This Week</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span>{selectedWeek}</span>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Sessions Completed</p>
                    <div className="flex items-baseline gap-2">
                      <p ref={weeklySessions.ref} className="text-2xl font-bold text-slate-900">{weeklySessions.count}</p>
                      <span className="text-sm text-green-600">+3</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Hours Worked</p>
                    <div className="flex items-baseline gap-2">
                      <p ref={weeklyHours.ref} className="text-2xl font-bold text-slate-900">{weeklyHours.count}</p>
                      <span className="text-sm text-slate-500">3.8 avg</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Rating</p>
                    <div className="flex items-baseline gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        <p ref={weeklyRating.ref} className="text-2xl font-bold text-slate-900">{(weeklyRating.count / 10).toFixed(1)}</p>
                      </div>
                      <span className="text-sm text-slate-500">8 reviews</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Earned</p>
                    <div className="flex items-baseline gap-2">
                      <p ref={weeklyEarned.ref} className="text-2xl font-bold text-slate-900">${weeklyEarned.count.toLocaleString()}</p>
                      <span className="text-sm text-green-600">+25%</span>
                    </div>
                  </div>
                </div>

                {/* Bar Chart */}
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-end justify-between gap-2 h-32">
                    {weeklyData.map((item, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full flex items-end justify-center">
                          <div
                            className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                            style={{
                              height: `${(item.value / 5) * 100}%`,
                              minHeight: item.value > 0 ? "8px" : "4px",
                            }}
                          />
                        </div>
                        <span className="text-xs text-slate-600">{item.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Latest Reviews */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold">Latest Reviews</CardTitle>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-slate-900">4.9/5.0</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {latestReviews.map((review) => (
                  <div key={review.id} className="space-y-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-slate-200 text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {review.comment}
                    </p>
                    <p className="text-xs text-slate-500">
                      {review.reviewer} • {review.timeAgo}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdvisorShell>
  );
}
