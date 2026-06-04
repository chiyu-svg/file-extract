import { useState, useEffect, useCallback } from 'react';
import { Extract, Undo, GetLog, ClearLog } from '../wailsjs/go/main/App';
import { EventsOn } from '../wailsjs/runtime/runtime';
import { FileEntry, ExtractResult, ExtractStartData, ProgressData } from './types';
import Header from './components/Header';
import DirectoryInput from './components/DirectoryInput';
import MatchPatternInput from './components/MatchPatternInput';
import OptionsPanel from './components/OptionsPanel';
import ActionButtons from './components/ActionButtons';
import ProgressBar from './components/ProgressBar';
import LogPanel from './components/LogPanel';
import PreviewModal from './components/PreviewModal';
import Toast from './components/Toast';
import ConfirmDialog from './components/ConfirmDialog';

interface ToastItem {
    id: number;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
}

function App() {
    // 目录
    const [sourceDir, setSourceDir] = useState('');
    const [targetDir, setTargetDir] = useState('');

    // 匹配模式
    const [pattern, setPattern] = useState('');
    const [matchMode, setMatchMode] = useState('extension');

    // 选项
    const [moveMode, setMoveMode] = useState(false);
    const [dryRun, setDryRun] = useState(false);
    const [preserveDir, setPreserveDir] = useState(false);
    const [cleanup, setCleanup] = useState(false);

    // 执行状态
    const [isExecuting, setIsExecuting] = useState(false);

    // 进度
    const [progress, setProgress] = useState<ProgressData>({ current: 0, total: 0, filename: '', status: '' });

    // 日志
    const [logs, setLogs] = useState<FileEntry[]>([]);
    const [hasLog, setHasLog] = useState(false);

    // 预览
    const [previewFiles, setPreviewFiles] = useState<string[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);

    // Toast
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    let toastId = 0;

    const showToast = useCallback((type: ToastItem['type'], message: string) => {
        toastId = Date.now();
        setToasts(prev => [...prev, { id: toastId, type, message }]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    // 确认对话框
    const [confirm, setConfirm] = useState<{
        open: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({ open: false, title: '', message: '', onConfirm: () => {} });

    const showConfirm = (title: string, message: string, onConfirm: () => void) => {
        setConfirm({ open: true, title, message, onConfirm });
    };

    // 事件监听
    useEffect(() => {
        const cancelStart = EventsOn('extract:start', (data: ExtractStartData) => {
            setIsExecuting(true);
            setProgress({ current: 0, total: data.matchedFiles, filename: '', status: 'processing' });
        });

        const cancelProgress = EventsOn('extract:progress', (data: ProgressData) => {
            setProgress(data);
        });

        const cancelDone = EventsOn('extract:done', (result: ExtractResult) => {
            setIsExecuting(false);
            setLogs(result.entries || []);

            // 匹配为空 → warning
            if (result.matchedFiles === 0) {
                showToast('warning', '未找到匹配的文件，尝试更换匹配模式或关键词');
            }
            // 有错误 → error
            else if (result.errors && result.errors.length > 0) {
                showToast('error', `提取完成，但有 ${result.errors.length} 个错误`);
            }
            // 成功
            else if (result.extracted > 0) {
                showToast('success', `成功提取 ${result.extracted} 个文件`);
            } else if (result.skipped > 0) {
                showToast('info', `演习模式：${result.skipped} 个文件将被处理`);
            }
        });

        return () => {
            cancelStart();
            cancelProgress();
            cancelDone();
        };
    }, [showToast]);

    // 检查目标目录是否有日志
    useEffect(() => {
        if (!targetDir) {
            setHasLog(false);
            return;
        }
        GetLog(targetDir).then(result => {
            setHasLog(result.entries && result.entries.length > 0);
        }).catch(() => {
            setHasLog(false);
        });
    }, [targetDir]);

    // 开始提取（带表单校验）
    const handleExtract = async () => {
        if (!sourceDir) {
            showToast('warning', '请选择源目录');
            return;
        }
        if (!targetDir) {
            showToast('warning', '请选择目标目录');
            return;
        }
        if (!pattern) {
            showToast('warning', '请输入匹配模式');
            return;
        }
        if (sourceDir === targetDir) {
            showToast('error', '源目录和目标目录不能相同');
            return;
        }

        try {
            await Extract(
                sourceDir, targetDir, pattern, matchMode,
                moveMode, dryRun, preserveDir, cleanup
            );
            if (moveMode) {
                setHasLog(true);
            }
        } catch (err) {
            showToast('error', `提取失败: ${err}`);
            setIsExecuting(false);
        }
    };

    // 撤销（带确认对话框）
    const handleUndo = () => {
        if (!targetDir) return;
        showConfirm(
            '确认撤销',
            '确定要撤销上次提取操作吗？文件将被恢复到原始位置。',
            async () => {
                setConfirm(prev => ({ ...prev, open: false }));
                try {
                    const result = await Undo(targetDir);
                    if (result.error) {
                        showToast('error', result.error);
                    } else {
                        setHasLog(false);
                        setLogs([]);
                        showToast('success', `成功恢复 ${result.restored} 个文件`);
                    }
                } catch (err) {
                    showToast('error', `撤销失败: ${err}`);
                }
            }
        );
    };
    // 清空日志（带确认对话框）
    const handleClearLog = () => {
        if (!targetDir) return;
        showConfirm(
            '确认清空',
            '确定要清空操作日志吗？清空后无法撤销。',
            async () => {
                setConfirm(prev => ({ ...prev, open: false }));
                try {
                    await ClearLog(targetDir);
                    setLogs([]);
                    setHasLog(false);
                    showToast('success', '日志已清空');
                } catch (err) {
                    showToast('error', `清空日志失败: ${err}`);
                }
            }
        );
    };

    // 预览
    const handlePreview = (files: string[]) => {
        setPreviewFiles(files);
        setPreviewOpen(true);
    };

    return (
        <div className="h-screen bg-gray-900 text-white flex flex-col overflow-hidden">
            <Header />
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden p-4 gap-4">
                {/* 左侧操作面板 */}
                <div className="md:flex-1 flex flex-col overflow-y-auto custom-scrollbar pr-2">
                    <DirectoryInput
                        label="源目录"
                        value={sourceDir}
                        onChange={setSourceDir}
                        placeholder="选择源文件目录..."
                    />
                    <DirectoryInput
                        label="目标目录"
                        value={targetDir}
                        onChange={setTargetDir}
                        placeholder="选择目标存放目录..."
                    />
                    <MatchPatternInput
                        pattern={pattern}
                        onPatternChange={setPattern}
                        matchMode={matchMode}
                        onMatchModeChange={setMatchMode}
                        sourceDir={sourceDir}
                        onPreview={handlePreview}
                    />
                    <OptionsPanel
                        moveMode={moveMode}
                        onMoveModeChange={setMoveMode}
                        dryRun={dryRun}
                        onDryRunChange={setDryRun}
                        preserveDir={preserveDir}
                        onPreserveDirChange={setPreserveDir}
                        cleanup={cleanup}
                        onCleanupChange={setCleanup}
                    />
                    {isExecuting && (
                        <ProgressBar
                            current={progress.current}
                            total={progress.total}
                            filename={progress.filename}
                        />
                    )}
                    <ActionButtons
                        isExecuting={isExecuting}
                        onExtract={handleExtract}
                        onUndo={handleUndo}
                        moveMode={moveMode}
                        hasLog={hasLog}
                    />
                </div>

                {/* 右侧日志面板 */}
                <div className="md:flex-1 border-t md:border-t-0 md:border-l border-gray-700 pt-4 md:pt-0 md:pl-4">
                    <LogPanel entries={logs} onClear={handleClearLog} />
                </div>
            </div>

            {/* 预览弹窗 */}
            <PreviewModal
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                files={previewFiles}
            />

            {/* 确认对话框 */}
            <ConfirmDialog
                open={confirm.open}
                title={confirm.title}
                message={confirm.message}
                onConfirm={confirm.onConfirm}
                onCancel={() => setConfirm(prev => ({ ...prev, open: false }))}
            />

            {/* Toast 提示 */}
            {toasts.map((toast, idx) => (
                <div key={toast.id} style={{ top: `${16 + idx * 56}px` }} className="fixed right-4 z-50">
                    <Toast
                        type={toast.type}
                        message={toast.message}
                        onClose={() => removeToast(toast.id)}
                    />
                </div>
            ))}
        </div>
    );
}

export default App;
