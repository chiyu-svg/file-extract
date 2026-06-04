package extract

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"
)

// 文件提取操作
// opts 提取选项
// progressCb 进度回调函数
func Extract(opts ExtractOptions, progressCb func(current, total int, filename string)) (*ExtractResult, error) {
	result := &ExtractResult{
		Errors:  []string{},
		Entries: []FileEntry{},
	}

	// 检验源目录
	info, err := os.Stat(opts.SourceDir)
	if err != nil {
		return nil, fmt.Errorf("源目录不存在啊: %s", opts.SourceDir)
	}
	if !info.IsDir() {
		return nil, fmt.Errorf("源路径不是目录啊: %s", opts.SourceDir)
	}

	// 校验非 dry-run 模式下，检验目标目录是否可写
	if !opts.DryRun {
		if err := os.MkdirAll(opts.TargetDir, 0755); err != nil {
			return nil, fmt.Errorf("无法创建目标目录: %s, %w", opts.TargetDir, err)
		}
		// 检验目标目录可写
		tmpFile := filepath.Join(opts.TargetDir, ".extract_write_test")
		f, err := os.Create(tmpFile)
		if err != nil {
			return nil, fmt.Errorf("目标目录放不进去，八成是文件权限的问题：%s, %w", opts.TargetDir, err)
		}
		f.Close()
		os.Remove(tmpFile)
	}

	// 统计源目录总文件数
	totalFiles := 0
	filepath.Walk(opts.SourceDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if !info.IsDir() {
			totalFiles++
		}
		return nil
	})
	result.TotalFiles = totalFiles

	// 获取匹配文件列表
	matchedFiles, err := MatchedFiles(opts.SourceDir, opts)
	if err != nil {
		return nil, fmt.Errorf("搜索匹配文件失败了呀: %w", err)
	}
	result.MatchedFiles = len(matchedFiles)

	// 遍历每个匹配文件
	for i, srcPath := range matchedFiles {
		fileInfo, err := os.Stat(srcPath)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("无法访问文件： %s, %v", srcPath, err))
			continue
		}

		relPath, _ := filepath.Rel(opts.SourceDir, srcPath) // 获取相对路径
		var destPath string
		if opts.PreserveDir { // 完整路径
			destPath = filepath.Join(opts.TargetDir, relPath)
		} else {
			destPath = filepath.Join(opts.TargetDir, filepath.Base(srcPath))
		}

		entry := FileEntry{
			SourcePath: srcPath,
			DestPath:   destPath,
			FileSize:   fileInfo.Size(),
			Timestamp:  time.Now().Format(time.RFC3339),
		}

		if opts.DryRun {
			// 演习模式，不实际操作，标记为跳过
			entry.Status = "skipped"
			result.Skipped++
		} else {
			// 创建目标文件的父目录（只在保留目录结构时需要）, 已经存在的化就会自动略过
			os.MkdirAll(filepath.Dir(destPath), 0755)

			// 处理同名冲突
			destPath = resolveConflict(destPath)
			entry.DestPath = destPath

			// 执行复制或移动
			var opErr error
			if opts.MoveMode {
				opErr = retryOp(func() error { return os.Rename(srcPath, destPath) }) // 移动文件
			} else {
				opErr = retryOp(func() error { return copyFile(srcPath, destPath) }) // 复制文件
			}

			if opErr != nil {
				entry.Status = "error"
				entry.Error = opErr.Error()
				result.Errors = append(result.Errors, fmt.Sprintf("%s: %v", srcPath, opErr))
			} else {
				entry.Status = "extracted"
				result.Extracted++
			}
		}
		result.Entries = append(result.Entries, entry)
		// 调用进度回调
		if progressCb != nil {
			progressCb(i+1, len(matchedFiles), filepath.Base(srcPath))
		}
	}

	// 移动模式下保存日志
	if opts.MoveMode && !opts.DryRun && result.Extracted > 0 {
		logPath := filepath.Join(opts.TargetDir, "extract_log.json")
		if err := SaveLog(logPath, result.Entries); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("保存日志失败: %v", err))
		}
	}

	// 清理空目录
	if opts.Cleanup && !opts.DryRun && opts.MoveMode {
		if err := cleanupEmptyDirs(opts.SourceDir); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("清理空目录失败: %v", err))
		}
	}

	return result, nil
}

// 处理同名冲突，自动加 _1、_2 后缀
func resolveConflict(destPath string) string {
	if _, err := os.Stat(destPath); os.IsNotExist(err) {
		return destPath
	}
	ext := filepath.Ext(destPath)
	base := strings.TrimSuffix(filepath.Base(destPath), ext)
	dir := filepath.Dir(destPath)
	for i := 1; ; i++ {
		// 创建出来文件名，然后再判断是否存在
		newPath := filepath.Join(dir, fmt.Sprintf("%s_%d%s", base, i, ext))
		if _, err := os.Stat(newPath); os.IsNotExist(err) {
			return newPath
		}
	}
}

// 文件操作重试：被占用时重试 3 次，间隔 500ms
func retryOp(op func() error) error {
	var err error
	for attempt := 0; attempt < 3; attempt++ {
		err = op()
		if err == nil {
			return nil
		}
		time.Sleep(500 * time.Millisecond)
	}
	return err
}

// 复制文件
func copyFile(src, dist string) error {
	srcFile, err := os.Open(src)
	if err != nil {
		return err
	}
	defer srcFile.Close()

	dstFile, err := os.Create(dist)
	if err != nil {
		return err
	}
	defer dstFile.Close()
	_, err = io.Copy(dstFile, srcFile)
	return err
}

// 按照深度降序清理源目录中的空文件
func cleanupEmptyDirs(root string) error {
	var dirs []string
	// 统计所有文件目录
	filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if info.IsDir() && path != root {
			dirs = append(dirs, path)
		}
		return nil
	})
	// 按深度降序排序：最深层的目录先清理
	sort.Slice(dirs, func(i, j int) bool {
		return strings.Count(dirs[i], string(filepath.Separator)) > strings.Count(dirs[j], string(filepath.Separator))
	})

	for _, dir := range dirs {
		os.Remove(dir) // 非空目录会失败，忽略即可
	}
	return nil
}
