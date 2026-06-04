export namespace extract {
	
	export class FileEntry {
	    sourcePath: string;
	    destPath: string;
	    fileSize: number;
	    status: string;
	    error: string;
	    timestamp: string;
	
	    static createFrom(source: any = {}) {
	        return new FileEntry(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sourcePath = source["sourcePath"];
	        this.destPath = source["destPath"];
	        this.fileSize = source["fileSize"];
	        this.status = source["status"];
	        this.error = source["error"];
	        this.timestamp = source["timestamp"];
	    }
	}
	export class ExtractResult {
	    totalFiles: number;
	    matchedFiles: number;
	    extracted: number;
	    skipped: number;
	    errors: string[];
	    entries: FileEntry[];
	
	    static createFrom(source: any = {}) {
	        return new ExtractResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.totalFiles = source["totalFiles"];
	        this.matchedFiles = source["matchedFiles"];
	        this.extracted = source["extracted"];
	        this.skipped = source["skipped"];
	        this.errors = source["errors"];
	        this.entries = this.convertValues(source["entries"], FileEntry);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class LogResult {
	    entries: FileEntry[];
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new LogResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.entries = this.convertValues(source["entries"], FileEntry);
	        this.error = source["error"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PreviewResult {
	    files: string[];
	    total: number;
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new PreviewResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.files = source["files"];
	        this.total = source["total"];
	        this.error = source["error"];
	    }
	}

}

export namespace main {
	
	export class ClearLogResult {
	    success: boolean;
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new ClearLogResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.error = source["error"];
	    }
	}
	export class FileStats {
	    totalFiles: number;
	    totalSize: number;
	    subDirs: number;
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new FileStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.totalFiles = source["totalFiles"];
	        this.totalSize = source["totalSize"];
	        this.subDirs = source["subDirs"];
	        this.error = source["error"];
	    }
	}
	export class UndoResult {
	    restored: number;
	    failed: string[];
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new UndoResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.restored = source["restored"];
	        this.failed = source["failed"];
	        this.error = source["error"];
	    }
	}

}

