export interface EntryMarkdownOptions {
  entryDate: string;
  fragments: readonly string[];
}

export interface ReadmeRenderOptions {
  entryMarkdown: string;
  readme: string;
}

const fragmentsHeading = "## Fragmentos";
const emptyPlaceholder = "Ainda nao ha registros.";

export function renderEntryMarkdown(options: EntryMarkdownOptions): string {
  const fragments = options.fragments.map((fragment) => fragment.trim());

  if (fragments.length === 0 || fragments.some((fragment) => fragment.length === 0)) {
    throw new Error("fragments must contain non-empty text.");
  }

  return [`### ${options.entryDate}`, "", fragments.join("\n\n"), ""].join("\n");
}

export function renderReadmeWithEntry(options: ReadmeRenderOptions): string {
  const fragmentsIndex = options.readme.indexOf(fragmentsHeading);

  if (fragmentsIndex === -1) {
    throw new Error("README.md must contain a ## Fragmentos section.");
  }

  const sectionStart = fragmentsIndex + fragmentsHeading.length;
  const beforeEntries = options.readme.slice(0, sectionStart);
  const currentEntries = options.readme.slice(sectionStart).trim();
  const entryMarkdown = options.entryMarkdown.trim();

  if (currentEntries === "" || currentEntries === emptyPlaceholder) {
    return `${beforeEntries}\n\n${entryMarkdown}\n`;
  }

  return `${beforeEntries}\n\n${entryMarkdown}\n\n${currentEntries}\n`;
}
