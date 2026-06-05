import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { writeEntry } from "../src/entry-writer.js";

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "daily-blueprint-"));
  await writeFile(
    join(tempDir, "README.md"),
    "# daily-blueprint\n\n## Fragmentos\n\nAinda nao ha registros.\n",
    "utf8"
  );
});

afterEach(async () => {
  await rm(tempDir, { force: true, recursive: true });
});

describe("entry writer", () => {
  it("writes the dated entry file and updates README.md", async () => {
    await writeEntry({
      entryDate: "2026-06-08",
      fragments: ["Entrada nova."],
      rootDir: tempDir
    });

    await expect(readFile(join(tempDir, "entries", "2026-06-08.md"), "utf8")).resolves.toBe(
      "### 2026-06-08\n\nEntrada nova.\n"
    );
    await expect(readFile(join(tempDir, "README.md"), "utf8")).resolves.toBe(
      "# daily-blueprint\n\n## Fragmentos\n\n### 2026-06-08\n\nEntrada nova.\n"
    );
  });

  it("rejects duplicate entries by default", async () => {
    await writeEntry({
      entryDate: "2026-06-08",
      fragments: ["Entrada nova."],
      rootDir: tempDir
    });

    await expect(
      writeEntry({
        entryDate: "2026-06-08",
        fragments: ["Entrada duplicada."],
        rootDir: tempDir
      })
    ).rejects.toThrow("Entry for 2026-06-08 already exists.");
  });
});
