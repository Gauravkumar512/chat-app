import { useEffect, useRef } from "react";
import type { ChatItem } from "../../hooks/useMessages";
import { useAuthStore } from "../../store/useAuthStore";

interface MessageListProps {
    items: ChatItem[];
    isLoading: boolean;
}

function fmtTime(input: string | Date | undefined): string {
    if (!input) return "";
    const d = typeof input === "string" ? new Date(input) : input;
    const hh = d.getHours().toString().padStart(2, "0");
    const mm = d.getMinutes().toString().padStart(2, "0");
    return `${hh}:${mm}`;
}

function dayKey(input: string | Date | undefined): string {
    if (!input) return "";
    const d = typeof input === "string" ? new Date(input) : input;
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(input: string | Date | undefined): string {
    if (!input) return "";
    const d = typeof input === "string" ? new Date(input) : input;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.round((today.getTime() - target.getTime()) / 86_400_000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return target.toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

export default function MessageList({ items, isLoading }: MessageListProps) {
    const { user } = useAuthStore();
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [items]);

    if (isLoading) {
        return (
            <div
                style={{
                    display: "flex",
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <div
                    style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.08)",
                        borderTopColor: "var(--echo-text-mute)",
                        animation: "spin 0.7s linear infinite",
                    }}
                />
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div
                style={{
                    display: "flex",
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 24,
                }}
            >
                <p style={{ fontSize: 13, color: "var(--echo-text-mute)" }}>
                    No messages yet. Say hello.
                </p>
            </div>
        );
    }

    return (
        <div
            className="hide-scrollbar"
            style={{
                display: "flex",
                flex: 1,
                flexDirection: "column",
                overflowY: "auto",
                padding: "16px 18px 20px",
                gap: 2,
            }}
        >
            {items.map((item, i) => {
                const itemDay = dayKey(item.createdAt);
                const prevItemDay = i > 0 ? dayKey(items[i - 1].createdAt) : "";
                const showDivider = !!itemDay && itemDay !== prevItemDay;

                if (item.type === "system") {
                    return (
                        <div key={item._id}>
                            {showDivider && <DateDivider label={dayLabel(item.createdAt)} />}
                            <div
                                style={{
                                    display: "flex",
                                    width: "100%",
                                    justifyContent: "center",
                                    padding: "8px 0",
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: 11,
                                        color: "var(--echo-text-mute)",
                                        letterSpacing: "0.02em",
                                    }}
                                >
                                    {item.text}
                                </span>
                            </div>
                        </div>
                    );
                }

                const isMe = item.sender._id === user?._id;
                const prev = items[i - 1];
                const sameSenderAsPrev =
                    !showDivider &&
                    prev &&
                    prev.type !== "system" &&
                    prev.sender._id === item.sender._id;

                return (
                    <div key={item._id}>
                        {showDivider && <DateDivider label={dayLabel(item.createdAt)} />}

                        <div
                            style={{
                                display: "flex",
                                width: "100%",
                                justifyContent: isMe ? "flex-end" : "flex-start",
                                marginTop: sameSenderAsPrev ? 2 : 10,
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: isMe ? "flex-end" : "flex-start",
                                    maxWidth: "min(560px, 72%)",
                                    minWidth: 0,
                                }}
                            >
                                {!isMe && !sameSenderAsPrev && (
                                    <span
                                        style={{
                                            marginLeft: 12,
                                            marginBottom: 4,
                                            fontSize: 11,
                                            color: "var(--echo-text-mute)",
                                            letterSpacing: "0.01em",
                                        }}
                                    >
                                        @{item.sender.username}
                                    </span>
                                )}

                                <Bubble isMe={isMe} text={item.content} time={fmtTime(item.createdAt)} />
                            </div>
                        </div>
                    </div>
                );
            })}

            <div ref={bottomRef} />
        </div>
    );
}

function Bubble({
    isMe,
    text,
    time,
}: {
    isMe: boolean;
    text: string;
    time: string;
}) {
    return (
        <div
            style={{
                position: "relative",
                background: isMe ? "#1A3A2A" : "#111111",
                color: isMe ? "#e9fff1" : "var(--echo-text)",
                border: isMe ? "1px solid rgba(255,255,255,0.04)" : "1px solid #1f2937",
                padding: "9px 12px 6px",
                borderRadius: 16,
                borderBottomRightRadius: isMe ? 4 : 16,
                borderBottomLeftRadius: isMe ? 16 : 4,
                fontSize: 14,
                lineHeight: 1.45,
                wordBreak: "break-word",
                whiteSpace: "pre-wrap",
            }}
        >
            <span style={{ display: "block", paddingRight: 48 }}>{text}</span>
            <span
                style={{
                    position: "absolute",
                    right: 10,
                    bottom: 5,
                    fontSize: 10,
                    color: isMe ? "rgba(233,255,241,0.55)" : "#6b7280",
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: "0.02em",
                }}
            >
                {time}
            </span>
        </div>
    );
}

function DateDivider({ label }: { label: string }) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                margin: "16px 0 12px",
            }}
        >
            <span
                style={{
                    padding: "4px 12px",
                    fontSize: 11,
                    color: "#9ca3af",
                    background: "#000",
                    border: "1px solid #1f2937",
                    borderRadius: 999,
                    letterSpacing: "0.02em",
                }}
            >
                {label}
            </span>
        </div>
    );
}
