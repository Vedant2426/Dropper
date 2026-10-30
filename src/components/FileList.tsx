import Link from "next/link";
import {
  formatFileSize,
  getCopyableText,
  isTextFile,
  type FileItem,
} from "@/lib/files";
import { encodePath } from "@/lib/urls";
import CopyButton from "./CopyButton";

interface FileListProps {
  files: FileItem[];
}

export default function FileList({ files }: FileListProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {files.map((file) => {
          if (file.type === "directory") {
            return (
              <li key={file.path}>
                <Link
                  href={`/${encodePath(file.path)}`}
                  className="flex items-center px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg
                    className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                  <span className="text-gray-900 dark:text-gray-100 font-medium flex-1 truncate">
                    {file.name}
                  </span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </li>
            );
          }

          const previewable = isTextFile(file.name);
          const copyText = previewable ? getCopyableText(file.path) : null;
          const downloadUrl = `/api/download?path=${encodeURIComponent(file.path)}`;

          return (
            <li key={file.path} className="flex items-center px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Link
                href={previewable ? `/${encodePath(file.path)}` : downloadUrl}
                {...(previewable ? {} : { download: true })}
                className="flex items-center flex-1 min-w-0"
                title={previewable ? `View ${file.name}` : `Download ${file.name}`}
              >
                <svg
                  className="w-6 h-6 text-gray-400 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-gray-900 dark:text-gray-100 flex-1 truncate">{file.name}</span>
                <span className="ml-3 text-xs text-gray-400 hidden sm:inline">
                  {formatFileSize(file.size)}
                </span>
              </Link>

              <div className="flex items-center gap-1 ml-2">
                {copyText !== null && (
                  <CopyButton
                    text={copyText}
                    variant="icon"
                    ariaLabel={`Copy code from ${file.name}`}
                  />
                )}
                <a
                  href={downloadUrl}
                  download
                  title={`Download ${file.name}`}
                  aria-label={`Download ${file.name}`}
                  className="p-2 rounded-lg text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
