"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StartupProfilePage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/startup/startup-profile/info");
    }, [router]);

    return null;
}
