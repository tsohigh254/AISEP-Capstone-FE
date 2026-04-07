import axios from "../interceptor";

export const CreatePaymentLink = (amount: number, mentorshipId: number) => {
  return axios.post<IBackendRes<IPaymentInfo>>(
    "/api/Payment/create-payment-link",
    { amount, mentorshipId }
  );
};
