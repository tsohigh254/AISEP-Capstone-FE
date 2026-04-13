import axios from "axios";
import type { AxiosResponse } from "axios";

export interface IBankOption {
  bin: string;
  logo: string;
  shortName: string;
}

export const GetBanks = () => {
  return axios.get(`${process.env.NEXT_PUBLIC_BANK_URI}`);
};

export const GetBankOptions = async (): Promise<IBankOption[]> => {
  const res = await GetBanks();
  const payload = (res?.data as unknown) ?? [];

  const bankList = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as { data?: unknown[] })?.data)
      ? (payload as { data?: unknown[] }).data!
      : [];

  return bankList
    .map((item) => {
      const bank = item as Partial<{
        bin: string | number;
        logo: string;
        shortName: string;
      }>;

      const bin = String(bank.bin ?? "").trim();
      const logo = String(bank.logo ?? "").trim();
      const shortName = String(bank.shortName ?? "").trim();

      if (!bin || !shortName) return null;
      return { bin, logo, shortName };
    })
    .filter((bank): bank is IBankOption => bank !== null);
};
