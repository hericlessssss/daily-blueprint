import { mkdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { access } from "node:fs/promises";
import { join } from "node:path";

import {
  renderEntryMarkdown,
  renderReadmeWithEntry
} from "./entry-renderer.js";

export interface WriteEntryOptions {
  entryDate: string;
  fragments: readonly string[];
  rootDir: string;
}

export async function writeEntry(options: WriteEntryOptions): Promise<void> {
  const entriesDir = join(options.rootDir, "entries");
  const entryPath = join(entriesDir, `${options.entryDate}.md`);
  const readmePath = join(options.rootDir, "README.md");

  if (await fileExists(entryPath)) {
    throw new Error(`Entry for ${options.entryDate} already exists.`);
  }

  const entryMarkdown = renderEntryMarkdown({
    entryDate: options.entryDate,
    fragments: options.fragments
  });
  const readme = await readFile(readmePath, "utf8");
  const nextReadme = renderReadmeWithEntry({
    entryMarkdown,
    readme
  });

  await mkdir(entriesDir, { recursive: true });
  await writeFile(entryPath, entryMarkdown, "utf8");
  await writeFile(readmePath, nextReadme, "utf8");
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path, constants.F_OK);

    return true;
  } catch {
    return false;
  }
}
