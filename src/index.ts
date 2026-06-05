import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { loadConfig } from "./config.js";
import { writeEntry } from "./entry-writer.js";
import {
  generateOllamaFragments
} from "./llm-generator.js";
import { generateMockFragments } from "./mock-generator.js";
import { getProjectName } from "./project.js";
import {
  publishGitChanges,
  syncGitRepository
} from "./git-publisher.js";
import {
  buildPromptInput,
  loadRecentEntries
} from "./prompt-context.js";
import { buildPublicationPlan } from "./publication.js";

const config = loadConfig(process.env);
const rootDir = process.cwd();
const plan = buildPublicationPlan({
  date: new Date(),
  maxFragments: config.maxFragmentsPerRun,
  minFragments: config.minFragmentsPerRun,
  publishDays: config.publishDays,
  timeZone: config.timeZone
});

const recentEntries = await loadRecentEntries({
  limit: 5,
  rootDir
});
const summary = await readFile(join(rootDir, "state", "summary.md"), "utf8");
const systemTemplate = await readFile(join(rootDir, "prompts", "system.md"), "utf8");
const userTemplate = await readFile(join(rootDir, "prompts", "user.md"), "utf8");
const promptInput = buildPromptInput({
  bookTitle: config.bookTitle,
  entryDate: plan.entryDate,
  fragmentCount: plan.fragmentCount,
  recentEntries,
  summary,
  systemTemplate,
  userTemplate
});

const fragments = plan.shouldPublish ? await generateFragments() : [];
let gitPublication = {
  committed: false,
  pushed: false
};

if (plan.shouldPublish) {
  if (config.gitAutoCommit) {
    await syncGitRepository({
      rootDir
    });
  }

  await writeEntry({
    entryDate: plan.entryDate,
    fragments,
    rootDir
  });

  if (config.gitAutoCommit) {
    gitPublication = await publishGitChanges({
      entryDate: plan.entryDate,
      fragmentCount: plan.fragmentCount,
      push: config.gitPush,
      rootDir
    });
  }
}

console.log(
  `${getProjectName()}: ${JSON.stringify({
    fragments,
    generator: config.llmProvider,
    git: gitPublication,
    plan,
    promptReady: promptInput.system.length > 0 && promptInput.user.length > 0
  })}`
);

async function generateFragments(): Promise<readonly string[]> {
  if (config.llmProvider === "mock") {
    return generateMockFragments({
      entryDate: plan.entryDate,
      fragmentCount: plan.fragmentCount
    });
  }

  return generateOllamaFragments({
    baseUrl: config.ollamaBaseUrl,
    fragmentCount: plan.fragmentCount,
    model: config.ollamaModel,
    promptInput
  });
}
