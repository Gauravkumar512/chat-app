interface TypingIndicatorProps {
    users: string[];
}

export default function TypingIndicator({ users }: TypingIndicatorProps) {
    if (users.length === 0) return null;

    let text: string;
    if (users.length === 1) {
        text = `${users[0]} is typing`;
    } else if (users.length === 2) {
        text = `${users[0]} and ${users[1]} are typing`;
    } else {
        text = `${users[0]} and ${users.length - 1} others are typing`;
    }

    return (
        <div
            className="font-mono"
            style={{
                padding: "4px 20px 2px",
                fontSize: 11,
                letterSpacing: "0.04em",
                color: "var(--echo-text-mute)",
                background: "#0A0A0A",
                display: "flex",
                alignItems: "center",
                gap: 6,
                minHeight: 22,
            }}
        >
            <span className="typing-dots" aria-hidden>
                <span />
                <span />
                <span />
            </span>
            <span>{text}</span>
        </div>
    );
}
