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
      .configureLogging(signalR.LogLevel.Warning)
      .build();

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
      console.warn("[useNotifications] connection closed", err);
    });

    connection.start()
      .then(() => {
        console.info("[useNotifications] connected to", url);
      })
      .catch((err) => {
        console.warn("useNotifications: connection failed", err);
      });

    return () => {
      try {
        connection.off("ReceiveNotification", handleReceive);
        connection.stop().catch(() => { /* ignore */ });
      } catch {
        // ignore
      }
    };
  }, []);

  return null;
}
