import { useState, useEffect, useRef, useCallback } from "react";
import { socket } from "../lib/socket";

const TYPING_TIMEOUT_MS = 2000;

export const useTypingIndicator = (roomId: string) => {
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
    const isTyping = useRef(false);
    const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const handleUserTyping = (data: { roomId: string; username: string }) => {
            if (data.roomId !== roomId) return;

            setTypingUsers((prev) =>
                prev.includes(data.username) ? prev : [...prev, data.username]
            );

            // Clear any existing timeout for this user
            const existing = timers.current.get(data.username);
            if (existing) clearTimeout(existing);

            // Auto-remove after timeout (safety net if stop-typing is missed)
            const timer = setTimeout(() => {
                setTypingUsers((prev) => prev.filter((u) => u !== data.username));
                timers.current.delete(data.username);
            }, TYPING_TIMEOUT_MS + 500);
            timers.current.set(data.username, timer);
        };

        const handleUserStopTyping = (data: { roomId: string; username: string }) => {
            if (data.roomId !== roomId) return;
            setTypingUsers((prev) => prev.filter((u) => u !== data.username));
            const existing = timers.current.get(data.username);
            if (existing) {
                clearTimeout(existing);
                timers.current.delete(data.username);
            }
        };

        socket.on("user-typing", handleUserTyping);
        socket.on("user-stop-typing", handleUserStopTyping);

        return () => {
            socket.off("user-typing", handleUserTyping);
            socket.off("user-stop-typing", handleUserStopTyping);
            // Clean up all timers
            timers.current.forEach((t) => clearTimeout(t));
            timers.current.clear();
            setTypingUsers([]);
        };
    }, [roomId]);

    const emitTyping = useCallback(() => {
        if (!isTyping.current) {
            isTyping.current = true;
            socket.emit("typing", roomId);
        }

        // Reset the stop timer
        if (stopTimer.current) clearTimeout(stopTimer.current);
        stopTimer.current = setTimeout(() => {
            isTyping.current = false;
            socket.emit("stop-typing", roomId);
        }, TYPING_TIMEOUT_MS);
    }, [roomId]);

    const emitStopTyping = useCallback(() => {
        if (isTyping.current) {
            isTyping.current = false;
            if (stopTimer.current) clearTimeout(stopTimer.current);
            socket.emit("stop-typing", roomId);
        }
    }, [roomId]);

    return { typingUsers, emitTyping, emitStopTyping };
};
