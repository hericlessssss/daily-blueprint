export interface AppConfig {
  bookLanguage: string;
  bookTitle: string;
  gitAutoCommit: boolean;
  gitPush: boolean;
  llmProvider: LlmProvider;
  maxFragmentsPerRun: number;
  minFragmentsPerRun: number;
  ollamaBaseUrl: string;
  ollamaModel: string;
  publishDays: readonly number[];
  timeZone: string;
}

type Environment = Record<string, string | undefined>;
type LlmProvider = "ollama" | "mock";

const defaultLlmProvider: LlmProvider = "ollama";

const defaultConfig = {
  bookLanguage: "pt-BR",
  bookTitle: "O Espelho de Segunda a Sexta",
  gitAutoCommit: false,
  gitPush: false,
  llmProvider: defaultLlmProvider,
  maxFragmentsPerRun: 3,
  minFragmentsPerRun: 1,
  ollamaBaseUrl: "http://localhost:11434",
  ollamaModel: "qwen3:1.7b",
  publishDays: [1, 2, 3, 4, 5] as const,
  timeZone: "America/Sao_Paulo"
};

export function loadConfig(env: Environment): AppConfig {
  const minFragmentsPerRun = parseInteger(
    env.MIN_FRAGMENTS_PER_RUN,
    defaultConfig.minFragmentsPerRun,
    "MIN_FRAGMENTS_PER_RUN"
  );
  const maxFragmentsPerRun = parseInteger(
    env.MAX_FRAGMENTS_PER_RUN,
    defaultConfig.maxFragmentsPerRun,
    "MAX_FRAGMENTS_PER_RUN"
  );

  if (maxFragmentsPerRun < minFragmentsPerRun) {
    throw new Error("MAX_FRAGMENTS_PER_RUN must be greater than or equal to MIN_FRAGMENTS_PER_RUN.");
  }

  return {
    bookLanguage: env.BOOK_LANGUAGE ?? defaultConfig.bookLanguage,
    bookTitle: env.BOOK_TITLE ?? defaultConfig.bookTitle,
    gitAutoCommit: parseBoolean(env.GIT_AUTO_COMMIT, defaultConfig.gitAutoCommit, "GIT_AUTO_COMMIT"),
    gitPush: parseBoolean(env.GIT_PUSH, defaultConfig.gitPush, "GIT_PUSH"),
    llmProvider: parseLlmProvider(env.LLM_PROVIDER),
    maxFragmentsPerRun,
    minFragmentsPerRun,
    ollamaBaseUrl: trimTrailingSlash(env.OLLAMA_BASE_URL ?? defaultConfig.ollamaBaseUrl),
    ollamaModel: env.OLLAMA_MODEL ?? defaultConfig.ollamaModel,
    publishDays: parsePublishDays(env.PUBLISH_DAYS),
    timeZone: env.TIMEZONE ?? defaultConfig.timeZone
  };
}

function parseBoolean(value: string | undefined, fallback: boolean, name: string): boolean {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw new Error(`${name} must be true or false.`);
}

function parseLlmProvider(value: string | undefined): LlmProvider {
  if (value === undefined || value.trim() === "") {
    return defaultConfig.llmProvider;
  }

  if (value === "ollama" || value === "mock") {
    return value;
  }

  throw new Error("LLM_PROVIDER must be one of: ollama, mock.");
}

function parsePublishDays(value: string | undefined): readonly number[] {
  if (value === undefined || value.trim() === "") {
    return defaultConfig.publishDays;
  }

  const days = value.split(",").map((item) => parseInteger(item, 0, "PUBLISH_DAYS"));
  const hasInvalidDay = days.some((day) => day < 0 || day > 6);

  if (hasInvalidDay) {
    throw new Error("PUBLISH_DAYS must contain integers from 0 to 6.");
  }

  return days;
}

function parseInteger(value: string | undefined, fallback: number, name: string): number {
  if (value === undefined || value.trim() === "") {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed.toString() !== value.trim()) {
    throw new Error(`${name} must be an integer.`);
  }

  return parsed;
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}
