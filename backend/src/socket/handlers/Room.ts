import type { TypedServer, TypedSocket } from "../../types";

const emitOnlineUsersForRoom = (io: TypedServer, roomId: string) => {
    const roomSockets = io.sockets.adapter.rooms.get(roomId);
    if (!roomSockets) {
        io.to(roomId).emit("online-users", { roomId, users: [] });
        return;
    }

    const usernames = new Set<string>();
    for (const socketId of roomSockets) {
        const roomSocket = io.sockets.sockets.get(socketId);
        const username = roomSocket?.data.user?.username;
        if (username) usernames.add(username);
    }

    io.to(roomId).emit("online-users", { roomId, users: [...usernames] });
};

const joinRoom = (io: TypedServer, socket: TypedSocket) => {
    socket.on("join-room", (roomId: string) => {
        if (socket.rooms.has(roomId)) {
            emitOnlineUsersForRoom(io, roomId);
            return;
        }

        socket.join(roomId);

        io.to(roomId).emit("user-joined", {
            roomId,
            username: socket.data.user.username,
            userId: socket.data.user._id,
        });
        emitOnlineUsersForRoom(io, roomId);
        console.log(`${socket.data.user.username} joined room ${roomId}`);
    });

    socket.on("leave-room", (roomId: string) => {
        if (!socket.rooms.has(roomId)) {
            emitOnlineUsersForRoom(io, roomId);
            return;
        }

        io.to(roomId).emit("user-left", {
            roomId,
            username: socket.data.user?.username,
            userId: socket.data.user?._id,
        });
        socket.leave(roomId);
        emitOnlineUsersForRoom(io, roomId);
        console.log(`${socket.data.user?.username} left room ${roomId}`);
    });
};

export default joinRoom;