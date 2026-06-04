// 单个文件的操作记录
export interface FileEntry {
    sourcePath: string;
    destPath: string;
    fileSize: number;
    status: string; // "extracted" | "skipped" | "error"
    error: string;
    timestamp: string;
}

// 提取结果
export interface ExtractResult {
    totalFiles: number;
    matchedFiles: number;
    extracted: number;
    skipped: number;
    errors: string[];
    entries: FileEntry[];
}

// 撤销结果
export interface UndoResult {
    restored: number;
    failed: string[];
    error: string;
}

// 日志读取结果
export interface LogResult {
    entries: FileEntry[];
    error: string;
}

// 清除日志结果
export interface ClearLogResult  {
    success: boolean;
    error: string;
}

// 目录文件统计
export interface FileStats {
    totalFiles: number;
    totalSize: number;
    subDirs: number;
    error: string;
}

// 预览匹配结果
export interface PreviewResult {
    files: string[];
    total: number;
    error: string;
}

//  extract:start 事件数据
export interface ExtractStartData {
    matchedFiles: number;
}

// 进度事件数据 
export interface ProgressData {
    current: number;
    total: number;
    filename: string;
    status: string;
}