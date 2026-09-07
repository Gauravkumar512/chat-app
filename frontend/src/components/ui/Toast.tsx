export type ToastItem = { id: string; text: string };

export default function Toast({ items }: { items: ToastItem[] }) {
    if (!items || items.length === 0) return null;

    return (
        <div style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 1100, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map((t) => (
                <div key={t.id} style={{ minWidth: 220, maxWidth: 360, padding: '10px 12px', borderRadius: 8, background: '#111', border: '1px solid rgba(255,255,255,0.06)', color: '#e4e4e7', boxShadow: '0 6px 18px rgba(2,6,23,0.6)' }}>
                    <div style={{ fontSize: 13 }}>{t.text}</div>
                </div>
            ))}
        </div>
    );
}
