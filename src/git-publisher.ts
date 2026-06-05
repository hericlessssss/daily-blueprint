import { execFile } from "node:child_process";
import { promisify } from "node:util";

export interface CommitMessageOptions {
  entryDate: string;
  fragmentCount: number;
}

export interface GitCommandResult {
  stderr: string;
  stdout: string;
}

export type GitRunner = (
  command: string,
  args: readonly string[],
  options: GitRunnerOptions
) => Promise<GitCommandResult>;

export interface GitRunnerOptions {
  cwd: string;
}

export interface PublishGitChangesOptions {
  entryDate: string;
  fragmentCount: number;
  push: boolean;
  rootDir: string;
  runner?: GitRunner;
}

export interface SyncGitRepositoryOptions {
  rootDir: string;
  runner?: GitRunner;
}

export interface PublishGitChangesResult {
  committed: boolean;
  pushed: boolean;
}

const execFileAsync = promisify(execFile);

export function buildCommitMessage(options: CommitMessageOptions): string {
  const suffix = options.fragmentCount === 1 ? "fragment" : "fragments";

  return `entry: add ${options.entryDate} ${suffix}`;
}

export async function syncGitRepository(options: SyncGitRepositoryOptions): Promise<void> {
  const runner = options.runner ?? runGitCommand;

  await runner("git", ["pull", "--rebase"], {
    cwd: options.rootDir
  });
}

export async function publishGitChanges(
  options: PublishGitChangesOptions
): Promise<PublishGitChangesResult> {
  const runner = options.runner ?? runGitCommand;
  const runnerOptions = {
    cwd: options.rootDir
  };

  const status = await runner(
    "git",
    ["status", "--porcelain", "--", "README.md", "entries"],
    runnerOptions
  );

  if (status.stdout.trim().length === 0) {
    return {
      committed: false,
      pushed: false
    };
  }

  await runner("git", ["add", "README.md", "entries"], runnerOptions);
  await runner(
    "git",
    ["commit", "-m", buildCommitMessage(options)],
    runnerOptions
  );

  if (!options.push) {
    return {
      committed: true,
      pushed: false
    };
  }

  await runner("git", ["push"], runnerOptions);

  return {
    committed: true,
    pushed: true
  };
}

async function runGitCommand(
  command: string,
  args: readonly string[],
  options: GitRunnerOptions
): Promise<GitCommandResult> {
  const result = await execFileAsync(command, [...args], {
    cwd: options.cwd
  });

  return {
    stderr: result.stderr,
    stdout: result.stdout
  };
}
