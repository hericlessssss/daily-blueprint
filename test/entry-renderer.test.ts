import { describe, expect, it } from "vitest";

import {
  renderEntryMarkdown,
  renderReadmeWithEntry
} from "../src/entry-renderer.js";

describe("entry renderer", () => {
  it("renders a dated entry with fragments separated by blank lines", () => {
    expect(
      renderEntryMarkdown({
        entryDate: "2026-06-08",
        fragments: ["Primeiro fragmento.", "Segundo fragmento."]
      })
    ).toBe("### 2026-06-08\n\nPrimeiro fragmento.\n\nSegundo fragmento.\n");
  });

  it("rejects empty fragments", () => {
    expect(() =>
      renderEntryMarkdown({
        entryDate: "2026-06-08",
        fragments: ["   "]
      })
    ).toThrow("fragments must contain non-empty text.");
  });

  it("replaces the empty readme fragment placeholder with the new entry", () => {
    const readme = [
      "# daily-blueprint",
      "",
      "## O Espelho de Segunda a Sexta",
      "",
      "Abertura.",
      "",
      "## Fragmentos",
      "",
      "Ainda nao ha registros.",
      ""
    ].join("\n");

    expect(
      renderReadmeWithEntry({
        entryMarkdown: "### 2026-06-08\n\nPrimeiro fragmento.\n",
        readme
      })
    ).toBe(
      [
        "# daily-blueprint",
        "",
        "## O Espelho de Segunda a Sexta",
        "",
        "Abertura.",
        "",
        "## Fragmentos",
        "",
        "### 2026-06-08",
        "",
        "Primeiro fragmento.",
        ""
      ].join("\n")
    );
  });

  it("prepends the new entry before existing entries", () => {
    const readme = [
      "# daily-blueprint",
      "",
      "## Fragmentos",
      "",
      "### 2026-06-05",
      "",
      "Entrada antiga.",
      ""
    ].join("\n");

    expect(
      renderReadmeWithEntry({
        entryMarkdown: "### 2026-06-08\n\nEntrada nova.\n",
        readme
      })
    ).toBe(
      [
        "# daily-blueprint",
        "",
        "## Fragmentos",
        "",
        "### 2026-06-08",
        "",
        "Entrada nova.",
        "",
        "### 2026-06-05",
        "",
        "Entrada antiga.",
        ""
      ].join("\n")
    );
  });

  it("rejects readmes without a fragments section", () => {
    expect(() =>
      renderReadmeWithEntry({
        entryMarkdown: "### 2026-06-08\n\nEntrada nova.\n",
        readme: "# daily-blueprint\n"
      })
    ).toThrow("README.md must contain a ## Fragmentos section.");
  });
});
