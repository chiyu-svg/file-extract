import { useState, useEffect } from 'react';
import { SelectDirectory, GetFileStats } from '../../wailsjs/go/main/App';
import { FileStats  } from '../types';
import { formatFileSize } from '../utils';


interface DirectoryInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
}

export default function DirectoryInput({ label, value, onChange, placeholder }: DirectoryInputProps) {
    const [stats, setStats] = useState<FileStats | null>(null);

    // 当 value 变化时自动查询文件统计
    useEffect(() => {
        if (!value) {
            setStats(null);
            return;
        }
        GetFileStats(value).then((result: FileStats) => {
            if (result.error) {
                setStats(null);
            } else {
                setStats(result);
            }
        }).catch(() => {
            setStats(null);
        });
    }, [value]);

    const handleBrowse = async () => {
        const dir = await SelectDirectory();
        if (dir) {
            onChange(dir);
        }
    };

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                />
                <button
                    onClick={handleBrowse}
                    className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white text-sm transition-colors whitespace-nowrap"
                >
                    📁 浏览
                </button>
            </div>
            {stats && (
                <div className="mt-1 text-xs text-gray-400">
                    {stats.totalFiles} 个文件 · {formatFileSize(stats.totalSize)} · {stats.subDirs} 个子目录
                </div>
            )}
        </div>
    );
}