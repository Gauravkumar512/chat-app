import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiClient } from "../lib/api"
import { getAuthToken } from "../lib/authStorage"
import { Link } from "react-router-dom"

export default function LandingPage() {
    const navigate = useNavigate()
    const [checkingAuth, setCheckingAuth] = useState(true)

    useEffect(() => {
        const check = async () => {
            if (!getAuthToken()) {
                setCheckingAuth(false)
                return
            }
            try {
                await apiClient.get("/auth/me")
                navigate("/chat", { replace: true })
            } catch {
                setCheckingAuth(false)
            }
        }
        check()
    }, [navigate])

    if (checkingAuth) {
        return (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "100vh",
                    background: "var(--echo-bg)",
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
        )
    }

    return (
        <div
            className="echo-page-on"
            style={{
                background: "var(--echo-bg)",
                color: "var(--echo-text)",
                overflowX: "hidden",
                position: "relative",
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* Navbar */}
            <nav style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 32px",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span className="echo-signal-bars" aria-hidden>
                        <span /><span /><span />
                    </span>
                    <span className="font-mono" style={{ fontSize: 13, color: "#fff", letterSpacing: "0.3em" }}>
                        ECHO
                    </span>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                    <Link to="/login" className="font-mono" style={{
                        fontSize: 12, letterSpacing: "0.16em", color: "var(--echo-text-soft)",
                        padding: "8px 16px", border: "1px solid rgba(255,255,255,0.1)",
                        background: "transparent", cursor: "pointer", textDecoration: "none",
                    }}>
                        LOG IN
                    </Link>
                    <Link to="/register" className="font-mono" style={{
                        fontSize: 12, letterSpacing: "0.16em", color: "#000",
                        padding: "8px 16px", background: "#EAEAEA", border: "1px solid #EAEAEA",
                        cursor: "pointer", textDecoration: "none",
                    }}>
                        SIGN UP
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "60px 24px 80px",
                gap: 24,
            }}>
                <div className="font-mono" style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    padding: "6px 14px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    fontSize: 11, letterSpacing: "0.2em", color: "var(--echo-text-mute)",
                }}>
                    <span className="echo-presence-dot" />
                    SIGNAL ACTIVE
                </div>

                <h1 className="font-display" style={{
                    fontSize: "clamp(32px, 6vw, 56px)",
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.1,
                    maxWidth: 640,
                }}>
                    Real-time chat.
                    <br />
                    <span style={{ color: "var(--echo-text-mute)" }}>Zero noise.</span>
                </h1>

                <p style={{
                    fontSize: 16,
                    color: "var(--echo-text-soft)",
                    maxWidth: 480,
                    lineHeight: 1.6,
                }}>
                    Echo transmits your team's conversations in real time.
                    No lag. No bloat. Just signal.
                </p>

                <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
                    <Link to="/register" className="echo-cta-primary font-mono">
                        GET STARTED
                    </Link>
                    <Link to="/login" className="font-mono" style={{
                        padding: "14px 26px", fontSize: 13, letterSpacing: "0.22em",
                        color: "#fff", border: "1px solid rgba(255,255,255,0.12)",
                        background: "transparent",
                    }}>
                        SIGN IN
                    </Link>
                </div>

                {/* Feature pills */}
                <div style={{
                    display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center",
                    marginTop: 40, maxWidth: 600,
                }}>
                    {[
                        "Real-time messaging",
                        "Chat rooms",
                        "Online presence",
                        "Message history",
                        "OAuth login",
                        "Dark mode",
                    ].map((f) => (
                        <span key={f} className="font-mono" style={{
                            padding: "6px 14px", fontSize: 11, letterSpacing: "0.1em",
                            color: "var(--echo-text-mute)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            background: "rgba(255,255,255,0.02)",
                        }}>
                            {f}
                        </span>
                    ))}
                </div>
            </div>

            <div className="echo-scanlines" aria-hidden />
        </div>
    )
}
