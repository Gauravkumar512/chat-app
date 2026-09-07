import { useEffect, useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { apiClient } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import { connectSocket, socket } from '../lib/socket';
import RoomList from '../components/chat/RoomList';
import ConfirmModal from '../components/ui/ConfirmModal';
import Toast, { type ToastItem } from '../components/ui/Toast';
import CreateRoomModal from '../components/chat/CreateRoomModal';
import type { IRoom } from '../types';
import axios from 'axios';
import { clearAuthToken } from '../lib/authStorage';

export default function ChatLayout() {
    const [isHydrating, setIsHydrating] = useState(true);
    const [rooms, setRooms] = useState<IRoom[]>([]);
    const [createOpen, setCreateOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<{ id: string; name?: string } | null>(null);
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const navigate = useNavigate();
    const location = useLocation();
    const { user, setUser } = useAuthStore();

    useEffect(() => {
        const verifyAndHydrate = async () => {
            try {

                const [userRes, roomsRes] = await Promise.all([
                    apiClient.get('/auth/me'),
                    apiClient.get('/room')
                ]);

                setUser(userRes.data.data);
                setRooms(roomsRes.data.data || []);

                connectSocket();
                setIsHydrating(false);
            } catch {
                console.error("Hydration failed, redirecting to login");
                clearAuthToken();
                setUser(null);
                navigate('/login');
            }
        };

        verifyAndHydrate();
    }, []);

    useEffect(() => {
        const onRoomCreated = (payload: { room: IRoom }) => {
            const r = payload.room;
            setRooms((prev) => {
                if (prev.some((x) => x._id === r._id)) return prev;
                return [
                    { _id: r._id, name: r.name, description: r.description, createdBy: r.createdBy, createdAt: r.createdAt },
                    ...prev,
                ];
            });
        };
        socket.on('room-created', onRoomCreated);
        const onRoomDeleted = (payload: { id: string }) => {
            const removedId = payload.id;
            setRooms((prev) => prev.filter((r) => r._id !== removedId));
            const inRoom = location.pathname.startsWith(`/chat/room/${removedId}`);
            if (inRoom) {
                const toastId = `deleted-${removedId}-${Date.now()}`;
                setToasts((t) => [...t, { id: toastId, text: 'This room was deleted - redirecting...' }]);
                setTimeout(() => {
                    setToasts((t) => t.filter((x) => x.id !== toastId));
                    navigate('/chat');
                }, 1200);
            }
        };
        socket.on('room-deleted', onRoomDeleted);
        return () => {
            socket.off('room-created', onRoomCreated);
            socket.off('room-deleted', onRoomDeleted);
        };
    }, [location.pathname]);

    const handleDeleteRoom = async (id: string) => {
        try {
            await apiClient.delete(`/room/${id}`);
            setRooms((prev) => prev.filter((r) => r._id !== id));
            if (location.pathname.startsWith(`/chat/room/${id}`)) {
                const toastId = `deleted-owner-${id}-${Date.now()}`;
                setToasts((t) => [...t, { id: toastId, text: 'You deleted this room - redirecting...' }]);
                setTimeout(() => {
                    setToasts((t) => t.filter((x) => x.id !== toastId));
                    navigate('/chat');
                }, 600);
            }
        } catch (error) {
            console.error('Failed to delete room', error);
        }
    };

    const requestDeleteRoom = (id: string, name?: string) => {
        setPendingDelete({ id, name });
        setConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!pendingDelete) return;
        setConfirmOpen(false);
        const id = pendingDelete.id;
        setPendingDelete(null);
        await handleDeleteRoom(id);
    };

    const handleLogout = async () => {
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            if (!axios.isAxiosError(error) || error.response?.status !== 401) {
                console.error("Logout failed", error);
            }
        } finally {
            socket.disconnect();
            clearAuthToken();
            setUser(null);
            navigate('/');
        }
    };

    if (isHydrating) {
        return (
            <div style={{
                display: 'flex', height: '100vh', width: '100%',
                alignItems: 'center', justifyContent: 'center',
                background: '#0A0A0A',
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.08)',
                        borderTopColor: 'var(--echo-text-mute)',
                        animation: 'spin 0.7s linear infinite',
                    }} />
                    <p className="font-mono" style={{
                        fontSize: 11, letterSpacing: '0.22em', color: 'var(--echo-text-mute)',
                    }}>
                        CONNECTING…
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex', flexDirection: 'column',
            height: '100vh', width: '100%',
            background: '#0A0A0A', color: 'var(--echo-text)',
            overflow: 'hidden',
        }}>

            <nav style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                height: 52, padding: '0 20px', flexShrink: 0,
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background: '#0A0A0A',
            }}>
                <div
                    style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                    onClick={() => navigate('/chat')}
                >
                    <span className="echo-signal-bars" aria-hidden>
                        <span />
                        <span />
                        <span />
                    </span>
                    <span className="font-mono" style={{
                        fontSize: 13, color: '#fff', letterSpacing: '0.3em',
                    }}>
                        ECHO
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <span className="font-mono" style={{
                        fontSize: 11, color: 'var(--echo-text-mute)', letterSpacing: '0.1em',
                    }}>
                        @{user?.username}
                    </span>
                    <button
                        onClick={handleLogout}
                        className="font-mono"
                        style={{
                            background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 0, padding: '5px 12px',
                            fontSize: 11, letterSpacing: '0.18em', color: 'var(--echo-text-soft)',
                            cursor: 'pointer', transition: 'color 150ms, border-color 150ms',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#fff';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--echo-text-soft)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        }}
                        title="Log out"
                    >
                        LOG OUT
                    </button>
                </div>
            </nav>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                <aside style={{
                    display: 'flex', width: 240, flexShrink: 0,
                    flexDirection: 'column',
                    borderRight: '1px solid rgba(255,255,255,0.06)',
                    background: '#0d0d0f',
                }}>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '18px 0 8px' }} className="hide-scrollbar">
                        <p className="font-mono" style={{
                            fontSize: 10,
                            letterSpacing: '0.28em',
                            color: 'var(--echo-text-faint)',
                            padding: '0 16px',
                            margin: '0 0 10px',
                        }}>
                            CHANNELS
                        </p>
                        <RoomList rooms={rooms} onDelete={(id) => requestDeleteRoom(id, rooms.find(r => r._id === id)?.name)} />
                    </div>

                    <div style={{
                        padding: '12px 16px',
                        borderTop: '1px solid rgba(255,255,255,0.06)',
                    }}>
                        <button
                            type="button"
                            onClick={() => setCreateOpen(true)}
                            className="font-mono"
                            style={{
                                background: 'transparent', border: 'none',
                                fontSize: 11, letterSpacing: '0.18em', color: 'var(--echo-text-soft)',
                                cursor: 'pointer', padding: '4px 0',
                                transition: 'color 150ms',
                                display: 'flex', alignItems: 'center', gap: 8,
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--echo-text-soft)'; }}
                        >
                            <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>
                            NEW CHANNEL
                        </button>
                    </div>
                </aside>

                <main style={{
                    position: 'relative', display: 'flex',
                    flex: 1, flexDirection: 'column', overflow: 'hidden',
                    background: '#0A0A0A',
                }}>
                    <Outlet />
                </main>
            </div>

            {createOpen && (
                <CreateRoomModal
                    theme="dark"
                    onClose={() => setCreateOpen(false)}
                    onCreated={(room) => {
                        setRooms((prev) => {
                            if (prev.some((x) => x._id === room._id)) return prev;
                            return [room as unknown as IRoom, ...prev];
                        });
                        setCreateOpen(false);
                        navigate(`/chat/room/${room._id}`);
                    }}
                />
            )}
            <ConfirmModal
                open={confirmOpen}
                title={pendingDelete ? `Delete ${pendingDelete.name ?? 'channel'}?` : 'Delete channel?'}
                description={pendingDelete ? `This will permanently delete the channel "${pendingDelete.name ?? ''}" and remove it for everyone.` : undefined}
                confirmLabel="Delete"
                onClose={() => { setConfirmOpen(false); setPendingDelete(null); }}
                onConfirm={confirmDelete}
            />

            <Toast items={toasts} />
        </div>
    );
}
