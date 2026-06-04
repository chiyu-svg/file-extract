import { getFileIcon } from '../utils';

interface PreviewModalProps {
    open: boolean;
    onClose: () => void;
    files: string[];
}

export default function PreviewModal({ open, onClose, files }: PreviewModalProps) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            <div
                className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-medium text-white mb-4">
                    匹配文件预览 (前{files.length}个)
                </h3>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                    {files.length === 0 ? (
                        <div className="text-center text-gray-500 py-4 text-sm">
                            未找到匹配的文件
                        </div>
                    ) : (
                        files.map((file, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-700/50 text-sm text-gray-300"
                            >
                                <span>{getFileIcon(file)}</span>
                                <span className="truncate">{file}</span>
                            </div>
                        ))
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="mt-4 w-full px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                >
                    关闭
                </button>
            </div>
        </div>
    );
}
