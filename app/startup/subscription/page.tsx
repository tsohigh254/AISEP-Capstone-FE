"use client";

import { useMemo, useState } from "react";
import { StartupShell } from "@/components/startup/startup-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ArrowRight, Check, Infinity, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { CreatePaymentLinkForSubscription, TargetPlan } from "@/services/payment/payment.api";

type PlanKey = "FREE" | "PRO" | "FUNDRAISING";
type StartupSubscriptionPlanCode = "PRO" | "FUNDRAISING";

type FeatureRow = {
  feature: string;
  free: string | boolean;
  pro: string | boolean;
  fundraising: string | boolean;
};

const FEATURE_MATRIX: FeatureRow[] = [
  { feature: "Tạo hồ sơ startup", free: true, pro: true, fundraising: true },
  { feature: "Duyệt danh sách nhà đầu tư", free: true, pro: true, fundraising: true },
  { feature: "Duyệt danh sách cố vấn", free: true, pro: true, fundraising: true },
  { feature: "Đặt lịch tư vấn với cố vấn", free: true, pro: true, fundraising: true },
  { feature: "Yêu cầu kết nối nhà đầu tư", free: "3", pro: "15", fundraising: "Unlimited" },
  { feature: "Yêu cầu tư vấn cố vấn", free: "2", pro: "10", fundraising: "Unlimited" },
  { feature: "Kết nối nhà đầu tư phù hợp (AI Matching)", free: false, pro: true, fundraising: true },
  { feature: "Phân tích dữ liệu startup", free: false, pro: true, fundraising: true },
  { feature: "Lịch sử điểm AI Score", free: false, pro: true, fundraising: true },
  { feature: "Xác thực Blockchain", free: false, pro: true, fundraising: true },
  { feature: "Xem nhà đầu tư đang quan tâm", free: false, pro: false, fundraising: true },
  { feature: "Startup nổi bật (Featured)", free: false, pro: false, fundraising: true },
  { feature: "Hỗ trợ ưu tiên", free: false, pro: false, fundraising: true },
];

const PLAN_META: Record<PlanKey, { label: string; desc: string; cta?: string; code?: StartupSubscriptionPlanCode }> = {
  FREE: {
    label: "Free",
    desc: "Dùng các chức năng cốt lõi để bắt đầu.",
  },
  PRO: {
    label: "Pro",
    desc: "Tăng giới hạn kết nối và mở khóa tính năng phân tích.",
    cta: "Nâng cấp Pro",
    code: "PRO",
  },
  FUNDRAISING: {
    label: "Fundraising",
    desc: "Gói đầy đủ cho startup đang tập trung gọi vốn.",
    cta: "Nâng cấp Fundraising",
    code: "FUNDRAISING",
  },
};

const PLAN_CHECKOUT_META: Record<StartupSubscriptionPlanCode, { targetPlan: TargetPlan; amount: number }> = {
  PRO: {
    targetPlan: TargetPlan.Pro,
    amount: 99_000,
  },
  FUNDRAISING: {
    targetPlan: TargetPlan.Fundraising,
    amount: 199_000,
  },
};

function renderValue(value: string | boolean) {
  if (value === true)
    return (
      <div className="flex justify-center">
        <Check className="h-4 w-4 text-emerald-600" />
      </div>
    );
  if (value === false)
    return (
      <div className="flex justify-center">
        <X className="h-4 w-4 text-slate-300" />
      </div>
    );
  if (String(value).toLowerCase() === "unlimited") {
    return (
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 whitespace-nowrap">
          <Infinity className="h-3.5 w-3.5 shrink-0" />
          Unlimited
        </span>
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      <span className="text-sm font-semibold text-slate-700">{value}</span>
    </div>
  );
}

export default function StartupSubscriptionPage() {
  const [payingPlan, setPayingPlan] = useState<StartupSubscriptionPlanCode | null>(null);

  const planColumns = useMemo(() => (["FREE", "PRO", "FUNDRAISING"] as const), []);

  const handleUpgrade = async (planCode: StartupSubscriptionPlanCode) => {
    setPayingPlan(planCode);
    try {
      const checkoutMeta = PLAN_CHECKOUT_META[planCode];
      const res = await CreatePaymentLinkForSubscription(checkoutMeta.targetPlan, checkoutMeta.amount);
      const data = (res as any)?.data ?? {};
      const checkoutUrl =
        data?.checkoutUrl ??
        data?.paymentUrl ??
        data?.paymentLink ??
        data?.url ??
        (typeof data === "string" ? data : null);

      if (!checkoutUrl) {
        toast.error("Không nhận được link thanh toán từ hệ thống.");
        return;
      }

      window.location.href = checkoutUrl;
    } catch {
      toast.error("Không thể tạo phiên thanh toán. Vui lòng thử lại.");
    } finally {
      setPayingPlan(null);
    }
  };

  return (
    <StartupShell>
      <div className="mx-auto max-w-[1100px] space-y-6 pb-20 animate-in fade-in duration-500">
        <Card className="border-slate-200/80 bg-gradient-to-r from-amber-50 via-white to-orange-50">
          <CardHeader className="space-y-3">
            <Badge className="w-fit bg-amber-100 text-amber-800 hover:bg-amber-100">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              Startup Subscription
            </Badge>
            <CardTitle className="text-2xl text-slate-900">Nâng cấp tài khoản Startup</CardTitle>
            <CardDescription className="max-w-3xl text-slate-600">
              Chọn gói phù hợp để mở rộng năng lực kết nối, phân tích và gọi vốn.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {planColumns.map((plan) => {
            const meta = PLAN_META[plan];
            const isHighlight = plan !== "FREE";
            const isLoading = meta.code && payingPlan === meta.code;
            return (
              <Card
                key={plan}
                className={cn(
                  "border-slate-200/80",
                  isHighlight && "relative overflow-hidden border-amber-300/70 shadow-[0_6px_24px_rgba(217,119,6,0.10)]",
                )}
              >
                {plan === "FUNDRAISING" && (
                  <div className="absolute right-3 top-3 rounded-full bg-amber-500 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    Recommended
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl text-slate-900">{meta.label}</CardTitle>
                  <CardDescription>{meta.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  {meta.code ? (
                    <Button
                      className={cn(
                        "w-full",
                        plan === "FUNDRAISING" && "bg-amber-500 text-white hover:bg-amber-600",
                      )}
                      disabled={isLoading}
                      onClick={() => handleUpgrade(meta.code!)}
                    >
                      {isLoading ? "Đang chuyển thanh toán..." : meta.cta}
                      {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  ) : (
                    <Button className="w-full" disabled variant="secondary">
                      Gói hiện tại
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-slate-200/80">
          <CardHeader>
            <CardTitle className="text-lg text-slate-900">So sánh tính năng</CardTitle>
            <CardDescription>Chi tiết các tính năng theo từng gói dịch vụ.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="min-w-[240px] font-bold text-slate-700">Tính năng</TableHead>
                  <TableHead className="text-center font-bold text-slate-700 w-32">Free</TableHead>
                  <TableHead className="text-center font-bold text-slate-700 w-32">Pro</TableHead>
                  <TableHead className="text-center font-bold text-slate-700 w-40">Fundraising</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {FEATURE_MATRIX.map((item) => (
                  <TableRow key={item.feature}>
                    <TableCell className="font-medium text-slate-700">{item.feature}</TableCell>
                    <TableCell className="text-center align-middle">{renderValue(item.free)}</TableCell>
                    <TableCell className="text-center align-middle">{renderValue(item.pro)}</TableCell>
                    <TableCell className="text-center align-middle">{renderValue(item.fundraising)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </StartupShell>
  );
}
