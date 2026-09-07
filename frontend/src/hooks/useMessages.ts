import { useState, useEffect, useMemo } from "react";
import { apiClient } from "../lib/api";
import { socket } from "../lib/socket";
import { useAuthStore } from "../store/useAuthStore";

export interface IMessage {
    _id: string;
    content: string;
    sender: { _id: string; username: string };
    createdAt: string;
}

export type ChatItem =
    | { type: "message"; _id: string; content: string; sender: { _id: string; username: string }; createdAt: string }
    | { type: "system"; _id: string; text: string; createdAt: string };

export type RoomMeta = {
    createdAt?: string;
    creatorUsername?: string;
} | null;

function sortByTime(a: ChatItem, b: ChatItem) {
    return a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : 0;
}

export const useMessages = (roomId: string, roomMeta: RoomMeta) => {
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [systemLines, setSystemLines] = useState<ChatItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuthStore();

    useEffect(() => {
        setMessages([]);
        setSystemLines([]);
        setIsLoading(true);

        const fetchHistory = async () => {
            try {
                const res = await apiClient.get(`/message/${roomId}`);
                setMessages(res.data.data || []);
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setIsLoading(false);
            }
        };
        if (roomId) fetchHistory();
    }, [roomId]);

    useEffect(() => {
        if (!roomId || !roomMeta?.creatorUsername) return;
        const createdAt = roomMeta.createdAt || new Date().toISOString();
        const id = `system-room-created-${roomId}`;
        setSystemLines((prev) => {
            if (prev.some((l) => l._id === id)) return prev;
            const line: ChatItem = {
                type: "system",
                _id: id,
                text: `Room created by ${roomMeta.creatorUsername}`,
                createdAt,
            };
            return [...prev, line].sort(sortByTime);
        });
    }, [roomId, roomMeta?.creatorUsername, roomMeta?.createdAt]);

    useEffect(() => {
        const handleNewMessage = (message: IMessage & { room?: string }) => {
            if (message.room && message.room !== roomId) return;
            const createdAt =
                typeof message.createdAt === "string"
                    ? message.createdAt
                    : new Date(message.createdAt as unknown as Date).toISOString();
            const normalized: IMessage = {
                _id: message._id,
                content: message.content,
                sender: message.sender,
                createdAt,
            };
            setMessages((prev) => {
                if (prev.some((m) => m._id === normalized._id)) return prev;
                return [...prev, normalized];
            });
        };

        const appendSystem = (text: string) => {
            setSystemLines((prev) => {
                const now = Date.now();
                const last = prev[prev.length - 1];

                if (
                    last?.type === "system" &&
                    last.text === text &&
                    now - new Date(last.createdAt).getTime() < 5000
                ) {
                    return prev;
                }

                const line: ChatItem = {
                    type: "system",
                    _id: `sys-${now}-${Math.random().toString(36).slice(2)}`,
                    text,
                    createdAt: new Date(now).toISOString(),
                };
                return [...prev, line].sort(sortByTime);
            });
        };

        const onJoined = (data: { roomId: string; userId: string; username: string }) => {
            if (data.roomId !== roomId) return;
            if (user?._id === data.userId) return;
            const label = `${data.username} joined the room`;
            appendSystem(label);
        };

        const onLeft = (data: { roomId: string; userId: string; username: string }) => {
            if (data.roomId !== roomId) return;
            if (user?._id === data.userId) return;
            const label = `${data.username} left the room`;
            appendSystem(label);
        };

        socket.on("receive-message", handleNewMessage);
        socket.on("user-joined", onJoined);
        socket.on("user-left", onLeft);

        return () => {
            socket.off("receive-message", handleNewMessage);
            socket.off("user-joined", onJoined);
            socket.off("user-left", onLeft);
        };
    }, [roomId, user?._id]);

    const items = useMemo(() => {
        const msgItems: ChatItem[] = messages.map((m) => ({
            type: "message",
            _id: m._id,
            content: m.content,
            sender: m.sender,
            createdAt: m.createdAt,
        }));
        return [...msgItems, ...systemLines].sort(sortByTime);
    }, [messages, systemLines]);

    return { items, isLoading };
};
