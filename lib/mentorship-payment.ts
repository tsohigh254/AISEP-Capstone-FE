const COMPLETED_PAYMENT_STATUSES = new Set([
  "paid",
  "completed",
  "succeeded",
  "successful",
]);

export function isMentorshipPaymentCompleted(
  paymentStatus?: string | null,
  paidAt?: string | null,
) {
  if (typeof paidAt === "string" && paidAt.trim().length > 0) {
    return true;
  }

  if (typeof paymentStatus !== "string") {
    return false;
  }

  return COMPLETED_PAYMENT_STATUSES.has(paymentStatus.trim().toLowerCase());
}
