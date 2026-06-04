interface ActionButtonsProps {
    isExecuting: boolean;
    onExtract: () => void;
    onUndo: () => void;
    moveMode: boolean;
    hasLog: boolean;
}

export default function ActionButtons({
    isExecuting, onExtract, onUndo, moveMode, hasLog,
}: ActionButtonsProps) {
    return (
        <div className="flex gap-3">
            <button
                onClick={onExtract}
                disabled={isExecuting}
                className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
            >
                {isExecuting ? (
                    <span className="inline-flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        执行中...
                    </span>
                ) : '▶ 开始提取'}
            </button>
            <button
                onClick={onUndo}
                disabled={isExecuting || !moveMode || !hasLog}
                className="px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
            >
                ↩ 撤销
            </button>
        </div>
    );
}