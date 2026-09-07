import type { TypedServer, TypedSocket } from "../../types";

const typing = (io: TypedServer, socket: TypedSocket) => {

    socket.on("typing", (roomId: string) => {
        socket.to(roomId).emit("user-typing", {
            roomId,
            username: socket.data.user.username,
        });
    });

    socket.on("stop-typing", (roomId: string) => {
        socket.to(roomId).emit("user-stop-typing", {
            roomId,
            username: socket.data.user.username,
        });
    });
};

export default typing;
