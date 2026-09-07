import { Server, Socket } from "socket.io"
import type { IUser } from "../models/User"

declare global {
    namespace Express {
        interface User extends IUser {}
    }
}

export interface RoomCreatedPayload {
    _id: string
    name: string
    description?: string
    createdBy: { _id: string; username: string; email?: string }
    createdAt: string
    updatedAt?: string
}

export interface ServerToClientEvents {
    "receive-message": (data: {
        _id: string
        content: string
        sender: { _id: string; username: string; avatar?: string }
        avatar?: string
        room: string
        createdAt: Date
    }) => void
    "user-joined": (data: { roomId: string; userId: string; username: string }) => void
    "user-left": (data: { roomId: string; userId: string; username: string }) => void
    "room-created": (data: { room: RoomCreatedPayload }) => void
    "room-deleted": (data: { id: string }) => void
    "online-users": (data: { roomId: string; users: string[] }) => void
    "user-typing": (data: { roomId: string; username: string }) => void
    "user-stop-typing": (data: { roomId: string; username: string }) => void
}

export interface ClientToServerEvents {
    "join-room": (roomId: string) => void
    "leave-room": (roomId: string) => void
    "send-message": (data: { roomId: string; content: string }) => void
    "typing": (roomId: string) => void
    "stop-typing": (roomId: string) => void
}

export interface InterServerEvents {}

export interface SocketData {
    user: {
        _id: string
        username: string
    }
}

export type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
export type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>

export type { Request, Response, NextFunction, RequestHandler } from "express"

export {}

