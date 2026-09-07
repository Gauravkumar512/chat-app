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

const disconnect = (io: TypedServer, socket: TypedSocket) => {
    socket.on("disconnect", (reason: string) => {
        const user = socket.data.user;
        console.log(`${user.username} disconnected: ${reason}`);

        for (const roomId of socket.rooms) {
            if (roomId === socket.id) continue;
            io.to(roomId).emit("user-left", {
                roomId,
                userId: user._id,
                username: user.username,
            });
            emitOnlineUsersForRoom(io, roomId);
        }
    });
};

export default disconnect;