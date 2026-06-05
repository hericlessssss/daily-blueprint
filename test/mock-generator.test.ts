import { describe, expect, it } from "vitest";

import { generateMockFragments } from "../src/mock-generator.js";

describe("mock fragment generator", () => {
  it("generates exactly the requested number of fragments", () => {
    const fragments = generateMockFragments({
      entryDate: "2026-06-08",
      fragmentCount: 3
    });

    expect(fragments).toHaveLength(3);
  });

  it("generates non-empty fragments", () => {
    const fragments = generateMockFragments({
      entryDate: "2026-06-08",
      fragmentCount: 2
    });

    expect(fragments.every((fragment) => fragment.trim().length > 0)).toBe(true);
  });

  it("is deterministic for the same date and fragment count", () => {
    const options = {
      entryDate: "2026-06-08",
      fragmentCount: 2
    };

    expect(generateMockFragments(options)).toEqual(generateMockFragments(options));
  });

  it("rejects fragment counts outside the publication range", () => {
    expect(() =>
      generateMockFragments({
        entryDate: "2026-06-08",
        fragmentCount: 0
      })
    ).toThrow("fragmentCount must be between 1 and 3.");

    expect(() =>
      generateMockFragments({
        entryDate: "2026-06-08",
        fragmentCount: 4
      })
    ).toThrow("fragmentCount must be between 1 and 3.");
  });

  it("does not leak repository mechanics into public fragments", () => {
    const fragments = generateMockFragments({
      entryDate: "2026-06-08",
      fragmentCount: 3
    });
    const body = fragments.join("\n").toLowerCase();

    expect(body).not.toContain("api key");
    expect(body).not.toContain("cron");
    expect(body).not.toContain("github");
    expect(body).not.toContain("openai");
    expect(body).not.toContain("repositorio");
  });
});
