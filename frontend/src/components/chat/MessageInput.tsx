import { useState } from "react";
import { socket } from "../../lib/socket";

interface MessageInputProps {
    roomId: string;
    onTyping?: () => void;
    onStopTyping?: () => void;
}

export default function MessageInput({ roomId, onTyping, onStopTyping }: MessageInputProps) {
    const [content, setContent] = useState("");
    const [focused, setFocused] = useState(false);

    const handleSend = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!content.trim()) return;
        socket.emit("send-message", { roomId, content });
        setContent("");
        onStopTyping?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setContent(e.target.value);
        if (e.target.value.trim()) {
            onTyping?.();
        } else {
            onStopTyping?.();
        }
    };

    const canSend = content.trim().length > 0;

    return (
        <div
            style={{
                borderTop: "1px solid rgba(255,255,255,0.06)",
                padding: "10px 20px 12px",
                background: "#0A0A0A",
            }}
        >
            <form
                onSubmit={handleSend}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    background: "#111",
                    border: "1px solid",
                    borderColor: focused ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.06)",
                    transition: "border-color 180ms ease",
                }}
            >
                {/* Terminal caret */}
                <span
                    className="font-mono"
                    aria-hidden
                    style={{
                        fontSize: 13,
                        color: focused ? "#fff" : "var(--echo-text-mute)",
                        userSelect: "none",
                        transition: "color 180ms ease",
                    }}
                >
                    {">"}
                </span>

                <input
                    type="text"
                    value={content}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="transmit message…"
                    className="font-mono"
                    style={{
                        flex: 1,
                        background: "transparent",
                        border: "none",
                        padding: 0,
                        fontSize: 13,
                        color: "#fff",
                        outline: "none",
                        letterSpacing: "0.02em",
                    }}
                    autoComplete="off"
                />

                <span
                    className="font-mono"
                    style={{
                        fontSize: 10,
                        letterSpacing: "0.18em",
                        color: "var(--echo-text-mute)",
                    }}
                >
                    ↵ SEND
                </span>

                <button
                    type="submit"
                    disabled={!canSend}
                    className="font-mono"
                    style={{
                        padding: "5px 12px",
                        background: canSend ? "#EAEAEA" : "transparent",
                        color: canSend ? "#000" : "var(--echo-text-mute)",
                        border: `1px solid ${canSend ? "#EAEAEA" : "rgba(255,255,255,0.1)"}`,
                        fontSize: 11,
                        letterSpacing: "0.18em",
                        cursor: canSend ? "pointer" : "not-allowed",
                        transition: "all 160ms ease",
                    }}
                >
                    TX
                </button>
            </form>
        </div>
    );
}

