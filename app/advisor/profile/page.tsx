import { Suspense } from "react";
import AdvisorProfileClient from "./AdvisorProfileClient";

export default function AdvisorProfilePage() {
  return (
    <Suspense fallback={<div className="p-6">Đang tải hồ sơ advisor...</div>}>
      <AdvisorProfileClient />
    </Suspense>
  );
}
