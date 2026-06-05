import { describe, expect, it } from "vitest";

import { loadConfig } from "../src/config.js";

describe("config", () => {
  it("loads defaults from an empty environment", () => {
    expect(loadConfig({})).toEqual({
      bookLanguage: "pt-BR",
      bookTitle: "O Espelho de Segunda a Sexta",
      gitAutoCommit: false,
      gitPush: false,
      llmProvider: "ollama",
      maxFragmentsPerRun: 3,
      minFragmentsPerRun: 1,
      ollamaBaseUrl: "http://localhost:11434",
      ollamaModel: "qwen3:1.7b",
      publishDays: [1, 2, 3, 4, 5],
      timeZone: "America/Sao_Paulo"
    });
  });

  it("parses numeric boundaries and publish days", () => {
    expect(
      loadConfig({
        MAX_FRAGMENTS_PER_RUN: "2",
        MIN_FRAGMENTS_PER_RUN: "1",
        PUBLISH_DAYS: "1,3,5"
      })
    ).toMatchObject({
      maxFragmentsPerRun: 2,
      minFragmentsPerRun: 1,
      publishDays: [1, 3, 5]
    });
  });

  it("loads Ollama settings from the environment", () => {
    expect(
      loadConfig({
        LLM_PROVIDER: "mock",
        OLLAMA_BASE_URL: "http://127.0.0.1:11434",
        OLLAMA_MODEL: "qwen3:0.6b"
      })
    ).toMatchObject({
      llmProvider: "mock",
      ollamaBaseUrl: "http://127.0.0.1:11434",
      ollamaModel: "qwen3:0.6b"
    });
  });

  it("loads Git publication flags from the environment", () => {
    expect(
      loadConfig({
        GIT_AUTO_COMMIT: "true",
        GIT_PUSH: "true"
      })
    ).toMatchObject({
      gitAutoCommit: true,
      gitPush: true
    });
  });

  it("rejects invalid booleans", () => {
    expect(() => loadConfig({ GIT_AUTO_COMMIT: "yes" })).toThrow(
      "GIT_AUTO_COMMIT must be true or false."
    );
  });

  it("rejects unsupported LLM providers", () => {
    expect(() => loadConfig({ LLM_PROVIDER: "openai" })).toThrow(
      "LLM_PROVIDER must be one of: ollama, mock."
    );
  });

  it("rejects invalid publish days", () => {
    expect(() => loadConfig({ PUBLISH_DAYS: "1,8" })).toThrow(
      "PUBLISH_DAYS must contain integers from 0 to 6."
    );
  });

  it("rejects invalid fragment ranges", () => {
    expect(() =>
      loadConfig({
        MAX_FRAGMENTS_PER_RUN: "2",
        MIN_FRAGMENTS_PER_RUN: "3"
      })
    ).toThrow("MAX_FRAGMENTS_PER_RUN must be greater than or equal to MIN_FRAGMENTS_PER_RUN.");
  });
});
