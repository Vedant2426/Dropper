import { NextResponse } from "next/server";
import { getFileContent } from "@/lib/files";
import path from "path";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get("path");
    
    if (!filePath) {
      return new NextResponse("No file path provided", { status: 400 });
    }
    
    const content = getFileContent(filePath);
    
    if (!content) {
      return new NextResponse("File not found", { status: 404 });
    }
    
    const fileName = path.basename(filePath);
    const mimeType = getMimeType(fileName);
    
    return new NextResponse(new Uint8Array(content), {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
      },
    });
  } catch (error) {
    return new NextResponse("Error downloading file", { status: 500 });
  }
}

function getMimeType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".pdf": "application/pdf",
    ".txt": "text/plain",
    ".md": "text/markdown",
    ".ipynb": "application/x-ipynb+json",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".zip": "application/zip",
    ".rar": "application/x-rar-compressed",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".java": "text/plain",
    ".py": "text/plain",
    ".cpp": "text/plain",
    ".c": "text/plain",
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
  };
  return mimeTypes[ext] || "application/octet-stream";
}
