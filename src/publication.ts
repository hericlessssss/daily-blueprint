export interface PublicationOptions {
  timeZone: string;
  publishDays?: readonly number[];
}

export interface FragmentCountOptions {
  min: number;
  max: number;
  random?: () => number;
}

export interface PublicationPlanOptions {
  date: Date;
  timeZone: string;
  minFragments: number;
  maxFragments: number;
  publishDays?: readonly number[];
  random?: () => number;
}

export interface PublicationPlan {
  shouldPublish: boolean;
  entryDate: string;
  fragmentCount: number;
}

const defaultPublishDays = [1, 2, 3, 4, 5] as const;

const weekdayByName = new Map<string, number>([
  ["Sun", 0],
  ["Mon", 1],
  ["Tue", 2],
  ["Wed", 3],
  ["Thu", 4],
  ["Fri", 5],
  ["Sat", 6]
]);

export function isPublishDay(date: Date, options: PublicationOptions): boolean {
  const publishDays = options.publishDays ?? defaultPublishDays;
  const weekday = getWeekdayInTimeZone(date, options.timeZone);

  return publishDays.includes(weekday);
}

export function formatDateInTimeZone(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone,
    year: "numeric"
  }).formatToParts(date);

  const year = requireDatePart(parts, "year");
  const month = requireDatePart(parts, "month");
  const day = requireDatePart(parts, "day");

  return `${year}-${month}-${day}`;
}

export function selectFragmentCount(options: FragmentCountOptions): number {
  if (!Number.isInteger(options.min) || !Number.isInteger(options.max)) {
    throw new Error("Fragment count boundaries must be integers.");
  }

  if (options.min < 1) {
    throw new Error("Minimum fragment count must be at least 1.");
  }

  if (options.max < options.min) {
    throw new Error("Maximum fragment count must be greater than or equal to minimum.");
  }

  const random = options.random ?? Math.random;
  const roll = random();

  if (roll < 0 || roll >= 1) {
    throw new Error("Random generator must return a number from 0 inclusive to 1 exclusive.");
  }

  return Math.floor(roll * (options.max - options.min + 1)) + options.min;
}

export function buildPublicationPlan(options: PublicationPlanOptions): PublicationPlan {
  const entryDate = formatDateInTimeZone(options.date, options.timeZone);
  const shouldPublish = isPublishDay(options.date, {
    publishDays: options.publishDays,
    timeZone: options.timeZone
  });

  if (!shouldPublish) {
    return {
      entryDate,
      fragmentCount: 0,
      shouldPublish
    };
  }

  return {
    entryDate,
    fragmentCount: selectFragmentCount({
      max: options.maxFragments,
      min: options.minFragments,
      random: options.random
    }),
    shouldPublish
  };
}

function getWeekdayInTimeZone(date: Date, timeZone: string): number {
  const weekdayName = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short"
  }).format(date);
  const weekday = weekdayByName.get(weekdayName);

  if (weekday === undefined) {
    throw new Error(`Unable to resolve weekday for ${weekdayName}.`);
  }

  return weekday;
}

function requireDatePart(parts: Intl.DateTimeFormatPart[], type: string): string {
  const value = parts.find((part) => part.type === type)?.value;

  if (value === undefined) {
    throw new Error(`Unable to resolve date part ${type}.`);
  }

  return value;
}
