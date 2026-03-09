"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select } from "@/components/ui/select";
import { AnimatedNumber } from "@/lib/useCountUp";
import { 
  Calendar as CalendarIcon, 
  CheckCircle, 
  Clock, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Plus
} from "lucide-react";
import { AdvisorShell } from "@/components/advisor/advisor-shell";

type Meeting = {
  id: string;
  companyName: string;
  companyInitials: string;
  companyColor: string;
  time: string;
  description: string;
  status: "confirmed" | "pending" | "cancelled";
  date: Date;
};

type Deadline = {
  id: string;
  title: string;
  date: Date;
};

const meetings: Meeting[] = [
  {
    id: "1",
    companyName: "TechFlow Solutions",
    companyInitials: "TF",
    companyColor: "bg-blue-500",
    time: "9:00 AM - 10:00 AM",
    description: "Q1 Strategy Review & Funding Discussion",
    status: "confirmed",
    date: new Date(2025, 0, 15), // Jan 15, 2025
  },
  {
    id: "2",
    companyName: "GreenHarvest",
    companyInitials: "GH",
    companyColor: "bg-green-500",
    time: "2:00 PM - 3:00 PM",
    description: "Product Market Fit Analysis",
    status: "pending",
    date: new Date(2025, 0, 15),
  },
  {
    id: "3",
    companyName: "NeuralWave AI",
    companyInitials: "NW",
    companyColor: "bg-purple-500",
    time: "4:30 PM - 5:30 PM",
    description: "Technical Architecture Review",
    status: "confirmed",
    date: new Date(2025, 0, 15),
  },
  {
    id: "4",
    companyName: "BlockChain Ventures",
    companyInitials: "BC",
    companyColor: "bg-orange-500",
    time: "10:00 AM - 11:00 AM",
    description: "Pitch Deck Review & Investor Prep",
    status: "confirmed",
    date: new Date(2025, 0, 16), // Jan 16, 2025
  },
  {
    id: "5",
    companyName: "MediHealth Connect",
    companyInitials: "MH",
    companyColor: "bg-teal-500",
    time: "2:00 PM - 3:30 PM",
    description: "Regulatory Compliance Consultation",
    status: "pending",
    date: new Date(2025, 0, 16),
  },
  {
    id: "6",
    companyName: "CloudSync Pro",
    companyInitials: "CS",
    companyColor: "bg-indigo-500",
    time: "11:00 AM - 12:00 PM",
    description: "Scaling Strategy Discussion",
    status: "confirmed",
    date: new Date(2025, 0, 17),
  },
];

const deadlines: Deadline[] = [
  {
    id: "1",
    title: "TechFlow Q1 Report Due",
    date: new Date(2025, 0, 18),
  },
  {
    id: "2",
    title: "GreenHarvest Pitch Deck Review",
    date: new Date(2025, 0, 20),
  },
  {
    id: "3",
    title: "BlockChain Due Diligence",
    date: new Date(2025, 0, 25),
  },
];

// Helper function to group meetings by date
const groupMeetingsByDate = (meetings: Meeting[]) => {
  const grouped: { [key: string]: Meeting[] } = {};
  meetings.forEach((meeting) => {
    const dateKey = meeting.date.toDateString();
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(meeting);
  });
  return grouped;
};

// Helper function to format date
const formatDateHeader = (date: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateCopy = new Date(date);
  dateCopy.setHours(0, 0, 0, 0);

  if (dateCopy.getTime() === today.getTime()) {
    return `Today - ${date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;
  } else if (dateCopy.getTime() === tomorrow.getTime()) {
    return `Tomorrow - ${date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;
  } else {
    return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  }
};

export default function AdvisorSchedulePage() {
  const [activeTab, setActiveTab] = useState("all");
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 0, 1)); // January 2025

  const filteredMeetings = meetings.filter((meeting) => {
    if (activeTab === "all") return true;
    if (activeTab === "upcoming") return meeting.status !== "cancelled" && meeting.date >= new Date();
    if (activeTab === "past") return meeting.date < new Date();
    if (activeTab === "cancelled") return meeting.status === "cancelled";
    return true;
  });

  const groupedMeetings = groupMeetingsByDate(filteredMeetings);
  const sortedDates = Object.keys(groupedMeetings).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  );

  // Calculate summary stats
  const thisWeekCount = meetings.filter(m => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return m.date >= weekStart && m.date < weekEnd;
  }).length;

  const thisMonthCount = meetings.filter(m => 
    m.date.getMonth() === new Date().getMonth() && 
    m.date.getFullYear() === new Date().getFullYear()
  ).length;

  const confirmedCount = meetings.filter(m => m.status === "confirmed").length;
  const pendingCount = meetings.filter(m => m.status === "pending").length;

  // Calendar generation
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  const calendarDays = generateCalendarDays();
  const today = new Date();
  const currentDate = today.getDate();
  const currentMonthIndex = today.getMonth();
  const currentYear = today.getFullYear();

  const hasMeetingOnDate = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return meetings.some(m => 
      m.date.getDate() === date.getDate() &&
      m.date.getMonth() === date.getMonth() &&
      m.date.getFullYear() === date.getFullYear()
    );
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === "prev") {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  return (
    <AdvisorShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">My Schedule</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-slate-200 bg-slate-50">
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 mb-1">THIS WEEK</p>
              <AnimatedNumber value={thisWeekCount} duration={800} delay={0} className="text-3xl font-bold text-slate-900" />
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-slate-50">
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 mb-1">THIS MONTH</p>
              <AnimatedNumber value={thisMonthCount} duration={800} delay={150} className="text-3xl font-bold text-slate-900" />
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-slate-50">
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 mb-1">CONFIRMED</p>
              <AnimatedNumber value={confirmedCount} duration={800} delay={300} className="text-3xl font-bold text-slate-900" />
            </CardContent>
          </Card>
          <Card className="border-slate-200 bg-slate-50">
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 mb-1">PENDING</p>
              <AnimatedNumber value={pendingCount} duration={800} delay={450} className="text-3xl font-bold text-slate-900" />
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area - 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Meetings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filter Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-slate-100">
                <TabsTrigger 
                  value="all" 
                  className={activeTab === "all" ? "bg-blue-500 text-white" : ""}
                >
                  All Meetings
                </TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Meetings by Date */}
            <div className="space-y-6">
              {sortedDates.map((dateKey) => {
                const date = new Date(dateKey);
                const dayMeetings = groupedMeetings[dateKey];
                
                return (
                  <div key={dateKey} className="space-y-3">
                    <h2 className="text-lg font-bold text-slate-900">
                      {formatDateHeader(date)}
                    </h2>
                    {dayMeetings.map((meeting) => (
                      <Card key={meeting.id} className="border-slate-200 shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <Avatar className={`${meeting.companyColor} h-12 w-12`}>
                              <AvatarFallback className={`${meeting.companyColor} text-white font-semibold`}>
                                {meeting.companyInitials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 mb-1">
                                {meeting.companyName}
                              </h3>
                              <p className="text-sm text-slate-600 mb-2">
                                {meeting.time}
                              </p>
                              <p className="text-sm text-slate-700 mb-3">
                                {meeting.description}
                              </p>
                              {meeting.status === "confirmed" ? (
                                <Badge className="bg-green-500 text-white border-0 hover:bg-green-500 flex items-center gap-1 w-fit">
                                  <CheckCircle className="w-3 h-3" />
                                  Confirmed
                                </Badge>
                              ) : meeting.status === "pending" ? (
                                <Badge className="bg-orange-500 text-white border-0 hover:bg-orange-500 flex items-center gap-1 w-fit">
                                  <Clock className="w-3 h-3" />
                                  Pending
                                </Badge>
                              ) : null}
                            </div>
                            <Button variant="ghost" size="icon" className="text-slate-400">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Calendar */}
           

            {/* Upcoming Deadlines */}
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <h3 className="font-bold text-slate-900 mb-4">Upcoming Deadlines</h3>
                <div className="space-y-4">
                  {deadlines.map((deadline) => (
                    <div key={deadline.id} className="flex gap-3">
                      <div className="w-1 bg-orange-500 rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {deadline.title}
                        </p>
                        <p className="text-xs text-slate-600">
                          {deadline.date.toLocaleDateString("en-US", { 
                            month: "long", 
                            day: "numeric", 
                            year: "numeric" 
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdvisorShell>
  );
}
