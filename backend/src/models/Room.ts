import mongoose, { Document, Schema } from 'mongoose';

export interface IRoom extends Document {
    name: string;
    description?: string;
    createdBy: mongoose.Types.ObjectId;
}

const roomSchema: Schema<IRoom> = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String},
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }
}, {
    timestamps: true
})

export const Room = mongoose.model<IRoom>('room', roomSchema)