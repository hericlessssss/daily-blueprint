import { describe, expect, it, vi } from "vitest";

import {
  generateOllamaFragments,
  parseGeneratedFragments
} from "../src/llm-generator.js";

describe("LLM generator", () => {
  it("parses generated fragments separated by blank lines", () => {
    expect(parseGeneratedFragments("Primeiro.\n\nSegundo.", 2)).toEqual([
      "Primeiro.",
      "Segundo."
    ]);
  });

  it("rejects empty generated output", () => {
    expect(() => parseGeneratedFragments("   ", 1)).toThrow("LLM response was empty.");
  });

  it("rejects unexpected fragment counts", () => {
    expect(() => parseGeneratedFragments("Primeiro.\n\nSegundo.", 1)).toThrow(
      "Expected 1 fragment(s), received 2."
    );
  });

  it("splits sentence blocks when the model omits blank lines", () => {
    expect(parseGeneratedFragments("Primeiro. Segundo. Terceiro.", 2)).toEqual([
      "Primeiro.",
      "Segundo. Terceiro."
    ]);
  });

  it("calls the injected Ollama HTTP client", async () => {
    const fetch = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          response: "Primeiro.\n\nSegundo."
        }),
      ok: true,
      status: 200,
      statusText: "OK"
    });

    await expect(
      generateOllamaFragments({
        baseUrl: "http://localhost:11434",
        fetch,
        fragmentCount: 2,
        model: "qwen3:1.7b",
        promptInput: {
          system: "Sistema",
          user: "Usuario"
        }
      })
    ).resolves.toEqual(["Primeiro.", "Segundo."]);

    expect(fetch).toHaveBeenCalledWith("http://localhost:11434/api/generate", {
      body: JSON.stringify({
        model: "qwen3:1.7b",
        prompt: "Sistema\n\nUsuario",
        stream: false
      }),
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    });
  });

  it("rejects non-OK Ollama responses", async () => {
    const fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error"
    });

    await expect(
      generateOllamaFragments({
        baseUrl: "http://localhost:11434",
        fetch,
        fragmentCount: 1,
        model: "qwen3:1.7b",
        promptInput: {
          system: "Sistema",
          user: "Usuario"
        }
      })
    ).rejects.toThrow("Ollama request failed with 500 Internal Server Error.");
  });
});
