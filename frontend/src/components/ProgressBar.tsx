interface ProgressBarProps {
    current: number;
    total: number;
    filename: string;
}

export default function ProgressBar({ current, total, filename }: ProgressBarProps) {
    if (total === 0) return null;

    const percent = Math.round((current / total) * 100);

    return (
        <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{current} / {total}</span>
                <span>{percent}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${percent}%` }}
                />
            </div>
            {filename && (
                <div className="mt-1 text-xs text-gray-400 truncate">{filename}</div>
            )}
        </div>
    );
}