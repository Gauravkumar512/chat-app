import mongoose, {Schema,Document} from "mongoose";
import { IUser } from "./User";


export interface IMessage extends Document {
    content: string;
    sender: mongoose.Types.ObjectId | IUser;
    room: mongoose.Types.ObjectId;
}

const MessageSchema: Schema<IMessage> = new Schema({
    content: { type: String, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'room', required: true }
}, {
    timestamps: true
})

MessageSchema.index({ room: 1, createdAt: 1 })

export const Message = mongoose.model<IMessage>('message', MessageSchema)