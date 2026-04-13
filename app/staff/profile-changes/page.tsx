"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProfileChangesPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/staff/kyc"); }, [router]);
  return null;
}
