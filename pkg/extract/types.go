package extract

// 定义文件匹配方式枚举
type MatchMode string

const (
	// 后缀匹配
	MatchByExtension MatchMode = "extension"
	// 文件名关键词匹配
	MatchByKeyword MatchMode = "keyword"
	// 通配符匹配
	MatchByGlob MatchMode = "glob"
)

// 操作配置项
type ExtractOptions struct {
	SourceDir   string    // 源目录
	TargetDir   string    // 目标目录
	Pattern     string    // 匹配模式的字符串
	MatchMode   MatchMode // 匹配方式
	MoveMode    bool      // true = 移动，false = 复制
	DryRun      bool      // 演习模式，不实际操作文件
	PreserveDir bool      // 是否保留子目录结构
	Cleanup     bool      // 完成后清理空目录
}

// 提取操作的完整结果
type ExtractResult struct {
	TotalFiles   int         `json:"totalFiles"`   // 搜索到的文件总数
	MatchedFiles int         `json:"matchedFiles"` // 匹配到的文件数
	Extracted    int         `json:"extracted"`    // 成功提取的文件数
	Skipped      int         `json:"skipped"`      // 跳过的文件数
	Errors       []string    `json:"errors"`       // 错误列表
	Entries      []FileEntry `json:"entries"`      // 详细条目
}

// 单个文件的操作记录
type FileEntry struct {
	SourcePath string `json:"sourcePath"` // 原始路径
	DestPath   string `json:"destPath"`   // 目标路径
	FileSize   int64  `json:"fileSize"`   // 文件大小（字节）
	Status     string `json:"status"`     // "extracted" | "skipped" | "error"
	Error      string `json:"error"`      // 错误信息（如有）
	Timestamp  string `json:"timestamp"`  // RFC3339 时间戳
}

// LogResult 日志读取的返回结构
type LogResult struct {
	Entries []FileEntry `json:"entries"` // 日志条目列表
	Error   string      `json:"error"`   // 错误信息
}

// 预览匹配的返回文件
type PreviewResult struct {
	Files []string `json:"files"` // 匹配的文件名列表
	Total int      `json:"total"` // 匹配的总数
	Error string   `json:"error"` // 错误信息
}
