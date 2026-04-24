export type NotificationRouteRole = "startup" | "investor" | "advisor" | "staff" | "admin";

const STARTUP_CONNECTIONS_ROUTE = "/startup/investors";
const INVESTOR_KYC_STATUS_ROUTE = "/investor/kyc/status";

export const inferNotificationRouteRole = (
  pathname?: string | null,
): NotificationRouteRole | undefined => {
  if (!pathname) return undefined;
  if (pathname.startsWith("/startup")) return "startup";
  if (pathname.startsWith("/investor")) return "investor";
  if (pathname.startsWith("/advisor")) return "advisor";
  if (pathname.startsWith("/staff")) return "staff";
  if (pathname.startsWith("/admin")) return "admin";
  return undefined;
};

export const getDashboardPathForRole = (role?: NotificationRouteRole) => {
  switch (role) {
    case "startup":
      return "/startup";
    case "investor":
      return "/investor";
    case "advisor":
      return "/advisor";
    case "staff":
      return "/staff";
    case "admin":
      return "/admin/dashboard";
    default:
      return "/";
  }
};

export const resolveNotificationActionUrl = (
  actionUrl?: string | null,
  role?: NotificationRouteRole,
): string | null => {
  if (!actionUrl) return null;

  let parsed: URL;
  try {
    parsed = new URL(actionUrl, "http://aisep.local");
  } catch {
    return null;
  }

  const pathname = parsed.pathname;
  const search = parsed.search;

  if (pathname === "/dashboard") {
    return getDashboardPathForRole(role);
  }

  if (pathname === "/investor/verification") {
    return INVESTOR_KYC_STATUS_ROUTE;
  }

  if (pathname === "/startup/connections") {
    return STARTUP_CONNECTIONS_ROUTE;
  }

  const startupConnectionMatch = pathname.match(/^\/startup\/connections\/(\d+)$/);
  if (startupConnectionMatch) {
    return `${STARTUP_CONNECTIONS_ROUTE}?connectionId=${startupConnectionMatch[1]}`;
  }

  const investorConnectionMatch = pathname.match(/^\/investor\/connections\/(\d+)$/);
  if (investorConnectionMatch) {
    return `/investor/connections?connectionId=${investorConnectionMatch[1]}`;
  }

  const startupEvaluationMatch = pathname.match(/^\/startup\/evaluations\/(\d+)$/);
  if (startupEvaluationMatch) {
    return `/startup/ai-evaluation/${startupEvaluationMatch[1]}`;
  }

  // Backward compatibility for legacy notifications created before the
  // role-prefixed messaging contract was finalized.
  if (pathname === "/messaging") {
    const targetRole = role ?? "startup";
    return `/${targetRole}/messaging${search}`;
  }

  return `${pathname}${search}`;
};
