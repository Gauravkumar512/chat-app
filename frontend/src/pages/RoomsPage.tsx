import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { apiClient } from "../lib/api"
import { socket } from "../lib/socket"
import type { IRoom } from "../types"
import CreateRoomModal from "../components/chat/CreateRoomModal"

function formatRelativeTime(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60_000)
    if (mins < 1) return "just now"
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
}

function EmptyState({ hasFilter, onClear }: { hasFilter: boolean; onClear: () => void }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", textAlign: "center" }}>
            <p className="font-mono" style={{ fontSize: 12, letterSpacing: "0.16em", color: "var(--echo-text-soft)" }}>
                {hasFilter ? "NO MATCHES" : "NO CHANNELS YET"}
            </p>
            <p style={{ fontSize: 13, color: "var(--echo-text-mute)", marginTop: 6 }}>
                {hasFilter ? "Try a different keyword" : "Create one to start transmitting"}
            </p>
            {hasFilter && (
                <button onClick={onClear} className="font-mono" style={{ marginTop: 14, fontSize: 11, letterSpacing: "0.16em", color: "var(--echo-text)", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", cursor: "pointer", padding: "6px 12px" }}>
                    CLEAR SEARCH
                </button>
            )}
        </div>
    )
}

function SkeletonRow() {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 100px", alignItems: "center", gap: 16, padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ height: 12, background: "#1a1a1f", animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ height: 12, background: "#1a1a1f", animation: "pulse 1.5s ease-in-out infinite" }} />
            <div style={{ height: 12, background: "#1a1a1f", animation: "pulse 1.5s ease-in-out infinite" }} />
        </div>
    )
}

export default function RoomsPage() {
    const [rooms, setRooms] = useState<IRoom[]>([])
    const [loading, setLoading] = useState(true)
    const [fetchError, setFetchError] = useState("")
    const [search, setSearch] = useState("")
    const [showModal, setShowModal] = useState(false)
    const [hoveredRow, setHoveredRow] = useState<string | null>(null)
    const [searchFocused, setSearchFocused] = useState(false)

    const navigate = useNavigate()

    const fetchRooms = useCallback(async () => {
        setLoading(true)
        setFetchError("")
        try {
            const res = await apiClient.get("/room")
            setRooms(res.data.data ?? res.data)
        } catch {
            setFetchError("Could not load rooms. Please try again.")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchRooms() }, [fetchRooms])

    useEffect(() => {
        const onRoomCreated = (payload: { room: IRoom }) => {
            const room = payload.room
            setRooms((prev) => {
                if (prev.some((existing) => existing._id === room._id)) return prev
                return [room, ...prev]
            })
        }
        const onRoomDeleted = (payload: { id: string }) => {
            setRooms((prev) => prev.filter((room) => room._id !== payload.id))
        }
        socket.on("room-created", onRoomCreated)
        socket.on("room-deleted", onRoomDeleted)
        return () => {
            socket.off("room-created", onRoomCreated)
            socket.off("room-deleted", onRoomDeleted)
        }
    }, [])

    const filteredRooms = rooms.filter(
        (r) =>
            r.name.toLowerCase().includes(search.toLowerCase()) ||
            r.description?.toLowerCase().includes(search.toLowerCase())
    )

    const handleRoomCreated = (newRoom: IRoom) => {
        setRooms((prev) => {
            if (prev.some((x) => x._id === newRoom._id)) return prev
            return [newRoom, ...prev]
        })
        setShowModal(false)
        navigate(`/chat/room/${newRoom._id}`)
    }

    return (
        <>
            <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#0A0A0A" }}>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, padding: "24px 28px 18px", flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <div>
                        <p className="font-mono" style={{ fontSize: 10, letterSpacing: "0.28em", color: "var(--echo-text-mute)", margin: "0 0 6px" }}>CHANNELS DIRECTORY</p>
                        <h1 className="font-display" style={{ fontSize: 24, fontWeight: 600, color: "#fff", letterSpacing: "-0.02em", margin: 0 }}>Rooms</h1>
                        <p className="font-mono" style={{ fontSize: 11, color: "var(--echo-text-mute)", letterSpacing: "0.1em", marginTop: 6 }}>
                            {loading ? "LOADING…" : `${rooms.length} ${rooms.length === 1 ? "ROOM" : "ROOMS"} AVAILABLE`}
                        </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <input
                            id="rooms-search"
                            type="text"
                            placeholder="Search…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                            className="font-mono"
                            style={{ width: 200, height: 34, background: "#111", border: `1px solid ${searchFocused ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.06)"}`, borderRadius: 0, padding: "0 12px", fontSize: 12, color: "#fff", outline: "none", letterSpacing: "0.06em", transition: "border-color 150ms" }}
                        />
                        <button
                            id="open-create-room-modal"
                            onClick={() => setShowModal(true)}
                            className="font-mono"
                            style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 34, padding: "0 14px", border: "1px solid #EAEAEA", background: "#EAEAEA", color: "#000", fontSize: 12, fontWeight: 600, letterSpacing: "0.16em", cursor: "pointer", transition: "background 150ms", borderRadius: 0 }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "#fff" }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "#EAEAEA" }}
                        >
                            <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>
                            NEW ROOM
                        </button>
                    </div>
                </div>

                {fetchError && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "16px 28px 0", padding: "10px 14px", border: "1px solid rgba(239,68,68,0.25)", borderLeft: "2px solid #ef4444", background: "rgba(239,68,68,0.06)" }}>
                        <p className="font-mono" style={{ fontSize: 12, color: "#ef4444", letterSpacing: "0.06em" }}>ERR: {fetchError}</p>
                        <button onClick={fetchRooms} className="font-mono" style={{ fontSize: 11, letterSpacing: "0.16em", color: "#ef4444", background: "none", border: "1px solid rgba(239,68,68,0.4)", cursor: "pointer", padding: "4px 10px" }}>RETRY</button>
                    </div>
                )}

                <div style={{ flex: 1, overflowY: "auto", padding: "0 28px" }} className="hide-scrollbar">
                    {loading ? (
                        <div>{Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}</div>
                    ) : filteredRooms.length === 0 ? (
                        <EmptyState hasFilter={search.length > 0} onClear={() => setSearch("")} />
                    ) : (
                        <div>
                            <div className="font-mono" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 100px", alignItems: "center", gap: 16, padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 10, letterSpacing: "0.22em", color: "var(--echo-text-faint)" }}>
                                <span>NAME</span>
                                <span>CREATED BY</span>
                                <span style={{ textAlign: "right" }}>TIME</span>
                            </div>
                            {filteredRooms.map((room) => (
                                <div
                                    key={room._id}
                                    id={`room-card-${room._id}`}
                                    onClick={() => navigate(`/chat/room/${room._id}`)}
                                    onMouseEnter={() => setHoveredRow(room._id)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                    style={{ display: "grid", gridTemplateColumns: "2fr 1fr 100px", alignItems: "center", gap: 16, padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)", background: hoveredRow === room._id ? "rgba(255,255,255,0.03)" : "transparent", borderLeft: hoveredRow === room._id ? "2px solid rgba(255,255,255,0.22)" : "2px solid transparent", cursor: "pointer", transition: "background 120ms, border-color 120ms" }}
                                >
                                    <div style={{ minWidth: 0, display: "flex", alignItems: "center", gap: 10 }}>
                                        <span className="font-mono" style={{ color: "var(--echo-text-mute)", flexShrink: 0 }}>#</span>
                                        <div style={{ minWidth: 0 }}>
                                            <span className="font-mono" style={{ fontSize: 14, color: "#fff", letterSpacing: "0.02em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{room.name}</span>
                                            {room.description && (<span style={{ fontSize: 12, color: "var(--echo-text-mute)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", marginTop: 2 }}>{room.description}</span>)}
                                        </div>
                                    </div>
                                    <span className="font-mono" style={{ fontSize: 12, color: "var(--echo-text-soft)", letterSpacing: "0.04em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>@{room.createdBy?.username ?? "-"}</span>
                                    <span className="font-mono" style={{ fontSize: 11, color: "var(--echo-text-mute)", letterSpacing: "0.1em", textAlign: "right" }}>{formatRelativeTime(room.createdAt)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <CreateRoomModal
                    theme="dark"
                    onClose={() => setShowModal(false)}
                    onCreated={handleRoomCreated}
                />
            )}
        </>
    )
}
