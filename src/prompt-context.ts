import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

export interface LoadRecentEntriesOptions {
  limit: number;
  rootDir: string;
}

export interface BuildPromptInputOptions {
  bookTitle: string;
  entryDate: string;
  fragmentCount: number;
  recentEntries: readonly string[];
  summary: string;
  systemTemplate: string;
  userTemplate: string;
}

export interface PromptInput {
  system: string;
  user: string;
}

type PromptVariables = Record<string, string | number>;

const entryFilePattern = /^\d{4}-\d{2}-\d{2}\.md$/;
const unresolvedVariablePattern = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

export async function loadRecentEntries(
  options: LoadRecentEntriesOptions
): Promise<readonly string[]> {
  const entriesDir = join(options.rootDir, "entries");
  let fileNames: string[];

  try {
    fileNames = await readdir(entriesDir);
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }

  const recentFileNames = fileNames
    .filter((fileName) => entryFilePattern.test(fileName))
    .sort()
    .reverse()
    .slice(0, options.limit);

  return Promise.all(
    recentFileNames.map((fileName) => readFile(join(entriesDir, fileName), "utf8"))
  );
}

export function renderPromptTemplate(
  template: string,
  variables: PromptVariables
): string {
  const rendered = Object.entries(variables).reduce(
    (current, [key, value]) => current.replaceAll(`{{${key}}}`, String(value)),
    template
  );
  const unresolvedVariables = Array.from(rendered.matchAll(unresolvedVariablePattern)).map(
    (match) => match[1]
  );

  if (unresolvedVariables.length > 0) {
    throw new Error(
      `Prompt template has unresolved variables: ${unresolvedVariables.join(", ")}.`
    );
  }

  return rendered;
}

export function buildPromptInput(options: BuildPromptInputOptions): PromptInput {
  const variables = {
    book_title: options.bookTitle,
    date: options.entryDate,
    fragment_count: options.fragmentCount,
    recent_entries: options.recentEntries.join("\n"),
    summary: options.summary
  };

  return {
    system: renderPromptTemplate(options.systemTemplate, variables),
    user: renderPromptTemplate(options.userTemplate, variables)
  };
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
