"use client";

import { InvestorShell } from "@/components/investor/investor-shell";
import { MessagingContent } from "@/components/messaging/messaging-content";

export default function InvestorMessagingPage() {
  return (
    <InvestorShell>
      <MessagingContent />
    </InvestorShell>
  );
}
