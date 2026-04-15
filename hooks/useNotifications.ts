"use client";

import { useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";

type NotificationHandler = (n: INotificationItem) => void;

/**
 * useNotifications
 * - Opens a persistent SignalR connection to the chat hub and listens for
 *   `ReceiveNotification` messages, forwarding them to the provided callback.
 * - Reuses the same hub path `/hubs/chat` so server-side `Clients.User(...)`
 *   pushes are received by this connection.
 */
export function useNotifications(onNotification?: NotificationHandler) {
  const onNotificationRef = useRef<NotificationHandler | undefined>(onNotification);
  onNotificationRef.current = onNotification;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const accessTokenFactory = () => {
      try {
        return localStorage.getItem("accessToken") ?? "";
      } catch {
        return "";
      }
    };

    const backend = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
    if (!backend) return;

    const url = `${backend.replace(/\/$/, "")}/hubs/notifications`;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(url, { accessTokenFactory })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.None)
      .build();

    let disposed = false;
    let startPromise: Promise<void> | null = null;

    const isExpectedShutdownError = (err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err ?? "");
      const lower = msg.toLowerCase();
      return (
        lower.includes("stopped during negotiation") ||
        lower.includes("connection was stopped") ||
        lower.includes("abort")
      );
    };

    const handleReceive = (payload: any) => {
      try {
        onNotificationRef.current?.(payload as INotificationItem);
      } catch (e) {
        // swallow handler errors
        // eslint-disable-next-line no-console
        console.warn("useNotifications handler error", e);
      }
    };

    connection.on("ReceiveNotification", handleReceive);

    connection.onreconnecting((err) => {
      console.warn("[useNotifications] reconnecting...", err);
    });
    connection.onreconnected((connId) => {
      console.info("[useNotifications] reconnected:", connId);
    });
    connection.onclose((err) => {
      if (disposed) return;
      console.warn("[useNotifications] connection closed", err);
    });

    startPromise = connection.start()
      .then(async () => {
        if (disposed) {
          if (connection.state !== signalR.HubConnectionState.Disconnected) {
            await connection.stop().catch(() => { /* ignore */ });
          }
          return;
        }
        console.info("[useNotifications] connected to", url);
      })
      .catch((err) => {
        if (disposed && isExpectedShutdownError(err)) return;
        console.warn("useNotifications: connection failed", err);
      });

    return () => {
      disposed = true;
      try {
        connection.off("ReceiveNotification", handleReceive);

        // Avoid stopping while negotiation is still in-flight (common in StrictMode)
        Promise.resolve(startPromise)
          .catch(() => { /* ignore */ })
          .finally(() => {
            if (connection.state !== signalR.HubConnectionState.Disconnected) {
              connection.stop().catch(() => { /* ignore */ });
            }
          });
      } catch {
        // ignore
      }
    };
  }, []);

  return null;
}
