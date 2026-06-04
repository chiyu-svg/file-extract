interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }: ConfirmDialogProps) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onCancel}
        >
            <div
                className="bg-gray-800 rounded-xl p-6 max-w-sm w-full mx-4 border border-gray-700"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-300 mb-6">{message}</p>
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                    >
                        取消
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white transition-colors"
                    >
                        确定
                    </button>
                </div>
            </div>
        </div>
    );
}
