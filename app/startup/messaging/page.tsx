"use client";

import { StartupShell } from "@/components/startup/startup-shell";
import { MessagingContent } from "@/components/messaging/messaging-content";

export default function StartupMessagingPage() {
  return (
    <StartupShell>
      <MessagingContent />
    </StartupShell>
  );
}
