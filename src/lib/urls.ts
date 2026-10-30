export function encodePath(filePath: string): string {
  return filePath
    .split("/")
    .filter((segment) => segment.length > 0)
    .map(encodeURIComponent)
    .join("/");
}
