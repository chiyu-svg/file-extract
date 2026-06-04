import { FileEntry } from "../types";
import { formatFileSize, getFileIcon } from "../utils";

interface LogPanelProps {
  entries: FileEntry[];
  onClear: () => void;
}

const STATUS_CONFIG: Record<
  string,
  { icon: string; label: string; color: string }
> = {
  extracted: { icon: "✅", label: "已提取", color: "text-emerald-400" },
  skipped: { icon: "⏭", label: "已跳过", color: "text-yellow-400" },
  error: { icon: "❌", label: "错误", color: "text-red-400" },
};

export default function LogPanel({ entries, onClear }: LogPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-gray-300">📝 操作日志</h2>
          {entries.length > 0 && (
            <span className="text-xs text-gray-500">({entries.length})</span>
          )}
        </div>
        {entries.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            清空
          </button>
        )}
      </div>
      <div className="flex-1 max-h-[400px] overflow-y-auto custom-scrollbar">
        {entries.length === 0 ? (
          <div className="text-center text-gray-500 py-8 text-sm">
            📭 暂无操作记录
          </div>
        ) : (
          <div className="space-y-1">
            {entries.map((entry, idx) => {
              const status = STATUS_CONFIG[entry.status] || STATUS_CONFIG.error;
              const fileName =
                entry.sourcePath.split(/[/\\]/).pop() || entry.sourcePath;
              return (
                <div
                  key={idx}
                  className="animate-slideIn flex items-start gap-2 px-2 py-1.5 rounded hover:bg-gray-800/50 transition-colors"
                >
                  <span className="text-xs shrink-0">{status.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm truncate">
                        {getFileIcon(fileName)} {fileName}
                      </span>
                      <span className={`text-xs shrink-0 ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{formatFileSize(entry.fileSize)}</span>
                      {entry.destPath && (
                        <span className="truncate">
                          → {entry.destPath.split(/[/\\]/).pop()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
