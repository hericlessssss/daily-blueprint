import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { loadEnvFile } from "../src/env-file.js";

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "daily-blueprint-env-"));
});

afterEach(async () => {
  await rm(tempDir, { force: true, recursive: true });
});

describe("env file loader", () => {
  it("loads key value pairs from .env", async () => {
    await writeFile(
      join(tempDir, ".env"),
      [
        "LLM_PROVIDER=mock",
        "BOOK_TITLE=O Espelho de Segunda a Sexta",
        "OLLAMA_MODEL=\"qwen3:1.7b\""
      ].join("\n"),
      "utf8"
    );

    await expect(loadEnvFile(join(tempDir, ".env"), {})).resolves.toEqual({
      BOOK_TITLE: "O Espelho de Segunda a Sexta",
      LLM_PROVIDER: "mock",
      OLLAMA_MODEL: "qwen3:1.7b"
    });
  });

  it("does not override existing environment values", async () => {
    await writeFile(join(tempDir, ".env"), "LLM_PROVIDER=ollama\n", "utf8");

    await expect(loadEnvFile(join(tempDir, ".env"), { LLM_PROVIDER: "mock" })).resolves.toEqual({
      LLM_PROVIDER: "mock"
    });
  });

  it("ignores missing .env files", async () => {
    await expect(loadEnvFile(join(tempDir, ".env"), {})).resolves.toEqual({});
  });

  it("ignores comments and blank lines", async () => {
    await writeFile(join(tempDir, ".env"), "\n# comment\nGIT_PUSH=true\n", "utf8");

    await expect(loadEnvFile(join(tempDir, ".env"), {})).resolves.toEqual({
      GIT_PUSH: "true"
    });
  });
});
