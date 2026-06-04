export default function Header() {
    return (
        <header className="bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
                <span className="text-2xl">📦</span>
                <h1 className="text-xl font-bold text-white">FileExtract 文件提取工具</h1>
            </div>
            <span className="text-xs text-emerald-100/70">v1.0.0</span>
        </header>
    );
}