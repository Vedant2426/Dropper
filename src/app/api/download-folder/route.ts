import { NextResponse } from "next/server";
import archiver from "archiver";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

const CONTENT_DIR = path.join(process.cwd(), "content");

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folderPath = searchParams.get("path");
    
    if (!folderPath) {
      return new NextResponse("No folder path provided", { status: 400 });
    }
    
    const fullPath = path.normalize(path.join(CONTENT_DIR, folderPath));
    const relative = path.relative(CONTENT_DIR, fullPath);

    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      return new NextResponse("Invalid path", { status: 400 });
    }
    
    if (!fs.existsSync(fullPath)) {
      return new NextResponse("Folder not found", { status: 404 });
    }
    
    const stats = fs.statSync(fullPath);
    if (!stats.isDirectory()) {
      return new NextResponse("Not a folder", { status: 400 });
    }
    
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    archive.on("error", (error) => {
      console.error("Failed to create zip:", error);
    });

    archive.directory(fullPath, path.basename(fullPath));
    archive.finalize();

    const stream = Readable.toWeb(archive) as ReadableStream;

    const folderName = path.basename(fullPath);

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(folderName)}.zip"`,
      },
    });
  } catch (error) {
    return new NextResponse("Error creating zip", { status: 500 });
  }
}
