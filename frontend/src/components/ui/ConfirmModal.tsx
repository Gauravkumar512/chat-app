export default function ConfirmModal({
    open,
    title = "Are you sure?",
    description,
    confirmLabel = "Delete",
    onClose,
    onConfirm,
}: {
    open: boolean;
    title?: string;
    description?: string;
    confirmLabel?: string;
    onClose: () => void;
    onConfirm: () => void;
}) {
    if (!open) return null;

    return (
        <div
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{ width: '100%', maxWidth: 420, borderRadius: 8, padding: 20, background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}
            >
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#fff' }}>{title}</h3>
                {description && (
                    <p style={{ marginTop: 8, marginBottom: 16, fontSize: 13, color: '#c7c7cc' }}>{description}</p>
                )}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{ padding: '8px 12px', borderRadius: 6, background: 'transparent', border: '1px solid rgba(255,255,255,0.06)', color: '#c7c7cc', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        style={{ padding: '8px 12px', borderRadius: 6, background: '#ef4444', border: 'none', color: '#fff', cursor: 'pointer' }}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
