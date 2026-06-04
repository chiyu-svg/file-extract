package extract

import (
	"os"
	"path/filepath"
	"strings"
)

// 匹配后缀名，不去区分大小写
func MatchExtension(filename, ext string) bool {
	if ext == "" {
		return false
	}
	if !strings.HasPrefix(ext, ".") {
		ext = "." + ext
	}
	return strings.EqualFold(filepath.Ext(filename), ext)
}

// MatchKeyword 关键词匹配，不区分大小写，只匹配文件名部分
func MatchKeyword(filename, keyword string) bool {
	if keyword == "" {
		return false
	}
	return strings.Contains(
		strings.ToLower(filepath.Base(filename)),
		strings.ToLower(keyword),
	)
}

// 通配符匹配
func MatchGlob(filename, pattern string) (bool, error) {
	if pattern == "" {
		return false, nil
	}
	return filepath.Match(pattern, filepath.Base(filename))
}

// 递归遍历源目录
// 返回所有匹配的文件完整路径列表
func MatchedFiles(sourceDir string, opts ExtractOptions) ([]string, error) {
	var matched []string
	err := filepath.Walk(sourceDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return nil
		}
		if info.IsDir() {
			return nil
		}
		var isMatch bool
		var matchErr error

		switch opts.MatchMode {
		case MatchByExtension:
			isMatch = MatchExtension(path, opts.Pattern)
		case MatchByKeyword:
			isMatch = MatchKeyword(path, opts.Pattern)
		case MatchByGlob:
			isMatch, matchErr = MatchGlob(path, opts.Pattern)
		default:
			return nil
		}

		if matchErr != nil {
			return nil
		}
		if isMatch {
			matched = append(matched, path)
		}
		return nil
	})
	return matched, err
}
