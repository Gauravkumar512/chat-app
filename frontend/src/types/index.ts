export interface IUser {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
}

export interface IRoom {
    _id: string;
    name: string;
    description?: string;
    createdBy: IUser;
    createdAt: string;
}

export interface IMessage {
    _id: string;
    content: string;
    sender: IUser;
    room: IRoom;
}
