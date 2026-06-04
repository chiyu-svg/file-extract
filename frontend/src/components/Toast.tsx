import { useEffect, useState } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    type: ToastType;
    message: string;
    onClose: () => void;
}

const TYPE_STYLES: Record<ToastType, string> = {
    success: 'bg-emerald-600 border-emerald-500',
    error: 'bg-red-600 border-red-500',
    warning: 'bg-amber-600 border-amber-500',
    info: 'bg-blue-600 border-blue-500',
};

const TYPE_ICONS: Record<ToastType, string> = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
};

export default function Toast({ type, message, onClose }: ToastProps) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        // 3 秒后自动消失
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300); // 等 fadeOut 动画结束再移除
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg text-white text-sm transition-all duration-300 ${
                TYPE_STYLES[type]
            } ${visible ? 'animate-slideInRight' : 'animate-fadeOut'}`}
        >
            <span>{TYPE_ICONS[type]}</span>
            <span>{message}</span>
            <button
                onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
                className="ml-2 text-white/70 hover:text-white"
            >
                ✕
            </button>
        </div>
    );
}
