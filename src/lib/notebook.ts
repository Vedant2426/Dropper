export interface NotebookCell {
  type: "code" | "markdown" | "raw";
  source: string;
  outputs: string[];
}

export interface ParsedNotebook {
  language: string;
  cells: NotebookCell[];
}

function joinSource(source: unknown): string {
  if (Array.isArray(source)) {
    return source.join("");
  }

  return typeof source === "string" ? source : "";
}

function extractOutputText(output: unknown): string | null {
  if (!output || typeof output !== "object") {
    return null;
  }

  const item = output as {
    output_type?: string;
    ename?: string;
    evalue?: string;
    text?: unknown;
    data?: Record<string, unknown>;
  };

  if (item.output_type === "error") {
    return [item.ename, item.evalue].filter(Boolean).join(": ") || null;
  }

  if (item.data) {
    const plainText = item.data["text/plain"];
    if (plainText) {
      return joinSource(plainText);
    }
  }

  if (item.text) {
    return joinSource(item.text);
  }

  return null;
}

/**
 * Parse a Jupyter notebook (.ipynb) file into a simple cell list.
 * Returns null when the file is not valid JSON / not a notebook.
 */
export function parseNotebook(raw: string): ParsedNotebook | null {
  try {
    const json = JSON.parse(raw.replace(/^\uFEFF/, "")) as {
      cells?: unknown[];
      metadata?: {
        language_info?: { name?: string };
        kernelspec?: { language?: string };
      };
    };

    if (!json || !Array.isArray(json.cells)) {
      return null;
    }

    const cells: NotebookCell[] = [];

    for (const cell of json.cells) {
      if (!cell || typeof cell !== "object") {
        continue;
      }

      const typedCell = cell as {
        cell_type?: string;
        source?: unknown;
        outputs?: unknown[];
      };

      if (
        typedCell.cell_type !== "code" &&
        typedCell.cell_type !== "markdown" &&
        typedCell.cell_type !== "raw"
      ) {
        continue;
      }

      const outputs = Array.isArray(typedCell.outputs)
        ? typedCell.outputs
            .map(extractOutputText)
            .filter((text): text is string => Boolean(text && text.trim()))
        : [];

      cells.push({
        type: typedCell.cell_type,
        source: joinSource(typedCell.source),
        outputs,
      });
    }

    return {
      language:
        json.metadata?.language_info?.name ??
        json.metadata?.kernelspec?.language ??
        "python",
      cells,
    };
  } catch {
    return null;
  }
}

/**
 * Concatenate the source of every code cell, used by "copy all" buttons.
 */
export function getNotebookCode(cells: NotebookCell[]): string {
  return cells
    .filter((cell) => cell.type === "code" && cell.source.trim().length > 0)
    .map((cell) => cell.source)
    .join("\n\n");
}

export function extractNotebookCode(raw: string): string | null {
  const notebook = parseNotebook(raw);
  if (!notebook) {
    return null;
  }

  return getNotebookCode(notebook.cells);
}
