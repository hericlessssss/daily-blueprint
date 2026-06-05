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
        "Primeiro fragmento.",
        ""
      ].join("\n")
    );
  });

  it("appends the new entry after existing entries", () => {
    const readme = [
      "# daily-blueprint",
      "",
      "## Fragmentos",
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
        "Entrada antiga.",
        "",
        "Entrada nova.",
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

  it("does not expose dates in the public readme body", () => {
    const readme = "# daily-blueprint\n\n## Fragmentos\n\nAinda nao ha registros.\n";

    expect(
      renderReadmeWithEntry({
        entryMarkdown: "### 2026-06-08\n\nEntrada nova.\n",
        readme
      })
    ).not.toContain("2026-06-08");
  });
});
