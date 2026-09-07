import { Socket, io } from "socket.io-client"
import { getAuthToken } from "./authStorage"

const socketUrl = import.meta.env.VITE_SOCKET_URL

export const socket: Socket = io(socketUrl, {
    autoConnect: false,
    withCredentials: true,
})

export const connectSocket = (): Socket => {
    const token = getAuthToken()

    socket.auth = token ? { token } : {}

    if (!socket.connected) {
        socket.connect()
    }

    return socket
}

export default connectSocket
