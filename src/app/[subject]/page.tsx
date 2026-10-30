import { getFilesInDirectory } from "@/lib/files";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import FileList from "@/components/FileList";

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ subject: string }>;
}) {
  const { subject: rawSubject } = await params;
  const subject = decodeURIComponent(rawSubject);
  const files = getFilesInDirectory(subject);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
                Practicals
              </Link>
              <span>/</span>
              <span className="text-gray-900 dark:text-gray-100 font-medium">{subject}</span>
            </div>
            <ThemeToggle />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{subject}</h1>
            <a
              href={`/api/download-folder?path=${encodeURIComponent(subject)}`}
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
              Download All (ZIP)
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {files.length === 0 ? (
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
