import { describe, expect, it } from "vitest";

import {
  buildCommitMessage,
  publishGitChanges
} from "../src/git-publisher.js";

describe("git publisher", () => {
  it("builds a singular commit message", () => {
    expect(buildCommitMessage({ entryDate: "2026-06-08", fragmentCount: 1 })).toBe(
      "entry: add 2026-06-08 fragment"
    );
  });

  it("builds a plural commit message", () => {
    expect(buildCommitMessage({ entryDate: "2026-06-08", fragmentCount: 3 })).toBe(
      "entry: add 2026-06-08 fragments"
    );
  });

  it("skips commit when README and entries have no changes", async () => {
    const commands: string[] = [];

    await expect(
      publishGitChanges({
        entryDate: "2026-06-08",
        fragmentCount: 1,
        push: true,
        rootDir: "/repo",
        runner: (command, args) => {
          commands.push([command, ...args].join(" "));

          return Promise.resolve({
            stdout: "",
            stderr: ""
          });
        }
      })
    ).resolves.toEqual({
      committed: false,
      pushed: false
    });

    expect(commands).toEqual([
      "git pull --rebase",
      "git status --porcelain -- README.md entries"
    ]);
  });

  it("commits and pushes publication files when changes exist", async () => {
    const commands: string[] = [];

    await expect(
      publishGitChanges({
        entryDate: "2026-06-08",
        fragmentCount: 2,
        push: true,
        rootDir: "/repo",
        runner: (command, args) => {
          commands.push([command, ...args].join(" "));

          return Promise.resolve({
            stdout: command === "git" && args[0] === "status" ? " M README.md\n?? entries/2026-06-08.md\n" : "",
            stderr: ""
          });
        }
      })
    ).resolves.toEqual({
      committed: true,
      pushed: true
    });

    expect(commands).toEqual([
      "git pull --rebase",
      "git status --porcelain -- README.md entries",
      "git add README.md entries",
      "git commit -m entry: add 2026-06-08 fragments",
      "git push"
    ]);
  });

  it("commits without pushing when push is disabled", async () => {
    const commands: string[] = [];

    await publishGitChanges({
      entryDate: "2026-06-08",
      fragmentCount: 1,
      push: false,
      rootDir: "/repo",
      runner: (command, args) => {
        commands.push([command, ...args].join(" "));

        return Promise.resolve({
          stdout: command === "git" && args[0] === "status" ? " M README.md\n" : "",
          stderr: ""
        });
      }
    });

    expect(commands).not.toContain("git push");
  });
});
