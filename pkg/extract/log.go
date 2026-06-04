package extract

import (
	"encoding/json"
	"fmt"
	"os"
)

// 讲文件条目列表序列化为 JSON 写入文件
func SaveLog(logPath string, entries []FileEntry) error {
	data, err := json.MarshalIndent(entries, "", "  ")
	if err != nil {
		return fmt.Errorf("序列化日志失败: %w", err)
	}
	return os.WriteFile(logPath, data, 0644)
}

// 从日志文件读取并反序列化文件条目列表
func LoadLog(logPath string) ([]FileEntry, error) {
	data, err := os.ReadFile(logPath)
	if err != nil {
		return nil, fmt.Errorf("读取日志文件失败: %w", err)
	}
	var entries []FileEntry
	if err := json.Unmarshal(data, &entries); err != nil {
		return nil, fmt.Errorf("日志文件损坏了: %w", err)
	}
	return entries, nil
}

// 删除日志文件
func ClearLog(logPath string) error {
	return os.Remove(logPath)
}
