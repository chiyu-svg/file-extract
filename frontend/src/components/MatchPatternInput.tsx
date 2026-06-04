import { useState } from 'react';
import { PreviewMatch } from '../../wailsjs/go/main/App';
import { PreviewResult } from '../types';

interface MatchPatternInputProps {
    pattern: string;
    onPatternChange: (value: string) => void;
    matchMode: string;
    onMatchModeChange: (value: string) => void;
    sourceDir: string;
    onPreview: (files: string[]) => void;
}

const MODES = [
    { value: 'extension', label: '🔤 后缀名', placeholder: '如 jpg、.png、pdf' },
    { value: 'keyword', label: '🔍 关键词', placeholder: '如 invoice、报告' },
    { value: 'glob', label: '⭐ 通配符', placeholder: '如 *.log、photo_*' },
];

export default function MatchPatternInput({
    pattern, onPatternChange, matchMode, onMatchModeChange, sourceDir, onPreview,
}: MatchPatternInputProps) {
    const [loading, setLoading] = useState(false);
    const currentMode = MODES.find(m => m.value === matchMode) || MODES[0];
    const handlePreview = async () => {
        if (!sourceDir || !pattern) return;
        setLoading(true);
        try {
            const result: PreviewResult = await PreviewMatch(sourceDir, pattern, matchMode);
            if(result.error) {
                alert(result.error)
            } else {
                onPreview(result.files || []);
            }
        } catch (err) {
            alert(`预览失败: ${err}`);
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">匹配模式</label>
            <div className="flex gap-2 mb-2">
                {MODES.map(mode => (
                    <button
                        key={mode.value}
                        onClick={() => onMatchModeChange(mode.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                            matchMode === mode.value
                                ? 'bg-emerald-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        {mode.label}
                    </button>
                ))}
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={pattern}
                    onChange={(e) => onPatternChange(e.target.value)}
                    placeholder={currentMode.placeholder}
                    className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                />
                <button
                    onClick={handlePreview}
                    disabled={loading || !sourceDir || !pattern}
                    className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm transition-colors whitespace-nowrap"
                >
                    {loading ? '...' : '👁 预览'}
                </button>
            </div>
        </div>
    );
}
