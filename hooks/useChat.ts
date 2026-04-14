"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import * as signalR from "@microsoft/signalr";

export type ChatConnectionState = "idle" | "connecting" | "connected" | "reconnecting" | "disconnected" | "error";

interface UseChatOptions {
    conversationId: number | null;
    onMessage: (msg: IIncomingMessage) => void;
    onNotification?: (n: any) => void;
}

interface UseChatReturn {
    sendMessage: (content: string, attachmentUrl?: string) => void;
    connectionState: ChatConnectionState;
}

export function useChat({ conversationId, onMessage, onNotification }: UseChatOptions): UseChatReturn {
    const onMessageRef = useRef(onMessage);
    const onNotificationRef = useRef<((n: any) => void) | undefined>(onNotification);
    useEffect(() => { onMessageRef.current = onMessage; }, [onMessage]);
    useEffect(() => { onNotificationRef.current = onNotification; }, [onNotification]);

    const connectionRef = useRef<signalR.HubConnection | null>(null);
    const [connectionState, setConnectionState] = useState<ChatConnectionState>("idle");

    useEffect(() => {
        // Không kết nối nếu chưa có conversationId
        if (conversationId == null) {
            setConnectionState("idle");
            return;
        }

        // Luôn đọc token mới nhất tại thời điểm negotiate/reconnect
        const getToken = () => localStorage.getItem("accessToken") ?? "";

        if (!getToken()) {
            setConnectionState("error");
            return;
        }

        setConnectionState("connecting");

        const connection = new signalR.HubConnectionBuilder()
            .withUrl(`${process.env.NEXT_PUBLIC_BACKEND_URL}/hubs/chat`, {
                accessTokenFactory: getToken,
                // Thử WebSocket trước, fallback LongPolling — tránh negotiate fail do transport
                transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
            })
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (ctx) => {
                    // Dừng retry sau 3 lần thất bại
                    if (ctx.previousRetryCount >= 3) return null;
                    return [0, 3000, 10000][ctx.previousRetryCount] ?? 10000;
                },
            })
            .configureLogging(signalR.LogLevel.Warning)
            .build();

        // Sự kiện từ Hub
        connection.on("ReceiveMessage", (msg) => onMessageRef.current(msg));
        connection.on("ReceiveNotification", (n) => { try { onNotificationRef.current && onNotificationRef.current(n); } catch (e) { console.warn('[ChatHub] ReceiveNotification handler error', e); } });
        connection.on("Error", (msg: string) => console.error("[ChatHub]", msg));

        // Theo dõi trạng thái reconnect
        connection.onreconnecting(() => setConnectionState("reconnecting"));
        connection.onreconnected(() => setConnectionState("connected"));
        connection.onclose(() => setConnectionState("disconnected"));

        connection
            .start()
            .then(() => {
                setConnectionState("connected");
                return connection.invoke("JoinConversation", conversationId);
            })
            .catch((err: Error) => {
                // 404 = hub chưa triển khai, 401 = token lỗi — không crash UI
                const msg = err?.message ?? "";
                const is404 = msg.includes("404") || msg.includes("Not Found");
                const is401 = msg.includes("401") || msg.includes("Unauthorized") || msg.includes("negotiation");
                if (is404) {
                    console.warn("[ChatHub] Hub chưa tồn tại (404) — realtime tạm thời không khả dụng.");
                } else if (is401) {
                    console.warn("[ChatHub] Token không hợp lệ hoặc hết hạn (401).");
                } else {
                    console.warn("[ChatHub] Không thể kết nối:", msg);
                }
                setConnectionState("error");
            });

        connectionRef.current = connection;

        return () => {
            connectionRef.current = null;
            if (connection.state === signalR.HubConnectionState.Connected) {
                connection
                    .invoke("LeaveConversation", conversationId)
                    .catch(() => {})
                    .finally(() => connection.stop());
            } else {
                connection.stop();
            }
        };
    // onMessage thay đổi mỗi render nếu không được memo — chỉ re-connect khi conversationId thay đổi
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId]);

    const sendMessage = useCallback(
        async (content: string, attachmentUrl?: string) => {
            const conn = connectionRef.current;
            if (!conn || conn.state !== signalR.HubConnectionState.Connected) {
                throw new Error("Chat service is currently not connected");
            }
            if (conversationId == null) return;

            await conn.invoke("SendMessage", {
                conversationId,
                content,
                attachmentUrl: attachmentUrl ?? null,
            } satisfies ISendMessageBody);
        },
        [conversationId]
    );

    return { sendMessage, connectionState };
}
