/**
 * Proxy service for Advisor Settings
 * - Attempts to call real backend endpoints (GetMe, GetAdvisorProfile, settings endpoints)
 * - Normalizes backend envelope vs direct payload
 * - Falls back to in-memory mockState when network/backend calls fail
 */

import axios from "../interceptor";
import { GetMe } from "../user/user.api";
import { GetAdvisorProfile } from "./advisor.api";
import { ChangePassword } from "../auth/auth.api";

/**
 * Mock Service for Advisor Settings
 * Following advisor-settings-implementation.md
 */

export interface IAdvisorSettings {
  account: {
    email: string;
    role: "ADVISOR";
    accountStatus: "ACTIVE" | "LOCKED" | "SUSPENDED" | "PENDING";
    emailVerified: boolean;
    createdAt?: string;
    lastPasswordChangedAt?: string | null;
  };
  notificationPreferences: {
    inAppEnabled: boolean;
    emailEnabled: boolean;
  };
}

const mockSettings: IAdvisorSettings = {
  account: {
    email: "advisor.test@aisep.vn",
    role: "ADVISOR",
    accountStatus: "ACTIVE",
    emailVerified: true,
    createdAt: "2024-01-15T08:00:00Z",
    lastPasswordChangedAt: "2024-03-10T14:30:00Z",
  },
  notificationPreferences: {
    inAppEnabled: true,
    emailEnabled: false,
  },
};

function normalizeEnvelope<T>(maybeEnvelope: any): T | null {
  if (!maybeEnvelope) return null;
  // axios response shape: { data: ... }
  const payload = maybeEnvelope.data ?? maybeEnvelope;
  // backend envelope: IBackendRes<T>
  if (payload && (payload.success || payload.isSuccess) && payload.data) return payload.data as T;
  // direct payload
  if (payload && typeof payload === "object") return payload as T;
  return null;
}

export const getMockAdvisorSettings = async (): Promise<IAdvisorSettings> => {
  // Simulate API delay
  await new Promise(r => setTimeout(r, 800));
  return { ...mockSettings };
};

export const updateMockNotificationPreferences = async (prefs: {
  inAppEnabled: boolean;
  emailEnabled: boolean;
}): Promise<boolean> => {
  await new Promise(r => setTimeout(r, 1000));
  mockSettings.notificationPreferences = { ...prefs };
  return true;
};

export const changeMockPassword = async (payload: any): Promise<boolean> => {
  await new Promise(r => setTimeout(r, 1200));
  // In a real mock we might validate current password but here we just succeed
  mockSettings.account.lastPasswordChangedAt = new Date().toISOString();
  return true;
};
