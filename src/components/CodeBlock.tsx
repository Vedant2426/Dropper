import CopyButton from "./CopyButton";

interface CodeBlockProps {
  code: string;
  /** Label shown in the top bar of the block. */
  caption?: string;
  /** Text used by the copy button when the visible code is transformed. */
  copyText?: string;
}

export default function CodeBlock({ code, caption = "Code", copyText }: CodeBlockProps) {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-700 bg-gray-900">
      <div className="flex items-center justify-between gap-3 px-4 py-2 bg-gray-800 border-b border-gray-700">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-400 truncate">
          {caption}
        </span>
        <CopyButton text={copyText ?? code} label="Copy code" />
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed text-gray-100">
        <code className="whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}
