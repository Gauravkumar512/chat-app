import { useState, useEffect } from 'react';
import { socket } from '../lib/socket';

export const useOnlineUsers = (roomId: string) => {
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

    useEffect(() => {
        const handleInitialUsers = (data: { roomId: string; users: string[] }) => {
            if (data.roomId !== roomId) return;
            setOnlineUsers(data.users);
        };

        const handleUserJoined = (data: { roomId: string; userId: string; username: string }) => {
            if (data.roomId !== roomId) return;
            setOnlineUsers((prev) =>
                prev.includes(data.username) ? prev : [...prev, data.username]
            );
        };

        const handleUserLeft = (data: { roomId: string; userId: string; username: string }) => {
            if (data.roomId !== roomId) return;
            setOnlineUsers((prev) => prev.filter((u) => u !== data.username));
        };

        socket.on('online-users', handleInitialUsers);
        socket.on('user-joined', handleUserJoined);
        socket.on('user-left', handleUserLeft);


        return () => {
            socket.off('online-users', handleInitialUsers);
            socket.off('user-joined', handleUserJoined);
            socket.off('user-left', handleUserLeft);
        };
    }, [roomId]);

    return { onlineUsers };
};
