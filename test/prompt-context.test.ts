import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  buildPromptInput,
  loadRecentEntries,
  renderPromptTemplate
} from "../src/prompt-context.js";

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "daily-blueprint-prompts-"));
  await mkdir(join(tempDir, "entries"), { recursive: true });
});

afterEach(async () => {
  await rm(tempDir, { force: true, recursive: true });
});

describe("prompt context", () => {
  it("loads recent entries from newest to oldest", async () => {
    await writeFile(join(tempDir, "entries", "2026-06-04.md"), "### 2026-06-04\n\nQuarta.\n");
    await writeFile(join(tempDir, "entries", "2026-06-05.md"), "### 2026-06-05\n\nSexta.\n");
    await writeFile(join(tempDir, "entries", "2026-06-03.md"), "### 2026-06-03\n\nTerca.\n");

    await expect(loadRecentEntries({ limit: 2, rootDir: tempDir })).resolves.toEqual([
      "### 2026-06-05\n\nSexta.\n",
      "### 2026-06-04\n\nQuarta.\n"
    ]);
  });

  it("returns an empty list when entries directory does not exist", async () => {
    await rm(join(tempDir, "entries"), { force: true, recursive: true });

    await expect(loadRecentEntries({ limit: 5, rootDir: tempDir })).resolves.toEqual([]);
  });

  it("renders prompt templates with all variables replaced", () => {
    expect(
      renderPromptTemplate("Titulo: {{book_title}}\nData: {{date}}\n", {
        book_title: "Livro",
        date: "2026-06-08"
      })
    ).toBe("Titulo: Livro\nData: 2026-06-08\n");
  });

  it("rejects templates with unresolved variables", () => {
    expect(() => renderPromptTemplate("Titulo: {{book_title}}\nData: {{date}}\n", {
      book_title: "Livro"
    })).toThrow("Prompt template has unresolved variables: date.");
  });

  it("builds prompt input from templates, summary, and recent entries", () => {
    const input = buildPromptInput({
      bookTitle: "O Espelho de Segunda a Sexta",
      entryDate: "2026-06-08",
      fragmentCount: 2,
      recentEntries: ["### 2026-06-05\n\nEntrada anterior.\n"],
      summary: "Uma voz observa os pedidos humanos.",
      systemTemplate: "Livro: {{book_title}}\n",
      userTemplate:
        "Data: {{date}}\nQuantidade: {{fragment_count}}\nResumo:\n{{summary}}\nUltimos:\n{{recent_entries}}\n"
    });

    expect(input).toEqual({
      system: "Livro: O Espelho de Segunda a Sexta\n",
      user:
        "Data: 2026-06-08\nQuantidade: 2\nResumo:\nUma voz observa os pedidos humanos.\nUltimos:\n### 2026-06-05\n\nEntrada anterior.\n\n"
    });
  });
});
