import fs from "fs";
import path from "path";
import { extractNotebookCode } from "./notebook";

const CONTENT_DIR = path.join(process.cwd(), "content");

const TEXT_EXTENSIONS = new Set([
  ".txt",
  ".md",
  ".markdown",
  ".ipynb",
  ".json",
  ".xml",
  ".yml",
  ".yaml",
  ".csv",
  ".java",
  ".py",
  ".c",
  ".h",
  ".cpp",
  ".hpp",
  ".cs",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".css",
  ".html",
  ".sql",
  ".sh",
  ".bat",
  ".ini",
  ".cfg",
  ".properties",
  ".log",
]);

export interface FileItem {
  name: string;
  type: "file" | "directory";
  path: string;
  size?: number;
}

export interface FileDetails extends FileItem {
  extension: string;
}

/**
 * Resolve a path inside content/ and make sure it can not escape the folder.
 */
function resolveContentPath(relativePath: string): string | null {
  const fullPath = path.normalize(path.join(CONTENT_DIR, relativePath));
  const relative = path.relative(CONTENT_DIR, fullPath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return null;
  }

  return fullPath;
}

export function isTextFile(fileName: string): boolean {
  return TEXT_EXTENSIONS.has(path.extname(fileName).toLowerCase());
}

export function isNotebook(fileName: string): boolean {
  return path.extname(fileName).toLowerCase() === ".ipynb";
}

export function getSubjects(): FileItem[] {
  if (!fs.existsSync(CONTENT_DIR)) {
    return [];
  }

  const entries = fs.readdirSync(CONTENT_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => ({
      name: entry.name,
      type: "directory" as const,
      path: entry.name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getFilesInDirectory(dirPath: string): FileItem[] {
  const fullPath = resolveContentPath(dirPath);

  if (!fullPath || !fs.existsSync(fullPath)) {
    return [];
  }

  const stats = fs.statSync(fullPath);
  if (!stats.isDirectory()) {
    return [];
  }

  const entries = fs.readdirSync(fullPath, { withFileTypes: true });
  return entries
    .map((entry) => {
      const itemPath = [dirPath, entry.name].filter(Boolean).join("/").replace(/\\/g, "/");
      const itemFullPath = path.join(fullPath, entry.name);
      const itemStats = fs.statSync(itemFullPath);

      return {
        name: entry.name,
        type: entry.isDirectory() ? ("directory" as const) : ("file" as const),
        path: itemPath,
        size: entry.isFile() ? itemStats.size : undefined,
      };
    })
    .sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "directory" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
}

export function getFileDetails(filePath: string): FileDetails | null {
  const fullPath = resolveContentPath(filePath);

  if (!fullPath || !fs.existsSync(fullPath)) {
    return null;
  }

  const stats = fs.statSync(fullPath);
  const name = path.basename(fullPath);

  return {
    name,
    type: stats.isDirectory() ? "directory" : "file",
    path: filePath.replace(/\\/g, "/"),
    size: stats.isFile() ? stats.size : undefined,
    extension: stats.isFile() ? path.extname(name).toLowerCase() : "",
  };
}

export function getFileContent(filePath: string): Buffer | null {
  const fullPath = resolveContentPath(filePath);

  if (!fullPath || !fs.existsSync(fullPath)) {
    return null;
  }

  try {
    return fs.readFileSync(fullPath);
  } catch {
    return null;
  }
}

/**
 * Read a text file as UTF-8. Returns null for binary files and missing files.
 */
export function readTextFile(filePath: string): string | null {
  const details = getFileDetails(filePath);

  if (!details || details.type !== "file" || !isTextFile(details.name)) {
    return null;
  }

  const content = getFileContent(filePath);
  if (!content) {
    return null;
  }

  return content.toString("utf8");
}

/**
 * Text that should be placed on the clipboard. For notebooks this is only the
 * code from the cells (without the raw JSON wrapper or outputs).
 */
export function getCopyableText(filePath: string): string | null {
  const content = readTextFile(filePath);

  if (content === null) {
    return null;
  }

  if (isNotebook(filePath)) {
    const code = extractNotebookCode(content);
    return code && code.trim().length > 0 ? code : null;
  }

  return content;
}

export function formatFileSize(bytes?: number): string {
  if (bytes === undefined) {
    return "";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
