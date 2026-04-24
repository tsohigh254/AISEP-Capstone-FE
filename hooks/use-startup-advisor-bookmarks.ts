"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CreateStartupAdvisorBookmark,
  GetStartupAdvisorBookmarkIds,
  RemoveStartupAdvisorBookmark,
} from "@/services/startup/startup-advisor-bookmark.api";

const BOOKMARKS_REFRESH_KEY = "startup-advisor-bookmarks-refresh";
const BOOKMARKS_CHANNEL_NAME = "startup-advisor-bookmarks";

function getErrorCode(source: any): string | undefined {
  return (
    source?.error?.code ??
    source?.code ??
    source?.errorCode ??
    source?.data?.error?.code ??
    source?.data?.code ??
    source?.response?.data?.error?.code ??
    source?.response?.data?.code
  );
}

function getErrorMessage(source: any): string | undefined {
  return (
    source?.message ??
    source?.error?.message ??
    source?.data?.message ??
    source?.response?.data?.message
  );
}

function translateBookmarkError(source: any, fallback: string) {
  const code = getErrorCode(source);

  if (code === "EMAIL_NOT_VERIFIED") {
    return "Bạn cần xác thực email trước khi lưu cố vấn.";
  }

  if (code === "STARTUP_KYC_NOT_APPROVED") {
    return "Bạn cần được duyệt KYC trước khi lưu cố vấn.";
  }

  if (code === "ADVISOR_NOT_FOUND") {
    return "Không tìm thấy cố vấn này trong hệ thống.";
  }

  if (code === "BOOKMARK_ALREADY_EXISTS") {
    return "Cố vấn này đã có trong danh sách đã lưu.";
  }

  if (code === "BOOKMARK_NOT_FOUND") {
    return "Cố vấn này không còn trong danh sách đã lưu.";
  }

  return getErrorMessage(source) || fallback;
}

function uniqueIds(ids: number[]) {
  return Array.from(new Set(ids.filter((id) => Number.isFinite(id) && id > 0)));
}

export function useStartupAdvisorBookmarks() {
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [loadingIds, setLoadingIds] = useState(true);
  const [pendingIds, setPendingIds] = useState<Record<number, boolean>>({});

  const setPending = useCallback((advisorId: number, value: boolean) => {
    setPendingIds((current) => {
      if (value) {
        return { ...current, [advisorId]: true };
      }

      const next = { ...current };
      delete next[advisorId];
      return next;
    });
  }, []);

  const notifyBookmarksUpdated = useCallback(() => {
    try {
      if (typeof window === "undefined") return;

      if ("BroadcastChannel" in window) {
        const channel = new BroadcastChannel(BOOKMARKS_CHANNEL_NAME);
        channel.postMessage({ type: "refresh" });
        channel.close();
      } else {
        localStorage.setItem(BOOKMARKS_REFRESH_KEY, Date.now().toString());
      }
    } catch {
      // ignore sync errors
    }
  }, []);

  const refreshBookmarkedIds = useCallback(async (silent = false) => {
    if (!silent) {
      setLoadingIds(true);
    }

    try {
      const response = await GetStartupAdvisorBookmarkIds();
      if (response?.success || response?.isSuccess) {
        setBookmarkedIds(uniqueIds(response.data?.advisorIds ?? []));
      }
    } finally {
      if (!silent) {
        setLoadingIds(false);
      }
    }
  }, []);

  useEffect(() => {
    void refreshBookmarkedIds();

    if (typeof window === "undefined") return;

    let channel: BroadcastChannel | null = null;

    const onStorage = (event: StorageEvent) => {
      if (event.key === BOOKMARKS_REFRESH_KEY) {
        void refreshBookmarkedIds(true);
      }
    };

    window.addEventListener("storage", onStorage);

    if ("BroadcastChannel" in window) {
      channel = new BroadcastChannel(BOOKMARKS_CHANNEL_NAME);
      channel.onmessage = () => {
        void refreshBookmarkedIds(true);
      };
    }

    return () => {
      window.removeEventListener("storage", onStorage);
      channel?.close();
    };
  }, [refreshBookmarkedIds]);

  const isBookmarked = useCallback(
    (advisorId: number) => bookmarkedIds.includes(advisorId),
    [bookmarkedIds]
  );

  const isBookmarkPending = useCallback(
    (advisorId: number) => Boolean(pendingIds[advisorId]),
    [pendingIds]
  );

  const saveBookmark = useCallback(
    async (advisorId: number) => {
      if (!advisorId || pendingIds[advisorId]) return false;

      setPending(advisorId, true);

      try {
        const response = await CreateStartupAdvisorBookmark(advisorId);

        if (response?.success || response?.isSuccess) {
          setBookmarkedIds((current) => uniqueIds([...current, advisorId]));
          notifyBookmarksUpdated();
          toast.success("Đã lưu cố vấn vào danh sách của bạn.");
          return true;
        }

        const code = getErrorCode(response);
        if (code === "BOOKMARK_ALREADY_EXISTS") {
          setBookmarkedIds((current) => uniqueIds([...current, advisorId]));
        }

        toast.error(translateBookmarkError(response, "Không thể lưu cố vấn lúc này."));
        return false;
      } catch (error) {
        toast.error(translateBookmarkError(error, "Không thể lưu cố vấn lúc này."));
        return false;
      } finally {
        setPending(advisorId, false);
      }
    },
    [notifyBookmarksUpdated, pendingIds, setPending]
  );

  const removeBookmark = useCallback(
    async (advisorId: number) => {
      if (!advisorId || pendingIds[advisorId]) return false;

      setPending(advisorId, true);

      try {
        const response = await RemoveStartupAdvisorBookmark(advisorId);

        if (response?.success || response?.isSuccess) {
          setBookmarkedIds((current) => current.filter((id) => id !== advisorId));
          notifyBookmarksUpdated();
          toast.success("Đã bỏ lưu cố vấn.");
          return true;
        }

        const code = getErrorCode(response);
        if (code === "BOOKMARK_NOT_FOUND") {
          setBookmarkedIds((current) => current.filter((id) => id !== advisorId));
        }

        toast.error(translateBookmarkError(response, "Không thể bỏ lưu cố vấn lúc này."));
        return false;
      } catch (error) {
        toast.error(translateBookmarkError(error, "Không thể bỏ lưu cố vấn lúc này."));
        return false;
      } finally {
        setPending(advisorId, false);
      }
    },
    [notifyBookmarksUpdated, pendingIds, setPending]
  );

  const toggleBookmark = useCallback(
    async (advisorId: number) => {
      if (isBookmarked(advisorId)) {
        return removeBookmark(advisorId);
      }

      return saveBookmark(advisorId);
    },
    [isBookmarked, removeBookmark, saveBookmark]
  );

  return {
    bookmarkedIds,
    loadingIds,
    isBookmarked,
    isBookmarkPending,
    refreshBookmarkedIds,
    saveBookmark,
    removeBookmark,
    toggleBookmark,
  };
}
