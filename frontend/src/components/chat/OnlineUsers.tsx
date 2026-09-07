interface OnlineUsersProps {
    users: string[];
}

export default function OnlineUsers({ users }: OnlineUsersProps) {
    return (
        <div style={{
            display: 'flex', width: '220px', flexDirection: 'column',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
            background: '#0a0a0f',
        }}>
            <div style={{
                display: 'flex', height: '48px', alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                padding: '0 16px',
            }}>
                <h3 style={{
                    fontSize: '10px', fontWeight: 500,
                    letterSpacing: '0.08em', textTransform: 'uppercase',
                    color: '#52525b',
                }}>
                    Online - {users.length}
                </h3>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }} className="hide-scrollbar">
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '8px', listStyle: 'none', margin: 0, padding: 0 }}>
                    {users.map((username) => (
                        <li key={username} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    display: 'flex', width: '28px', height: '28px',
                                    alignItems: 'center', justifyContent: 'center',
                                    borderRadius: '6px', background: '#1a1a1f',
                                    fontSize: '11px', fontWeight: 500, color: '#71717a',
                                }}>
                                    {username.charAt(0).toUpperCase()}
                                </div>
                                <span style={{
                                    position: 'absolute', bottom: '-1px', right: '-1px',
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    border: '2px solid #0a0a0f', background: '#4ade80',
                                }} />
                            </div>
                            <span style={{
                                fontSize: '12px', fontWeight: 400, color: '#a1a1aa',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                                {username}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
