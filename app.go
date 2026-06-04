package main

import (
	"context"
	"file-extract/pkg/extract"
	"fmt"
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello, %s! Backend is ready.", name)
}

// Extract 命令 =============================
func (a *App) Extract(
	sourceDir string,
	targetDir string,
	pattern string,
	matchMode string,
	moveMode bool,
	dryRun bool,
	preserveDir bool,
	cleanup bool,
) extract.ExtractResult {
	var mode extract.MatchMode
	switch matchMode {
	case "extension":
		mode = extract.MatchByExtension
	case "keyword":
		mode = extract.MatchByKeyword
	case "glob":
		mode = extract.MatchByGlob
	default:
		return extract.ExtractResult{
			Errors: []string{fmt.Sprintf("不支持的匹配模式: %s", matchMode)},
		}
	}

	opts := extract.ExtractOptions{
		SourceDir:   sourceDir,
		TargetDir:   targetDir,
		Pattern:     pattern,
		MatchMode:   mode,
		MoveMode:    moveMode,
		DryRun:      dryRun,
		PreserveDir: preserveDir,
		Cleanup:     cleanup,
	}

	// ===== 参数校验 =====
	// 源目录和目标目录不能相同
	if sourceDir == targetDir {
		return extract.ExtractResult{
			Errors: []string{"源目录和目标目录不能相同"},
		}
	}

	//1. 提取开始，告知前端即将处理的匹配文件数
	matchedFiles, _ := extract.MatchedFiles(opts.SourceDir, opts)
	if len(matchedFiles) == 0 {
		return extract.ExtractResult{
			MatchedFiles: 0,
			Errors:       []string{},
			Entries:      []extract.FileEntry{},
		}
	}

	runtime.EventsEmit(a.ctx, "extract:start", map[string]interface{}{
		"matchedFiles": len(matchedFiles),
	})

	//2.  构造进度回调：通过 Wails 事件推送到前端
	progressCb := func(current, total int, filename string) {
		runtime.EventsEmit(a.ctx, "extract:progress", map[string]interface{}{
			"current":  current,
			"total":    total,
			"filename": filename,
			"status":   "processing",
		})
	}

	result, err := extract.Extract(opts, progressCb)

	if err != nil {
		return extract.ExtractResult{
			Errors: []string{err.Error()},
		}
	}
	// 确保 Errors 和 Entries 不为 nil，前端序列化更加友好
	if result.Errors == nil {
		result.Errors = []string{}
	}
	if result.Entries == nil {
		result.Entries = []extract.FileEntry{}
	}
	// 3. 发送extract:done 事件： 提取完成，推送完整结果
	runtime.EventsEmit(a.ctx, "extract:done", *result)
	return *result
}

// Undo 命令 ================================
type UndoResult struct {
	Restored int      `json:"restored"` // 成功恢复的文件数
	Failed   []string `json:"failed"`   // 恢复失败的文件路径列表
	Error    string   `json:"error"`    // 整体错误信息（如有）
}

// Undo 撤销上次
// 日志路径固定为目标目录下的 extract_log.json
func (a *App) Undo(targetDir string) UndoResult {
	logPath := filepath.Join(targetDir, "extract_log.json")
	restored, failed, err := extract.Undo(logPath)
	result := UndoResult{
		Restored: restored,
		Failed:   failed,
	}
	if failed == nil {
		result.Failed = []string{}
	}
	if err != nil {
		result.Error = err.Error()
	}
	return result
}

// GetLog 命令 ==============================
func (a *App) GetLog(targetDir string) extract.LogResult {
	logPath := filepath.Join(targetDir, "extract_log.json")

	entries, err := extract.LoadLog(logPath)
	result := extract.LogResult{}
	if entries == nil {
		result.Entries = []extract.FileEntry{}
	} else {
		result.Entries = entries
	}
	if err != nil {
		result.Error = err.Error()
	}
	return result
}

// ClearLog 命令 ===========================
type ClearLogResult struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
}

// 删除文件
func (a *App) ClearLog(targetDir string) ClearLogResult {
	logPath := filepath.Join(targetDir, "extract_log.json")

	err := extract.ClearLog(logPath)
	if err != nil {
		if os.IsNotExist(err) {
			return ClearLogResult{Success: true}
		}
		return ClearLogResult{Error: err.Error()}
	}
	return ClearLogResult{Success: true}
}

// SelectDirectory 命令 ====================
func (a *App) SelectDirectory() string {
	dir, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "选择目录",
	})
	if err != nil {
		return ""
	}
	return dir
}

// GetFileStats 命令 ======================
type FileStats struct {
	TotalFiles int    `json:"totalFiles"` // 总文件数
	TotalSize  int64  `json:"totalSize"`  // 总大小（字节）
	SubDirs    int    `json:"subDirs"`    // 子目录数
	Error      string `json:"error"`
}

// 统计目录下的文件信息
func (a *App) GetFileStats(dirPath string) FileStats {
	info, err := os.Stat(dirPath)
	if err != nil {
		return FileStats{Error: fmt.Sprintf("目录不存在: %s", dirPath)}
	}
	if !info.IsDir() {
		return FileStats{Error: fmt.Sprintf("路径不是目录: %s", dirPath)}
	}
	stats := FileStats{}
	filepath.Walk(dirPath, func(path string, fi os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if fi.IsDir() {
			if path != dirPath {
				stats.SubDirs++
			}
		} else {
			stats.TotalFiles++
			stats.TotalSize += fi.Size()
		}
		return nil
	})
	return stats
}

// PreviewMatch 命令 =======================
func (a *App) PreviewMatch(sourceDir string, pattern string, matchMode string) extract.PreviewResult {
	var mode extract.MatchMode
	switch matchMode {
	case "extension":
		mode = extract.MatchByExtension
	case "keyword":
		mode = extract.MatchByKeyword
	case "glob":
		mode = extract.MatchByGlob
	default:
		return extract.PreviewResult{
			Error: fmt.Sprintf("不支持的匹配模式: %s", matchMode),
		}
	}
	opts := extract.ExtractOptions{
		SourceDir: sourceDir,
		Pattern:   pattern,
		MatchMode: mode,
	}
	matched, err := extract.MatchedFiles(sourceDir, opts)
	result := extract.PreviewResult{}

	if err != nil {
		result.Error = err.Error()
		return result
	}
	// 只显示前50个
	limit := 50
	if len(matched) > limit {
		matched = matched[:limit]
	}
	// 只返回文件名
	files := make([]string, len(matched))
	for i, p := range matched {
		files[i] = filepath.Base(p)
	}
	result.Files = files
	result.Total = len(matched)

	return result
}
