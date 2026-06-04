package extract

import (
	"fmt"
	"os"
	"path/filepath"
)

// 仅支持移动模式的撤销
// 返回：恢复的文件数、失败的文件列表、错误
func Undo(logPath string) (int, []string, error) {
	// 读取日志
	entries, err := LoadLog(logPath)
	if err != nil {
		return 0, nil, fmt.Errorf("读取日志失败: %w", err)
	}
	// 过滤出需要恢复的条目
	var toRestore []FileEntry
	for _, entry := range entries {
		if entry.Status == "extracted" {
			toRestore = append(toRestore, entry)
		}
	}

	if len(toRestore) == 0 {
		return 0, nil, fmt.Errorf("日志中没有可恢复的文件")
	}

	// 反向遍历，将文件移回原始的位置
	restored := 0
	var failed []string

	for i := len(toRestore) - 1; i >= 0; i-- {
		entry := toRestore[i]
		// 确保源路径的父目录存在
		os.MkdirAll(filepath.Dir(entry.SourcePath), 0755)

		if err := os.Rename(entry.DestPath, entry.SourcePath); err != nil {
			failed = append(failed, entry.DestPath)
		} else {
			restored++
		}
	}
	// 全部恢复成功后删除日志文件
	if len(failed) == 0 {
		ClearLog(logPath)
	}
	return restored, failed, nil
}
