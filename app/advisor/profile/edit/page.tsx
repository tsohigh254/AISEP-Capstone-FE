import { Suspense } from "react";
import AdvisorProfileClient from "../AdvisorProfileClient";

export default function AdvisorProfileEditPage() {
  return (
    <Suspense fallback={<div className="p-6">Đang tải hồ sơ advisor...</div>}>
      <AdvisorProfileClient initialEditing={true} />
    </Suspense>
  );
}
