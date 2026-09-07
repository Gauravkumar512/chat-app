import axios from "axios"
import { getAuthToken } from "./authStorage"

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
})

apiClient.interceptors.request.use((config) => {
    const token = getAuthToken()

    if (token) {
        config.headers = config.headers ?? {}
        ;(config.headers as Record<string, string>).Authorization = `Bearer ${token}`
    }

    return config
})
