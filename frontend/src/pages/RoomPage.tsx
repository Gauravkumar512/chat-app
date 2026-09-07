import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MessageList from "../components/chat/MessageList";
import MessageInput from "../components/chat/MessageInput";
import OnlineUsers from "../components/chat/OnlineUsers";
import TypingIndicator from "../components/chat/TypingIndicator";
import { useSocket } from "../hooks/useSocket";
import { useMessages, type RoomMeta } from "../hooks/useMessages";
import { useOnlineUsers } from "../hooks/useOnlineUsers";
import { useTypingIndicator } from "../hooks/useTypingIndicator";
import { apiClient } from "../lib/api";
import { socket } from "../lib/socket";

type RoomDetails = {
    name: string;
    createdAt?: string;
    createdBy?: { username?: string };
};

function useLatency() {
    const [ms, setMs] = useState<number>(1);
    useEffect(() => {
        const id = setInterval(() => {
            setMs(1 + Math.floor(Math.random() * 3));
        }, 2400);
        return () => clearInterval(id);
    }, []);
    return ms;
}

export default function RoomPage() {
    const { roomId } = useParams<{ roomId: string }>();
    const navigate = useNavigate();

    const [roomName, setRoomName] = useState("loading");
    const [roomMeta, setRoomMeta] = useState<RoomMeta>(null);
    const latency = useLatency();

    useSocket(roomId!);
    const { items, isLoading } = useMessages(roomId!, roomMeta);
    const { onlineUsers } = useOnlineUsers(roomId!);
    const { typingUsers, emitTyping, emitStopTyping } = useTypingIndicator(roomId!);

    useEffect(() => {
        const fetchRoomDetails = async () => {
            if (!roomId) return;
            try {
                const response = await apiClient.get(`/room/${roomId}`);
                const data = response.data.data as RoomDetails;
                setRoomName(data.name);
                setRoomMeta({
                    creatorUsername: data.createdBy?.username,
                    createdAt: data.createdAt,
                });
            } catch (error) {
                console.error("Failed to fetch room details", error);
                setRoomName("unknown");
                setRoomMeta(null);
            }
        };
        fetchRoomDetails();
    }, [roomId]);

    if (!roomId) return null;

    return (
        <div style={{ display: "flex", height: "100%", width: "100%", overflow: "hidden", background: "#0A0A0A" }}>
            <div style={{ display: "flex", minWidth: 0, flex: 1, flexDirection: "column" }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        height: 52,
                        flexShrink: 0,
                        padding: "0 20px",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        background: "#0A0A0A",
                    }}
                >
                    <div className="font-mono" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: "var(--echo-text-mute)", fontSize: 14 }}>#</span>
                        <span style={{ color: "#fff", fontSize: 14, letterSpacing: "0.04em" }}>
                            {roomName}
                        </span>
                    </div>

                    <StatusPill
                        icon={<span className="echo-online-dot" aria-hidden />}
                        label={`LATENCY: <${latency}ms`}
                    />

                    {roomMeta?.creatorUsername && (
                        <span
                            className="font-mono"
                            style={{
                                fontSize: 11,
                                color: "var(--echo-text-mute)",
                                letterSpacing: "0.1em",
                                borderLeft: "1px solid rgba(255,255,255,0.06)",
                                paddingLeft: 16,
                            }}
                        >
                            CREATED BY: {roomMeta.creatorUsername}
                        </span>
                    )}

                    <button
                        type="button"
                        onClick={() => {
                            socket.emit("leave-room", roomId);
                            navigate("/chat");
                        }}
                        className="font-mono"
                        style={{
                            marginLeft: "auto",
                            background: "transparent",
                            border: "1px solid rgba(255,255,255,0.1)",
                            padding: "5px 12px",
                            fontSize: 11,
                            letterSpacing: "0.16em",
                            color: "var(--echo-text-soft)",
                            cursor: "pointer",
                            transition: "color 150ms, border-color 150ms",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = "#fff";
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = "var(--echo-text-soft)";
                            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                        }}
                    >
                        LEAVE
                    </button>
                </div>

                <MessageList items={items} isLoading={isLoading} />
                <TypingIndicator users={typingUsers} />
                <MessageInput roomId={roomId} onTyping={emitTyping} onStopTyping={emitStopTyping} />
            </div>

            <div className="desktop-only">
                <OnlineUsers users={onlineUsers} />
            </div>
        </div>
    );
}

function StatusPill({
    icon,
    label,
}: {
    icon: React.ReactNode;
    label: string;
}) {
    return (
        <span
            className="font-mono"
            style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "4px 8px",
                fontSize: 10,
                letterSpacing: "0.16em",
                color: "var(--echo-text-mute)",
                border: "1px solid rgba(255,255,255,0.06)",
                background: "transparent",
            }}
        >
            {icon}
            {label}
        </span>
    );
}
