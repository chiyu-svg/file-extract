interface OptionsPanelProps {
    moveMode: boolean;
    onMoveModeChange: (value: boolean) => void;
    dryRun: boolean;
    onDryRunChange: (value: boolean) => void;
    preserveDir: boolean;
    onPreserveDirChange: (value: boolean) => void;
    cleanup: boolean;
    onCleanupChange: (value: boolean) => void;
}

export default function OptionsPanel({
    moveMode, onMoveModeChange,
    dryRun, onDryRunChange,
    preserveDir, onPreserveDirChange,
    cleanup, onCleanupChange,
}: OptionsPanelProps) {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">选项</label>

            {/* 操作模式：复制 / 移动（互斥 Radio） */}
            <div className="flex gap-2 mb-2">
                <label className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    !moveMode ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}>
                    <input
                        type="radio"
                        name="moveMode"
                        checked={!moveMode}
                        onChange={() => onMoveModeChange(false)}
                        className="accent-emerald-500"
                    />
                    📋 复制文件
                </label>
                <label className={`flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    moveMode ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}>
                    <input
                        type="radio"
                        name="moveMode"
                        checked={moveMode}
                        onChange={() => onMoveModeChange(true)}
                        className="accent-emerald-500"
                    />
                    ✂️ 移动文件
                </label>
            </div>

            {/* 其他选项：复选框 */}
            <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={dryRun}
                        onChange={(e) => onDryRunChange(e.target.checked)}
                        className="accent-emerald-500 w-4 h-4"
                    />
                    <span className="text-sm text-gray-300">👁 演习模式</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={preserveDir}
                        onChange={(e) => onPreserveDirChange(e.target.checked)}
                        className="accent-emerald-500 w-4 h-4"
                    />
                    <span className="text-sm text-gray-300">📁 保留目录结构</span>
                </label>
                <label className={`flex items-center gap-2 ${moveMode ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                    <input
                        type="checkbox"
                        checked={cleanup}
                        onChange={(e) => onCleanupChange(e.target.checked)}
                        disabled={!moveMode}
                        className="accent-emerald-500 w-4 h-4"
                    />
                    <span className="text-sm text-gray-300">🧹 清理空目录</span>
                </label>
            </div>
        </div>
    );
}
