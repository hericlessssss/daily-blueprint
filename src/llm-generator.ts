import type { PromptInput } from "./prompt-context.js";

export interface GenerateOllamaFragmentsOptions {
  baseUrl: string;
  fetch?: Fetch;
  fragmentCount: number;
  model: string;
  promptInput: PromptInput;
}

type Fetch = (url: string, init: RequestInit) => Promise<OllamaHttpResponse>;

interface OllamaHttpResponse {
  json?: () => Promise<unknown>;
  ok: boolean;
  status: number;
  statusText: string;
}

interface OllamaGenerateResponse {
  response?: string;
}

export async function generateOllamaFragments(
  options: GenerateOllamaFragmentsOptions
): Promise<readonly string[]> {
  const fetchClient = options.fetch ?? fetch;
  const response = await fetchClient(`${options.baseUrl}/api/generate`, {
    body: JSON.stringify({
      model: options.model,
      prompt: `${options.promptInput.system}\n\n${options.promptInput.user}`,
      stream: false
    }),
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  if (!response.ok) {
    throw new Error(
      `Ollama request failed with ${String(response.status)} ${response.statusText}.`
    );
  }

  const payload = await readJson(response);
  const generated = isOllamaGenerateResponse(payload) ? payload.response : undefined;

  return parseGeneratedFragments(generated ?? "", options.fragmentCount);
}

export function parseGeneratedFragments(
  outputText: string,
  expectedFragmentCount: number
): readonly string[] {
  const trimmedOutput = outputText.trim();

  if (trimmedOutput.length === 0) {
    throw new Error("LLM response was empty.");
  }

  const fragments = trimmedOutput
    .split(/\n{2,}/)
    .map((fragment) => fragment.trim())
    .filter((fragment) => fragment.length > 0);

  if (fragments.length !== expectedFragmentCount) {
    throw new Error(
      `Expected ${String(expectedFragmentCount)} fragment(s), received ${String(fragments.length)}.`
    );
  }

  return fragments;
}

function isOllamaGenerateResponse(value: unknown): value is OllamaGenerateResponse {
  return typeof value === "object" && value !== null && "response" in value;
}

async function readJson(response: OllamaHttpResponse): Promise<unknown> {
  if (response.json === undefined) {
    return undefined;
  }

  return response.json();
}
