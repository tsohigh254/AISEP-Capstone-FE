"use client";

import { InvestorShell } from "@/components/investor/investor-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  DollarSign, 
  Briefcase, 
  Clock,
  AlertCircle,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { useCountUp } from "@/lib/useCountUp";

type ActivityItem = {
  id: string;
  text: string;
  time: string;
  type: 'info' | 'success' | 'warning';
  icon: any;
};

const recentActivities: ActivityItem[] = [
  {
    id: '1',
    text: 'Đã gửi đề nghị đầu tư cho Tech ABC',
    time: '2 giờ trước',
    type: 'info',
    icon: Clock,
  },
  {
    id: '2',
    text: 'Thêm HealthAI Pro vào watchlist',
    time: '5 giờ trước',
    type: 'info',
    icon: Clock,
  },
  {
    id: '3',
    text: 'Đã nhận báo cáo Q1 từ FinNext',
    time: '1 ngày trước',
    type: 'success',
    icon: CheckCircle,
  },
  {
    id: '4',
    text: 'Hoàn tất đầu tư vào DataFlow',
    time: '3 ngày trước',
    type: 'warning',
    icon: AlertTriangle,
  },
];

export default function InvestorDashboardPage() {
  const totalInvest = useCountUp(250000, 1400, 0);
  const portfolio = useCountUp(8, 800, 150);
  const roi = useCountUp(185, 1200, 300); // 18.5 * 10

  return (
    <InvestorShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Tổng quan</h1>
          <p className="text-slate-600 mt-1">Dashboard đầu tư của bạn</p>
        </div>

        {/* KYC Warning Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-full p-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Tài khoản chưa xác thực</h3>
              <p className="text-white/90 text-sm mt-0.5">
                Để đầu tư vào các startup, bạn cần xác thực tài khoản và hoàn tất hồ sơ investor của mình.
              </p>
            </div>
          </div>
          <Link href="/investor/settings">
            <Button className="bg-white text-orange-600 hover:bg-white/90 font-semibold px-6">
              Xác thực ngay
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Investment Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-600 font-medium">Tổng đầu tư</h3>
                <div className="bg-blue-100 rounded-lg p-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="space-y-2">
                <div ref={totalInvest.ref} className="text-3xl font-bold">${totalInvest.count.toLocaleString()}</div>
                <div className="text-sm text-green-600 font-medium">
                  +12% so với tháng trước
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Portfolio Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-600 font-medium">Portfolio</h3>
                <div className="bg-purple-100 rounded-lg p-2">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold"><span ref={portfolio.ref}>{portfolio.count}</span> startups</div>
                <div className="text-sm text-slate-600">
                  Đang theo dõi 12 startup khác
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ROI Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-600 font-medium">ROI trung bình</h3>
                <div className="bg-green-100 rounded-lg p-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold"><span ref={roi.ref}>{(roi.count / 10).toFixed(1)}</span>%</div>
                <div className="text-sm text-green-600 font-medium">
                  Vượt mục tiêu 15%
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const IconComponent = activity.icon;
                const iconColors = {
                  info: 'bg-blue-100 text-blue-600',
                  success: 'bg-green-100 text-green-600',
                  warning: 'bg-orange-100 text-orange-600',
                };
                
                return (
                  <div key={activity.id} className="flex items-start gap-4">
                    <div className={`rounded-full p-2.5 ${iconColors[activity.type]}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{activity.text}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </InvestorShell>
  );
}


