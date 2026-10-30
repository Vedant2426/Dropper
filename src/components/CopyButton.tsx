"use client";

import { useEffect, useRef, useState } from "react";

interface CopyButtonProps {
  /** Text that will be written to the clipboard. */
  text: string;
  /** Visible label for the default (button) variant. */
  label?: string;
  /** Accessible label, also used as tooltip for the icon variant. */
  ariaLabel?: string;
  variant?: "button" | "icon";
  className?: string;
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the older execCommand approach.
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied;
  } catch {
    return false;
  }
}

export default function CopyButton({
  text,
  label = "Copy",
  ariaLabel,
  variant = "button",
  className = "",
}: CopyButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleClick = async () => {
    const copied = await copyText(text);
    setStatus(copied ? "copied" : "failed");

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => setStatus("idle"), 2000);
  };

  const accessibleLabel =
    ariaLabel ?? (variant === "icon" ? label : undefined);

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={status === "copied" ? "Copied!" : status === "failed" ? "Copy failed" : (accessibleLabel ?? "Copy code")}
        aria-label={accessibleLabel ?? "Copy code"}
        className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors ${
          status === "copied"
            ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30"
            : status === "failed"
              ? "text-red-600 dark:text-red-400"
              : "text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        } ${className}`}
      >
        {status === "copied" ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-4 10h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={accessibleLabel}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        status === "copied"
          ? "bg-green-600 text-white"
          : status === "failed"
            ? "bg-red-600 text-white"
            : "bg-gray-800 text-gray-100 hover:bg-gray-700 border border-gray-700"
      } ${className}`}
    >
      {status === "copied" ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : status === "failed" ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Copy failed
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-4 10h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
