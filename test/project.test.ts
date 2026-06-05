import { describe, expect, it } from "vitest";

import { getProjectName } from "../src/project.js";

describe("project metadata", () => {
  it("exposes the project name", () => {
    expect(getProjectName()).toBe("daily-blueprint");
  });
});
