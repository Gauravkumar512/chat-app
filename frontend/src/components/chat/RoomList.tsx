import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import type { IRoom } from "../../types";

interface RoomListProps {
    rooms: IRoom[];
    onDelete?: (id: string) => void;
}

export default function RoomList({ rooms, onDelete }: RoomListProps) {
    const location = useLocation();
    const match = location.pathname.match(/^\/chat\/room\/([^/]+)/);
    const activeRoomId = match?.[1];
    const { user } = useAuthStore();

    const sortedRooms = [...rooms].sort((a, b) => {
        const aIsGeneral = a.name.trim().toLowerCase() === "general chat";
        const bIsGeneral = b.name.trim().toLowerCase() === "general chat";
        if (aIsGeneral && !bIsGeneral) return -1;
        if (!aIsGeneral && bIsGeneral) return 1;
        return 0;
    });

    if (!rooms || rooms.length === 0) {
        return (
            <div
                className="font-mono"
                style={{
                    padding: "12px 16px",
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    color: "var(--echo-text-mute)",
                }}
            >
                {">"} no channels. create one ↓
            </div>
        );
    }

    const slug = (name: string) =>
        name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "");

    return (
        <ul style={{ display: "flex", flexDirection: "column", margin: 0, padding: 0, listStyle: "none" }}>
            {sortedRooms.map((room) => {
                const isActive = activeRoomId === room._id;
                const isOwner = !!(user && room.createdBy && user._id === room.createdBy._id);

                return (
                    <li
                        key={room._id}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 4,
                        }}
                    >
                        <Link
                            to={`/chat/room/${room._id}`}
                            className="font-mono"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "7px 12px",
                                fontSize: 12,
                                letterSpacing: "0.04em",
                                color: isActive ? "#fff" : "var(--echo-text-soft)",
                                background: isActive ? "rgba(255,255,255,0.04)" : "transparent",
                                borderLeft: `2px solid ${isActive ? "rgba(255,255,255,0.4)" : "transparent"}`,
                                transition: "color 150ms, background 150ms",
                                textDecoration: "none",
                                flex: 1,
                                minWidth: 0,
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) e.currentTarget.style.color = "#fff";
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) e.currentTarget.style.color = "var(--echo-text-soft)";
                            }}
                        >
                            {isActive ? (
                                <span className="echo-online-dot" aria-hidden />
                            ) : (
                                <span
                                    style={{
                                        width: 7,
                                        height: 7,
                                        borderRadius: "50%",
                                        background: "transparent",
                                        border: "1px solid rgba(255,255,255,0.12)",
                                        flexShrink: 0,
                                    }}
                                    aria-hidden
                                />
                            )}
                            <span
                                style={{
                                    color: isActive ? "#fff" : "var(--echo-text-mute)",
                                    flexShrink: 0,
                                }}
                            >
                                #
                            </span>
                            <span
                                style={{
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    minWidth: 0,
                                }}
                            >
                                {slug(room.name)}
                            </span>
                        </Link>

                        {isOwner && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (onDelete) onDelete(room._id);
                                }}
                                title="Delete channel"
                                className="font-mono"
                                style={{
                                    background: "transparent",
                                    border: "1px solid rgba(239,68,68,0.15)",
                                    color: "#ef4444",
                                    cursor: "pointer",
                                    padding: "3px 7px",
                                    fontSize: 10,
                                    letterSpacing: "0.1em",
                                    marginRight: 6,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = "rgba(239,68,68,0.1)";
                                    e.currentTarget.style.color = "#ff5d5d";
                                    e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = "transparent";
                                    e.currentTarget.style.color = "#ef4444";
                                    e.currentTarget.style.borderColor = "rgba(239,68,68,0.15)";
                                }}
                            >
                                DEL
                            </button>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
