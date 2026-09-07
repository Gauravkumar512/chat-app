import { Server } from "socket.io";
import type { Server as HttpServer } from "http";
import type { ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData, TypedServer } from "../types";
import socketAuth from "./socketAuth";
import disconnect from "./handlers/disconnect";
import sendMessage from "./handlers/sendMessage";
import joinRoom from "./handlers/Room";
import typing from "./handlers/typing";

export let io: TypedServer

export const initSocket = (server: HttpServer) => {
    io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
        cors: {
            origin: process.env.CLIENT_URL,
            methods: ['GET', 'POST'],
            credentials: true
        }
    });
    
    io.use(socketAuth);

    io.on('connection', (socket) => {
        const id = socket.id;   
        console.log(`Client connected: ${id}`);

        joinRoom(io, socket);
        sendMessage(io, socket);
        typing(io, socket);
        disconnect(io, socket);
    });
    return io;
};





