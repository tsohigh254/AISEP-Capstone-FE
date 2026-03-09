"use client";

import { AdvisorShell } from "@/components/advisor/advisor-shell";
import { MessagingContent } from "@/components/messaging/messaging-content";

export default function AdvisorMessagingPage() {
  return (
    <AdvisorShell>
      <MessagingContent />
    </AdvisorShell>
  );
}
