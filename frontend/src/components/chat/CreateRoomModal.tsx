import { useState } from "react";
import { apiClient } from "../../lib/api";
import type { IRoom } from "../../types";

type Theme = "light" | "dark";

export default function CreateRoomModal({
    onClose,
    onCreated,
    theme = "dark",
}: {
    onClose: () => void;
    onCreated: (room: IRoom) => void;
    theme?: Theme;
}) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setError("");
        setLoading(true);
        try {
            const res = await apiClient.post("/room", {
                name: name.trim(),
                description: description.trim() || undefined,
            });
            onCreated(res.data.data);
        } catch (err: unknown) {
            const msg =
                err && typeof err === "object" && "response" in err
                    ? (err as { response?: { data?: { message?: string } } }).response?.data
                          ?.message
                    : undefined;
            setError(msg || "Failed to create room");
        } finally {
            setLoading(false);
        }
    };

    const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    const isDark = theme === "dark";

    return (
        <div
            onClick={handleBackdrop}
            style={{
                position: 'fixed', inset: 0, zIndex: 100,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 16px',
                background: 'rgba(0,0,0,0.7)',
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '100%', maxWidth: '420px',
                    borderRadius: '8px',
                    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e5e7eb',
                    background: isDark ? '#111' : '#fff',
                    padding: '24px',
                    animation: 'animateIn 0.18s ease-out both',
                }}
            >
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: '20px',
                }}>
                    <div>
                        <h2 style={{
                            fontSize: '14px', fontWeight: 600, margin: 0,
                            color: isDark ? '#fff' : '#111',
                        }}>
                            Create a room
                        </h2>
                        <p style={{
                            fontSize: '11px', color: isDark ? '#52525b' : '#9ca3af',
                            marginTop: '3px',
                        }}>
                            Start a new conversation space
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '28px', height: '28px', borderRadius: '4px',
                            background: 'none',
                            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e5e7eb',
                            color: isDark ? '#71717a' : '#9ca3af',
                            cursor: 'pointer', transition: 'color 0.15s',
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14 }}>
                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <p style={{
                        marginBottom: '16px', padding: '10px 12px',
                        borderRadius: '4px', fontSize: '12px', fontWeight: 500,
                        background: isDark ? '#1a0a0a' : '#fef2f2',
                        color: '#ef4444',
                        border: isDark ? '1px solid #3f1515' : '1px solid #fecaca',
                    }}>
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                        <label
                            htmlFor="room-name-modal"
                            style={{
                                display: 'block', fontSize: '11px', fontWeight: 500,
                                color: isDark ? '#a1a1aa' : '#374151',
                                marginBottom: '6px', letterSpacing: '0.02em',
                            }}
                        >
                            Room name <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            id="room-name-modal"
                            type="text"
                            autoFocus
                            placeholder="e.g. general, design…"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={60}
                            required
                            style={{
                                width: '100%', height: '36px',
                                background: isDark ? '#1a1a1f' : '#f9fafb',
                                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e5e7eb',
                                borderRadius: '4px', padding: '0 12px',
                                fontSize: '13px', color: isDark ? '#e4e4e7' : '#111',
                                outline: 'none', fontFamily: 'inherit',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.15s',
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.2)' : '#9ca3af';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';
                            }}
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="room-desc-modal"
                            style={{
                                display: 'block', fontSize: '11px', fontWeight: 500,
                                color: isDark ? '#a1a1aa' : '#374151',
                                marginBottom: '6px', letterSpacing: '0.02em',
                            }}
                        >
                            Description{' '}
                            <span style={{ fontWeight: 400, color: isDark ? '#52525b' : '#9ca3af' }}>
                                (optional)
                            </span>
                        </label>
                        <textarea
                            id="room-desc-modal"
                            placeholder="What's this room about?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            maxLength={200}
                            style={{
                                width: '100%', resize: 'none',
                                background: isDark ? '#1a1a1f' : '#f9fafb',
                                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e5e7eb',
                                borderRadius: '4px', padding: '8px 12px',
                                fontSize: '13px', color: isDark ? '#e4e4e7' : '#111',
                                outline: 'none', fontFamily: 'inherit', lineHeight: '1.5',
                                boxSizing: 'border-box',
                                transition: 'border-color 0.15s',
                            }}
                            onFocus={(e) => {
                                e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.2)' : '#9ca3af';
                            }}
                            onBlur={(e) => {
                                e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb';
                            }}
                        />
                        <p style={{
                            textAlign: 'right', fontSize: '10px',
                            color: isDark ? '#52525b' : '#9ca3af',
                            marginTop: '4px',
                        }}>
                            {description.length}/200
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                flex: 1, height: '36px', borderRadius: '4px',
                                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e5e7eb',
                                background: 'none',
                                fontSize: '12px', fontWeight: 500,
                                color: isDark ? '#71717a' : '#6b7280',
                                cursor: 'pointer', transition: 'color 0.15s',
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !name.trim()}
                            style={{
                                flex: 1, height: '36px', borderRadius: '4px',
                                border: 'none',
                                background: loading || !name.trim()
                                    ? (isDark ? '#1a1a1f' : '#e5e7eb')
                                    : (isDark ? '#fff' : '#111'),
                                color: loading || !name.trim()
                                    ? (isDark ? '#52525b' : '#9ca3af')
                                    : (isDark ? '#111' : '#fff'),
                                fontSize: '12px', fontWeight: 500,
                                cursor: loading || !name.trim() ? 'not-allowed' : 'pointer',
                                transition: 'background 0.15s, color 0.15s',
                            }}
                        >
                            {loading ? "Creating…" : "Create room"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
