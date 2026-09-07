import mongoose from "mongoose";
import type { TypedServer,TypedSocket } from "../../types";
import { Message } from "../../models/Message";
import { IUser } from "../../models/User";


const sendMessage = (io: TypedServer, socket: TypedSocket) => {

    socket.on('send-message', async ({ roomId, content }) => {
    try {    
            const message = await Message.create({
                content,
                sender: new mongoose.Types.ObjectId(socket.data.user._id),
                room: new mongoose.Types.ObjectId(roomId),
            });
    
            const populated = await message.populate<{sender: IUser}>('sender', 'username avatar');
    
            io.to(roomId).emit('receive-message', {
                _id: populated._id.toString(),
                content: populated.content,
                sender: {
                    _id: populated.sender._id.toString(),
                    username: populated.sender.username.toString(),
                    avatar: populated.sender.avatar?.toString() || "",
                },
                room: populated.room.toString(),
                createdAt: (populated as any).createdAt
            });

    } catch (error) {
        console.error('Error sending message:', error);
    }
})
};

export default sendMessage;