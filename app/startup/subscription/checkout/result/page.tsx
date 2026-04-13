"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { StartupShell } from "@/components/startup/startup-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, CreditCard, RefreshCcw, XCircle } from "lucide-react";

function CheckoutResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = (searchParams.get("status") ?? "").trim().toLowerCase();
  const ref = searchParams.get("ref") ?? searchParams.get("orderCode") ?? "";

  const successStatuses = new Set(["success", "succeeded", "successful", "paid", "completed"]);
  const isSuccess = status === "" || successStatuses.has(status);

  return (
    <div className="mx-auto max-w-[620px] pb-20 pt-8 animate-in fade-in duration-500">
      <Card className="border-slate-200/80">
        <CardHeader className="items-center text-center">
          <Badge className={isSuccess ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-red-100 text-red-700 hover:bg-red-100"}>
            {isSuccess ? "Thanh toán thành công" : "Thanh toán chưa thành công"}
          </Badge>
          <div className="mt-2 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
            {isSuccess ? (
              <CheckCircle2 className="h-9 w-9 text-emerald-600" />
            ) : (
              <XCircle className="h-9 w-9 text-red-500" />
            )}
          </div>
          <CardTitle className="text-2xl text-slate-900">
            {isSuccess ? "Nâng cấp tài khoản thành công" : "Thanh toán bị hủy hoặc thất bại"}
          </CardTitle>
          <CardDescription>
            {isSuccess
              ? "Gói tài khoản mới của bạn đã được ghi nhận. Bạn có thể quay lại trang Subscription để tiếp tục sử dụng."
              : "Bạn có thể quay lại trang Subscription để thử thanh toán lại."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {ref && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <span className="mr-2 inline-flex items-center gap-1 font-medium text-slate-500">
                <CreditCard className="h-4 w-4" />
                Mã giao dịch:
              </span>
              <span className="font-mono">{ref}</span>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="flex-1" onClick={() => router.push("/startup/subscription")}>
              Về trang Subscription
            </Button>
            {!isSuccess && (
              <Button className="flex-1" variant="outline" onClick={() => router.push("/startup/subscription")}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Thanh toán lại
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ResultSkeleton() {
  return (
    <div className="mx-auto max-w-[620px] pb-20 pt-8">
      <Card className="border-slate-200/80">
        <CardContent className="py-14 text-center text-sm text-slate-400">Đang xử lý kết quả thanh toán...</CardContent>
      </Card>
    </div>
  );
}

export default function StartupSubscriptionCheckoutResultPage() {
  return (
    <StartupShell>
      <Suspense fallback={<ResultSkeleton />}>
        <CheckoutResultContent />
      </Suspense>
    </StartupShell>
  );
}
