import { useEffect } from "react";
import { socket } from "../lib/socket";

const pendingLeaves = new Map<string, ReturnType<typeof setTimeout>>();

export const useSocket = (roomId: string) => {
    useEffect(() => {
        if (!roomId) return

        const pending = pendingLeaves.get(roomId);
        if (pending) {
            clearTimeout(pending);
            pendingLeaves.delete(roomId);
        }

        socket.emit("join-room", roomId)

        return () => {
            const leaveTimer = setTimeout(() => {
                socket.emit("leave-room", roomId)
                pendingLeaves.delete(roomId);
            }, 300);
            pendingLeaves.set(roomId, leaveTimer);
        }
    }, [roomId])

}
