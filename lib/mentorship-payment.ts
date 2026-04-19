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

export const parsePositiveAmount = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.-]/g, ""));
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
};

export const parseDurationMinutes = (value?: string | number | null) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return 60;
  const parsed = Number(value.replace(/[^\d]/g, ""));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 60;
};

export const calculateMentorshipTotal = (
  hourlyRate: unknown,
  durationValue: string | number | null | undefined,
) => {
  const rate = parsePositiveAmount(hourlyRate) || 0;
  const minutes = parseDurationMinutes(durationValue);
  return (rate * minutes) / 60;
};
