import axios from "../interceptor";

export type StartupSubscriptionPlanCode = "PRO" | "FUNDRAISING";

type StartupSubscriptionCheckoutPayload = {
  planCode: StartupSubscriptionPlanCode;
};

const DEFAULT_CHECKOUT_ENDPOINT = "/api/startup-subscriptions/checkout-link";

export const CreateStartupSubscriptionCheckout = (
  data: StartupSubscriptionCheckoutPayload,
) => {
  const endpoint =
    process.env.NEXT_PUBLIC_STARTUP_SUBSCRIPTION_CHECKOUT_ENDPOINT ??
    DEFAULT_CHECKOUT_ENDPOINT;

  return axios.post<IBackendRes<{ checkoutUrl?: string }>>(endpoint, data);
};
