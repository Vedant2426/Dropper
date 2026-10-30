import {
  getFileDetails,
  getFilesInDirectory,
  isNotebook,
  readTextFile,
} from "@/lib/files";
import { parseNotebook } from "@/lib/notebook";
import { encodePath } from "@/lib/urls";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import FileList from "@/components/FileList";
import CodeBlock from "@/components/CodeBlock";
import NotebookViewer from "@/components/NotebookViewer";

interface NestedPageProps {
  params: Promise<{ subject: string; path: string[] }>;
}

export default async function NestedPage({ params }: NestedPageProps) {
  const { subject: rawSubject, path: rawPath } = await params;
  const subject = decodeURIComponent(rawSubject);
  const segments = rawPath.map((segment) => decodeURIComponent(segment));
  const fullPath = [subject, ...segments].join("/");
  const details = getFileDetails(fullPath);
  const isFile = details?.type === "file";
  const isDirectory = details?.type === "directory";

  const crumbs = [
    { name: subject, href: `/${encodePath(subject)}` },
    ...segments.map((segment, index) => ({
      name: segment,
      href: `/${encodePath([subject, ...segments.slice(0, index + 1)].join("/"))}`,
    })),
  ];
  const currentName = crumbs[crumbs.length - 1].name;
  const textContent = isFile ? readTextFile(fullPath) : null;
  const notebook =
    textContent !== null && details && isNotebook(details.name)
      ? parseNotebook(textContent)
      : null;
  const files = isDirectory ? getFilesInDirectory(fullPath) : [];
  const downloadUrl = isFile
    ? `/api/download?path=${encodeURIComponent(fullPath)}`
    : `/api/download-folder?path=${encodeURIComponent(fullPath)}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2 gap-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
              <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
                Practicals
              </Link>
              <span>/</span>
              {crumbs.map((crumb, idx) => (
                <div key={crumb.href} className="flex items-center space-x-2">
                  {idx < crumbs.length - 1 ? (
                    <Link href={crumb.href} className="hover:text-blue-600 dark:hover:text-blue-400">
                      {crumb.name}
                    </Link>
                  ) : (
                    <span className="text-gray-900 dark:text-gray-100 font-medium">{crumb.name}</span>
                  )}
                  {idx < crumbs.length - 1 && <span>/</span>}
                </div>
              ))}
            </div>
            <ThemeToggle />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 break-all">
              {currentName}
            </h1>
            {details && (
              <a
                href={downloadUrl}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                {isFile ? "Download" : "Download All (ZIP)"}
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!details ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">This file or folder was not found.</p>
          </div>
        ) : isFile ? (
          textContent === null ? (
            <div className="text-center py-12 space-y-4">
              <p className="text-gray-500 dark:text-gray-400">
                Preview is not available for this file type. Download it to view the contents.
              </p>
              <a
                href={downloadUrl}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Download {details.name}
              </a>
            </div>
          ) : notebook ? (
            <NotebookViewer cells={notebook.cells} language={notebook.language} />
          ) : (
            <CodeBlock code={textContent} caption={details.name} />
          )
        ) : files.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No files in this folder.</p>
          </div>
        ) : (
          <FileList files={files} />
        )}
      </main>
    </div>
  );
}
