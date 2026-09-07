import React, { useState } from "react"
import { connectSocket } from "../lib/socket"
import { apiClient } from "../lib/api"
import { Link, useNavigate } from "react-router-dom"
import { useAuthStore } from "../store/useAuthStore"
import axios from "axios"
import { persistAuthToken } from "../lib/authStorage"

const USERNAME_RE = /^[a-zA-Z0-9_]+$/

export default function RegisterPage() {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()
    const { setUser } = useAuthStore()

    const startOAuth = (provider: "google" | "github") => {
        const baseUrl = (apiClient.defaults.baseURL || import.meta.env.VITE_API_URL || "").replace(/\/$/, "")
        if (!baseUrl) {
            setError("OAuth is not configured")
            return
        }
        window.location.href = `${baseUrl}/auth/${provider}`
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setLoading(true)

        const normalizedUsername = username.trim().replace(/\s+/g, "_")

        if (
            normalizedUsername.length < 3 ||
            normalizedUsername.length > 20 ||
            !USERNAME_RE.test(normalizedUsername)
        ) {
            setError("Username must be 3–20 characters: letters, numbers, underscores")
            setLoading(false)
            return
        }

        try {
            const response = await apiClient.post("/auth/register", {
                username: normalizedUsername,
                email: email.trim(),
                password,
            })
            const { user: userData, accessToken } = response.data.data
            if (accessToken) persistAuthToken(accessToken)
            setUser(userData)
            connectSocket()
            navigate("/chat")
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                const backendError = error.response?.data?.error?.[0]
                const message = error.response?.data?.message
                if (typeof backendError === "string") setError(backendError)
                else if (typeof message === "string") setError(message)
                else setError("An error occurred during registration")
            } else {
                setError("An error occurred during registration")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#0A0A0A",
                padding: "32px 16px",
            }}
        >
            <div style={{ width: "100%", maxWidth: 400 }}>
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                    <Link
                        to="/"
                        className="font-display"
                        style={{
                            fontSize: 18,
                            fontWeight: 600,
                            color: "#fff",
                            textDecoration: "none",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        Echo
                    </Link>
                </div>

                <h1
                    className="font-display"
                    style={{
                        fontSize: 22,
                        fontWeight: 600,
                        color: "#fff",
                        margin: "0 0 6px",
                        letterSpacing: "-0.02em",
                        textAlign: "center",
                    }}
                >
                    Create your account
                </h1>
                <p
                    style={{
                        fontSize: 13,
                        color: "#B3B3B3",
                        margin: "0 0 28px",
                        textAlign: "center",
                    }}
                >
                    Free, no card required
                </p>

                {error && (
                    <div
                        style={{
                            marginBottom: 16,
                            padding: "10px 12px",
                            borderRadius: 6,
                            border: "1px solid rgba(239,68,68,0.25)",
                            background: "rgba(239,68,68,0.08)",
                            fontSize: 12,
                            color: "#ef4444",
                        }}
                    >
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <Field
                        id="register-username"
                        label="Username"
                        type="text"
                        value={username}
                        onChange={(v) => setUsername(v.replace(/\s+/g, "_"))}
                        placeholder="your_handle"
                        required
                        autoComplete="username"
                    />
                    <Field
                        id="register-email"
                        label="Email"
                        type="email"
                        value={email}
                        onChange={setEmail}
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                    />
                    <Field
                        id="register-password"
                        label="Password"
                        type="password"
                        value={password}
                        onChange={setPassword}
                        placeholder="••••••••"
                        autoComplete="new-password"
                    />

                    <button
                        type="submit"
                        id="register-submit"
                        disabled={loading}
                        className="font-mono"
                        style={{
                            width: "100%",
                            padding: "11px 16px",
                            borderRadius: 6,
                            border: "none",
                            background: loading ? "#2a2a2a" : "#EAEAEA",
                            color: loading ? "#666" : "#000",
                            fontSize: 13,
                            fontWeight: 600,
                            letterSpacing: "0.12em",
                            cursor: loading ? "not-allowed" : "pointer",
                            transition: "background 160ms ease, color 160ms ease",
                            marginTop: 4,
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) e.currentTarget.style.background = "#fff"
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) e.currentTarget.style.background = "#EAEAEA"
                        }}
                    >
                        {loading ? "Creating account…" : "INITIATE SIGNAL"}
                    </button>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            margin: "6px 0",
                            fontSize: 11,
                            color: "#6b6b75",
                        }}
                    >
                        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
                        <span>or</span>
                        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                        {[
                            { src: "/google-color-svgrepo-com.svg", label: "Google", id: "google" as const },
                            { src: "/github-svgrepo-com.svg", label: "GitHub", id: "github" as const },
                        ].map(({ src, label, id }) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => startOAuth(id)}
                                style={{
                                    flex: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 8,
                                    padding: "10px 12px",
                                    background: "transparent",
                                    border: "1px solid #374151",
                                    borderRadius: 6,
                                    fontSize: 13,
                                    color: "#B3B3B3",
                                    cursor: "pointer",
                                    transition: "border-color 150ms, color 150ms",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = "#4b5563"
                                    e.currentTarget.style.color = "#fff"
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = "#374151"
                                    e.currentTarget.style.color = "#B3B3B3"
                                }}
                            >
                                <img
                                    src={src}
                                    alt=""
                                    width={14}
                                    height={14}
                                    style={{ filter: label === "GitHub" ? "invert(1)" : "none" }}
                                />
                                {label}
                            </button>
                        ))}
                    </div>
                </form>

                <p style={{ marginTop: 24, textAlign: "center", fontSize: 13, color: "#B3B3B3" }}>
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        style={{ color: "#fff", textDecoration: "none", fontWeight: 500 }}
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}

function Field({
    id,
    label,
    type,
    value,
    onChange,
    placeholder,
    required,
    autoComplete,
}: {
    id: string
    label: string
    type: "text" | "email" | "password"
    value: string
    onChange: (v: string) => void
    placeholder?: string
    required?: boolean
    autoComplete?: string
}) {
    return (
        <div>
            <label
                htmlFor={id}
                style={{
                    display: "block",
                    marginBottom: 6,
                    fontSize: 13,
                    color: "#e4e4e7",
                    fontWeight: 500,
                }}
            >
                {label}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                autoComplete={autoComplete}
                style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 12px",
                    background: "transparent",
                    border: "1px solid #374151",
                    borderRadius: 6,
                    fontSize: 14,
                    color: "#fff",
                    outline: "none",
                    fontFamily: "inherit",
                    transition: "border-color 150ms",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#6b7280")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#374151")}
            />
        </div>
    )
}
