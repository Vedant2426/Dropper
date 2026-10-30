import CopyButton from "./CopyButton";
import CodeBlock from "./CodeBlock";
import { getNotebookCode, type NotebookCell } from "@/lib/notebook";

interface NotebookViewerProps {
  cells: NotebookCell[];
  language: string;
}

function MarkdownCell({ source }: { source: string }) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-2">Markdown</p>
      <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
        {source}
      </div>
    </div>
  );
}

export default function NotebookViewer({ cells, language }: NotebookViewerProps) {
  const codeCellCount = cells.filter((cell) => cell.type === "code").length;
  const allCode = getNotebookCode(cells);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {cells.length} cells · {codeCellCount} code
        </p>
        {allCode.trim() && <CopyButton text={allCode} label="Copy all code" />}
      </div>

      {cells.map((cell, index) => {
        if (cell.type === "code") {
          return (
            <div key={index} className="space-y-2">
              <CodeBlock
                code={cell.source}
                caption={`${language} · cell ${index + 1}`}
              />
              {cell.outputs.length > 0 && (
                <details className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <summary className="cursor-pointer select-none px-4 py-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Output
                  </summary>
                  <pre className="px-4 pb-4 overflow-x-auto text-xs leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {cell.outputs.join("\n")}
                  </pre>
                </details>
              )}
            </div>
          );
        }

        if (cell.type === "markdown") {
          return <MarkdownCell key={index} source={cell.source} />;
        }

        return (
          <div
            key={index}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-2">Raw</p>
            <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{cell.source}</pre>
          </div>
        );
      })}
    </div>
  );
}
