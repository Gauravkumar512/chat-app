const AUTH_TOKEN_KEY = "echo.accessToken"
const AUTH_COOKIE_NAME = "accessToken"

export const persistAuthToken = (token: string) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token)

    const secureFlag = window.location.protocol === "https:" ? "; Secure" : ""
    document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=1800; SameSite=Lax${secureFlag}`
}

export const getAuthToken = (): string | null => {
    return localStorage.getItem(AUTH_TOKEN_KEY)
}

export const clearAuthToken = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`
}
