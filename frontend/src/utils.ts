// 人性化文件大小：B / KB / MB / GB
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// 根据文件扩展名返回图标
export function getFileIcon(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const iconMap: Record<string, string> = {
        jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', bmp: '🖼️', svg: '🖼️', webp: '🖼️',
        pdf: '📄',
        doc: '📝', docx: '📝', txt: '📝', md: '📝',
        xls: '📊', xlsx: '📊', csv: '📊',
        mp3: '🎵', wav: '🎵', flac: '🎵',
        mp4: '🎬', avi: '🎬', mkv: '🎬',
        zip: '📦', rar: '📦', '7z': '📦', tar: '📦', gz: '📦',
        go: '🔷', ts: '🔷', tsx: '🔷', js: '🔷', py: '🔷', rs: '🔷', java: '🔷',
    };
    return iconMap[ext] || '📎';
}